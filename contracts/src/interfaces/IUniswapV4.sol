// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title Uniswap V4 Core Interfaces
/// @notice Minimal interfaces needed for Velvet Hook

/// @notice Pool key identifying a Uniswap V4 pool
struct PoolKey {
    address currency0;
    address currency1;
    uint24 fee;
    int24 tickSpacing;
    address hooks;
}

/// @notice Pool ID is the hash of the pool key
type PoolId is bytes32;

/// @notice Balance delta for token movements
type BalanceDelta is int256;

/// @notice Before swap delta for custom accounting
type BeforeSwapDelta is int256;

/// @notice Swap parameters
struct SwapParams {
    bool zeroForOne;
    int256 amountSpecified;
    uint160 sqrtPriceLimitX96;
}

/// @notice Hook permissions flags
struct Permissions {
    bool beforeInitialize;
    bool afterInitialize;
    bool beforeAddLiquidity;
    bool afterAddLiquidity;
    bool beforeRemoveLiquidity;
    bool afterRemoveLiquidity;
    bool beforeSwap;
    bool afterSwap;
    bool beforeDonate;
    bool afterDonate;
    bool beforeSwapReturnDelta;
    bool afterSwapReturnDelta;
    bool afterAddLiquidityReturnDelta;
    bool afterRemoveLiquidityReturnDelta;
}

/// @notice IPoolManager interface
interface IPoolManager {
    /// @notice Update the dynamic LP fee for a pool
    function updateDynamicLPFee(PoolKey calldata key, uint24 newDynamicLPFee) external;
}

/// @notice IHooks interface that hooks must implement
interface IHooks {
    /// @notice Called before a swap
    function beforeSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        bytes calldata hookData
    ) external returns (bytes4, BeforeSwapDelta, uint24);

    /// @notice Called after a swap
    function afterSwap(
        address sender,
        PoolKey calldata key,
        SwapParams calldata params,
        BalanceDelta delta,
        bytes calldata hookData
    ) external returns (bytes4, int128);

    /// @notice Returns the hook's permissions
    function getHookPermissions() external pure returns (Permissions memory);
}

/// @notice Library for LP fee manipulation
library LPFeeLibrary {
    /// @notice Flag to indicate dynamic fee should be overridden
    uint24 public constant OVERRIDE_FEE_FLAG = 0x800000;

    /// @notice Remove the override flag from a fee
    function removeOverrideFlag(uint24 fee) internal pure returns (uint24) {
        return fee & 0x7FFFFF;
    }

    /// @notice Check if fee has override flag set
    function isOverride(uint24 fee) internal pure returns (bool) {
        return fee & OVERRIDE_FEE_FLAG != 0;
    }
}
