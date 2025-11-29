# Gas 费优化器 - 快速开始

## 🚀 5 分钟快速部署

### 步骤 1: 克隆并安装

```bash
# 如果还没有克隆项目
git clone <your-repo-url>
cd paymind

# 安装依赖
npm install
```

### 步骤 2: 配置环境变量

复制环境变量示例文件：
```bash
copy .env.local.example .env.local
```

编辑 `.env.local`，添加以下配置：

```bash
# OpenAI API Key（必需）
OPENAI_API_KEY=sk-your-openai-api-key-here

# 合约地址（部署后填写）
NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=

# USDC 地址（已配置 Sepolia 测试网）
NEXT_PUBLIC_USDC_ADDRESS=0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238

# 其他已有配置保持不变...
```

### 步骤 3: 编译合约

```bash
npx hardhat compile
```

### 步骤 4: 部署合约

#### 选项 A: 部署到 Sepolia 测试网（推荐）

```bash
npm run gas-optimizer:deploy
```

#### 选项 B: 部署到本地网络

```bash
# 终端 1: 启动本地节点
npx hardhat node

# 终端 2: 部署合约
npm run gas-optimizer:deploy:local
```

部署成功后，将合约地址添加到 `.env.local`：
```bash
NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=0x你的合约地址
```

### 步骤 5: 启动前端

```bash
npm run dev
```

访问: `http://localhost:3000/gas-optimizer`

---

## 📱 使用指南

### 1. 准备钱包

确保你的 MetaMask 钱包有：
- ✅ 测试网 ETH（用于 Gas 费）
- ✅ 测试网 USDC（至少 0.5 USDC 用于咨询费）

**获取测试币**:
- Sepolia ETH: https://sepoliafaucet.com/
- Sepolia USDC: 在 Uniswap 测试网兑换

### 2. 连接钱包

1. 访问 `http://localhost:3000/gas-optimizer`
2. 点击右上角 "Connect" 按钮
3. 选择 MetaMask 并确认连接

### 3. 使用优化器

#### 步骤 1: 输入需求
在输入框中描述你的兑换需求，例如：
```
我要在 Base 链上把 1 ETH 换成 USDC
```

#### 步骤 2: 开始分析
点击"开始分析"按钮

#### 步骤 3: 支付咨询费
- 系统显示需要支付 0.5 USDC
- 点击"支付咨询费"
- 在 MetaMask 中确认交易

#### 步骤 4: 查看优化方案
支付成功后，AI 会返回：
- 最优交易路径
- 推荐滑点设置
- Gas 费优化参数
- 预估输出数量

#### 步骤 5: 执行兑换
- 点击"执行兑换"按钮
- 在 MetaMask 中确认交易
- 等待交易完成

---

## 🧪 测试

### 运行单元测试

```bash
npx hardhat test
```

### 测试 API

```bash
# 测试优化 API
curl -X POST http://localhost:3000/api/optimize-gas \
  -H "Content-Type: application/json" \
  -d '{"prompt":"我要把 1 ETH 换成 USDC","userAddress":"0x..."}'
```

---

## 🐛 常见问题

### Q1: 连接钱包失败
**解决方案**:
1. 确保已安装 MetaMask
2. 检查网络是否正确（Sepolia 或 localhost）
3. 刷新页面重试

### Q2: 支付咨询费失败
**可能原因**:
- USDC 余额不足
- 未授权合约使用 USDC
- Gas 费不足

**解决方案**:
1. 检查 USDC 余额
2. 手动授权合约（在 Etherscan 上）
3. 确保有足够的 ETH 支付 Gas

### Q3: AI 返回错误
**可能原因**:
- OpenAI API Key 无效
- API 配额用完
- 网络问题

**解决方案**:
1. 检查 `.env.local` 中的 API Key
2. 查看控制台错误信息
3. 使用模拟数据测试（无需 API Key）

### Q4: 交易执行失败
**可能原因**:
- 滑点设置过低
- 流动性不足
- Gas 费设置不当

**解决方案**:
1. 增加滑点容忍度
2. 减少交易数量
3. 调整 Gas 费设置

---

## 📚 更多资源

- [完整文档](./GAS_OPTIMIZER_GUIDE.md)
- [演示脚本](./DEMO_SCRIPT.md)
- [合约代码](./contracts/GasOptimizer.sol)
- [前端代码](./app/gas-optimizer/page.tsx)

---

## 🤝 获取帮助

遇到问题？
1. 查看 [常见问题](#-常见问题)
2. 检查浏览器控制台错误
3. 查看 [完整文档](./GAS_OPTIMIZER_GUIDE.md)
4. 提交 Issue

---

## 🎉 开始使用

现在你已经准备好了！访问 `http://localhost:3000/gas-optimizer` 开始体验吧！

**祝你使用愉快！** 🚀
