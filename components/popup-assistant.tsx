'use client'

import React, { useState, useRef } from 'react'
import { sendCozeMessageStream } from '@/lib/coze-api'

interface PopupAssistantProps {
  isOpen: boolean
  onClose: () => void
}

export function PopupAssistant({ isOpen, onClose }: PopupAssistantProps) {
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    { id: 1, text: '需要什么帮助么?', sender: 'assistant' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [userId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`)
  const assistantMessageIdRef = useRef<number | null>(null)
  
  // 开场白按钮选项
  const quickActions = [
    '支付引导',
    '支付状态查询',
    '分润信息展示',
    '支付策略推荐'
  ]
  
  // 判断是否显示开场白按钮（只有初始消息时显示）
  const showQuickActions = messages.length === 1 && !isLoading

  const handleQuickAction = (actionText: string) => {
    // 点击快速操作按钮时，直接发送对应的消息
    handleSend(actionText)
  }

  const handleSend = async (customMessage?: string) => {
    const messageToSend = customMessage || message.trim()
    if (!messageToSend || isLoading) return
    
    const userMessage = messageToSend
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, sender: 'user' }])
    setMessage('')
    setIsLoading(true)
    
    // Create a placeholder assistant message for streaming
    const assistantMessageId = Date.now() + 1
    assistantMessageIdRef.current = assistantMessageId
    setMessages(prev => [...prev, { 
      id: assistantMessageId, 
      text: '', 
      sender: 'assistant' 
    }])
    
    try {
      await sendCozeMessageStream(
        userMessage,
        userId,
        (chunk: string) => {
          // Strictly update only the assistant message - ensure we're not modifying user messages
          setMessages(prev => prev.map(msg => {
            // Only update if this is the assistant message we created
            if (msg.id === assistantMessageIdRef.current && msg.sender === 'assistant') {
              return { ...msg, text: msg.text + chunk }
            }
            // For all other messages, return unchanged
            return msg
          }))
        }
      )
    } catch (error) {
      console.error('Failed to get response from Coze:', error)
      // Update the error message
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageIdRef.current
          ? { ...msg, text: error instanceof Error ? error.message : '发送消息时发生错误，请稍后重试。' }
          : msg
      ))
    } finally {
      setIsLoading(false)
      assistantMessageIdRef.current = null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1a1a2e] rounded-lg shadow-2xl w-[500px] h-[600px] flex flex-col border border-gray-200 dark:border-[#34495e]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-[#34495e]">
          <h2 className="text-lg font-semibold text-blue-600 dark:text-blue-400">ai智能助手</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Console Info */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-[#34495e] bg-gray-50 dark:bg-[#16213e]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              COPILOTKIT DEV CONSOLE (localhost only)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-600 dark:text-gray-400">Version: latest (1.3.1)</span>
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            </div>
            <button className="px-3 py-1 text-xs bg-gray-200 dark:bg-[#34495e] text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-[#2e3b5e] transition-colors">
              Debug
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-[#2e3b5e] text-gray-900 dark:text-gray-100'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          
          {/* 开场白按钮 */}
          {showQuickActions && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAction(action)}
                    className="px-4 py-2.5 bg-white dark:bg-[#2e3b5e] border border-gray-300 dark:border-[#34495e] rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#34495e] transition-colors text-center"
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {isLoading && messages[messages.length - 1]?.sender === 'assistant' && !messages[messages.length - 1]?.text && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-[#2e3b5e] text-gray-900 dark:text-gray-100 rounded-lg px-4 py-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 dark:border-[#34495e] p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSend()}
              placeholder="Type a message..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#34495e] rounded-lg bg-white dark:bg-[#16213e] text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <button
              onClick={handleSend}
              disabled={isLoading || !message.trim()}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

