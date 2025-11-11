/**
 * Coze API 集成模块
 * 处理与 Coze AI 助手的通信
 */

import { COZE_CONFIG } from './config'

/**
 * Coze 聊天消息接口
 */
export interface CozeChatMessage {
  /** 消息角色：用户、助手或系统 */
  role: 'user' | 'assistant' | 'system'
  /** 消息内容 */
  content: string
  /** 内容类型，固定为 'text' */
  content_type: 'text'
  /** 消息类型：问题或答案（可选） */
  type?: 'question' | 'answer'
}

/**
 * 创建会话接口响应
 */
export interface CreateConversationResponse {
  /** 状态码，0 表示成功 */
  code: number
  /** 状态信息 */
  msg: string
  /** 响应数据 */
  data: {
    /** 会话 ID */
    id: string
  }
}

/**
 * 聊天接口响应
 */
export interface ChatResponse {
  /** 状态码，0 表示成功 */
  code: number
  /** 状态信息 */
  msg: string
  /** 响应数据 */
  data: {
    /** 对话 ID */
    id: string
    /** 会话 ID */
    conversation_id: string
  }
}

/**
 * 获取对话详情接口响应
 */
export interface ChatRetrieveResponse {
  /** 状态码，0 表示成功 */
  code: number
  /** 状态信息 */
  msg: string
  /** 响应数据 */
  data: {
    /** 对话 ID */
    id: string
    /** 会话 ID */
    conversation_id: string
    /** 对话状态：已创建、处理中、已完成、失败、需要操作、已取消 */
    status: 'created' | 'in_progress' | 'completed' | 'failed' | 'requires_action' | 'canceled'
  }
}

/**
 * 消息列表接口响应
 */
export interface MessageListResponse {
  /** 状态码，0 表示成功 */
  code: number
  /** 状态信息 */
  msg: string
  /** 消息列表数据 */
  data: Array<{
    /** 消息 ID */
    id: string
    /** 消息角色 */
    role: string
    /** 消息内容 */
    content: string
    /** 内容类型 */
    content_type: string
    /** 消息类型 */
    type: string
    /** 创建时间戳 */
    created_at: number
  }>
}

/**
 * Coze API 客户端类（单例模式）
 * 负责与 Coze API 进行交互，支持流式和非流式两种聊天模式
 */
export class Coze {
  /** 单例实例 */
  private static instance: Coze | null = null
  /** 聊天 API 地址 */
  private static readonly API_URL = 'https://api.coze.cn/v3/chat'
  /** 创建会话 API 地址 */
  private static readonly CREATE_CONVERSATION_URL = 'https://api.coze.cn/v1/conversation/create'
  /** 获取对话详情 API 地址 */
  private static readonly RETRIEVE_URL = 'https://api.coze.cn/v3/chat/retrieve'
  /** 获取消息列表 API 地址 */
  private static readonly MESSAGE_LIST_URL = 'https://api.coze.cn/v3/chat/message/list'

  /** 机器人 ID */
  private BOT_ID: string
  /** API 密钥 */
  private API_KEY: string
  /** 用户会话 ID 映射表，键为用户 ID，值为会话 ID */
  private conversation: Record<string, string> = {}

  /**
   * 构造函数（单例模式）
   * @param BOT_ID 机器人 ID
   * @param API_KEY API 密钥
   */
  constructor(BOT_ID: string, API_KEY: string) {
    // 如果已存在实例，直接返回该实例
    if (Coze.instance) {
      return Coze.instance
    }
    this.BOT_ID = BOT_ID
    this.API_KEY = API_KEY
    this.conversation = {}
    Coze.instance = this
  }

  /**
   * 创建新会话
   * @param user 用户 ID
   * @returns 会话 ID，失败返回空字符串
   */
  async createConversation(user: string): Promise<string> {
    // 如果该用户已有会话，直接返回
    if (this.conversation[user]) {
      return this.conversation[user]
    }

    try {
      const response = await fetch(Coze.CREATE_CONVERSATION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          bot_id: this.BOT_ID,
          user_id: user,
          stream: false,
          auto_save_history: true,
          additional_messages: []
        })
      })

      const data: CreateConversationResponse = await response.json()
      if (data.code !== 0) {
        throw new Error(data.msg || 'Failed to create conversation')
      }

      // 缓存会话 ID
      this.conversation[user] = data.data.id
      return data.data.id
    } catch (error) {
      console.error('创建会话失败:', error)
      return ''
    }
  }

  /**
   * 与 Coze 聊天（支持流式和非流式两种模式）
   * @param conversation_id 会话 ID，如果为空则自动创建新会话
   * @param user 用户 ID
   * @param query 用户查询内容
   * @param messages 历史消息列表（可选）
   * @param useStream 是否使用流式模式，默认为 false（使用轮询模式）
   * @returns 助手回复内容
   */
  async chatCozeV3(
    conversation_id: string,
    user: string,
    query: string,
    messages: CozeChatMessage[] = [],
    useStream: boolean = false
  ): Promise<string> {
    // 兼容原逻辑：如果没有传入会话 ID，则创建新的
    conversation_id = conversation_id || await this.createConversation(user)

    // 根据模式选择流式或轮询方式
    if (useStream) {
      return this._streamChat(conversation_id, user, query, messages)
    } else {
      return this._pollingChat(conversation_id, user, query, messages)
    }
  }

  /**
   * 流式聊天模式（支持回调函数）
   * @param conversation_id 会话 ID
   * @param user 用户 ID
   * @param query 用户查询内容
   * @param messages 历史消息列表
   * @param onChunk 接收到数据块时的回调函数（可选）
   * @returns 完整的助手回复内容
   */
  async streamChatWithCallback(
    conversation_id: string,
    user: string,
    query: string,
    messages: CozeChatMessage[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    // 构建请求 URL，包含会话 ID
    const url = `${Coze.API_URL}?conversation_id=${conversation_id}`
    // 将用户消息添加到消息列表
    const message: CozeChatMessage = { role: 'user', content: query, content_type: 'text' }
    messages.push(message)

    // 构建请求参数
    const params = {
      bot_id: this.BOT_ID,
      user_id: user,
      query: query,
      additional_messages: messages,
      stream: true,
      auto_save_history: true
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify(params)
      })

      // 获取流式读取器
      const reader = response.body!.getReader()
      let result = ''

      // 持续读取流数据
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        // 解码数据块
        const decoder = new TextDecoder()
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        // 逐行处理
        for (let i = 0; i < lines.length; i++) {
          let line = lines[i].trim()
          if (line === '') continue
          if (line.includes('[DONE]')) break

          // 处理 SSE 格式的事件（event:conversation.message.delta）
          if (line.startsWith('event:conversation.message.delta')) {
            // 查找对应的 data 行
            const dataLineIndex = lines.slice(i + 1).findIndex(l => l.startsWith('data:'))
            if (dataLineIndex !== -1) {
              const dataLine = lines[i + 1 + dataLineIndex]
              const resStr = dataLine.trim().replace('data:', '')
              try {
                const respJson = JSON.parse(resStr)
                // 只处理助手消息 - 检查嵌套和直接格式
                const role = respJson.data?.role || respJson.role
                const content = respJson.data?.content || respJson.content || ''
                
                // 确保只处理助手角色的消息
                if (role === 'assistant' && content && typeof content === 'string') {
                  result += content
                  if (onChunk) {
                    onChunk(content)
                  }
                }
                // 明确忽略用户消息
              } catch (parseError) {
                // 跳过无效的 JSON
              }
              i += dataLineIndex
            }
          } else if (line.startsWith('data:')) {
            // 处理直接 JSON 格式
            try {
              const resStr = line.replace('data:', '').trim()
              if (!resStr) continue
              
              const respJson = JSON.parse(resStr)
              
              // 严格过滤：只处理助手消息且类型为 answer
              if (respJson.role === 'assistant' && respJson.type === 'answer' && respJson.content) {
                const newContent = String(respJson.content)
                // 处理累积内容格式 - 提取增量部分
                if (newContent.length > result.length) {
                  // 提取新增的内容
                  const incrementalContent = newContent.slice(result.length)
                  result = newContent
                  if (onChunk && incrementalContent) {
                    onChunk(incrementalContent)
                  }
                } else if (!result && newContent) {
                  // 第一条消息
                  result = newContent
                  if (onChunk) {
                    onChunk(newContent)
                  }
                }
              }
              // 明确忽略所有其他消息类型（用户、系统等）
            } catch (e) {
              // 跳过无效的 JSON - 静默继续
            }
          }
        }
      }
      return result
    } catch (error) {
      console.error('流式请求失败:', error)
      return ''
    }
  }

  /**
   * 流式聊天模式（私有方法）
   * @param conversation_id 会话 ID
   * @param user 用户 ID
   * @param query 用户查询内容
   * @param messages 历史消息列表
   * @returns 完整的助手回复内容
   */
  private async _streamChat(
    conversation_id: string,
    user: string,
    query: string,
    messages: CozeChatMessage[]
  ): Promise<string> {
    return this.streamChatWithCallback(conversation_id, user, query, messages)
  }

  /**
   * 轮询聊天模式（非流式）
   * 先发送消息，然后轮询等待完成，最后获取回复
   * @param conversation_id 会话 ID
   * @param user 用户 ID
   * @param query 用户查询内容
   * @param messages 历史消息列表
   * @returns 完整的助手回复内容
   */
  private async _pollingChat(
    conversation_id: string,
    user: string,
    query: string,
    messages: CozeChatMessage[]
  ): Promise<string> {
    try {
      // 步骤 1: 发送消息到 API
      const response = await fetch(Coze.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.API_KEY}`
        },
        body: JSON.stringify({
          bot_id: this.BOT_ID,
          user_id: user,
          additional_messages: [
            {
              role: 'user',
              content: query,
              content_type: 'text'
            }
          ],
          stream: false,
          auto_save_history: true,
          conversation_id: conversation_id
        })
      })

      const data: ChatResponse = await response.json()
      if (data.code !== 0) {
        throw new Error(data.msg || 'API请求失败')
      }

      // 获取对话 ID 和会话 ID
      const chatId = data.data.id
      conversation_id = data.data.conversation_id

      // 步骤 2: 等待处理完成
      await this._waitForCompletion(chatId, conversation_id)

      // 步骤 3: 获取最终回复
      return await this._getFinalResponse(chatId, conversation_id)
    } catch (error) {
      console.error('轮询请求失败:', error)
      return ''
    }
  }

  /**
   * 等待对话完成
   * 轮询检查对话状态，直到状态为 completed 或失败
   * @param chatId 对话 ID
   * @param conversationId 会话 ID
   * @param maxRetries 最大重试次数，默认 30 次
   * @param interval 轮询间隔（毫秒），默认 1000ms
   * @returns 如果完成返回 true，超时抛出错误
   */
  private async _waitForCompletion(
    chatId: string,
    conversationId: string,
    maxRetries: number = 30,
    interval: number = 1000
  ): Promise<boolean> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        // 查询对话状态
        const response = await fetch(
          `${Coze.RETRIEVE_URL}?chat_id=${chatId}&conversation_id=${conversationId}`,
          {
            headers: {
              'Authorization': `Bearer ${this.API_KEY}`
            }
          }
        )

        const data: ChatRetrieveResponse = await response.json()
        if (data.code !== 0) {
          throw new Error(data.msg || 'API请求失败')
        }

        // 如果状态为已完成，返回成功
        if (data.data.status === 'completed') {
          return true
        }

        // 等待指定间隔后继续轮询
        await new Promise(resolve => setTimeout(resolve, interval))
      } catch (error) {
        throw error
      }
    }

    // 超时抛出错误
    throw new Error('等待响应超时')
  }

  /**
   * 从消息列表获取最终回复
   * @param chatId 对话 ID
   * @param conversationId 会话 ID
   * @returns 助手的最新回复内容，如果没有则返回空字符串
   */
  private async _getFinalResponse(chatId: string, conversationId: string): Promise<string> {
    try {
      // 获取消息列表
      const response = await fetch(
        `${Coze.MESSAGE_LIST_URL}?chat_id=${chatId}&conversation_id=${conversationId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.API_KEY}`
          }
        }
      )

      const data: MessageListResponse = await response.json()
      if (data.code !== 0) {
        throw new Error(data.msg || 'API请求失败')
      }

      // 过滤出助手回复（role 为 assistant 且 type 为 answer）
      const assistantReplies = data.data.filter(
        msg => msg.role === 'assistant' && msg.type === 'answer'
      )

      // 返回最新的助手回复，如果没有则返回空字符串
      return assistantReplies.length > 0 ? assistantReplies[assistantReplies.length - 1].content : ''
    } catch (error) {
      console.error('获取最终回复失败:', error)
      throw error
    }
  }
}

/**
 * 获取 Coze 实例的辅助函数（单例模式）
 * @returns Coze 实例
 */
function getCozeInstance(): Coze {
  return new Coze(COZE_CONFIG.BOT_ID, COZE_CONFIG.API_TOKEN)
}

/**
 * 使用流式 API 向 Coze AI 助手发送消息
 * @param userMessage 用户消息内容
 * @param userId 用户 ID，默认为 'default_user'
 * @param onChunk 接收到数据块时的回调函数
 * @param useStream 是否使用流式模式，默认为 true
 * @returns 完整的助手回复内容
 */
export async function sendCozeMessageStream(
  userMessage: string,
  userId: string = 'default_user',
  onChunk: (chunk: string) => void,
  useStream: boolean = true
): Promise<string> {
  const coze = getCozeInstance()
  const conversation_id = '' // 空字符串将触发自动创建会话
  const messages: CozeChatMessage[] = []

  // 流式模式：实时接收回复
  if (useStream) {
    try {
      const result = await coze.streamChatWithCallback(
        conversation_id,
        userId,
        userMessage,
        messages,
        onChunk
      )
      return result
    } catch (error) {
      console.error('Failed to send message to Coze:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('发送消息时发生未知错误')
    }
  } else {
    // 非流式模式：使用轮询方式等待完整回复
    try {
      const result = await coze.chatCozeV3(conversation_id, userId, userMessage, messages, false)
      return result
    } catch (error) {
      console.error('Failed to send message to Coze:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('发送消息时发生未知错误')
    }
  }
}

/**
 * 向 Coze AI 助手发送消息（非流式，用于向后兼容）
 * @param userMessage 用户消息内容
 * @param userId 用户 ID，默认为 'default_user'
 * @returns 完整的助手回复内容
 */
export async function sendCozeMessage(
  userMessage: string,
  userId: string = 'default_user'
): Promise<string> {
  return sendCozeMessageStream(userMessage, userId, () => {}, false)
}

