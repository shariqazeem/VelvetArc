// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "./interfaces/IERC20.sol";
import {
    IPoolManager,
    IHooks,
    PoolKey,
    PoolId,
    SwapParams,
    BalanceDelta,
    BeforeSwapDelta,
    Permissions,
    LPFeeLibrary
} from "./interfaces/IUniswapV4.sol";

/// @title VelvetHook
/// @notice Uniswap V4 Hook with AI-controlled dynamic fees
/// @dev Deployed on Base, managed by the Velvet Agent
/// @author Velvet Arc - ETHGlobal HackMoney 2026
contract VelvetHook is IHooks {
    using LPFeeLibrary for uint24;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event FeeUpdated(uint24 indexed oldFee, uint24 indexed newFee, string reason);
    event VolatilityUpdated(VolatilityLevel oldLevel, VolatilityLevel newLevel);
    event LiquidityDeposited(address indexed from, uint256 amount);
    event LiquidityWithdrawn(address indexed to, uint256 amount);
    event SwapProcessed(
        PoolId indexed poolId,
        address indexed sender,
        bool zeroForOne,
        int256 amountSpecified,
        uint24 feeApplied
    );

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAgent();
    error NotPoolManager();
    error FeeTooHigh();
    error InvalidVolatilityLevel();
    error InsufficientLiquidity();
    error ZeroAmount();

    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    enum VolatilityLevel {
        LOW,      // Stable market conditions
        MEDIUM,   // Normal volatility
        HIGH,     // High volatility - defensive mode
        EXTREME   // Circuit breaker conditions
    }

    struct FeeConfig {
        uint24 baseFee;      // Base fee in basis points (100 = 0.01%)
        uint24 lowVolFee;    // Fee during low volatility
        uint24 medVolFee;    // Fee during medium volatility
        uint24 highVolFee;   // Fee during high volatility
        uint24 extremeFee;   // Fee during extreme volatility
    }

    struct PoolMetrics {
        uint256 totalVolume;
        uint256 swapCount;
        uint256 lastSwapTimestamp;
        int256 netFlow;      // Positive = inflow, negative = outflow
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTANTS
    //////////////////////////////////////////////////////////////*/

    uint24 public constant MAX_FEE = 10000;      // 1% max
    uint24 public constant MIN_FEE = 100;        // 0.01% min
    uint24 public constant DEFAULT_FEE = 3000;   // 0.3% default

    /*//////////////////////////////////////////////////////////////
                                 STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice Uniswap V4 Pool Manager
    IPoolManager public immutable POOL_MANAGER;

    /// @notice USDC token on this chain (Base)
    IERC20 public immutable USDC;

    /// @notice Agent address (can update fees)
    address public immutable AGENT;

    /// @notice Contract owner
    address public owner;

    /// @notice Current dynamic fee (in basis points)
    uint24 public dynamicFee;

    /// @notice Current volatility level
    VolatilityLevel public volatilityLevel;

    /// @notice Fee configuration per volatility level
    FeeConfig public feeConfig;

    /// @notice Total liquidity managed by this hook
    uint256 public totalLiquidity;

    /// @notice Pool metrics for each pool this hook serves
    mapping(PoolId => PoolMetrics) public poolMetrics;

    /// @notice Last fee update timestamp
    uint256 public lastFeeUpdate;

    /// @notice Fee update history (for transparency)
    string public lastFeeReason;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyAgent() {
        if (msg.sender != AGENT) revert NotAgent();
        _;
    }

    modifier onlyPoolManager() {
        if (msg.sender != address(POOL_MANAGER)) revert NotPoolManager();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _poolManager Uniswap V4 PoolManager address
    /// @param _usdc USDC token address on Base
    /// @param _agent Agent address authorized to update fees
    constructor(
        address _poolManager,
        address _usdc,
        address _agent
    ) {
        POOL_MANAGER = IPoolManager(_poolManager);
        USDC = IERC20(_usdc);
        AGENT = _agent;
        owner = msg.sender;

        // Initialize fee config
        feeConfig = FeeConfig({
            baseFee: DEFAULT_FEE,
            lowVolFee: 200,      // 0.02% - competitive
            medVolFee: 500,      // 0.05% - standard
            highVolFee: 1500,    // 0.15% - protective
            extremeFee: 5000     // 0.5% - circuit breaker
        });

        dynamicFee = DEFAULT_FEE;
        volatilityLevel = VolatilityLevel.LOW;
        lastFeeUpdate = block.timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                         HOOK IMPLEMENTATION
    //////////////////////////////////////////////////////////////*/

    /// @notice Returns the permissions this hook requires
    function getHookPermissions() external pure override returns (Permissions memory) {
        return Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: true,           // We override fee here
            afterSwap: true,            // We track metrics here
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    /// @notice Called before each swap - returns the dynamic fee
    /// @dev This is where the AI-controlled fee logic takes effect
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata /* hookData */
    ) external override onlyPoolManager returns (bytes4, BeforeSwapDelta, uint24) {
        // Calculate the fee to apply based on current volatility
        uint24 feeToApply = _calculateFee(params);

        // Return the selector, zero delta (no custom accounting), and the fee with override flag
        return (
            IHooks.beforeSwap.selector,
            BeforeSwapDelta.wrap(0),
            feeToApply | LPFeeLibrary.OVERRIDE_FEE_FLAG
        );
    }

    /// @notice Called after each swap - track metrics
    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata /* hookData */
    ) external override onlyPoolManager returns (bytes4, int128) {
        // Calculate pool ID
        PoolId poolId = _toPoolId(key);

        // Update pool metrics
        PoolMetrics storage metrics = poolMetrics[poolId];
        metrics.swapCount++;
        metrics.lastSwapTimestamp = block.timestamp;

        // Track volume (absolute value of amount specified)
        uint256 volume = params.amountSpecified >= 0
            ? uint256(params.amountSpecified)
            : uint256(-params.amountSpecified);
        metrics.totalVolume += volume;

        // Track net flow direction
        metrics.netFlow += params.amountSpecified;

        emit SwapProcessed(poolId, sender, params.zeroForOne, params.amountSpecified, dynamicFee);

        return (IHooks.afterSwap.selector, 0);
    }

    /*//////////////////////////////////////////////////////////////
                          AGENT FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Update volatility level (triggers fee adjustment)
    /// @param newLevel New volatility level
    function setVolatilityLevel(VolatilityLevel newLevel) external onlyAgent {
        if (uint8(newLevel) > uint8(VolatilityLevel.EXTREME)) {
            revert InvalidVolatilityLevel();
        }

        VolatilityLevel oldLevel = volatilityLevel;
        volatilityLevel = newLevel;

        // Auto-adjust fee based on new volatility
        _adjustFeeForVolatility();

        emit VolatilityUpdated(oldLevel, newLevel);
    }

    /// @notice Manually set dynamic fee with reason
    /// @param newFee New fee in basis points
    /// @param reason Human-readable reason for fee change
    function updateDynamicFee(uint24 newFee, string calldata reason) external onlyAgent {
        if (newFee > MAX_FEE) revert FeeTooHigh();
        if (newFee < MIN_FEE) newFee = MIN_FEE;

        uint24 oldFee = dynamicFee;
        dynamicFee = newFee;
        lastFeeUpdate = block.timestamp;
        lastFeeReason = reason;

        emit FeeUpdated(oldFee, newFee, reason);
    }

    /// @notice Update fee configuration
    /// @param _config New fee configuration
    function updateFeeConfig(FeeConfig calldata _config) external onlyAgent {
        if (_config.lowVolFee > MAX_FEE || _config.medVolFee > MAX_FEE ||
            _config.highVolFee > MAX_FEE || _config.extremeFee > MAX_FEE) {
            revert FeeTooHigh();
        }
        feeConfig = _config;
    }

    /// @notice Deposit liquidity for hook operations
    /// @param amount Amount of USDC to deposit
    function depositLiquidity(uint256 amount) external onlyAgent {
        if (amount == 0) revert ZeroAmount();

        bool success = USDC.transferFrom(msg.sender, address(this), amount);
        require(success, "Transfer failed");

        totalLiquidity += amount;
        emit LiquidityDeposited(msg.sender, amount);
    }

    /// @notice Withdraw liquidity
    /// @param amount Amount to withdraw
    /// @param recipient Recipient address
    function withdrawLiquidity(uint256 amount, address recipient) external onlyAgent {
        if (amount == 0) revert ZeroAmount();
        if (amount > totalLiquidity) revert InsufficientLiquidity();

        totalLiquidity -= amount;
        bool success = USDC.transfer(recipient, amount);
        require(success, "Transfer failed");

        emit LiquidityWithdrawn(recipient, amount);
    }

    /// @notice Emergency withdraw all liquidity
    /// @param recipient Recipient address
    function emergencyWithdraw(address recipient) external onlyAgent {
        uint256 amount = totalLiquidity;
        totalLiquidity = 0;

        uint256 balance = USDC.balanceOf(address(this));
        if (balance > 0) {
            USDC.transfer(recipient, balance);
        }

        emit LiquidityWithdrawn(recipient, amount);
    }

    /*//////////////////////////////////////////////////////////////
                         INTERNAL FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Calculate fee based on current state and swap params
    function _calculateFee(SwapParams memory params) internal view returns (uint24) {
        uint24 baseFee = dynamicFee;

        // Adjust based on swap size (larger swaps = slightly higher fee)
        uint256 swapSize = params.amountSpecified >= 0
            ? uint256(params.amountSpecified)
            : uint256(-params.amountSpecified);

        // Large swap adjustment (> 100k USDC)
        if (swapSize > 100_000 * 1e6) {
            baseFee = baseFee + (baseFee / 10); // +10%
        }

        // Cap at max
        if (baseFee > MAX_FEE) {
            baseFee = MAX_FEE;
        }

        return baseFee;
    }

    /// @notice Adjust fee based on volatility level
    function _adjustFeeForVolatility() internal {
        uint24 newFee;
        string memory reason;

        if (volatilityLevel == VolatilityLevel.LOW) {
            newFee = feeConfig.lowVolFee;
            reason = "Low volatility - competitive fees";
        } else if (volatilityLevel == VolatilityLevel.MEDIUM) {
            newFee = feeConfig.medVolFee;
            reason = "Medium volatility - standard fees";
        } else if (volatilityLevel == VolatilityLevel.HIGH) {
            newFee = feeConfig.highVolFee;
            reason = "High volatility - protective fees";
        } else {
            newFee = feeConfig.extremeFee;
            reason = "Extreme volatility - circuit breaker fees";
        }

        uint24 oldFee = dynamicFee;
        dynamicFee = newFee;
        lastFeeUpdate = block.timestamp;
        lastFeeReason = reason;

        emit FeeUpdated(oldFee, newFee, reason);
    }

    /// @notice Convert PoolKey to PoolId
    function _toPoolId(PoolKey calldata key) internal pure returns (PoolId) {
        return PoolId.wrap(keccak256(abi.encode(key)));
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get comprehensive hook status
    function getHookStatus() external view returns (
        uint24 currentFee,
        VolatilityLevel currentVolatility,
        uint256 liquidity,
        uint256 lastUpdate,
        string memory feeReason
    ) {
        return (
            dynamicFee,
            volatilityLevel,
            totalLiquidity,
            lastFeeUpdate,
            lastFeeReason
        );
    }

    /// @notice Get pool-specific metrics
    function getPoolMetrics(PoolId poolId) external view returns (
        uint256 totalVolume,
        uint256 swapCount,
        uint256 lastSwapTime,
        int256 netFlow
    ) {
        PoolMetrics memory m = poolMetrics[poolId];
        return (m.totalVolume, m.swapCount, m.lastSwapTimestamp, m.netFlow);
    }

    /// @notice Calculate fee for a given swap amount (preview)
    function previewFee(int256 amountSpecified) external view returns (uint24) {
        SwapParams memory params = SwapParams({
            zeroForOne: true,
            amountSpecified: amountSpecified,
            sqrtPriceLimitX96: 0
        });
        return _calculateFee(params);
    }

    /// @notice Get fee config
    function getFeeConfig() external view returns (FeeConfig memory) {
        return feeConfig;
    }
}
