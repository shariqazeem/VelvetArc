// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

interface IPoolSwapTest {
    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    struct TestSettings {
        bool takeClaims;
        bool settleUsingBurn;
    }

    function swap(
        PoolKey calldata key,
        SwapParams calldata params,
        TestSettings calldata testSettings,
        bytes calldata hookData
    ) external returns (int256, int256);
}

/// @title ExecuteSwap
/// @notice Execute a swap to demonstrate the hook's dynamic fee
contract ExecuteSwap is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_SWAP_TEST = 0x8B5bcC363ddE2614281aD875bad385E0A785D3B9;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Executing Swap ===");
        console.log("Hook:", hookAddress);
        console.log("Deployer:", deployer);

        uint256 usdcBal = IERC20(USDC).balanceOf(deployer);
        uint256 wethBal = IERC20(WETH).balanceOf(deployer);
        console.log("USDC balance:", usdcBal);
        console.log("WETH balance:", wethBal);

        // Sort tokens
        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

        // Try the original pool with tick spacing 60
        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG,
            tickSpacing: 60,  // Original pool
            hooks: IHooks(hookAddress)
        });

        bytes32 poolId = PoolId.unwrap(poolKey.toId());
        console.log("Pool ID:");
        console.logBytes32(poolId);

        vm.startBroadcast(deployerPrivateKey);

        // Approve tokens
        IERC20(USDC).approve(POOL_SWAP_TEST, type(uint256).max);
        IERC20(WETH).approve(POOL_SWAP_TEST, type(uint256).max);
        console.log("Tokens approved");

        // Swap 1 USDC for WETH (zeroForOne = true because USDC is token0)
        // amountSpecified > 0 means exact input
        int256 swapAmount = 1000000; // 1 USDC (6 decimals)

        console.log("Swapping 1 USDC for WETH...");

        (int256 delta0, int256 delta1) = IPoolSwapTest(POOL_SWAP_TEST).swap(
            poolKey,
            IPoolSwapTest.SwapParams({
                zeroForOne: true, // USDC -> WETH
                amountSpecified: swapAmount,
                sqrtPriceLimitX96: 4295128740 // Min sqrt price
            }),
            IPoolSwapTest.TestSettings({
                takeClaims: false,
                settleUsingBurn: false
            }),
            ""
        );

        console.log("Swap completed!");
        console.log("Delta0 (USDC):", delta0);
        console.log("Delta1 (WETH):", delta1);

        vm.stopBroadcast();
    }
}
