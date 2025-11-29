import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, userAddress } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { ok: false, error: '请提供兑换需求描述', data: null },
        { status: 400 }
      );
    }

    // 优先使用 Coze API
    const cozeApiToken = process.env.COZE_API_TOKEN;
    const cozeBotId = process.env.COZE_BOT_ID || '7578017691110621230';
    const cozeApiBase = process.env.COZE_API_BASE || 'https://api.coze.cn';
    
    if (cozeApiToken) {
      console.log('使用 Coze API 进行优化分析...');
      try {
        const cozeResult = await callCozeAPI(prompt, userAddress, cozeApiToken, cozeBotId, cozeApiBase);
        return NextResponse.json(cozeResult);
      } catch (error: any) {
        console.error('Coze API 调用失败，尝试备用方案:', error.message);
      }
    }

    // 备用方案：使用 OpenAI API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.warn('API 未配置，使用模拟数据');
      return NextResponse.json(getMockOptimization(prompt));
    }

    const systemPrompt = `你是一个专业的区块链交易优化 AI。用户会描述他们的代币兑换需求，你需要分析并返回最优的交易路径和 Gas 设置。

请严格按照以下 JSON 格式返回结果：
{
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "1000000000000000000",
    "amount_out_min": "2920500000",
    "slippage_bps": 100,
    "tx": {
      "to": "0x...",
      "data": "0x...",
      "value": "1000000000000000000",
      "gas": "210000",
      "maxFeePerGas": "2000000000",
      "maxPriorityFeePerGas": "150000000"
    }
  }
}

注意：
- amount_in 和 value 使用 wei 单位（18位小数）
- amount_out_min 根据输出代币的小数位数（USDC 是 6 位）
- slippage_bps 是基点（100 = 1%）
- gas 费用要根据当前网络状况优化
- 如果用户需求不明确或无法处理，返回 {"ok": false, "error": "错误描述", "data": null}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' }
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API 错误: ${response.statusText}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('优化失败:', error);
    return NextResponse.json(
      { ok: false, error: error.message || '优化失败，请重试', data: null },
      { status: 500 }
    );
  }
}

/**
 * 调用 Coze API
 */
async function callCozeAPI(
  prompt: string,
  userAddress: string,
  apiToken: string,
  botId: string,
  apiBase: string
) {
  const systemPrompt = `你是一个专业的区块链交易优化 AI。请分析用户的兑换需求并返回 JSON 格式的优化方案。`;

  const fullPrompt = `${systemPrompt}\n\n用户需求：${prompt}\n用户地址：${userAddress || '未提供'}`;

  const response = await fetch(`${apiBase}/v3/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiToken}`,
    },
    body: JSON.stringify({
      bot_id: botId,
      user_id: userAddress || 'anonymous',
      stream: false,
      auto_save_history: true,
      additional_messages: [
        {
          role: 'user',
          content: fullPrompt,
          content_type: 'text'
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Coze API 错误: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log('Coze API 响应:', JSON.stringify(data, null, 2));

  // 解析 Coze 响应
  if (data.code === 0 && data.data?.messages) {
    const assistantMessage = data.data.messages.find((msg: any) => msg.role === 'assistant');
    if (assistantMessage?.content) {
      try {
        // 尝试解析 JSON 响应
        let result = JSON.parse(assistantMessage.content);
        
        // 如果返回的数据包含 route 但没有 tx，需要构建 tx 数据
        if (result.ok && result.data && result.data.route && !result.data.tx) {
          console.log('AI 返回了路由信息，构建交易数据...');
          
          // 从路由信息构建交易数据
          const route = result.data.route[0]; // 使用第一个路由
          result.data.tx = {
            to: route.pool_address || '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
            data: '0x38ed1739' + result.data.amount_in.slice(2).padStart(64, '0') + result.data.amount_out_min.slice(2).padStart(64, '0'),
            value: result.data.input_token === 'ETH' ? result.data.amount_in : '0x0',
            gas: '210000',
            maxFeePerGas: '2000000000',
            maxPriorityFeePerGas: '150000000'
          };
        }
        
        return result;
      } catch (e) {
        console.error('解析 Coze 响应失败:', e);
        console.log('Coze 返回内容:', assistantMessage.content);
        // 使用模拟数据
        return getMockOptimization(prompt);
      }
    }
  }

  throw new Error('Coze API 返回格式不正确');
}

// 模拟数据（用于测试）
function getMockOptimization(prompt: string) {
  // 简单解析用户输入
  const ethMatch = prompt.match(/(\d+\.?\d*)\s*ETH/i);
  const amount = ethMatch ? ethMatch[1] : '1';
  const amountInWei = (parseFloat(amount) * 1e18).toString();
  const estimatedUSDC = (parseFloat(amount) * 2920.5).toFixed(2);
  const amountOutMin = (parseFloat(estimatedUSDC) * 1e6).toString();

  return {
    ok: true,
    error: null,
    data: {
      chain_id: 8453,
      input_token: 'ETH',
      output_token: 'USDC',
      amount_in: amountInWei,
      amount_out_min: amountOutMin,
      slippage_bps: 100,
      tx: {
        to: '0x4752ba5dbc23f44d87826276bf6fd6b1c372ad24',
        data: '0x38ed173900000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000de0b6b3a7640000',
        value: amountInWei,
        gas: '210000',
        maxFeePerGas: '2000000000',
        maxPriorityFeePerGas: '150000000'
      }
    }
  };
}
