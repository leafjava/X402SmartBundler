@echo off
echo ========================================
echo Gas 费优化器 - 快速启动脚本
echo ========================================
echo.

echo [1/4] 检查环境配置...
if not exist .env.local (
    echo 警告: .env.local 文件不存在
    echo 正在从示例文件创建...
    copy .env.local.example .env.local
    echo.
    echo 请编辑 .env.local 文件，添加以下配置：
    echo - OPENAI_API_KEY=你的OpenAI密钥
    echo - NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=合约地址
    echo.
    pause
)

echo [2/4] 安装依赖...
call npm install
if errorlevel 1 (
    echo 依赖安装失败！
    pause
    exit /b 1
)

echo.
echo [3/4] 编译智能合约...
call npx hardhat compile
if errorlevel 1 (
    echo 合约编译失败！
    pause
    exit /b 1
)

echo.
echo [4/4] 启动开发服务器...
echo.
echo ========================================
echo 服务器启动中...
echo 访问地址: http://localhost:3000/gas-optimizer
echo 按 Ctrl+C 停止服务器
echo ========================================
echo.

call npm run dev
