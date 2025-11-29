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

    // 调用 ChatGPT API
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      console.warn('OPENAI_API_KEY 未配置，使用模拟数据');
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
