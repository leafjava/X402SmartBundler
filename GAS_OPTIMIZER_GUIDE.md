# Gas 费优化器 - 完整指南

## 项目概述

Gas 费优化器是一个基于 AI 的智能交易路径计算服务，实现了 X402 支付协议。用户支付少量咨询费（0.5 USDC），即可获得 AI 计算的最优交易路径和 Gas 设置。

## 核心功能

### 1. 前端功能
- ✅ 输入框接收用户的兑换需求（prompt）
- ✅ 弹出支付按钮【支付咨询费】
- ✅ 支付后自动调用 ChatGPT 获取最优路径
- ✅ 显示 AI 返回的优化方案（JSON 格式）
- ✅ 一键执行兑换交易

### 2. 智能合约功能
- ✅ `payConsultationFee()` - 接收咨询费（0.5 USDC）
- ✅ `executeSwap()` - 执行代币兑换（使用 AI 返回的交易数据）
- ✅ 事件记录和费用管理

### 3. AI 输出格式
```json
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
      "to": "0x...router",
      "data": "0x1234abcd...",
      "value": "1000000000000000000",
      "gas": "210000",
      "maxFeePerGas": "2000000000",
      "maxPriorityFeePerGas": "150000000"
    }
  }
}
```

## 部署步骤

### 1. 环境配置

在 `.env.local` 文件中添加：

```bash
# OpenAI API Key（用于调用 ChatGPT）
OPENAI_API_KEY=your_openai_api_key_here

# 合约地址（部署后填写）
NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=

# USDC 地址（已配置）
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238
```

### 2. 部署智能合约

```bash
# 编译合约
npx hardhat compile

# 部署到 Sepolia 测试网
npx hardhat run scripts/deploy-gas-optimizer.js --network sepolia

# 或部署到本地网络
npx hardhat run scripts/deploy-gas-optimizer.js --network localhost
```

部署成功后，将合约地址添加到 `.env.local`：
```bash
NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=0x...
```

### 3. 启动前端

```bash
npm run dev
```

访问 `http://localhost:3000/gas-optimizer`

## 使用流程

### 用户视角

1. **连接钱包**
   - 点击右上角 "Connect" 按钮
   - 连接 MetaMask 或其他 Web3 钱包

2. **描述需求**
   - 在输入框中描述兑换需求
   - 例如："我要在 Base 链上把 1 ETH 换成 USDC"

3. **支付咨询费**
   - 点击"开始分析"
   - 系统显示支付界面（0.5 USDC）
   - 点击"支付咨询费"并确认交易

4. **获取优化方案**
   - AI 自动分析并返回最优路径
   - 显示详细的交易参数（滑点、Gas 费等）

5. **执行兑换**
   - 点击"执行兑换"
   - 确认交易并等待完成

### AI Agent 视角

AI Agent 通过以下步骤提供服务：

1. **接收请求** - 用户发送兑换需求
2. **返回 402** - 要求支付 0.5 USDC 咨询费
3. **验证支付** - 检查链上支付记录
4. **计算路径** - 调用 ChatGPT 分析最优路径
5. **返回方案** - 提供可执行的交易数据

## 技术架构

### 前端
- **框架**: Next.js 14 + TypeScript
- **Web3**: wagmi + viem
- **UI**: Tailwind CSS + Lucide Icons

### 后端 API
- **路由**: `/api/optimize-gas`
- **功能**: 调用 OpenAI API 获取优化方案
- **备用**: 提供模拟数据（无 API Key 时）

### 智能合约
- **语言**: Solidity ^0.8.0
- **依赖**: OpenZeppelin
- **功能**: 
  - 咨询费收取
  - 代币兑换执行
  - 事件记录

## 测试

### 前端测试
```bash
# 访问页面
http://localhost:3000/gas-optimizer

# 测试输入
"我要把 0.1 ETH 换成 USDC"
```

### 合约测试
```bash
# 运行测试（需要创建测试文件）
npx hardhat test
```

## 注意事项

1. **USDC 余额**: 确保钱包有足够的 USDC 支付咨询费
2. **Gas 费**: 执行交易需要 ETH 作为 Gas 费
3. **网络**: 确保连接到正确的网络（Sepolia 或 Base）
4. **授权**: 首次使用需要授权合约使用 USDC

## 常见问题

### Q: 没有 USDC 怎么办？
A: 可以在 Uniswap 或其他 DEX 上兑换一些测试网 USDC

### Q: AI 返回的路径准确吗？
A: AI 会根据当前市场情况计算，但实际执行时可能有偏差，建议设置合理的滑点

### Q: 支付了咨询费但没有收到方案？
A: 检查交易是否成功，或联系技术支持

### Q: 可以退款吗？
A: 咨询费一旦支付不可退款，请确认需求后再支付

## 未来优化

- [ ] 支持更多链（Arbitrum、Optimism 等）
- [ ] 批量交易优化
- [ ] 历史记录查询
- [ ] 价格预警功能
- [ ] MEV 保护

## 联系方式

如有问题或建议，请联系开发团队。

---

**祝您使用愉快！🚀**
