// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

interface IPoolModifyLiquidityTest {
    struct ModifyLiquidityParams {
        int24 tickLower;
        int24 tickUpper;
        int256 liquidityDelta;
        bytes32 salt;
    }

    function modifyLiquidity(
        PoolKey calldata key,
        ModifyLiquidityParams calldata params,
        bytes calldata hookData
    ) external returns (int256, int256);
}

/// @title AddLiquidityAtTick
/// @notice Adds liquidity at a range around tick -354560 where our pool is
contract AddLiquidityAtTick is Script {
    address constant POOL_MODIFY_LIQUIDITY_TEST = 0x37429cD17Cb1454C34E7F50b09725202Fd533039;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Liquidity Around Current Tick ===");
        console.log("Hook:", hookAddress);
        console.log("Deployer:", deployer);

        // Check balances
        uint256 usdcBal = IERC20(USDC).balanceOf(deployer);
        uint256 wethBal = IERC20(WETH).balanceOf(deployer);
        console.log("USDC balance:", usdcBal);
        console.log("WETH balance:", wethBal);

        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

        console.log("currency0:", currency0);
        console.log("currency1:", currency1);

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(hookAddress)
        });

        vm.startBroadcast(deployerPrivateKey);

        // Approve tokens
        IERC20(USDC).approve(POOL_MODIFY_LIQUIDITY_TEST, type(uint256).max);
        IERC20(WETH).approve(POOL_MODIFY_LIQUIDITY_TEST, type(uint256).max);

        console.log("Tokens approved");

        // Current tick is around -354552 (USDC is currency0, WETH is currency1)
        // Since USDC < WETH address-wise, current tick being negative means
        // price of currency1 (WETH) in terms of currency0 (USDC) is low
        //
        // For a range ABOVE current tick: only currency0 (USDC) needed
        // For a range BELOW current tick: only currency1 (WETH) needed
        // For a range CROSSING current tick: both needed

        // Let's add WETH-only liquidity BELOW current tick
        // We have 0.12 WETH which should be enough for a small position
        int24 tickLower = -360000; // Well below current tick
        int24 tickUpper = -354600; // Just below current tick (-354552)

        // Make sure ticks are aligned to spacing
        tickLower = (tickLower / TICK_SPACING) * TICK_SPACING;
        tickUpper = (tickUpper / TICK_SPACING) * TICK_SPACING;

        // Use very small liquidity to minimize WETH needed
        int256 liquidityDelta = 100000; // 1e5 - very small

        console.log("Adding WETH-only liquidity below current tick");
        console.log("tickLower:", tickLower);
        console.log("tickUpper:", tickUpper);
        console.log("liquidityDelta:", liquidityDelta);

        IPoolModifyLiquidityTest(POOL_MODIFY_LIQUIDITY_TEST).modifyLiquidity(
            poolKey,
            IPoolModifyLiquidityTest.ModifyLiquidityParams({
                tickLower: tickLower,
                tickUpper: tickUpper,
                liquidityDelta: liquidityDelta,
                salt: bytes32(0)
            }),
            ""
        );

        console.log("Liquidity added!");

        vm.stopBroadcast();
    }
}
