'use client';
import Button from './ui/Button';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { useEffect } from 'react';

export default function ConnectWallet() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, status, error } = useConnect();
  const { disconnect } = useDisconnect();

  // 调试信息
  console.log('🔍 ConnectWallet 组件状态:', {
    isConnected,
    connectorsCount: connectors?.length || 0,
    connectors: connectors?.map(c => ({ id: c.id, type: c.type, name: c.name })),
    status,
    hasError: !!error
  });

  // 监听连接状态变化
  useEffect(() => {
    if (status === 'success') {
      console.log('✅ 连接成功！');
    } else if (status === 'error') {
      console.log('❌ 连接失败:', error);
    }
  }, [status, error]);

  const handleConnect = async () => {
    console.log('🔗 开始钱包连接');
    console.log('📋 可用的连接器:', connectors);
    
    // 检查是否有 window.ethereum
    if (typeof window !== 'undefined' && !window.ethereum) {
      console.error('❌ 未检测到 Web3 钱包');
      alert('未检测到 MetaMask 或其他 Web3 钱包\n\n请先安装 MetaMask 浏览器扩展：\nhttps://metamask.io/download/');
      return;
    }
    
    // 尝试多种方式查找 injected connector
    const injectedConnector = connectors.find(
      connector => connector.type === 'injected' || connector.id === 'injected'
    );
    
    try {
      if (injectedConnector) {
        console.log('✓ 找到 injected connector:', injectedConnector);
        await connect({ connector: injectedConnector });
      } else if (connectors.length > 0) {
        // 如果找不到 injected，使用第一个可用的连接器
        console.log('✓ 使用第一个可用连接器:', connectors[0]);
        await connect({ connector: connectors[0] });
      } else {
        console.error('❌ 没有找到任何连接器');
        alert('没有找到可用的钱包连接器');
      }
    } catch (err: any) {
      console.error('❌ 连接过程出错:', err);
      // 不显示技术错误给用户，因为 wagmi 会处理
    }
  };

  if (error) {
    console.error('Connection error:', error);
  }

  const isLoading = status === 'pending';

  if (!isConnected) {
    return (
      <div className="flex flex-col items-end gap-2">
        <button 
          onClick={handleConnect} 
          disabled={isLoading}
          className="inline-flex items-center z-10 justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:bg-accent disabled:text-muted-foreground bg-blue-500/20 hover:bg-blue-500/15 text-blue-400 rounded-xl h-10 px-4 py-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
              连接中…
            </>
          ) : (
            'Connect'
          )}
        </button>
        {error && (
          <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg border border-red-500/20">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            连接失败: {error.message}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 rounded-xl">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-green-400">
          {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '已连接'}
        </span>
      </div>
      <button 
        onClick={() => disconnect()}
        className="px-4 py-2 bg-gradient-to-r from-red-500/20 to-pink-500/20 backdrop-blur-sm border border-red-500/30 text-red-400 font-medium rounded-xl hover:from-red-500/30 hover:to-pink-500/30 hover:text-red-300 transition-all duration-300 hover:scale-105"
      >
        断开
      </button>
    </div>
  );
}
