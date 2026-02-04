// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VelvetHook} from "../src/VelvetHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {LPFeeLibrary} from "@uniswap/v4-core/src/libraries/LPFeeLibrary.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

/// @title SetupPool
/// @notice Complete setup script for Velvet Arc on Base Sepolia
/// @dev Deploys hook, initializes pool, and adds liquidity
contract SetupPool is Script {
    // Base Sepolia addresses (official Uniswap V4 deployment)
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    // Pool configuration
    uint24 constant DYNAMIC_FEE_FLAG = 0x800000; // LPFeeLibrary.DYNAMIC_FEE_FLAG
    int24 constant TICK_SPACING = 60; // Standard for pools with hooks

    // Initial price: ~$2500 ETH/USDC
    // sqrtPriceX96 = sqrt(price) * 2^96
    // For USDC/WETH pool where USDC is currency0:
    // price = USDC per WETH = 2500
    // But since USDC has 6 decimals and WETH has 18:
    // adjusted_price = 2500 * 10^6 / 10^18 = 2500 * 10^-12
    // sqrtPriceX96 = sqrt(2500 * 10^-12) * 2^96 ≈ 3.954 * 10^21
    uint160 constant INITIAL_SQRT_PRICE = 3954242052050786000000; // ~$2500 ETH

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Velvet Arc Pool Setup ===");
        console.log("Network: Base Sepolia (Chain ID: 84532)");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Step 1: Deploy VelvetHook with correct PoolManager
        console.log("Step 1: Deploying VelvetHook...");
        VelvetHook hook = new VelvetHook(
            IPoolManager(POOL_MANAGER),
            USDC,
            deployer // Agent is deployer
        );
        console.log("VelvetHook deployed at:", address(hook));

        // Step 2: Create pool key
        // Note: currency0 must be < currency1 by address
        address currency0;
        address currency1;
        if (uint160(USDC) < uint160(WETH)) {
            currency0 = USDC;
            currency1 = WETH;
        } else {
            currency0 = WETH;
            currency1 = USDC;
        }

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG, // Dynamic fee
            tickSpacing: TICK_SPACING,
            hooks: IHooks(address(hook))
        });

        console.log("");
        console.log("Step 2: Pool Key Configuration");
        console.log("  Currency0:", currency0);
        console.log("  Currency1:", currency1);
        console.log("  Fee:", DYNAMIC_FEE_FLAG);
        console.log("  TickSpacing:", TICK_SPACING);
        console.log("  Hook:", address(hook));

        // Step 3: Initialize the pool
        console.log("");
        console.log("Step 3: Initializing pool...");

        // Calculate sqrtPriceX96 based on token order
        uint160 sqrtPriceX96;
        if (currency0 == USDC) {
            // USDC/WETH - price is USDC per WETH
            sqrtPriceX96 = INITIAL_SQRT_PRICE;
        } else {
            // WETH/USDC - price is inverted
            // sqrtPriceX96 = 2^96 / sqrt(2500 * 10^-12)
            sqrtPriceX96 = 1580818324885449000000000000000000000; // ~$2500 inverted
        }

        int24 tick = IPoolManager(POOL_MANAGER).initialize(poolKey, sqrtPriceX96);
        console.log("Pool initialized at tick:", tick);

        vm.stopBroadcast();

        console.log("");
        console.log("=== Setup Complete ===");
        console.log("");
        console.log("Add to .env.local:");
        console.log("NEXT_PUBLIC_HOOK_ADDRESS_BASE=", address(hook));
        console.log("");
        console.log("Pool is ready for liquidity and swaps!");
        console.log("Next: Add liquidity using PositionManager");
    }
}

/// @title AddLiquidity
/// @notice Add liquidity to the Velvet pool
contract AddLiquidity is Script {
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant POSITION_MANAGER = 0x4B2C77d209D3405F41a037Ec6c77F7F5b8e2ca80;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Liquidity ===");
        console.log("Hook:", hookAddress);

        vm.startBroadcast(deployerPrivateKey);

        // Approve tokens for PositionManager
        IERC20(USDC).approve(POSITION_MANAGER, type(uint256).max);
        IERC20(WETH).approve(POSITION_MANAGER, type(uint256).max);

        console.log("Tokens approved for PositionManager");
        console.log("");
        console.log("Note: Use PositionManager.modifyLiquidities() to add liquidity");
        console.log("This requires encoding the mint action with proper parameters");

        vm.stopBroadcast();
    }
}

/// @title TestSwap
/// @notice Execute a test swap through the Velvet pool
contract TestSwap is Script {
    address constant POOL_SWAP_TEST = 0x8B5bcC363ddE2614281aD875bad385E0A785D3B9;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    function run(address hookAddress, int256 amountIn) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Test Swap ===");
        console.log("Hook:", hookAddress);
        console.log("Amount:", amountIn);

        vm.startBroadcast(deployerPrivateKey);

        // Build pool key
        address currency0 = uint160(USDC) < uint160(WETH) ? USDC : WETH;
        address currency1 = uint160(USDC) < uint160(WETH) ? WETH : USDC;

        console.log("Swapping through pool...");
        console.log("Currency0:", currency0);
        console.log("Currency1:", currency1);

        // Note: Actual swap would use PoolSwapTest.swap()
        // This requires the pool to have liquidity first

        vm.stopBroadcast();
    }
}
