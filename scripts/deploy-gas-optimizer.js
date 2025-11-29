const hre = require("hardhat");

async function main() {
  console.log("开始部署 GasOptimizer 合约...");

  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  console.log("账户余额:", (await deployer.getBalance()).toString());

  // USDC 地址（Sepolia 测试网）
  const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238";
  
  // 费用接收地址（可以设置为自己的地址）
  const FEE_COLLECTOR = deployer.address;

  console.log("USDC 地址:", USDC_ADDRESS);
  console.log("费用接收地址:", FEE_COLLECTOR);

  // 部署合约
  const GasOptimizer = await hre.ethers.getContractFactory("GasOptimizer");
  const gasOptimizer = await GasOptimizer.deploy(USDC_ADDRESS, FEE_COLLECTOR);

  await gasOptimizer.deployed();

  console.log("✅ GasOptimizer 合约已部署到:", gasOptimizer.address);
  console.log("\n请将以下地址添加到 .env.local 文件:");
  console.log(`NEXT_PUBLIC_GAS_OPTIMIZER_ADDRESS=${gasOptimizer.address}`);

  // 验证合约配置
  const consultationFee = await gasOptimizer.consultationFee();
  console.log("\n合约配置:");
  console.log("- 咨询费:", hre.ethers.utils.formatUnits(consultationFee, 6), "USDC");
  console.log("- USDC 地址:", await gasOptimizer.usdcToken());
  console.log("- 费用接收地址:", await gasOptimizer.feeCollector());

  // 等待几个区块后验证合约
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("\n等待区块确认...");
    await gasOptimizer.deployTransaction.wait(6);
    
    console.log("\n验证合约...");
    try {
      await hre.run("verify:verify", {
        address: gasOptimizer.address,
        constructorArguments: [USDC_ADDRESS, FEE_COLLECTOR],
      });
      console.log("✅ 合约验证成功");
    } catch (error) {
      console.log("⚠️ 合约验证失败:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
