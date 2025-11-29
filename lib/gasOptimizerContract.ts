import { Contract, formatUnits, MaxUint256, parseUnits } from 'ethers';
import type { Signer, Provider } from 'ethers';

// 合约 ABI
export const GAS_OPTIMIZER_ABI = [
  "function payConsultationFee() external",
  "function executeSwap(address targetContract, bytes calldata callData) external payable returns (bool success, bytes memory returnData)",
  "function consultationFee() external view returns (uint256)",
  "function usdcToken() external view returns (address)",
  "function feeCollector() external view returns (address)",
  "event ConsultationFeePaid(address indexed user, uint256 amount, uint256 timestamp)",
  "event TokenSwapped(address indexed user, address indexed inputToken, address indexed outputToken, uint256 amountIn, uint256 amountOut, uint256 timestamp)"
];

// USDC ABI（简化版）
export const USDC_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)"
];

// 合约地址（需要部署后更新）
export const GAS_OPTIMIZER_ADDRESS = process.env.NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS || '';
export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';

/**
 * 支付咨询费
 */
export async function payConsultationFee(signer: Signer) {
  const gasOptimizer = new Contract(GAS_OPTIMIZER_ADDRESS, GAS_OPTIMIZER_ABI, signer);
  const usdc = new Contract(USDC_ADDRESS, USDC_ABI, signer);
  
  // 获取咨询费金额
  const fee = await gasOptimizer.consultationFee();
  
  // 检查授权
  const userAddress = await signer.getAddress();
  const allowance = await usdc.allowance(userAddress, GAS_OPTIMIZER_ADDRESS);
  
  // 如果授权不足，先授权
  if (allowance < fee) {
    const approveTx = await usdc.approve(GAS_OPTIMIZER_ADDRESS, MaxUint256);
    await approveTx.wait();
  }
  
  // 支付咨询费
  const tx = await gasOptimizer.payConsultationFee();
  const receipt = await tx.wait();
  
  return receipt;
}

/**
 * 执行兑换
 */
export async function executeSwap(
  signer: Signer,
  targetContract: string,
  callData: string,
  value: string
) {
  const gasOptimizer = new Contract(GAS_OPTIMIZER_ADDRESS, GAS_OPTIMIZER_ABI, signer);
  
  const tx = await gasOptimizer.executeSwap(targetContract, callData, {
    value: BigInt(value)
  });
  
  const receipt = await tx.wait();
  return receipt;
}

/**
 * 获取 USDC 余额
 */
export async function getUSDCBalance(provider: Provider, address: string) {
  const usdc = new Contract(USDC_ADDRESS, USDC_ABI, provider);
  const balance = await usdc.balanceOf(address);
  return formatUnits(balance, 6); // USDC 有 6 位小数
}
