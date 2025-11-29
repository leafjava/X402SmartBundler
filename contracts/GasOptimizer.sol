// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title GasOptimizer
 * @dev Gas 费优化器合约 - 处理咨询费和代币兑换
 */
contract GasOptimizer is Ownable, ReentrancyGuard {
    // 咨询费接收地址
    address public feeCollector;
    
    // 咨询费金额（USDC，6位小数）
    uint256 public consultationFee = 500000; // 0.5 USDC
    
    // USDC 代币地址
    address public usdcToken;
    
    // 事件
    event ConsultationFeePaid(address indexed user, uint256 amount, uint256 timestamp);
    event TokenSwapped(
        address indexed user,
        address indexed inputToken,
        address indexed outputToken,
        uint256 amountIn,
        uint256 amountOut,
        uint256 timestamp
    );
    event FeeCollectorUpdated(address indexed oldCollector, address indexed newCollector);
    event ConsultationFeeUpdated(uint256 oldFee, uint256 newFee);

    constructor(address _usdcToken, address _feeCollector) {
        require(_usdcToken != address(0), "Invalid USDC address");
        require(_feeCollector != address(0), "Invalid fee collector");
        
        usdcToken = _usdcToken;
        feeCollector = _feeCollector;
    }

    /**
     * @dev 支付咨询费
     */
    function payConsultationFee() external nonReentrant {
        IERC20 usdc = IERC20(usdcToken);
        
        require(
            usdc.transferFrom(msg.sender, feeCollector, consultationFee),
            "Consultation fee transfer failed"
        );
        
        emit ConsultationFeePaid(msg.sender, consultationFee, block.timestamp);
    }

    /**
     * @dev 执行代币兑换（使用 AI 返回的交易数据）
     * @param targetContract 目标合约地址（如 Uniswap Router）
     * @param callData AI 返回的交易数据
     */
    function executeSwap(
        address targetContract,
        bytes calldata callData
    ) external payable nonReentrant returns (bool success, bytes memory returnData) {
        require(targetContract != address(0), "Invalid target contract");
        
        // 执行外部调用
        (success, returnData) = targetContract.call{value: msg.value}(callData);
        
        require(success, "Swap execution failed");
        
        // 注意：这里简化了事件记录，实际应该解析 returnData 获取具体数量
        emit TokenSwapped(
            msg.sender,
            address(0), // 需要从 callData 解析
            address(0), // 需要从 callData 解析
            msg.value,
            0, // 需要从 returnData 解析
            block.timestamp
        );
    }

    /**
     * @dev 更新咨询费金额（仅 owner）
     */
    function updateConsultationFee(uint256 newFee) external onlyOwner {
        uint256 oldFee = consultationFee;
        consultationFee = newFee;
        emit ConsultationFeeUpdated(oldFee, newFee);
    }

    /**
     * @dev 更新费用接收地址（仅 owner）
     */
    function updateFeeCollector(address newCollector) external onlyOwner {
        require(newCollector != address(0), "Invalid collector address");
        address oldCollector = feeCollector;
        feeCollector = newCollector;
        emit FeeCollectorUpdated(oldCollector, newCollector);
    }

    /**
     * @dev 紧急提取代币（仅 owner）
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(amount);
        } else {
            IERC20(token).transfer(owner(), amount);
        }
    }

    // 接收 ETH
    receive() external payable {}
}
