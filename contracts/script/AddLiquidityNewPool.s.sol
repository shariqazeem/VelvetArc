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

/// @title AddLiquidityNewPool
/// @notice Add liquidity to the new pool with tick spacing 10
contract AddLiquidityNewPool is Script {
    address constant POOL_MODIFY_LIQUIDITY_TEST = 0x37429cD17Cb1454C34E7F50b09725202Fd533039;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 10; // New pool uses tick spacing 10

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Liquidity to New Pool ===");
        console.log("Hook:", hookAddress);

        uint256 usdcBal = IERC20(USDC).balanceOf(deployer);
        uint256 wethBal = IERC20(WETH).balanceOf(deployer);
        console.log("USDC balance:", usdcBal);
        console.log("WETH balance:", wethBal);

        // Sort tokens
        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

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

        // Pool is at tick -201300
        // Add liquidity ABOVE current tick (USDC only, no WETH needed)
        // This means tickLower > current tick
        int24 tickLower = -201290; // Just above -201300
        int24 tickUpper = -200000; // Well above

        // Align to tick spacing 10
        tickLower = (tickLower / 10) * 10;
        tickUpper = (tickUpper / 10) * 10;

        // Small liquidity
        int256 liquidityDelta = 10000; // 1e4

        console.log("Adding liquidity...");
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

        console.log("=== SUCCESS! Liquidity added! ===");

        vm.stopBroadcast();
    }
}
