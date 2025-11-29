const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("GasOptimizer", function () {
  let gasOptimizer;
  let mockUSDC;
  let owner;
  let user;
  let feeCollector;

  beforeEach(async function () {
    [owner, user, feeCollector] = await ethers.getSigners();

    // 部署 Mock USDC
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("Mock USDC", "USDC", 6);
    await mockUSDC.deployed();

    // 给用户一些 USDC
    await mockUSDC.mint(user.address, ethers.utils.parseUnits("1000", 6));

    // 部署 GasOptimizer
    const GasOptimizer = await ethers.getContractFactory("GasOptimizer");
    gasOptimizer = await GasOptimizer.deploy(mockUSDC.address, feeCollector.address);
    await gasOptimizer.deployed();
  });

  describe("部署", function () {
    it("应该正确设置 USDC 地址", async function () {
      expect(await gasOptimizer.usdcToken()).to.equal(mockUSDC.address);
    });

    it("应该正确设置费用接收地址", async function () {
      expect(await gasOptimizer.feeCollector()).to.equal(feeCollector.address);
    });

    it("应该设置默认咨询费为 0.5 USDC", async function () {
      const fee = await gasOptimizer.consultationFee();
      expect(fee).to.equal(ethers.utils.parseUnits("0.5", 6));
    });
  });

  describe("支付咨询费", function () {
    it("应该成功支付咨询费", async function () {
      const fee = await gasOptimizer.consultationFee();
      
      // 用户授权
      await mockUSDC.connect(user).approve(gasOptimizer.address, fee);
      
      // 支付前余额
      const beforeBalance = await mockUSDC.balanceOf(feeCollector.address);
      
      // 支付咨询费
      await expect(gasOptimizer.connect(user).payConsultationFee())
        .to.emit(gasOptimizer, "ConsultationFeePaid")
        .withArgs(user.address, fee, await ethers.provider.getBlockNumber() + 1);
      
      // 支付后余额
      const afterBalance = await mockUSDC.balanceOf(feeCollector.address);
      expect(afterBalance.sub(beforeBalance)).to.equal(fee);
    });

    it("未授权时应该失败", async function () {
      await expect(
        gasOptimizer.connect(user).payConsultationFee()
      ).to.be.reverted;
    });

    it("余额不足时应该失败", async function () {
      const poorUser = (await ethers.getSigners())[3];
      const fee = await gasOptimizer.consultationFee();
      
      await mockUSDC.connect(poorUser).approve(gasOptimizer.address, fee);
      
      await expect(
        gasOptimizer.connect(poorUser).payConsultationFee()
      ).to.be.reverted;
    });
  });

  describe("管理功能", function () {
    it("Owner 应该能更新咨询费", async function () {
      const newFee = ethers.utils.parseUnits("1", 6);
      
      await expect(gasOptimizer.updateConsultationFee(newFee))
        .to.emit(gasOptimizer, "ConsultationFeeUpdated");
      
      expect(await gasOptimizer.consultationFee()).to.equal(newFee);
    });

    it("非 Owner 不能更新咨询费", async function () {
      const newFee = ethers.utils.parseUnits("1", 6);
      
      await expect(
        gasOptimizer.connect(user).updateConsultationFee(newFee)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Owner 应该能更新费用接收地址", async function () {
      const newCollector = user.address;
      
      await expect(gasOptimizer.updateFeeCollector(newCollector))
        .to.emit(gasOptimizer, "FeeCollectorUpdated");
      
      expect(await gasOptimizer.feeCollector()).to.equal(newCollector);
    });

    it("不能设置零地址为费用接收地址", async function () {
      await expect(
        gasOptimizer.updateFeeCollector(ethers.constants.AddressZero)
      ).to.be.revertedWith("Invalid collector address");
    });
  });
});

// Mock ERC20 合约（用于测试）
// 需要创建 contracts/mocks/MockERC20.sol
