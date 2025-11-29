'use client';
import { useState } from 'react';
import { useAccount } from 'wagmi';
import ConnectWallet from '../../components/ConnectWallet';
import { Zap, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface OptimizationResult {
  ok: boolean;
  error: string | null;
  data: {
    chain_id: number;
    input_token: string;
    output_token: string;
    amount_in: string;
    amount_out_min: string;
    slippage_bps: number;
    tx: {
      to: string;
      data: string;
      value: string;
      gas: string;
      maxFeePerGas: string;
      maxPriorityFeePerGas: string;
    };
  } | null;
}

export default function GasOptimizer() {
  const { address, isConnected } = useAccount();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [txHash, setTxHash] = useState('');
  
  const CONSULTATION_FEE = '0.5'; // USDC

  const handleAnalyze = async () => {
    if (!prompt.trim()) {
      alert('请输入您的兑换需求');
      return;
    }
    
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }
    
    setLoading(true);
    try {
      console.log('🔍 开始调用 AI 分析需求...');
      
      // 调用 AI 获取优化方案
      const optimization = await fetchOptimization(prompt);
      console.log('✅ AI 返回优化方案:', optimization);
      
      if (!optimization.ok || !optimization.data) {
        throw new Error(optimization.error || 'AI 分析失败');
      }
      
      // 保存 AI 返回的结果
      setResult(optimization);
      
      // 显示支付界面
      setShowPayment(true);
      console.log('💡 AI 分析完成，请支付咨询费');
    } catch (error: any) {
      console.error('❌ 分析失败:', error);
      alert(`分析失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePayConsultation = async () => {
    if (!isConnected) {
      alert('请先连接钱包');
      return;
    }

    if (!result) {
      alert('请先进行分析');
      return;
    }

    setLoading(true);
    try {
      console.log('💰 开始支付咨询费...');
      console.log('📊 AI 优化方案:', result);
      
      // 合约地址
      const contractAddress = '0xb81173637860c9B9Bf9c20b07d1c270A9A434373';
      
      // 调用 paymentConsultationFee 函数
      const paymentTx = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: contractAddress,
          data: '0xb4cb0352', // paymentConsultationFee() 的函数选择器
          value: '0x16345785d8a0000', // 0.1 ETH (最小金额)
        }],
      });
      
      console.log('✅ 支付交易已发送:', paymentTx);
      
      // 支付成功，隐藏支付界面
      setShowPayment(false);
      alert('支付成功！现在可以执行兑换了。');
    } catch (error: any) {
      console.error('❌ 支付失败:', error);
      alert(`支付失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptimization = async (userPrompt: string): Promise<OptimizationResult> => {
    // 调用后端 API，后端调用 ChatGPT
    const response = await fetch('/api/optimize-gas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: userPrompt, userAddress: address })
    });
    
    return await response.json();
  };

  const handleExecuteSwap = async () => {
    if (!result?.data) return;
    
    setLoading(true);
    try {
      console.log('开始执行兑换...');
      console.log('AI 返回的数据:', result.data);
      
      // 如果 AI 返回了 tx 数据，直接使用
      if (result.data.tx) {
        const tx = result.data.tx;
        const txHash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: address,
            to: tx.to,
            data: tx.data,
            value: tx.value,
            gas: tx.gas,
            maxFeePerGas: tx.maxFeePerGas,
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
          }],
        });
        
        setTxHash(txHash);
        console.log('交易成功:', txHash);
        alert(`交易成功！\n交易哈希: ${txHash}`);
      } else {
        // 如果没有 tx 数据，使用路由信息构建交易
        console.log('使用路由信息构建交易');
        alert('AI 返回的数据格式不完整，请重试');
      }
    } catch (error: any) {
      console.error('交易失败:', error);
      alert(`交易失败: ${error.message || '请重试'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Gas 费优化器
            </div>
          </div>
          <ConnectWallet />
        </div>

        {/* 主要内容 */}
        <div className="bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-8">
          <h1 className="text-3xl font-bold text-white mb-4">智能交易路径优化</h1>
          <p className="text-gray-400 mb-8">
            输入您的兑换需求，AI 将为您计算最优的交易路径和 Gas 设置
          </p>

          {/* 输入框 */}
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm font-medium">
              描述您的兑换需求
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="例如：我要在 Base 链上把 1 ETH 换成 USDC"
              className="w-full bg-slate-900/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              rows={4}
              disabled={loading || showPayment || !!result}
            />
          </div>

          {/* 分析按钮 */}
          {!showPayment && !result && (
            <button
              onClick={handleAnalyze}
              disabled={loading || !prompt.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  分析中...
                </>
              ) : (
                <>
                  开始分析
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}

          {/* 支付咨询费 */}
          {showPayment && (
            <div className="bg-slate-900/50 border border-slate-600 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">支付咨询费</h3>
                  <p className="text-gray-400 text-sm">
                    AI 已分析您的需求，支付后即可获取最优路径
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-400">{CONSULTATION_FEE}</div>
                  <div className="text-gray-400 text-sm">USDC</div>
                </div>
              </div>
              
              <button
                onClick={handlePayConsultation}
                disabled={loading || !isConnected}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    支付中...
                  </>
                ) : !isConnected ? (
                  '请先连接钱包'
                ) : (
                  <>
                    <CheckCircle size={20} />
                    支付咨询费
                  </>
                )}
              </button>
            </div>
          )}

          {/* 优化结果 */}
          {result && result.ok && result.data && (
            <div className="space-y-6">
              <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-400" size={24} />
                  <h3 className="text-xl font-bold text-green-400">优化方案已生成</h3>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-gray-400 text-sm mb-1">输入代币</div>
                    <div className="text-white font-medium">{result.data.input_token}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">输出代币</div>
                    <div className="text-white font-medium">{result.data.output_token}</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">输入数量</div>
                    <div className="text-white font-medium">
                      {(Number(result.data.amount_in) / 1e18).toFixed(4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">最小输出</div>
                    <div className="text-white font-medium">
                      {(Number(result.data.amount_out_min) / 1e6).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">滑点</div>
                    <div className="text-white font-medium">{result.data.slippage_bps / 100}%</div>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm mb-1">预估 Gas</div>
                    <div className="text-white font-medium">{result.data.tx.gas}</div>
                  </div>
                </div>

                <button
                  onClick={handleExecuteSwap}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      执行中...
                    </>
                  ) : (
                    <>
                      执行兑换
                      <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </div>

              {txHash && (
                <div className="bg-blue-900/20 border border-blue-600/30 rounded-xl p-4">
                  <div className="text-blue-400 text-sm mb-1">交易哈希</div>
                  <div className="text-white font-mono text-sm break-all">{txHash}</div>
                </div>
              )}
            </div>
          )}

          {result && !result.ok && (
            <div className="bg-red-900/20 border border-red-600/30 rounded-xl p-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="text-red-400" size={24} />
                <div>
                  <h3 className="text-xl font-bold text-red-400 mb-1">优化失败</h3>
                  <p className="text-gray-400">{result.error}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 功能说明 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
            <div className="text-blue-400 font-bold mb-2">1. 描述需求</div>
            <div className="text-gray-400 text-sm">输入您想要进行的代币兑换</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
            <div className="text-green-400 font-bold mb-2">2. 支付咨询费</div>
            <div className="text-gray-400 text-sm">支付少量费用获取 AI 优化方案</div>
          </div>
          <div className="bg-slate-800/30 border border-slate-700/40 rounded-xl p-4">
            <div className="text-purple-400 font-bold mb-2">3. 执行交易</div>
            <div className="text-gray-400 text-sm">一键执行最优路径的兑换交易</div>
          </div>
        </div>
      </div>
    </div>
  );
}
