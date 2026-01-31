Building Your First Hook
Introduction
Uniswap introduced the v4 of their protocol introducing several new concepts such as hooks, flash accounting, singleton architecture and more. The most interesting of these for developers is hooks, and that’s what we’ll be learning about today.
In this guide, we’ll be conceptualizing, understanding and building a basic points hook, which will give you some idea of how to build your own hook.
What are we building?
Let’s start by conceptualizing what we’re building today and why. Let’s say you have a token named TOKEN that you want to incentivize people to buy. One way of doing so is awarding people points when they buy your token. Prior to v4, you’d have to do this off-chain or via your own helper contract outside of the swap logic, but in v4 you can enable universal access using hooks.
Let’s start by defining when users will be rewarded with these points:
When the user swaps ETH into TOKEN they will get awarded points equal to how much ETH they swapped the token with.
When the user adds liquidity, we award them with points equal to the amount of ETH they added.
In order to keep track of these points, we’ll mint the POINTS token to the user, this has an added benefit for the user to be able to track it in their wallet.
Hook Design
Let’s figure out how our hook will work.
From the Uniswap v4 Documentation, there are several hooks available for developers to integrate with. In our use case, we specifically need the ability to read swaps and figure out what amounts they are swapping for and who they are.
For our hook, we’ll be using afterSwap and afterAddLiquidity hooks. Why these instead of the before... hooks? We’ll dig deeper into this later in this guide.
Note: To initiate the swap in the first place, this is where UniversalRouter comes into play where we will pass in the V4_SWAP command to UniversalRouter.execute.
Let’s create our hook!
We’ll call this hook PointsHook and create it in such a way that any pool paired with TOKEN can use it.
Setting things up
The Uniswap v4-template repo provides a basic foundry environment with required imports already pre-loaded. Click on Use this template to create a new repository with it.
Or simply clone it and install the dependencies:
git clone https://github.com/uniswapfoundation/v4-template.git
cd v4-template
# requires foundry
forge install
forge test

After that let's create a new contract PointsHook.sol in src folder with the following codes:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

contract PointsHook is BaseHook {
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: false,
                afterAddLiquidity: true,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: false,
                afterSwap: true,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }
}

The above code does the following:
import the relevant dependencies
initialize the constructor by passing in the instance of PoolManager
override getHookPermissions from BaseHook.sol to return a struct of permissions to signal which hook functions are to be implemented. It will also be used at deployment to validate the address correctly represents the expected permissions.
Awesome! Now it's all set to start building the hook!
Basic Structure
So far, we’ve created the file named PointsHook.sol which only contains the outline of a hook contract. Let’s add our afterSwap and afterAddLiquidity hooks to it.
contract PointsHook is BaseHook {
    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions()
        public
        pure
        override
        returns (Hooks.Permissions memory)
    {
        return
            Hooks.Permissions({
                beforeInitialize: false,
                afterInitialize: false,
                beforeAddLiquidity: false,
                afterAddLiquidity: true,
                beforeRemoveLiquidity: false,
                afterRemoveLiquidity: false,
                beforeSwap: false,
                afterSwap: true,
                beforeDonate: false,
                afterDonate: false,
                beforeSwapReturnDelta: false,
                afterSwapReturnDelta: false,
                afterAddLiquidityReturnDelta: false,
                afterRemoveLiquidityReturnDelta: false
            });
    }

    function _afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata,
        BalanceDelta delta,
        bytes calldata
    ) internal override returns (bytes4, int128) {
        return (BaseHook.afterSwap.selector, 0);
    }

    function _afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) internal override returns (bytes4, BalanceDelta) {
        return (BaseHook.afterAddLiquidity.selector, delta);
    }
}

You’ll notice that both hooks return their own selector in the functions, this is a pattern used by the protocol to signal “successful” invocation. We’ll talk about rest of the return parameters when we start adding the functionality.
Most of the code at this point should be self-explanatory. It’s not doing anything yet, but it’s a great place to start adding the functionality we need.
Points Logic
First, let’s setup the POINTS token that we’ll reward users with via creating another contract PointsToken.sol and import relevant dependencies like ERC20 and Owned.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import {ERC20} from "solmate/src/tokens/ERC20.sol";
import {Owned} from "solmate/src/auth/Owned.sol";

contract PointsToken is ERC20, Owned {
    constructor() ERC20("Points Token", "POINTS", 18) Owned(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}

Let’s make it so that our hook can mint some!
contract PointsHook is BaseHook {
    PointsToken public pointsToken;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {
        pointsToken = new PointsToken();
    }

    [...]
}

Next, we need to calculate how many points to assign based on the ETH value of the swap or liquidity action. We’ll be awarding POINTS in 1:1 ratio for the ETH, so if the user swapped 1 ETH, we’ll give them 1 POINTS. Let’s also create a function to award these to the user.
    function getPointsForAmount(
        uint256 amount
    ) internal pure returns (uint256) {
        return amount; // 1:1 with ETH
    }

    function awardPoints(address to, uint256 amount) internal {
        pointsToken.mint(to, getPointsForAmount(amount));
    }

Hook Logic
Now we need to actually get the value that the user is swapping or adding liquidity with. We’ll be using the two hooks to achieve that functionality.
Getting the user address
Before we go into the logic for the hook, we have a side quest! How do we actually get the address of the user? The PositionManager doesn’t pass the user address directly to the hook, mainly because of the complexity of getting that data in the first place.
You’d have noticed, both of our hooks have a hookData field at the end. This allows any arbitrary data to be passed to the hook at the time of invocation, and we’ll use this field to encode the user address.
Let’s create some helper functions to encode and decode this data:
    function getHookData(address user) public pure returns (bytes memory) {
        return abi.encode(user);
    }

    function parseHookData(
        bytes calldata data
    ) public pure returns (address user) {
        return abi.decode(data, (address));
    }

Hook Logic: afterSwap
In order for us to award these points to the user, we need a few things and we also need to create a few conditions.
Let’s start with the most basic ones. We want the user to be swapping in the ETH/TOKEN pool and be buying the TOKEN in order to get awarded these POINTS token. Next, we need to figure out who the user is and how much ETH they are spending, and finally award the points accordingly.
    function _afterSwap(
        address,
        PoolKey calldata key,
        IPoolManager.SwapParams calldata swapParams,
        BalanceDelta delta,
        bytes calldata hookData
    ) internal override onlyPoolManager returns (bytes4, int128) {
        // We only award points in the ETH/TOKEN pools.
        if (!key.currency0.isAddressZero()) {
            return (BaseHook.afterSwap.selector, 0);
        }

        // We only award points if the user is buying the TOKEN
        if (!swapParams.zeroForOne) {
            return (BaseHook.afterSwap.selector, 0);
        }

        // Let's figure out who's the user
        address user = parseHookData(hookData);

        // How much ETH are they spending?
        uint256 ethSpendAmount = uint256(int256(-delta.amount0()));

        // And award the points!
        awardPoints(user, ethSpendAmount);

        return (BaseHook.afterSwap.selector, 0);
    }

That middle section about figuring out how much ETH the user spent seems a little fishy, what’s going on there? Let’s break it down.
When amountSpecified is less than 0, it means this is an exact input for output swap, essentially where the user is coming in with an exact amount of ETH. In the other case, it’s an exact output for input swap, where the user is expecting a specific amount out. In our case, we get this from the precalculated delta that Uniswap V4 gives us as a part of the afterSwap hook.
Hook Logic: afterAddLiquidity
Similar to what we did for the afterSwap hook, now we need to award users for adding liquidity. We’ll do the exact same thing here, except we’ll award the points based on the added liquidity.
    function _afterAddLiquidity(
        address sender,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata params,
        BalanceDelta delta,
        BalanceDelta feesAccrued,
        bytes calldata hookData
    ) internal override onlyPoolManager returns (bytes4, BalanceDelta) {
        // We only award points in the ETH/TOKEN pools.
        if (!key.currency0.isAddressZero()) {
            return (BaseHook.afterAddLiquidity.selector, delta);
        }

        // Let's figure out who's the user
        address user = parseHookData(hookData);

        // How much ETH are they spending?
        uint256 ethSpendAmount = uint256(int256(-delta.amount0()));

        // And award the points!
        awardPoints(user, ethSpendAmount);

        return (BaseHook.afterAddLiquidity.selector, delta);
    }

NOTE
It is important to note that the delta should be passed to awardPoints function as it avoids amount errors in case of partial fills.
Testing
We’re using Foundry for building our hook, and we’ll continue using it to write our tests. One of the great things about Foundry is that you can write tests in Solidity itself instead of context switching between another language.
Test Suite
The v4-template repo you cloned already has an existing base test file, let’s start by copying it into PointsHook.t.sol.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import {Fixtures} from "./utils/Fixtures.sol";
import {EasyPosm} from "./utils/EasyPosm.sol";

import {StateLibrary} from "v4-core/src/libraries/StateLibrary.sol";
import {Hooks, IHooks} from "v4-core/src/libraries/Hooks.sol";
import {PointsHook} from "../src/PointsHook.sol";
import {PointsToken} from "../src/PointsToken.sol";

import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId} from "v4-core/src/types/PoolId.sol";
import {Currency} from "v4-core/src/types/Currency.sol";
import {TickMath} from "v4-core/src/libraries/TickMath.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {LiquidityAmounts} from "v4-core/test/utils/LiquidityAmounts.sol";

contract PointsHookTest is Test, Fixtures {
    using EasyPosm for IPositionManager;
    using StateLibrary for IPoolManager;

    PointsHook hook;
    PointsToken pointsToken;
    PoolId poolId;

    uint256 tokenId;
    int24 tickLower;
    int24 tickUpper;

    function setUp() public {
        // creates the pool manager, utility routers, and test tokens
        deployFreshManagerAndRouters();
        deployMintAndApprove2Currencies();

        deployAndApprovePosm(manager);

        // Deploy the hook to an address with the correct flags
        address flags = address(
            uint160(Hooks.AFTER_SWAP_FLAG | Hooks.AFTER_ADD_LIQUIDITY_FLAG) ^
                (0x4444 << 144) // Namespace the hook to avoid collisions
        );
        bytes memory constructorArgs = abi.encode(manager); //Add all the necessary constructor arguments from the hook
        deployCodeTo("PointsHook.sol:PointsHook", constructorArgs, flags);
        hook = PointsHook(flags);
        pointsToken = hook.pointsToken();

        // Create the pool
        key = PoolKey(
            Currency.wrap(address(0)),
            currency1,
            3000,
            60,
            IHooks(hook)
        );
        poolId = key.toId();
        manager.initialize(key, SQRT_PRICE_1_1);

        // Provide full-range liquidity to the pool
        tickLower = TickMath.minUsableTick(key.tickSpacing);
        tickUpper = TickMath.maxUsableTick(key.tickSpacing);

        deal(address(this), 200 ether);

        (uint256 amount0, uint256 amount1) = LiquidityAmounts
            .getAmountsForLiquidity(
                SQRT_PRICE_1_1,
                TickMath.getSqrtPriceAtTick(tickLower),
                TickMath.getSqrtPriceAtTick(tickUpper),
                uint128(100e18)
            );

        (tokenId, ) = posm.mint(
            key,
            tickLower,
            tickUpper,
            100e18,
            amount0 + 1,
            amount1 + 1,
            address(this),
            block.timestamp,
            hook.getHookData(address(this))
        );
    }

    function test_PointsHook_Swap() public {
        // [code here]
    }
}


So far this test setup is fairly simple, we create a bunch of tokens and deploy v4 along with the position manager inside our test. Then, we create a pool with our hook and add some liquidity using the position manager.
Now, let’s write our test. We’ll start by testing the points awarded during the swap.
    function test_PointsHook_Swap() public {
        // We already have some points because we added some liquidity during setup.
        // So, we'll subtract those from the total points to get the points awarded for this swap.
        uint256 startingPoints = pointsToken.balanceOf(address(this));

        // Let's swap some ETH for the token.
        bool zeroForOne = true;
        int256 amountSpecified = -1e18; // negative number indicates exact input swap!
        BalanceDelta swapDelta = swap(
            key,
            zeroForOne,
            amountSpecified,
            hook.getHookData(address(this))
        );

        uint256 endingPoints = pointsToken.balanceOf(address(this));

        // Let's make sure we got the right amount of points!
        assertEq(
            endingPoints - startingPoints,
            uint256(-amountSpecified),
            "Points awarded for swap should be 1:1 with ETH"
        );
    }

This test case is fairly straightforward and simply swaps 1 ETH for the target token and compares if we got the right amount of points awarded for it.
Next, we should test our liquidity addition.
function test_PointsHook_Liquidity() public {
        // We already have some points because we added some liquidity during setup.
        // So, we'll subtract those from the total points to get the points awarded for this swap.
        uint256 startingPoints = pointsToken.balanceOf(address(this));

        uint128 liqToAdd = 100e18;

        (uint256 amount0, uint256 amount1) = LiquidityAmounts
            .getAmountsForLiquidity(
                SQRT_PRICE_1_1,
                TickMath.getSqrtPriceAtTick(tickLower),
                TickMath.getSqrtPriceAtTick(tickUpper),
                liqToAdd
            );

        posm.mint(
            key,
            tickLower,
            tickUpper,
            liqToAdd,
            amount0 + 1,
            amount1 + 1,
            address(this),
            block.timestamp,
            hook.getHookData(address(this))
        );

        uint256 endingPoints = pointsToken.balanceOf(address(this));

        // Let's make sure we got the right amount of points!
        assertApproxEqAbs(endingPoints - startingPoints, uint256(liqToAdd), 10);
    }

This test case looks very similar to the afterSwap one, except we’re testing based on the liquidity added. You’ll notice at the end we’re testing for approximate equality within 10 points. This is to account for minor differences in actual liquidity added due to ticks and pricing.
Next Steps
Congratulations on building your very first hook! You could explore further by going to Hook Deployment to learn about how hook flags work and see how we will deploy a hook in action.
Previous
Subscriber
Next


Hook Deployment
Hook Flags
As mentioned in Concept of Hooks, hook contracts indicate their implemented functions by encoding its behavior in the address of the contract. The PoolManager uses these permissions to determine which hook functions to call for a given pool. See PoolManager deployment addresses here.
Each hook function e.g. beforeSwap - corresponds to a certain flag. For example, the beforeSwap function is correlated to the BEFORE_SWAP_FLAG which has a value of 1 << 7.
These flags represent specific bits in the address of the hook smart contract - and the value of the bit (a one or a zero) represents whether that flag is true or false. An example:
Addresses on Ethereum are 20 bytes long (160 bits). So for example the address:
0x00000000000000000000000000000000000000C0

represented in binary is:
0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 
0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 
0000 0000 0000 0000 0000 0000 1100 0000

In binary it goes from right-to-left - so the trailing 8 bits of this address are 1100 0000 where:
1st Bit to 6th Bit = 0
7th Bit and 8th Bit = 1
The AFTER_SWAP flag is represented by the 7th bit - which is set to 1 for the example contract address. In the PoolManager swap execution flow, it will observe the flag and make a call to the hook's afterSwap function.
Similarly, the 8th bit which is also a 1, actually corresponds to the BEFORE_SWAP i.e. the beforeSwap hook function - which will also be called by the PoolManager during a swap workflow.
A full list of all flags can be found here.
Hook Miner
Because of encoded addresses, hook developers must mine an address to a their particular pattern.
For local testing, deployCodeTo cheatcode in Foundry can be used to deploy hook contract to any address.
But when deploying hooks to an actual network, address mining is required to find the proper deployment address There is a helper library HookMiner.sol that can be used to mine for correct addresses.
Let's see it in action for a Foundry script. We will make use of the example - Points Hook from Building Your First Hook.
First we set up the contract for Foundry script and import the relevant dependencies:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";

import {Constants} from "./base/Constants.sol";
import {PointsHook} from "../src/PointsHook.sol";

/// @notice Mines the address and deploys the PointsHook.sol Hook contract
contract PointsHookScript is Script, Constants {
    function setUp() public {}

    function run() public {

Specify the flags needed to be encoded in the address:
uint160 flags = uint160(
    Hooks.AFTER_ADD_LIQUIDITY_FLAG | Hooks.AFTER_SWAP_FLAG
);

Mine the address by finding a salt that produces a hook address with the desired flags, use the Foundry deterministic deployer when deploying via Foundry script. For most chains, CREATE2_DEPLOYER contract address is 0x4e59b44847b379578588920ca78fbf26c0b4956c.
bytes memory constructorArgs = abi.encode(POOLMANAGER);
(address hookAddress, bytes32 salt) =
    HookMiner.find(CREATE2_DEPLOYER, flags, type(PointsHook).creationCode, constructorArgs);

CREATE2_DEPLOYER
CREATE2_DEPLOYER is the address that will deploy the hook. In forge test, this will be the test contract address(this) or the pranking address.
In forge script, this should be 0x4e59b44847b379578588920cA78FbF26c0B4956C (CREATE2 Deployer Proxy)
Refer to this for more details on deploying contracts with CREATE2: Deploying Contracts with CREATE2
Deploy the hook using CREATE2 with the salt, and compare the deployed address with the address mined:
vm.broadcast();
PointsHook pointsHook = new PointsHook{salt: salt}(IPoolManager(POOLMANAGER));
require(address(pointsHook) == hookAddress, "PointsHookScript: hook address mismatch");

A Complete Foundry Script Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {HookMiner} from "v4-periphery/src/utils/HookMiner.sol";

import {Constants} from "./base/Constants.sol";
import {PointsHook} from "../src/PointsHook.sol";

/// @notice Mines the address and deploys the PointsHook.sol Hook contract
contract PointsHookScript is Script, Constants {
    function setUp() public {}

    function run() public {
        // hook contracts must have specific flags encoded in the address
        uint160 flags = uint160(
            Hooks.BEFORE_SWAP_FLAG | Hooks.AFTER_SWAP_FLAG | Hooks.BEFORE_ADD_LIQUIDITY_FLAG
                | Hooks.BEFORE_REMOVE_LIQUIDITY_FLAG
        );

        // Mine a salt that will produce a hook address with the correct flags
        bytes memory constructorArgs = abi.encode(POOLMANAGER);
        (address hookAddress, bytes32 salt) =
            HookMiner.find(CREATE2_DEPLOYER, flags, type(PointsHook).creationCode, constructorArgs);

        // Deploy the hook using CREATE2
        vm.broadcast();
        PointsHook pointsHook = new PointsHook{salt: salt}(IPoolManager(POOLMANAGER));
        require(address(pointsHook) == hookAddress, "PointsHookScript: hook address mismatch");
    }
}

More docs willbe provided on demand, just ask what docs u need from this:
Unlock Callback & Deltas
Reading Pool State
Custom Accounting
Swap routing
ERC-6909
Position Manager
StateView
Flash Accounting
Access msg.sender Inside a Hook
Calculate LP fees
Subscriber
Technical Reference
Security Framework