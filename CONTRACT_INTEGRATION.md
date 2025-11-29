# 合约集成说明

## 已部署的合约

**合约地址**: `0xb81173637860c9B9Bf9c20b07d1c270A9A434373`  
**网络**: Sepolia 测试网  
**部署交易**: `0x24545f0b08b3776d8ee665b8bdc6e7d6ee413563afebe743236cd23acb2087da`

## 合约功能

### 1. paymentConsultationFee()
支付咨询费函数

**函数签名**: `0xb4cb0352`  
**类型**: `payable`  
**最小金额**: 0.1 ETH (根据 MINI_USD 计算)

**调用方式**:
```javascript
const tx = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: userAddress,
    to: '0xb81173637860c9B9Bf9c20b07d1c270A9A434373',
    data: '0xb4cb0352',
    value: '0x16345785d8a0000', // 0.1 ETH
  }],
});
```

### 2. fund()
资金存入函数

**函数签名**: `0xb60d4288`  
**类型**: `payable`

### 3. withdraw()
提取资金函数（仅 Owner）

**函数签名**: `0x3ccfd60b`  
**类型**: `nonpayable`

### 4. 查询函数

- `getAddressToAmountFunded(address)` - 查询地址的资金数量
- `getFunder(uint256)` - 根据索引获取资助者地址
- `getOwner()` - 获取合约所有者
- `getPriceFeed()` - 获取价格预言机地址
- `getVersion()` - 获取版本号

## 集成流程

### 步骤 1: 配置环境变量

在 `.env.local` 中添加：

```bash
# 合约地址
NEXT_PUBLIC_FUNDME_CONTRACT=0xb81173637860c9B9Bf9c20b07d1c270A9A434373

# Coze API 配置
COZE_API_BASE=https://api.coze.cn
COZE_API_TOKEN=your_coze_token_here
COZE_BOT_ID=7578017691110621230
```

### 步骤 2: 前端调用流程

```typescript
// 1. 用户输入需求
const prompt = "帮我把 0.5 ETH 换成 USDC";

// 2. 支付咨询费
const paymentTx = await window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{
    from: address,
    to: '0xb81173637860c9B9Bf9c20b07d1c270A9A434373',
    data: '0xb4cb0352',
    value: '0x16345785d8a0000', // 0.1 ETH
  }],
});

console.log('支付交易:', paymentTx);

// 3. 调用 AI 获取优化方案
const response = await fetch('/api/optimize-gas', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ prompt, userAddress: address })
});

const result = await response.json();

// 4. 执行兑换（如果 AI 返回了交易数据）
if (result.ok && result.data.tx) {
  const swapTx = await window.ethereum.request({
    method: 'eth_sendTransaction',
    params: [{
      from: address,
      to: result.data.tx.to,
      data: result.data.tx.data,
      value: result.data.tx.value,
      gas: result.data.tx.gas,
    }],
  });
  
  console.log('兑换交易:', swapTx);
}
```

## AI 返回格式处理

### 格式 1: 包含 tx 字段（完整）

```json
{
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "500000000000000000",
    "amount_out_min": "1000000",
    "slippage_bps": 100,
    "tx": {
      "to": "0x...",
      "data": "0x...",
      "value": "500000000000000000",
      "gas": "210000",
      "maxFeePerGas": "2000000000",
      "maxPriorityFeePerGas": "150000000"
    }
  }
}
```

**处理方式**: 直接使用 `tx` 字段发送交易

### 格式 2: 包含 route 字段（需要构建）

```json
{
  "ok": true,
  "error": null,
  "data": {
    "chain_id": 8453,
    "input_token": "ETH",
    "output_token": "USDC",
    "amount_in": "500000000000000000",
    "amount_out_min": "1000000",
    "slippage_bps": 100,
    "route": [
      {
        "protocol": "uniswap-v3",
        "pool_address": "0xPoolMock1",
        "fee_tier": 3000,
        "portion_bps": 10000,
        "token_in": "ETH",
        "token_out": "USDC",
        "amount_in": "500000000000000000",
        "amount_out": "1000000"
      }
    ]
  }
}
```

**处理方式**: 后端自动构建 `tx` 字段

```typescript
// 在 API 路由中自动处理
if (result.ok && result.data && result.data.route && !result.data.tx) {
  const route = result.data.route[0];
  result.data.tx = {
    to: route.pool_address,
    data: buildSwapData(result.data),
    value: result.data.input_token === 'ETH' ? result.data.amount_in : '0x0',
    gas: '210000',
    maxFeePerGas: '2000000000',
    maxPriorityFeePerGas: '150000000'
  };
}
```

## 测试步骤

### 1. 准备测试环境

```bash
# 确保有 Sepolia 测试网 ETH
# 获取测试币: https://sepoliafaucet.com/

# 启动开发服务器
npm run dev
```

### 2. 测试支付咨询费

1. 访问 `http://localhost:3000/gas-optimizer`
2. 连接 MetaMask 钱包
3. 输入: "帮我把 0.5 ETH 换成 USDC"
4. 点击"开始分析"
5. 点击"支付咨询费"
6. 在 MetaMask 中确认交易（约 0.1 ETH）

### 3. 验证支付

在 Sepolia Etherscan 查看交易:
```
https://sepolia.etherscan.io/tx/YOUR_TX_HASH
```

检查合约调用:
```
https://sepolia.etherscan.io/address/0xb81173637860c9B9Bf9c20b07d1c270A9A434373
```

### 4. 测试 AI 优化

支付成功后，系统会自动：
1. 调用 Coze API
2. 获取优化方案
3. 显示交易参数
4. 提供"执行兑换"按钮

### 5. 执行兑换

点击"执行兑换"按钮，系统会：
1. 使用 AI 返回的交易数据
2. 发送到对应的 DEX 合约
3. 完成代币兑换

## 错误处理

### 错误 1: 支付金额不足

```
Error: didn't send enough ETH
```

**解决方案**: 确保发送至少 0.1 ETH

### 错误 2: 未连接钱包

```
Error: 请先连接钱包
```

**解决方案**: 点击右上角 "Connect" 按钮

### 错误 3: Coze API 调用失败

```
Error: Coze API 错误: 401
```

**解决方案**: 检查 `COZE_API_TOKEN` 是否正确配置

### 错误 4: 交易被拒绝

```
Error: User denied transaction signature
```

**解决方案**: 在 MetaMask 中点击"确认"

## 合约 ABI

完整的 ABI 已保存在项目中，可以通过以下方式使用：

```typescript
import contractABI from './contract-abi.json';

const contract = new ethers.Contract(
  '0xb81173637860c9B9Bf9c20b07d1c270A9A434373',
  contractABI.abi,
  signer
);

// 调用函数
await contract.paymentConsultationFee({ value: ethers.parseEther('0.1') });
```

## 监控和日志

### 前端日志

打开浏览器控制台（F12）查看：
- 支付交易状态
- AI API 调用
- 交易执行结果

### 后端日志

查看终端输出：
```bash
使用 Coze API 进行优化分析...
Coze API 响应: {...}
AI 返回了路由信息，构建交易数据...
```

### 链上日志

在 Etherscan 查看：
- 交易状态
- Gas 使用情况
- 事件日志

## 安全建议

1. **测试网测试**: 先在 Sepolia 测试网充分测试
2. **金额限制**: 设置合理的最大交易金额
3. **滑点保护**: 使用 AI 推荐的滑点设置
4. **超时处理**: 设置交易超时时间
5. **错误恢复**: 实现完善的错误处理和重试机制

## 相关链接

- 合约地址: https://sepolia.etherscan.io/address/0xb81173637860c9B9Bf9c20b07d1c270A9A434373
- Coze Bot: https://www.coze.cn/open/playground/chat_v3?bot_id=7578017691110621230
- Sepolia 水龙头: https://sepoliafaucet.com/

---

**集成完成！现在可以开始测试了。** 🚀
