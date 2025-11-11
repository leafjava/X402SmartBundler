/**
 * Application Configuration Management
 * Unified management of environment variables and default configurations
 */

// Network Configuration
export const NETWORK_CONFIG = {
  // Supported Chain IDs
  SUPPORTED_CHAINS: [137, 80002], // Polygon Mainnet, Amoy Testnet
  
  // RPC URLs for each network
  RPC_URLS: {
    137: process.env.NEXT_PUBLIC_POLYGON_RPC_URL || 'https://polygon-rpc.com',
    80002: process.env.NEXT_PUBLIC_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology',
  },
  
  // Chain name mapping
  CHAIN_NAMES: {
    137: 'Polygon Mainnet',
    80002: 'Polygon Amoy',
  },
  
  // Default chain ID - Use Polygon Mainnet
  DEFAULT_CHAIN_ID: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID || '137'),
} as const

// Get RPC URL by chain ID
export function getRpcUrl(chainId: number): string {
  return NETWORK_CONFIG.RPC_URLS[chainId as keyof typeof NETWORK_CONFIG.RPC_URLS] || NETWORK_CONFIG.RPC_URLS[137]
}

// Get chain name by chain ID
export function getChainName(chainId: number): string {
  return NETWORK_CONFIG.CHAIN_NAMES[chainId as keyof typeof NETWORK_CONFIG.CHAIN_NAMES] || 'Unknown'
}

// Contract Address Configuration - Grouped by Network
export const CONTRACT_ADDRESSES = {
  // Polygon Mainnet (137)
  137: {
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    CONDITIONAL_TOKENS: process.env.NEXT_PUBLIC_CONDITIONAL_TOKENS_ADDRESS || '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
    AAVE_STRATEGY: process.env.NEXT_PUBLIC_AAVE_STRATEGY_ADDRESS || '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
  
  // Polygon Amoy Testnet (80002)
  80002: {
    USDC: process.env.NEXT_PUBLIC_AMOY_USDC_ADDRESS || '0x41E94Eb019C0762f9BfF9fE4b2660c2B6Dc3D75',
    CONDITIONAL_TOKENS: process.env.NEXT_PUBLIC_AMOY_CONDITIONAL_TOKENS_ADDRESS || '0x4D97DCd97eC945f40cF65F87097ACe5EA0476045',
    AAVE_STRATEGY: process.env.NEXT_PUBLIC_AMOY_AAVE_STRATEGY_ADDRESS || '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  },
  
  
  // Default Oracle Address (Development Environment)
  DEFAULT_ORACLE: process.env.NEXT_PUBLIC_DEFAULT_ORACLE_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
  
  // Zero Address
  ZERO_ADDRESS: '0x0000000000000000000000000000000000000000',
  
  // Zero Hash
  ZERO_HASH: '0x0000000000000000000000000000000000000000000000000000000000000000',
} as const

// Get contract address by chain ID
export function getContractAddress(chainId: number, contractName: keyof typeof CONTRACT_ADDRESSES[137]): string {
  const chainAddresses = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (chainAddresses && typeof chainAddresses === 'object' && contractName in chainAddresses) {
    return chainAddresses[contractName as keyof typeof chainAddresses] as string
  }
  
  // Fallback to default address (Polygon Mainnet)
  return CONTRACT_ADDRESSES[137][contractName] || CONTRACT_ADDRESSES.ZERO_ADDRESS
}

// CORS Proxy Configuration
export const CORS_PROXY_CONFIG = {
  // CORS proxy service URL - hardcoded default value
  PROXY_URL: process.env.NEXT_PUBLIC_CORS_PROXY_URL || 'https://cors-i1y9vf7h9-brandonxweb3-9280s-projects.vercel.app',

  // Whether to enable CORS proxy
  ENABLED: process.env.NEXT_PUBLIC_USE_CORS_PROXY !== 'false',

  // Request timeout in milliseconds
  TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_CORS_TIMEOUT_MS || '30000'),
} as const

// Polymarket Configuration
export const POLYMARKET_CONFIG = {
  // Enable mock mode
  MOCK_ENABLED: process.env.NEXT_PUBLIC_PM_MOCK === 'true',
  
  // Enable browser event simulation
  MOCK_BROWSER_EVENT: process.env.NEXT_PUBLIC_PM_MOCK_BROWSER_EVENT === 'true',
  
  // Minimum price movement unit
  TICK_SIZE: process.env.NEXT_PUBLIC_PM_TICK_SIZE || '0.01',
  
  // Enable negative risk
  NEG_RISK: process.env.NEXT_PUBLIC_PM_NEG_RISK === 'true',
  
  // Token ID configuration
  TOKEN_ID_YES: process.env.NEXT_PUBLIC_PM_TOKEN_ID_YES,
  TOKEN_ID_NO: process.env.NEXT_PUBLIC_PM_TOKEN_ID_NO,
  
  // Exchange address
  EXCHANGE_ADDRESS: process.env.NEXT_PUBLIC_PM_EXCHANGE_ADDRESS,
  
  // Timeout configuration
  TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_PM_TIMEOUT_MS || '15000'),
  WAIT_TIMEOUT_MS: parseInt(process.env.NEXT_PUBLIC_PM_WAIT_TIMEOUT_MS || '15000'),
  
  // Mock fill configuration
  MOCK_FILL_CONTRACT: process.env.NEXT_PUBLIC_PM_MOCK_FILL_CONTRACT,
  MOCK_FILL_EVENT_TOPIC: process.env.NEXT_PUBLIC_PM_MOCK_FILL_EVENT_TOPIC,
} as const

// Coze API Configuration
export const COZE_CONFIG = {
  // Coze API token
  API_TOKEN: process.env.NEXT_PUBLIC_COZE_API_TOKEN || 'pat_XUph8jnpqmx82WegBQAhfEHqT9yll9YmE2XjCltmXiCYLKVju3QP7RaQ6kc6B6wH',
  
  // Bot ID
  BOT_ID: process.env.NEXT_PUBLIC_COZE_BOT_ID || '7567456704884015167',
  
  // API base URL (without /v3, as the CozeAPI class will add it)
  API_BASE_URL: 'https://api.coze.cn',
} as const

// Application Configuration
export const APP_CONFIG = {
  // Application name
  NAME: process.env.NEXT_PUBLIC_APP_NAME || 'Yield Market',
  
  // Application version
  VERSION: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  
  // Enable debug mode
  DEBUG: process.env.NODE_ENV === 'development',
  
  // Enable test mode
  TEST: process.env.NODE_ENV === 'test',
} as const

// Validate configuration
export function validateConfig(): void {
  const errors: string[] = []
  
  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_USDC_ADDRESS && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_USDC_ADDRESS is required in production')
  }
  
  if (!process.env.NEXT_PUBLIC_CONDITIONAL_TOKENS_ADDRESS && process.env.NODE_ENV === 'production') {
    errors.push('NEXT_PUBLIC_CONDITIONAL_TOKENS_ADDRESS is required in production')
  }
  
  if (errors.length > 0) {
    throw new Error(`Configuration validation failed:\n${errors.join('\n')}`)
  }
}

// Validate configuration in development environment
if (process.env.NODE_ENV === 'development') {
  try {
    validateConfig()
  } catch (error) {
    console.warn('Configuration validation warning:', error)
  }
}
