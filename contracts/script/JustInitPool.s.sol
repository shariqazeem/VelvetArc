// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {PoolId, PoolIdLibrary} from "@uniswap/v4-core/src/types/PoolId.sol";
import {TickMath} from "@uniswap/v4-core/src/libraries/TickMath.sol";

interface IPoolManager {
    function initialize(
        PoolKey calldata key,
        uint160 sqrtPriceX96
    ) external returns (int24 tick);
}

/// @title JustInitPool
/// @notice Initialize a new pool ONLY - no liquidity
contract JustInitPool is Script {
    using PoolIdLibrary for PoolKey;

    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Initializing New Pool ===");
        console.log("Hook:", hookAddress);
        console.log("Deployer:", deployer);

        // Sort tokens
        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

        // Tick spacing 10 for new pool
        int24 tickSpacing = 10;

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG,
            tickSpacing: tickSpacing,
            hooks: IHooks(hookAddress)
        });

        bytes32 poolId = PoolId.unwrap(poolKey.toId());
        console.log("New Pool ID:");
        console.logBytes32(poolId);

        // Target tick for ~$2500 ETH price
        int24 targetTick = -201300;
        targetTick = (targetTick / tickSpacing) * tickSpacing;
        uint160 sqrtPriceX96 = TickMath.getSqrtPriceAtTick(targetTick);

        console.log("Target tick:", targetTick);
        console.log("sqrtPriceX96:", sqrtPriceX96);

        vm.startBroadcast(deployerPrivateKey);

        int24 actualTick = IPoolManager(POOL_MANAGER).initialize(poolKey, sqrtPriceX96);
        console.log("Pool initialized at tick:", actualTick);

        vm.stopBroadcast();

        console.log("=== DONE ===");
    }
}
