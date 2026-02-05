// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";

interface IPoolManager {
    function initialize(
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external returns (int24 tick);
}

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

/// @title InitNewPool
/// @notice Initialize a new pool with reasonable price and add liquidity
contract InitNewPool is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant POOL_MODIFY_LIQUIDITY_TEST = 0x37429cD17Cb1454C34E7F50b09725202Fd533039;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Initializing New Pool with Reasonable Price ===");
        console.log("Hook:", hookAddress);
        console.log("Deployer:", deployer);

        // Check balances
        uint256 usdcBal = IERC20(USDC).balanceOf(deployer);
        uint256 wethBal = IERC20(WETH).balanceOf(deployer);
        console.log("USDC balance:", usdcBal);
        console.log("WETH balance:", wethBal);

        // Sort tokens (USDC < WETH by address)
        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

        console.log("currency0 (USDC):", currency0);
        console.log("currency1 (WETH):", currency1);

        // Create pool key with tick spacing 10 to differentiate from old pool
        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG,
            tickSpacing: 10, // Different tick spacing = different pool
            hooks: IHooks(hookAddress)
        });

        bytes32 poolId = PoolId.unwrap(poolKey.toId());
        console.log("New Pool ID:");
        console.logBytes32(poolId);

        // Target: 1 WETH = 2500 USDC (roughly current market)
        // With USDC as token0 and WETH as token1:
        // price = token1/token0 = WETH/USDC = 1/2500 = 0.0004
        // sqrtPrice = sqrt(0.0004) = 0.02
        // sqrtPriceX96 = 0.02 * 2^96 = 1.58e27
        // But we need to account for decimals: USDC has 6, WETH has 18
        // Real price ratio = (WETH_amount * 10^18) / (USDC_amount * 10^6)
        // For 1 WETH = 2500 USDC: ratio = 10^18 / (2500 * 10^6) = 10^18 / 2.5e9 = 4e8
        // sqrtPrice = sqrt(4e8) = 2e4 = 20000
        // sqrtPriceX96 = 20000 * 2^96 ≈ 1.58e33

        // Actually let's use a simpler approach: pick tick that gives ~$2500 price
        // For USDC/WETH with 6/18 decimals, tick -201300 gives approximately $2500/ETH
        // sqrtPriceX96 at tick -201300 ≈ 3.95e29
        int24 targetTick = -201300;
        targetTick = (targetTick / 10) * 10; // Align to tick spacing 10
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(targetTick);

        console.log("Target tick:", targetTick);
        console.log("sqrtPriceX96:", sqrtPriceX96);

        vm.startBroadcast(deployerPrivateKey);

        // Initialize the pool
        console.log("Initializing pool...");
        int24 actualTick = IPoolManager(POOL_MANAGER).initialize(poolKey, sqrtPriceX96);
        console.log("Pool initialized at tick:", actualTick);

        // Approve tokens for liquidity
        IERC20(USDC).approve(POOL_MODIFY_LIQUIDITY_TEST, type(uint256).max);
        IERC20(WETH).approve(POOL_MODIFY_LIQUIDITY_TEST, type(uint256).max);
        console.log("Tokens approved");

        // Add liquidity in a range around the current tick
        // Range from tick -201600 to -201000 (600 ticks = 60 tick spacings of 10)
        int24 tickLower = -201600;
        int24 tickUpper = -201000;

        // Align to tick spacing
        tickLower = (tickLower / 10) * 10;
        tickUpper = (tickUpper / 10) * 10;

        // Very small liquidity amount we can afford with 20 USDC
        // 1M liquidity needs ~350 USDC, so 50k needs ~17.5 USDC
        int256 liquidityDelta = 50000; // 5e4

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

        console.log("=== SUCCESS ===");
        console.log("New pool initialized and liquidity added!");

        vm.stopBroadcast();
    }
}
