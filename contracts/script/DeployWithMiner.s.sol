// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VelvetHook} from "../src/VelvetHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "@uniswap/v4-core/src/types/PoolKey.sol";
import {Currency} from "@uniswap/v4-core/src/types/Currency.sol";
import {IHooks} from "@uniswap/v4-core/src/interfaces/IHooks.sol";
import {Hooks} from "@uniswap/v4-core/src/libraries/Hooks.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";
import {IERC20} from "../src/interfaces/IERC20.sol";

/// @title DeployVelvetHook
/// @notice Deploys VelvetHook at a valid address using CREATE2 salt mining
contract DeployVelvetHook is Script {
    // Base Sepolia addresses
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // CREATE2 Deployer Proxy (standard address used by forge script)
    address constant CREATE2_DEPLOYER = 0x4e59b44847b379578588920cA78FbF26c0B4956C;

    function run() external returns (address hookAddress) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== VelvetHook Deployment with Address Mining ===");
        console.log("Deployer:", deployer);
        console.log("PoolManager:", POOL_MANAGER);
        console.log("");

        // Calculate required flags for VelvetHook permissions:
        // - afterInitialize: true (bit 12)
        // - beforeSwap: true (bit 7)
        // - afterSwap: true (bit 6)
        uint160 flags = uint160(
            Hooks.AFTER_INITIALIZE_FLAG |
            Hooks.BEFORE_SWAP_FLAG |
            Hooks.AFTER_SWAP_FLAG
        );

        console.log("Required flags:", flags);
        console.log("Binary: afterInitialize + beforeSwap + afterSwap");
        console.log("");

        // Mine the salt
        console.log("Mining for valid hook address...");

        bytes memory creationCode = type(VelvetHook).creationCode;
        bytes memory constructorArgs = abi.encode(
            IPoolManager(POOL_MANAGER),
            USDC,
            deployer // agent
        );

        (address minedAddress, bytes32 salt) = HookMiner.find(
            CREATE2_DEPLOYER,
            flags,
            creationCode,
            constructorArgs
        );

        console.log("Found valid address:", minedAddress);
        console.log("Salt:", vm.toString(salt));
        console.log("");

        // Deploy using the mined salt
        vm.startBroadcast(deployerPrivateKey);

        VelvetHook hook = new VelvetHook{salt: salt}(
            IPoolManager(POOL_MANAGER),
            USDC,
            deployer
        );

        console.log("Hook deployed at:", address(hook));
        require(address(hook) == minedAddress, "Address mismatch!");

        // Verify the hook permissions match
        Hooks.Permissions memory perms = hook.getHookPermissions();
        require(perms.afterInitialize, "afterInitialize not set");
        require(perms.beforeSwap, "beforeSwap not set");
        require(perms.afterSwap, "afterSwap not set");

        console.log("Hook permissions verified!");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Update .env.local:");
        console.log("NEXT_PUBLIC_HOOK_ADDRESS_BASE=", address(hook));

        return address(hook);
    }
}

/// @title InitializePool
/// @notice Initializes the WETH/USDC pool with VelvetHook
contract InitializePool is Script {
    address constant POOL_MANAGER = 0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Pool Initialization ===");
        console.log("Hook:", hookAddress);

        // Determine token ordering (currency0 < currency1)
        address currency0 = USDC < WETH ? USDC : WETH;
        address currency1 = USDC < WETH ? WETH : USDC;

        console.log("Currency0 (lower):", currency0);
        console.log("Currency1 (higher):", currency1);

        PoolKey memory poolKey = PoolKey({
            currency0: Currency.wrap(currency0),
            currency1: Currency.wrap(currency1),
            fee: DYNAMIC_FEE_FLAG,
            tickSpacing: TICK_SPACING,
            hooks: IHooks(hookAddress)
        });

        // Calculate initial sqrtPriceX96 for ~$2500 ETH
        // sqrtPriceX96 = sqrt(price) * 2^96
        // For USDC/WETH where USDC is currency0:
        // price = amount1/amount0 = WETH/USDC = 1/2500 (in terms of raw amounts considering decimals)
        // USDC has 6 decimals, WETH has 18 decimals
        // price = (1e18 WETH) / (2500e6 USDC) = 1e18 / 2.5e9 = 4e8
        // sqrtPrice = sqrt(4e8) = 2e4
        // sqrtPriceX96 = 2e4 * 2^96 = 1.585e33

        uint160 sqrtPriceX96;
        if (currency0 == USDC) {
            // USDC is currency0, WETH is currency1
            // price = WETH per USDC = 1/2500 adjusted for decimals
            sqrtPriceX96 = 1585889146846679885696; // approximately sqrt(1/2500 * 1e12) * 2^96
        } else {
            // WETH is currency0, USDC is currency1
            // price = USDC per WETH = 2500 adjusted for decimals
            sqrtPriceX96 = 3961408125713216879677197516800; // approximately sqrt(2500 * 1e-12) * 2^96
        }

        console.log("sqrtPriceX96:", sqrtPriceX96);

        vm.startBroadcast(deployerPrivateKey);

        int24 tick = IPoolManager(POOL_MANAGER).initialize(poolKey, sqrtPriceX96);

        console.log("Pool initialized at tick:", tick);

        vm.stopBroadcast();

        console.log("");
        console.log("=== Pool Ready ===");
        console.log("Next: Add liquidity using AddLiquidity script");
    }
}

/// @title AddLiquiditySimple
/// @notice Adds liquidity to the Velvet pool using PoolModifyLiquidityTest
contract AddLiquiditySimple is Script {
    address constant POOL_MODIFY_LIQUIDITY_TEST = 0x37429cD17Cb1454C34E7F50b09725202Fd533039;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress, int256 liquidityDelta) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Liquidity ===");
        console.log("Hook:", hookAddress);
        console.log("Liquidity delta:", liquidityDelta);

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

        console.log("Tokens approved");

        // Add liquidity using the test contract
        // We'll add liquidity in a wide range around the current price
        int24 tickLower = -887220; // min tick for 60 spacing
        int24 tickUpper = 887220;  // max tick for 60 spacing

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

/// @title ExecuteSwap
/// @notice Executes a test swap through the Velvet pool
contract ExecuteSwap is Script {
    address constant POOL_SWAP_TEST = 0x8B5bcC363ddE2614281aD875bad385E0A785D3B9;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress, bool zeroForOne, int256 amountSpecified) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        console.log("=== Executing Swap ===");
        console.log("Hook:", hookAddress);
        console.log("zeroForOne:", zeroForOne);
        console.log("amountSpecified:", amountSpecified);

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
        IERC20(USDC).approve(POOL_SWAP_TEST, type(uint256).max);
        IERC20(WETH).approve(POOL_SWAP_TEST, type(uint256).max);

        // Execute swap
        IPoolSwapTest.TestSettings memory testSettings = IPoolSwapTest.TestSettings({
            takeClaims: false,
            settleUsingBurn: false
        });

        IPoolSwapTest.SwapParams memory params = IPoolSwapTest.SwapParams({
            zeroForOne: zeroForOne,
            amountSpecified: amountSpecified,
            sqrtPriceLimitX96: zeroForOne ? 4295128739 + 1 : 1461446703485210103287273052203988822378723970342 - 1
        });

        int256 delta = IPoolSwapTest(POOL_SWAP_TEST).swap(poolKey, params, testSettings, "");

        console.log("Swap executed! Delta:", delta);

        vm.stopBroadcast();
    }
}

interface IPoolSwapTest {
    struct TestSettings {
        bool takeClaims;
        bool settleUsingBurn;
    }

    struct SwapParams {
        bool zeroForOne;
        int256 amountSpecified;
        uint160 sqrtPriceLimitX96;
    }

    function swap(
        PoolKey calldata key,
        SwapParams calldata params,
        TestSettings calldata testSettings,
        bytes calldata hookData
    ) external payable returns (int256);
}

/// @title AddLiquidityNarrow
/// @notice Adds narrow-range liquidity that works with small token amounts
contract AddLiquidityNarrow is Script {
    address constant POOL_MODIFY_LIQUIDITY_TEST = 0x37429cD17Cb1454C34E7F50b09725202Fd533039;
    address constant USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;
    address constant WETH = 0x4200000000000000000000000000000000000006;

    uint24 constant DYNAMIC_FEE_FLAG = 0x800000;
    int24 constant TICK_SPACING = 60;

    function run(address hookAddress) external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Adding Narrow-Range Liquidity ===");
        console.log("Hook:", hookAddress);
        console.log("Deployer:", deployer);

        // Check balances
        uint256 usdcBal = IERC20(USDC).balanceOf(deployer);
        uint256 wethBal = IERC20(WETH).balanceOf(deployer);
        console.log("USDC balance:", usdcBal);
        console.log("WETH balance:", wethBal);

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

        console.log("Tokens approved");

        // Current tick is around -354552
        // For single-sided WETH: provide below current tick
        // Both tickLower and tickUpper < currentTick means we only need currency1 (WETH)
        int24 tickLower = -360000; // Below current tick
        int24 tickUpper = -354600; // Just below current tick

        // Liquidity amount that works with 0.1 WETH
        int256 liquidityDelta = 100000000000; // 1e11

        console.log("Adding single-sided WETH liquidity");
        console.log("tickLower:", tickLower);
        console.log("tickUpper:", tickUpper);

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
