'use client';
import { http, createConfig } from 'wagmi';
import { sepolia, mainnet, type Chain } from 'viem/chains';
import { injected, walletConnect } from 'wagmi/connectors';
import { defineChain } from 'viem';

// 本地开发链配置
const localhost = defineChain({
  id: 1337,
  name: 'Localhost',
  network: 'localhost',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['http://127.0.0.1:8545'],
    },
    public: {
      http: ['http://127.0.0.1:8545'],
    },
  },
  blockExplorers: {
    default: { name: 'Local', url: 'http://localhost:8545' },
  },
});

// 只有明确设置了 NEXT_PUBLIC_USE_LOCAL=true 才使用本地节点
const isLocalDev = process.env.NEXT_PUBLIC_USE_LOCAL === 'true';

const chainId = isLocalDev ? 1337 : Number(process.env.NEXT_PUBLIC_CHAIN_ID || 11155111);
const rpcUrl = isLocalDev ? 'http://127.0.0.1:8545' : (process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.sepolia.org');

// 检查WalletConnect项目ID
const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID;

if (!walletConnectProjectId) {
  console.warn('⚠️ NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID 未设置，WalletConnect功能可能无法正常工作');
  console.warn('请访问 https://cloud.walletconnect.com/ 获取项目ID');
}

// 定义链配置 - 确保类型正确
const chains: readonly [Chain, ...Chain[]] = isLocalDev 
  ? [localhost, sepolia, mainnet] 
  : [sepolia, mainnet];

// 构建连接器数组 - 只使用最基础的 injected 连接器
const getConnectors = () => {
  // 只使用 injected 连接器，避免 MetaMask SDK 的兼容性问题
  const baseConnectors = [
    injected({ 
      shimDisconnect: true,
      target: 'metaMask' // 优先使用 MetaMask
    }),
  ];
  
  // 只在客户端环境且有有效的 projectId 时添加 WalletConnect
  if (typeof window !== 'undefined' && walletConnectProjectId && walletConnectProjectId !== 'your_walletconnect_project_id_here') {
    try {
      baseConnectors.push(
        // @ts-ignore - WalletConnect 连接器类型暂时不兼容 wagmi v2，但运行时正常
        walletConnect({
          projectId: walletConnectProjectId,
          showQrModal: true,
        })
      );
      console.log('✅ WalletConnect 连接器已启用');
    } catch (error) {
      console.warn('⚠️ WalletConnect 连接器初始化失败:', error);
    }
  } else if (typeof window !== 'undefined') {
    console.warn('⚠️ WalletConnect连接器未启用，请配置有效的项目ID');
  }
  
  console.log('📱 已配置的连接器数量:', baseConnectors.length);
  return baseConnectors;
};

const connectors = getConnectors();

export const wagmiConfig = createConfig({
  chains,
  connectors,
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'),
    [sepolia.id]: http('https://rpc.sepolia.org'),
    [mainnet.id]: http(),
  },
  ssr: true,
});

// 调试信息
console.log('🔧 Wagmi 配置:');
console.log('  - 使用本地节点:', isLocalDev);
console.log('  - Chain ID:', chainId);
console.log('  - RPC URL:', rpcUrl);
console.log('  - 可用链:', chains.map(c => `${c.name} (${c.id})`).join(', '));
