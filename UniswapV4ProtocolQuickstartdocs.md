Create Pool
Context
Creating a pool on Uniswap v4 is permissionless and enables the trading of an asset. Uniswap v4 is a popular destination for creating markets due to its:
Proven track record and battle-tested codebase
Concentrated liquidity, unlocking capital efficiency
Flexibile pool design through dynamic fees and hooks
Gas-efficient architecture
Integrations with alternative trading venues
For more information, developers should see Uniswap v4 Overview
The guide covers two approaches to creating a pool:
Create a pool only
Create a pool and add initial liquidity, with one transaction
Setup
Developing with Uniswap v4 requires foundry
Install the dependencies:
forge install uniswap/v4-core
forge install uniswap/v4-periphery

Guide: Create a Pool Only
To initialize a Uniswap v4 Pool without initial liquidity, developers should call PoolManager.initialize()
Creating a pool without liquidity may be useful for "reserving" a pool for future use, when initial liquidity is not available, or when external market makers would provide the starting liquidity
1. Configure the Pool
import {PoolKey} from "v4-core/src/types/PoolKey.sol";

PoolKey memory pool = PoolKey({
    currency0: currency0,
    currency1: currency1,
    fee: lpFee,
    tickSpacing: tickSpacing,
    hooks: hookContract
});

For native token pairs (Ether), use CurrencyLibrary.ADDRESS_ZERO as currency0
PoolKey uniquely identifies a pool
Currencies should be sorted, uint160(currency0) < uint160(currency1)
lpFee is the fee expressed in pips, i.e. 3000 = 0.30%
tickSpacing is the granularity of the pool. Lower values are more precise but may be more expensive to trade on
hookContract is the address of the hook contract
A note on tickSpacing:
Lower tick spacing provides improved price precision; however, smaller tick spaces will cause swaps to cross ticks more often, incurring higher gas costs
As a reference, Uniswap v3 pools are configured with:
Fee	Fee Value	Tick Spacing
0.01%	100	1
0.05%	500	10
0.30%	3000	60
1.00%	10_000	200
2. Call initialize
Pools are initialized with a starting price
IPoolManager(manager).initialize(pool, startingPrice);

the startingPrice is expressed as sqrtPriceX96: floor(sqrt(token1 / token0) * 2^96)
i.e. 79228162514264337593543950336 is the starting price for a 1:1 pool
Guide: Create a Pool & Add Liquidity
Uniswap v4's PositionManager supports atomic creation of a pool and initial liquidity using multicall. Developers can create a trading pool, with liquidity, in a single transaction:
1. Initialize the parameters provided to multicall()
bytes[] memory params = new bytes[](2);

The first call, params[0], will encode initializePool parameters
The second call, params[1], will encode a mint operation for modifyLiquidities
2. Configure the pool
PoolKey memory pool = PoolKey({
    currency0: currency0,
    currency1: currency1,
    fee: lpFee,
    tickSpacing: tickSpacing,
    hooks: hookContract
});

For native token pairs (Ether), use CurrencyLibrary.ADDRESS_ZERO as currency0
PoolKey uniquely identifies a pool
Currencies should be sorted, uint160(currency0) < uint160(currency1)
lpFee is the fee expressed in pips, i.e. 3000 = 0.30%
tickSpacing is the granularity of the pool. Lower values are more precise but more expensive to trade
hookContract is the address of the hook contract
3. Encode the initializePool parameters
Pools are initialized with a starting price
import {IPoolInitializer_v4} from "v4-periphery/src/interfaces/IPoolInitializer_v4.sol";

params[0] = abi.encodeWithSelector(
    IPoolInitializer_v4.initializePool.selector,
    pool,
    startingPrice
);

the startingPrice is expressed as sqrtPriceX96: floor(sqrt(token1 / token0) * 2^96)
79228162514264337593543950336 is the starting price for a 1:1 pool
4. Initialize the mint-liquidity parameters
PositionManager's modifyLiquidities uses an encoded command system
bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));

The first command MINT_POSITION creates a new liquidity position
The second command SETTLE_PAIR indicates that tokens are to be paid by the caller, to create the position
5. Encode the MINT_POSITION parameters
bytes[] memory mintParams = new bytes[](2);
mintParams[0] = abi.encode(pool, tickLower, tickUpper, liquidity, amount0Max, amount1Max, recipient, hookData);


pool the same PoolKey defined above, in pool-creation
tickLower and tickUpper are the range of the position, must be a multiple of pool.tickSpacing
liquidity is the amount of liquidity units to add, see LiquidityAmounts for converting token amounts to liquidity units
amount0Max and amount1Max are the maximum amounts of token0 and token1 the caller is willing to transfer
recipient is the address that will receive the liquidity position (ERC-721)
hookData is the optional hook data
6. Encode the SETTLE_PAIR parameters
Creating a position on a pool requires the caller to transfer currency0 and currency1 tokens
mintParams[1] = abi.encode(pool.currency0, pool.currency1);

7. Encode the modifyLiquidites call
// Note: In production, deadlines should be calculated off-chain using real time
// For example: uint256 deadline = block.timestamp + 3600; // 1 hour from now
uint256 deadline = block.timestamp + 3600; // 1 hour deadline
params[1] = abi.encodeWithSelector(
    posm.modifyLiquidities.selector, abi.encode(actions, mintParams), deadline
);

8. Approve the tokens
PositionManager uses Permit2 for token transfers
Repeat for both tokens
// approve permit2 as a spender
IERC20(token).approve(address(permit2), type(uint256).max);

// approve `PositionManager` as a spender
IAllowanceTransfer(address(permit2)).approve(token, address(positionManager), type(uint160).max, type(uint48).max);


9. Execute the multicall
The multicall is used to execute multiple calls in a single transaction
PositionManager(posm).multicall(params);

For pools paired with native tokens (Ether), provide value in the contract call
PositionManager(posm).multicall{value: ethToSend}(params);

Excess Ether is NOT refunded unless developers encoded SWEEP in the actions parameter
For a full end-to-end script, developers should see v4-template's scripts


Manage Liquidity:
Setup
For users looking to interact with the canonical Uniswap v4 PositionManager, v4-periphery is a required dependency
Currently, developing with Uniswap v4 requires foundry
Quickstart
Use v4-template, which has pre-configured dependencies and tests for Uniswap v4
Clone the repository made from v4-template
git clone https://github.com/<your_username>/<your_repo>

Install dependencies
forge install

Manual Setup
After cloning the repository, and installing foundry, developers can manually set up their Uniswap v4 environment:
Initialize a foundry project
forge init . --force

Install dependencies
forge install uniswap/v4-core
forge install uniswap/v4-periphery

Set the remappings.txt to:
@uniswap/v4-core/=lib/v4-core/
forge-gas-snapshot/=lib/v4-core/lib/forge-gas-snapshot/src/
forge-std/=lib/v4-core/lib/forge-std/src/
permit2/=lib/v4-periphery/lib/permit2/
solmate/=lib/v4-core/lib/solmate/
v4-periphery/=lib/v4-periphery/

Mint Position
Similar to Uniswap v3, liquidity positions are minted as ERC-721 tokens and depend on a periphery contract. v4's PositionManager contract will facilitate liquidity management
Context
Please note that PositionManager is a command-based contract, where integrators will be encoding commands and their corresponding parameters.
Setup
See the setup guide
Guide
Below is a step-by-step guide for minting a v4 liquidity position, in solidity
1. Import and define IPositionManager
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";

// inside a contract, test, or foundry script:
IPositionManager posm = IPositionManager(<address>);

2. Encode Actions
To mint a position, two actions are required:
mint operation - the creation of the liquidity position
settle pair - the two tokens to be paid by msg.sender
If providing ETH liquidity, a third action is required:
sweep - to recover excess eth sent to the position manager
import {Actions} from "v4-periphery/src/libraries/Actions.sol";

bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR));

// For ETH liquidity positions
bytes memory actions = abi.encodePacked(uint8(Actions.MINT_POSITION), uint8(Actions.SETTLE_PAIR), uint8(Actions.SWEEP));


3. Encode Parameters
bytes[] memory params = new bytes[](2); // new bytes[](3) for ETH liquidity positions

The MINT_POSITION action requires the following parameters:
Parameter	Type	Description
poolKey	PoolKey	where the liquidity will be added to
tickLower	int24	the lower tick boundary of the position
tickUpper	int24	the upper tick boundary of the position
liquidity	uint256	the amount of liquidity units to mint
amount0Max	uint128	the maximum amount of currency0 msg.sender is willing to pay
amount1Max	uint128	the maximum amount of currency1 msg.sender is willing to pay
recipient	address	the address that will receive the liquidity position (ERC-721)
hookData	bytes	arbitrary data that will be forwarded to hook functions
Currency currency0 = Currency.wrap(<tokenAddress1>); // tokenAddress1 = 0 for native ETH
Currency currency1 = Currency.wrap(<tokenAddress2>);
PoolKey poolKey = PoolKey(currency0, currency1, 3000, 60, IHooks(hook));

params[0] = abi.encode(poolKey, tickLower, tickUpper, liquidity, amount0Max, amount1Max, recipient, hookData);


The SETTLE_PAIR action requires the following parameters:
currency0 - Currency, one of the tokens to be paid by msg.sender
currency1 - Currency, the other token to be paid by msg.sender
params[1] = abi.encode(currency0, currency1);

The SWEEP action requires the following parameters:
currency - Currency, token to sweep - most commonly native Ether: CurrencyLibrary.ADDRESS_ZERO
recipient - address, where to send excess tokens
params[2] = abi.encode(currency, recipient);

4. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities()
uint256 deadline = block.timestamp + 60;

uint256 valueToPass = currency0.isAddressZero() ? amount0Max : 0;

posm.modifyLiquidities{value: valueToPass}(
    abi.encode(actions, params),
    deadline
);

Additional notes:
To obtain balance changes, callers should read token balances before and after the .modifyLiquidities() call


Increase Liquidity
Context
Please note that PositionManager is a command-based contract, where integrators will be encoding commands and their corresponding parameters.
Increasing liquidity assumes the position already exists and the user wants to add more tokens to the position.
Setup
See the setup guide
Guide
Below is a step-by-step guide for increasing a position's liquidity, in solidity.
1. Import and define IPositionManager
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";

// inside a contract, test, or foundry script:
IPositionManager posm = IPositionManager(<address>);

2. Encode Actions
To increase a position's liquidity, the first action must be:
increase operation - the addition of liquidity to an existing position.
For delta resolving operations, developers may need to choose between SETTLE_PAIR, CLOSE_CURRENCY, or CLEAR_OR_TAKE actions.
In Uniswap v4, fee revenue is automatically credited to a position on increasing liquidity
There are some cases, where the fee revenue can entirely "pay" for a liquidity increase, and remainder tokens need to be collected
If increasing the liquidity requires the transfer of both tokens:
settle pair - pays a pair of tokens, to increase liquidity
If increasing the liquidity for ETH positions, a third action is required:
sweep - to recover excess eth sent to the position manager
Otherwise:
close currency - automatically determines if a currency should be settled or taken.
OR clear or take - if the token amount to-be-collected is below a threshold, opt to forfeit the dust. Otherwise, claim the tokens
import {Actions} from "v4-periphery/src/libraries/Actions.sol";

If both tokens need to be sent:
bytes memory actions = abi.encodePacked(uint8(Actions.INCREASE_LIQUIDITY), uint8(Actions.SETTLE_PAIR));


If increasing liquidity for ETH positions:
bytes memory actions = abi.encodePacked(uint8(Actions.INCREASE_LIQUIDITY), uint8(Actions.SETTLE_PAIR), uint8(Actions.SWEEP));


If converting fees to liquidity, and expect excess fees to be collected
bytes memory actions = abi.encodePacked(uint8(Actions.INCREASE_LIQUIDITY), uint8(Actions.CLOSE_CURRENCY), uint8(Actions.CLOSE_CURRENCY));


If converting fees to liquidity, forfeiting dust:
bytes memory actions = abi.encodePacked(uint8(Actions.INCREASE_LIQUIDITY), uint8(Actions.CLEAR_OR_TAKE), uint8(Actions.CLEAR_OR_TAKE));


3. Encoded Parameters
When settling pair (for non-ETH positions):
bytes[] memory params = new bytes[](2);

Otherwise:
bytes[] memory params = new bytes[](3);

The INCREASE_LIQUIDITY action requires the following parameters:
Parameter	Type	Description
tokenId	uint256	position identifier
liquidity	uint256	the amount of liquidity to add
amount0Max	uint128	the maximum amount of currency0 liquidity msg.sender is willing to pay
amount1Max	uint128	the maximum amount of currency1 liquidity msg.sender is willing to pay
hookData	bytes	arbitrary data that will be forwarded to hook functions
params[0] = abi.encode(tokenId, liquidity, amount0Max, amount1Max, hookData);

The SETTLE_PAIR action requires the following parameters:
currency0 - Currency, one of the tokens to be paid by msg.sender
currency1 - Currency, the other token to be paid by msg.sender
In the above case, the parameter encoding is:
Currency currency0 = Currency.wrap(<tokenAddress1>); // tokenAddress1 = 0 for native ETH
Currency currency1 = Currency.wrap(<tokenAddress2>);
params[1] = abi.encode(currency0, currency1);

The SWEEP action requires the following parameters:
currency - Currency, token to sweep - most commonly native Ether: CurrencyLibrary.ADDRESS_ZERO
recipient - address, where to send excess tokens
In this case, the parameter encoding is:
params[2] = abi.encode(currency, recipient);

The CLOSE_CURRENCY action requires only one currency parameter and the encoding is:
params[1] = abi.encode(currency0)
params[2] = abi.encode(currency1)

The CLEAR_OR_TAKE action requires one currency and:
amountMax - uint256, the maximum threshold to concede dust, otherwise taking the dust.
In this case, the parameter encoding is:
params[1] = abi.encode(currency0, amount0Max);
params[2] = abi.encode(currency1, amount1Max);

4. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities().
uint256 deadline = block.timestamp + 60;

uint256 valueToPass = currency0.isAddressZero() ? amount0Max : 0;

posm.modifyLiquidities{value: valueToPass}(
    abi.encode(actions, params),
    deadline
);


Decrease Liquidity
Context
Please note that PositionManager is a command-based contract, where integrators will be encoding commands and their corresponding parameters.
Decreasing liquidity assumes the position already exists and the user wants to remove tokens from the position.
Setup
See the setup guide
Guide
Below is a step-by-step guide for decreasing a position's liquidity, in solidity.
1. Import and define IPositionManager
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";

// inside a contract, test, or foundry script:
IPositionManager posm = IPositionManager(<address>);

2. Encode Actions
To decrease a position's liquidity, the first action must be:
decrease operation - the subtraction of liquidity to an existing position.
For delta resolving operations, developers may need to choose between TAKE_PAIR, CLOSE_CURRENCY, or CLEAR_OR_TAKE actions.
In Uniswap v4, fee revenue is automatically debited to a position on decreasing liquidity
If decreasing the liquidity requires the transfer of both tokens:
take pair - receives a pair of tokens, to decrease liquidity
Otherwise:
clear or take - if the token amount to-be-collected is below a threshold, opt to forfeit the dust. Otherwise, claim the tokens
import {Actions} from "v4-periphery/src/libraries/Actions.sol";

If both tokens need to be sent:
bytes memory actions = abi.encodePacked(uint8(Actions.DECREASE_LIQUIDITY), uint8(Actions.TAKE_PAIR));


If converting fees to liquidity, forfeiting dust:
bytes memory actions = abi.encodePacked(uint8(Actions.DECREASE_LIQUIDITY), uint8(Actions.CLEAR_OR_TAKE), uint8(Actions.CLEAR_OR_TAKE));


3. Encoded Parameters
When taking pair:
bytes[] memory params = new bytes[](2);

Otherwise:
bytes[] memory params = new bytes[](3);

The DECREASE_LIQUIDITY action requires the following parameters:
Parameter	Type	Description
tokenId	uint256	position identifier
liquidity	uint256	the amount of liquidity to remove
amount0Min	uint128	the minimum amount of currency0 liquidity msg.sender is willing to receive
amount1Min	uint128	the minimum amount of currency1 liquidity msg.sender is willing to receive
hookData	bytes	arbitrary data that will be forwarded to hook functions
params[0] = abi.encode(tokenId, liquidity, amount0Min, amount1Min, hookData);

The TAKE_PAIR action requires the following parameters:
currency0 - Currency, one of the tokens to be received
currency1 - Currency, the other token to be received
recipient - Recipient, the recipient to receive the tokens
In the above case, the parameter encoding is:
Currency currency0 = Currency.wrap(<tokenAddress1>); // tokenAddress1 = 0 for native ETH
Currency currency1 = Currency.wrap(<tokenAddress2>);
params[1] = abi.encode(currency0, currency1, recipient);

The CLEAR_OR_TAKE action requires one currency and:
amountMax - uint256, the maximum threshold to concede dust, otherwise taking the dust.
In this case, the parameter encoding is:
params[1] = abi.encode(currency0, amount0Max);
params[2] = abi.encode(currency1, amount1Max);

4. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities().
uint256 deadline = block.timestamp + 60;

uint256 valueToPass = currency0.isAddressZero() ? amount0Max : 0;

posm.modifyLiquidities{value: valueToPass}(
    abi.encode(actions, params),
    deadline
);

Previous
Increase Liquidity
Next
Collect Fees
On this page
Context
Setup
Guide
1. Import and define IPositionManager
2. Encode Actions
3. Encoded Parameters
4. Submit Call
Ask AI
Edit this page
Footer
Uniswap Docs


Collect Fees
Setup
See the setup guide
Guide
In order to collect fees, the integrator must execute encoded actions using the PositionManager contract. Note that there is no COLLECT command, instead developers must decrease liquidity with a zero liquidity change.
1. Import and define IPositionManager
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";
// inside a contract, test, or foundry script:
IPositionManager posm = IPositionManager(<address>);

2. Encode actions
To collect fees, the following operations are required:
decrease liquidity - collect fees from the core contract
take pair - transfer the fee revenue, as both tokens, to a recipient
import {Actions} from "v4-periphery/src/libraries/Actions.sol";
bytes memory actions = abi.encodePacked(uint8(Actions.DECREASE_LIQUIDITY), uint8(Actions.TAKE_PAIR));


3. Encode Parameters
bytes[] memory params = new bytes[](2);

The DECREASE_LIQUIDITY action requires the following parameters:
Parameter	Type	Description
tokenId	uint256	position identifier
liquidity	uint256	the amount of liquidity to withdraw
amount0Min	uint128	the minimum amount of currency0 liquidity msg.sender is expecting to get back
amount1Min	uint128	the minimum amount of currency1 liquidity msg.sender is expecting to get back
hookData	bytes	arbitrary data that will be forwarded to hook functions
Note that in order to collect fees we will default liquidity, amount0Min and amount1Min to 0. Because fee collection can not be manipulated in a front-run attack, it is safe to set the slippage values amount0Min, amount1Min to 0.
/// @dev collecting fees is achieved with liquidity=0, the second parameter
params[0] = abi.encode(tokenId, 0, 0, 0, hookData);

The TAKE_PAIR action requires the following parameters:
currency0 - Currency, one of the tokens to be paid by msg.sender
currency1 - Currency, the other token to be paid by msg.sender
recipient - address, destination of the fee revenue for both tokens
Currency currency0 = Currency.wrap(<tokenAddress1>); // tokenAddress1 = 0 for native ETH
Currency currency1 = Currency.wrap(<tokenAddress2>);
params[1] = abi.encode(currency0, currency1, recipient);

4. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities().
uint256 deadline = block.timestamp + 60;

uint256 valueToPass = currency0.isAddressZero() ? amount0Max : 0;

posm.modifyLiquidities{value: valueToPass}(
    abi.encode(actions, params),
    deadline
);

Additional notes:
To obtain the amount of fees received, callers should read token balances before and after the .modifyLiquidities() call.


Burn Position
Context
To liquidate a position, the burn functionality can be invoked. The funds in the position will be withdrawn and all the information of the underlying token will be cleared. Burning the position is a cost effective way to exit as a liquidity provider.
Setup
See the setup guide
Guide
Below is a step-by-step guide to burn a position.
1. Import and define IPositionManager
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";

// inside a contract, test, or foundry script:
IPositionManager posm = IPositionManager(<address>);

2. Encode Actions
To burn a position, two actions are required:
burn operation - clears position entirely, withdrawing funds
take pair - sends withdrawn funds to the recipient
import {Actions} from "v4-periphery/src/libraries/Actions.sol";

bytes memory actions = abi.encodePacked(uint8(Actions.BURN_POSITION), uint8(Actions.TAKE_PAIR));

3. Encode Parameters
bytes[] memory params = new bytes[](2);

The BURN_POSITION action requires the following parameters:
Parameter	Type	Description
tokenId	uint256	position identifier
amount0Min	uint128	the minimum amount of currency0 liquidity msg.sender is expecting to get back
amount1Min	uint128	the minimum amount of currency1 liquidity msg.sender is expecting to get back
hookData	bytes	arbitrary data that will be forwarded to hook functions
params[0] = abi.encode(tokenId, amount0Min, amount1Min, hookData);

The TAKE_PAIR action requires the following parameters:
Parameter	Type	Description
currency0	Currency	first token currency
currency1	Currency	second token currency
recipient	address	address that will receive the tokens
params[1] = abi.encode(currency0, currency1, recipient);

4. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities()
uint256 deadline = block.timestamp + 60;

posm.modifyLiquidities(
    abi.encode(actions, params),
    deadline
);

Batch Modify
Context
As seen in previous guides, PositionManager is a command-based contract. This design is conducive to batching complex liquidity operations. For example, developers can encode efficient logic to move liquidity between two positions on entirely different Pools.
Setup
See the setup guide
Guide
Below is a general reference guide for batch-operating on multiple liquidity positions, in solidity. This guide does not focus on a specific batch sequence, and is intended to be a general guide for PositionManager's command-based interface.
1. Encoded Actions
Actions are divided into two types: liquidity-operations and delta-resolving.
liquidity-operations - actions which that incur a balance-change, a change in the pool's liquidity
delta-resolving - actions which facilitate token transfers, such as settling and taking
The ordering of actions determines the sequence of operations. The minimum number of actions is roughly two actions; and the maximum is limited by block gas limit. Additionally, liquidity-operations do not have to happen prior to delta-resolving actions. Developers can mix / alternate between the two types of actions.
However is good practice to perform liquidity-operations before delta-resolving actions. Minimizing token transfers and leveraging flash accounting is more gas efficient
Example: Action.Y happens after Action.X but before Action.Z
import {Actions} from "v4-periphery/src/libraries/Actions.sol";

bytes memory actions = abi.encodePacked(uint8(Actions.X), uint8(Actions.Y), uint8(Actions.Z), ...);

A Note on Special Actions:
PositionManager supports a few delta-resolving actions beyond the standard SETTLE and TAKE actions
CLOSE_CURRENCY - automatically determines if a currency should be settled (paid) or taken. Used for cases where callers may not know the final delta
CLEAR_OR_TAKE- forfeit tokens if the amount is below a specified threshold, otherwise take the tokens. Used for cases where callers may expect to produce dust
SWEEP - return any excess token balances to a recipient. Used for cases where callers may conversatively overpay tokens
2. Encoded Parameters
Each action has its own parameters to encode. Generally:
liquidity-operations - encode tokenIds, liquidity amounts, and slippage
delta-resolving - encode currencies, amounts, and recipients
Because actions are ordered, the parameters "zip" with their corresponding actions. The second parameter corresponds to the second action. Every action has its own encoded parameters
bytes[] memory params = new bytes[](3);

params[0] = abi.encode(...); // parameters for the first action
params[1] = abi.encode(...); // parameters for the second action
params[2] = abi.encode(...); // parameters for the third action

3. Submit Call
The entrypoint for all liquidity operations is modifyLiquidities()
uint256 deadline = block.timestamp + 60;

posm.modifyLiquidities(
    abi.encode(actions, params),
    deadline
);


Swap
Swapping on Uniswap v4
The Universal Router is a flexible, gas-efficient contract designed to execute complex swap operations across various protocols, including Uniswap v4. It serves as an intermediary between users and the Uniswap v4 PoolManager, handling the intricacies of swap execution.
Although it's technically possible to interact directly with the PoolManager contract for swaps, this approach is not recommended due to its complexity and potential inefficiencies. Instead, the Universal Router is the preferred method, as it abstracts away these complexities. By using the Universal Router, developers and users can ensure a more straightforward, efficient, and standardized approach to executing swaps on v4 pools, aligning with best practices for Uniswap interactions.
Configuring Universal Router for Uniswap v4 Swaps
Set up a foundry project and install the necessary dependencies:
forge install uniswap/v4-core
forge install uniswap/v4-periphery
forge install uniswap/permit2
forge install uniswap/universal-router
forge install uniswap/v3-core
forge install uniswap/v2-core
forge install OpenZeppelin/openzeppelin-contracts

In the remappings.txt, add the following:
@uniswap/v4-core/=lib/v4-core/
@uniswap/v4-periphery/=lib/v4-periphery/
@uniswap/permit2/=lib/permit2/
@uniswap/universal-router/=lib/universal-router/
@uniswap/v3-core/=lib/v3-core/
@uniswap/v2-core/=lib/v2-core/
@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/
[...]

Step 1: Set Up the Project
First, we need to set up our project and import the necessary dependencies. We'll create a new Solidity contract for our example.
// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import { UniversalRouter } from "@uniswap/universal-router/contracts/UniversalRouter.sol";
import { Commands } from "@uniswap/universal-router/contracts/libraries/Commands.sol";
import { IPoolManager } from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";
import { IV4Router } from "@uniswap/v4-periphery/src/interfaces/IV4Router.sol";
import { Actions } from "@uniswap/v4-periphery/src/libraries/Actions.sol";
import { IPermit2 } from "@uniswap/permit2/src/interfaces/IPermit2.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { StateLibrary } from "@uniswap/v4-core/src/libraries/StateLibrary.sol";

contract Example {
    using StateLibrary for IPoolManager;

    UniversalRouter public immutable router;
    IPoolManager public immutable poolManager;
    IPermit2 public immutable permit2;

    constructor(address _router, address _poolManager, address _permit2) {
        router = UniversalRouter(payable(_router));
        poolManager = IPoolManager(_poolManager);
        permit2 = IPermit2(_permit2);
    }

    // We'll add more functions here
}

In this step, we're importing the necessary contracts and interfaces:
UniversalRouter: This will be our main interface for executing swaps. It provides a flexible way to interact with various Uniswap versions and other protocols.
Commands: This library contains the command definitions used by the UniversalRouter.
IPoolManager: This interface is needed for interacting with Uniswap v4 pools. While we don't directly use it in our simple example, it's often necessary for more complex interactions with v4 pools.
IPermit2: This interface allows us to interact with the Permit2 contract, which provides enhanced token approval functionality.
StateLibrary: This provides optimized functions for interacting with the PoolManager's state. By using StateLibrary, we can more efficiently read and manipulate pool states, which is crucial for many operations in Uniswap v4.
Step 2: Implement Token Approval with Permit2
UniversalRouter integrates with Permit2, to enable users to have more safety, flexibility, and control over their ERC20 token approvals.
Before we can execute swaps, we need to ensure our contract can transfer tokens. We’ll implement a function to approve the Universal Router to spend tokens on behalf of our contract.
Here, for testing purposes, we set up our contract to use Permit2 with the UniversalRouter:
function approveTokenWithPermit2(
	address token,
	uint160 amount,
	uint48 expiration
) external {
    IERC20(token).approve(address(permit2), type(uint256).max);
    permit2.approve(token, address(router), amount, expiration);
}

This function first approves Permit2 to spend the token, then uses Permit2 to approve the UniversalRouter with a specific amount and expiration time.
Step 3: Implementing a Swap Function
3.1: Function Signature
First, let’s define our function signature:
function swapExactInputSingle(
    PoolKey calldata key, // PoolKey struct that identifies the v4 pool
    uint128 amountIn, // Exact amount of tokens to swap
    uint128 minAmountOut, // Minimum amount of output tokens expected
    uint256 deadline // Timestamp after which the transaction will revert
) external returns (uint256 amountOut) {
    // Implementation will follow
}

Important note:
The deadline parameter allows users to specify when their transaction should expire. This protects against unfavorable execution due to network delays or MEV attacks.
When swapping tokens involving native ETH, we use Currency.wrap(address(0)) to represent ETH in the PoolKey struct.
struct PoolKey {
    /// @notice The lower currency of the pool, sorted numerically.
    ///         For native ETH, Currency currency0 = Currency.wrap(address(0));
    Currency currency0;
    /// @notice The higher currency of the pool, sorted numerically
    Currency currency1;
    /// @notice The pool LP fee, capped at 1_000_000. If the highest bit is 1, the pool has a dynamic fee and must be exactly equal to 0x800000
    uint24 fee;
    /// @notice Ticks that involve positions must be a multiple of tick spacing
    int24 tickSpacing;
    /// @notice The hooks of the pool
    IHooks hooks;
}


3.2: Encoding the Swap Command
When encoding a swap command for the Universal Router, we need to choose between two types of swaps:
Exact Input Swaps:
Use this swap-type when you know the exact amount of tokens you want to swap in, and you're willing to accept any amount of output tokens above your minimum. This is common when you want to sell a specific amount of tokens.
Exact Output Swaps:
Use this swap-type when you need a specific amount of output tokens, and you're willing to spend up to a maximum amount of input tokens. This is useful when you need to acquire a precise amount of tokens, for example, to repay a loan or meet a specific requirement.
Next, we encode the swap command:
bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));

Here, we're using V4_SWAP, which tells the Universal Router that we want to perform a swap on a Uniswap v4 pool. The specific type of swap (exact input or exact output) will be determined by the V4Router actions we encode later. As we saw earlier, we encode this as a single byte, which is how the Universal Router expects to receive commands.
Check the complete list of commands.
3.3: Action Encoding
Now, let’s encode the actions for the swap:
// Encode V4Router actions
bytes memory actions = abi.encodePacked(
    uint8(Actions.SWAP_EXACT_IN_SINGLE),
    uint8(Actions.SETTLE_ALL),
    uint8(Actions.TAKE_ALL)
);

These actions define the sequence of operations that will be performed in our v4 swap:
SWAP_EXACT_IN_SINGLE: This action specifies that we want to perform an exact input swap using a single pool.
SETTLE_ALL: This action ensures all input tokens involved in the swap are properly paid. This is part of v4's settlement pattern for handling token transfers.
TAKE_ALL: This final action collects all output tokens after the swap is complete.
The sequence of these actions is important as they define the complete flow of our swap operation from start to finish.
3.4: Preparing the Swap Inputs
For our v4 swap, we need to prepare three parameters that correspond to our encoded actions:
bytes[] memory params = new bytes[](3);

// First parameter: swap configuration
params[0] = abi.encode(
    IV4Router.ExactInputSingleParams({
        poolKey: key,
        zeroForOne: true,            // true if we're swapping token0 for token1
        amountIn: amountIn,          // amount of tokens we're swapping
        amountOutMinimum: minAmountOut, // minimum amount we expect to receive
        hookData: bytes("")             // no hook data needed
    })
);

// Second parameter: specify input tokens for the swap
// encode SETTLE_ALL parameters
params[1] = abi.encode(key.currency0, amountIn);

// Third parameter: specify output tokens from the swap
params[2] = abi.encode(key.currency1, minAmountOut);

Each encoded parameter corresponds to a specific action in our swap:
The first parameter configures how the swap should be executed, defining the pool, amounts, and other swap-specific details
The second parameter defines what tokens we're putting into the swap
The third parameter defines what tokens we expect to receive from the swap
The sequence of these parameters must match the sequence of actions we defined earlier (SWAP_EXACT_IN_SINGLE, SETTLE_ALL, and TAKE_ALL).
3.5: Executing the Swap
Now we can execute the swap using the Universal Router:
bytes[] memory inputs = new bytes[](1);

// Combine actions and params into inputs
inputs[0] = abi.encode(actions, params);

// Execute the swap
uint256 deadline = block.timestamp + 20;
router.execute(commands, inputs, deadline);

This prepares and executes the swap based on our encoded commands, actions, and parameters.
Note: Never use block.timestamp or type(uint256).max as the deadline parameter.
3.6: (Optional) Verifying the Swap Output
After the swap, we need to verify that we received at least the minimum amount of tokens we specified:
amountOut = key.currency1.balanceOf(address(this));
require(amountOut >= minAmountOut, "Insufficient output amount");

3.7: Returning the Result
Finally, we return the amount of tokens we received:
return amountOut;

This allows the caller of the function to know exactly how many tokens were received in the swap.
Here's the complete swap function that combines all the steps we've covered:
function swapExactInputSingle(
    PoolKey calldata key,
    uint128 amountIn,
    uint128 minAmountOut
) external returns (uint256 amountOut) {
    // Encode the Universal Router command
    bytes memory commands = abi.encodePacked(uint8(Commands.V4_SWAP));
    bytes[] memory inputs = new bytes[](1);

    // Encode V4Router actions
    bytes memory actions = abi.encodePacked(
        uint8(Actions.SWAP_EXACT_IN_SINGLE),
        uint8(Actions.SETTLE_ALL),
        uint8(Actions.TAKE_ALL)
    );

    // Prepare parameters for each action
    bytes[] memory params = new bytes[](3);
    params[0] = abi.encode(
        IV4Router.ExactInputSingleParams({
            poolKey: key,
            zeroForOne: true,
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            hookData: bytes("")
        })
    );
    params[1] = abi.encode(key.currency0, amountIn);
    params[2] = abi.encode(key.currency1, minAmountOut);

    // Combine actions and params into inputs
    inputs[0] = abi.encode(actions, params);

    // Execute the swap
    uint256 deadline = block.timestamp + 20;
    router.execute(commands, inputs, deadline);

    // Verify and return the output amount
    amountOut = key.currency1.balanceOf(address(this));
    require(amountOut >= minAmountOut, "Insufficient output amount");
    return amountOut;
}

Contracts
v4 Protocol
Quickstart
Hooks
Set Up Local Environment
Set Up Local Environment
Before writing the hook let's first have a local environment properly configured e.g. deploying pool manager, utility routers and test tokens.
At the end of this guide a development environment will be set up to be used to build the rest of the examples in the Guides section of the docs.
To get started as quickly as possible for building Uniswap v4 hooks, there is a Quick Start section below to clone a boilerplate and get building. To start from scratch and learn the underlying concepts, jump to the Start from Scratch section.
Quick Start
The Uniswap v4-template repo provides a basic foundry environment with required imports already pre-loaded. Click on Use this template to create a new repository with it.
Or simply clone it and install the dependencies:
git clone https://github.com/uniswapfoundation/v4-template.git
cd v4-template
# requires foundry
forge install
forge test

Then hop to the Local Node via Anvil to complete the set up and start developing.
Start from Scratch
In the following sections, let's walk through the steps to create the same environment set up as the boilerplate from scratch and learn the underlying concepts.
Setting up Foundry
First thing is to set up a new Foundry project.
If there is no Foundry installed - follow the Foundry Book for installation.
Once Foundry is setup, initialize a new project:
forge init counter-hook
cd counter-hook

Then install the Uniswap v4-core and v4-periphery contracts as dependencies:
forge install Uniswap/v4-core && forge install Uniswap/v4-periphery

Next, set up the remappings so that the shorthand syntax for importing contracts from the dependencies work nicely:
forge remappings > remappings.txt

If there is something wrong with the inferred remappings, please replace with the following in remappings.txt:
@uniswap/v4-core/=lib/v4-core/
forge-gas-snapshot/=lib/v4-core/lib/forge-gas-snapshot/src/
forge-std/=lib/v4-core/lib/forge-std/src/
permit2/=lib/v4-periphery/lib/permit2/
solmate/=lib/v4-core/lib/solmate/
v4-core/=lib/v4-core/
v4-periphery/=lib/v4-periphery/

After that, remove the default Counter contract and its associated test and script file that Foundry initially set up. To do that, either manually delete those files, or just run the following:
rm ./**/Counter*.sol

Finally, since v4 uses transient storage which is only available after Ethereum's cancun hard fork and on Solidity versions >= 0.8.24 - some config must be set in foundry.toml config file.
To do that, add the following lines to foundry.toml:
# foundry.toml

solc_version = "0.8.26"
evm_version = "cancun"
ffi = true

Awesome! Now it's all set to start building the hook! Let’s run a quick test to confirm everything is set up properly.
Compile a Basic Hook Contract
To confirm that the environment is configured correctly let's write a basic Counter Hook contract. Create a new file, ./src/CounterHook.sol and paste the following code into it:
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

contract CounterHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeSwapCount;
    mapping(PoolId => uint256 count) public afterSwapCount;

    mapping(PoolId => uint256 count) public beforeAddLiquidityCount;
    mapping(PoolId => uint256 count) public beforeRemoveLiquidityCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: true,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // -----------------------------------------------
    // NOTE: see IHooks.sol for function documentation
    // -----------------------------------------------

    function _beforeSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        beforeSwapCount[key.toId()]++;
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    {
        afterSwapCount[key.toId()]++;
        return (BaseHook.afterSwap.selector, 0);
    }

    function _beforeAddLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        beforeAddLiquidityCount[key.toId()]++;
        return BaseHook.beforeAddLiquidity.selector;
    }

    function _beforeRemoveLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        beforeRemoveLiquidityCount[key.toId()]++;
        return BaseHook.beforeRemoveLiquidity.selector;
    }
}


To compile the Counter Hook contracts in the ./src folder, use the foundry build command:
forge build

If the environment is compiled correctly it will display a message:
Compiler run successful!

Local Node via Anvil
Other than writing unit tests, Anvil can be used to deploy and test hooks.
With the local node up and running, use the --rpc-url 127.0.0.1:8545 flag in tests to point the Foundry testing suite to that local node:
# start anvil, a local EVM chain
anvil

# in a new terminal
# foundry script for deploying v4 & hooks to anvil
forge script script/Anvil.s.sol \
    --rpc-url http://localhost:8545 \
    --private-key <test_wallet_private_key> \
    --broadcast

# test on the anvil local node
forge test --rpc-url 127.0.0.1:8545

Next Steps
With the environment set up ready to be built on. Jump over to the guides section to learn about the Uniswap functions that can be integrated with Hook. Remember to add all contracts (.sol files) to the ./src folder and their subsequent tests to the ./test folder. Then test them against the local anvil node by running:
forge test --rpc-url 127.0.0.1:8545

Appendix: OpenZeppelin Hooks Library
OpenZeppelin Hooks Library, included in v4-template, provides secure and modular reference implementations for Uniswap v4 Hooks!
If you're starting from scratch, you can install the OpenZeppelin Hooks library:
$ forge install OpenZeppelin/uniswap-hooks

The library includes:
BaseHook: Core scaffolding with security checks and permission management
BaseCustomAccounting: For implementing hook-owned liquidity and custom token accounting
BaseCustomCurve: For replacing default concentrated liquidity math with custom swap logic
BaseAsyncSwap: For implementing non-atomic and asynchronous swaps
BaseDynamicFee: For implementing dynamic fee pools
BaseOverrideFee: For implementing dynamic fees on every swap
BaseDynamicAfterFee: For implementing post-swap fee adjustments based on actual swap output

Swap Hooks
Swaps are the most common interaction with the Uniswap protocol. When it comes to swap there are two hook functions available to customize and extend its behavior:
beforeSwap
afterSwap
As the names suggest beforeSwap/afterSwap are functions called before or after a swap is executed on a pool.
This guide will go through the parameters for beforeSwap and afterSwap, and a simple example of a swap hook.
Note: The swap hook is not production ready code, and is implemented in a simplistic manner for the purpose of learning.
Set Up the Contract
Declare the solidity version used to compile the contract, here we will use >=0.8.24 for the solidity version as transient storage is used.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

Import the relevant dependencies from v4-core and v4-periphery:
import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

Create a contract called SwapHook, use PoolIdLibrary to attach functions of computing poolId for PoolKey. Declare two mappings as counters for beforeSwap and afterSwap.
contract SwapHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeSwapCount;
    mapping(PoolId => uint256 count) public afterSwapCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

Override getHookPermissions() from BaseHook to return a struct of permissions to signal which hook functions are to be implemented. It will also be used at deployment to validate the hook address correctly represents the expected permissions.
function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
    return Hooks.Permissions({
        beforeInitialize: false,
        afterInitialize: false,
        beforeAddLiquidity: false,
        afterAddLiquidity: false,
        beforeRemoveLiquidity: false,
        afterRemoveLiquidity: false,
        beforeSwap: true,
        afterSwap: true,
        beforeDonate: false,
        afterDonate: false,
        beforeSwapReturnDelta: false,
        afterSwapReturnDelta: false,
        afterAddLiquidityReturnDelta: false,
        afterRemoveLiquidityReturnDelta: false
    });
}

beforeSwap
Here the example shows that every time before a swap is executed in a pool, beforeSwapCount for that pool will be incremented by one.
function _beforeSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, bytes calldata)
    internal
    override
    returns (bytes4, BeforeSwapDelta, uint24)
{
    beforeSwapCount[key.toId()]++;
    return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
}


beforeSwap Parameters
When triggering the beforeSwap hook function, there are some parameters we can make use of to customize or extend the behavior of swap. These parameters are described in beforeSwap from IHooks.
A brief overview of the parameters:
sender The initial msg.sender for the PoolManager.swap call - typically a swap router
key The key for the pool
params The parameters for the swap i.e. SwapParams from IPoolManager
hookData Arbitrary data handed into the PoolManager by the swapper to be passed on to the hook
afterSwap
Similiar as above, every time after a swap is executed in a pool, afterSwapCount for that pool will be incremented by one.
function _afterSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, BalanceDelta, bytes calldata)
    internal
    override
    returns (bytes4, int128)
{
    afterSwapCount[key.toId()]++;
    return (BaseHook.afterSwap.selector, 0);
}


afterSwap Parameters
When triggering the afterSwap hook function, there are some parameters we can make use of to customize or extend the behavior of swap. These parameters are described in afterSwap from IHooks.
A brief overview of the parameters:
sender The initial msg.sender for the PoolManager.swap call - typically a swap router
key The key for the pool
params The parameters for the swap i.e. SwapParams from IPoolManager
delta The amount owed to the caller (positive) or owed to the pool (negative)
hookData Arbitrary data handed into the PoolManager by the swapper to be passed on to the hook
A Complete Swap Hook Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

contract SwapHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeSwapCount;
    mapping(PoolId => uint256 count) public afterSwapCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: true,
            afterRemoveLiquidity: false,
            beforeSwap: true,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // -----------------------------------------------
    // NOTE: see IHooks.sol for function documentation
    // -----------------------------------------------

    function _beforeSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        beforeSwapCount[key.toId()]++;
        return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO_DELTA, 0);
    }

    function _afterSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata, BalanceDelta, bytes calldata)
        internal
        override
        returns (bytes4, int128)
    {
        afterSwapCount[key.toId()]++;
        return (BaseHook.afterSwap.selector, 0);
    }
}


Liquidity Hooks
This guide will walk through on an example of adding and removing liquidity. There are four hook functions available to customize and extend these behavior:
beforeAddLiquidity
afterAddLiquidity
beforeRemoveLiquidity
afterRemoveLiquidity
As the names suggest beforeAddLiquidity/afterAddLiquidity are functions called before or after liquidity is added to a pool. Similarly beforeRemoveLiquidity/afterRemoveLiquidity are functions called before or after liquidity is removed from a pool.
This guide will go through the parameters and examples specifically for beforeAddLiquidity and beforeRemoveLiquidity.
Note: The liquidity examples are not production ready code, and are implemented in a simplistic manner for the purpose of learning.
Set Up the Contract
Declare the solidity version used to compile the contract, since transient storage is used the solidity version will be >=0.8.24.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

Import the relevant dependencies from v4-core and v4-periphery:
import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

Create a contract called LiquidityHook, use PoolIdLibrary to attach functions of computing ID of a pool to PoolKey. Declare two mappings to act as counters when calling beforeAddLiquidity and beforeRemoveLiquidity.
contract LiquidityHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeAddLiquidityCount;
    mapping(PoolId => uint256 count) public beforeRemoveLiquidityCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

Override getHookPermissions from BaseHook.sol to return a struct of permissions to signal which hook functions are to be implemented. It will also be used at deployment to validate the address correctly represents the expected permissions.
function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
    return Hooks.Permissions({
        beforeInitialize: false,
        afterInitialize: false,
        beforeAddLiquidity: true,
        afterAddLiquidity: false,
        beforeRemoveLiquidity: true,
        afterRemoveLiquidity: false,
        beforeSwap: false,
        afterSwap: false,
        beforeDonate: false,
        afterDonate: false,
        beforeAddLiquidityReturnDelta: false,
        afterSwapReturnDelta: false,
        afterAddLiquidityReturnDelta: false,
        afterRemoveLiquidityReturnDelta: false
    });
}

beforeAddLiquidity
Here the example shows that every time before liquidity is added to a pool, beforeAddLiquidityCount for that pool will be incremented by one.
function _beforeAddLiquidity(
    address,
    PoolKey calldata key,
    IPoolManager.ModifyLiquidityParams calldata,
    bytes calldata
) internal override returns (bytes4) {
    beforeAddLiquidityCount[key.toId()]++;
    return BaseHook.beforeAddLiquidity.selector;
}

beforeAddLiquidity Parameters
When triggering the beforeAddLiquidity hook function, there are some parameters we can make use of to customize or extend the behavior of modifyLiquidity. These parameters are described in beforeAddLiquidity from IHooks.sol.
A brief overview of the parameters:
sender The initial msg.sender for the add liquidity call
key The key for the pool
params The parameters for adding liquidity i.e. ModifyLiquidityParams from IPoolManager.sol
hookData Arbitrary data handed into the PoolManager by the liquidity provider to be be passed on to the hook
beforeRemoveLiquidity
Similiar as above, every time before liquidity is removed from a pool, beforeRemoveLiquidityCount for that pool will be incremented by one.
function _beforeRemoveLiquidity(
    address,
    PoolKey calldata key,
    IPoolManager.ModifyLiquidityParams calldata,
    bytes calldata
) internal override returns (bytes4) {
    beforeRemoveLiquidityCount[key.toId()]++;
    return BaseHook.beforeRemoveLiquidity.selector;
}

beforeRemoveLiquidity Parameters
When triggering the beforeRemoveLiquidity hook function, there are some parameters we can make use of to customize or extend the behavior of modifyLiquidity. These parameters are described in beforeRemoveLiquidity from IHooks.sol.
A brief overview of the parameters:
sender The initial msg.sender for the remove liquidity call
key The key for the pool
params The parameters for removing liquidity i.e. ModifyLiquidityParams from IPoolManager.sol
hookData Arbitrary data handed into the PoolManager by the liquidity provider to be be passed on to the hook
A Complete Liquidity Hook Contract
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";

import {Hooks} from "v4-core/src/libraries/Hooks.sol";
import {IPoolManager} from "v4-core/src/interfaces/IPoolManager.sol";
import {PoolKey} from "v4-core/src/types/PoolKey.sol";
import {PoolId, PoolIdLibrary} from "v4-core/src/types/PoolId.sol";
import {BalanceDelta} from "v4-core/src/types/BalanceDelta.sol";
import {BeforeSwapDelta, BeforeSwapDeltaLibrary} from "v4-core/src/types/BeforeSwapDelta.sol";

contract LiquidityHook is BaseHook {
    using PoolIdLibrary for PoolKey;

    // NOTE: ---------------------------------------------------------
    // state variables should typically be unique to a pool
    // a single hook contract should be able to service multiple pools
    // ---------------------------------------------------------------

    mapping(PoolId => uint256 count) public beforeAddLiquidityCount;
    mapping(PoolId => uint256 count) public beforeRemoveLiquidityCount;

    constructor(IPoolManager _poolManager) BaseHook(_poolManager) {}

    function getHookPermissions() public pure override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: true,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: true,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: false,
            beforeDonate: false,
            afterDonate: false,
            beforeAddLiquidityReturnDelta: false,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // -----------------------------------------------
    // NOTE: see IHooks.sol for function documentation
    // -----------------------------------------------

    function _beforeAddLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        beforeAddLiquidityCount[key.toId()]++;
        return BaseHook.beforeAddLiquidity.selector;
    }

    function _beforeRemoveLiquidity(
        address,
        PoolKey calldata key,
        IPoolManager.ModifyLiquidityParams calldata,
        bytes calldata
    ) internal override returns (bytes4) {
        beforeRemoveLiquidityCount[key.toId()]++;
        return BaseHook.beforeRemoveLiquidity.selector;
    }
}

AsyncSwap Hooks
One feature enabled by custom accounting is​​​​‌ AsyncSwap swap. This feature allows hook developers to replace the v4 (v3-style) swap logic.
This means developers can replace Uniswap's internal core logic for how to handle swaps. Two emergent use-cases are possible with custom accounting:
Asynchronous swaps and swap-ordering. Delay the v4 swap logic for fulfillment at a later time.
Custom Curves. Replace the v4 swap logic with different swap logic. The custom logic is flexible and developers can implement symmetric curves, asymmetric curves, or custom quoting.
AsyncSwap is typically described as taking the full input to replace the internal swap logic, partially taking the input is better described as custom accounting
Note: The flexibility of AsyncSwap means hook developers can implement harmful behavior (such as taking all swap amounts for themselves, charging extra fees, etc.). Hooks with AsyncSwap behavior should be examined very closely by both developers and users.
Configure a AsyncSwap Hook
To enable AsyncSwap, developers will need the hook permission BEFORE_SWAP_RETURNS_DELTA_FLAG
import {BaseHook} from "v4-periphery/src/utils/BaseHook.sol";
// ...

contract AsyncSwapHook is BaseHook {
    // ...

    function getHookPermissions() public pure virtual override returns (Hooks.Permissions memory) {
        return Hooks.Permissions({
            beforeInitialize: false,
            afterInitialize: false,
            beforeAddLiquidity: false,
            afterAddLiquidity: false,
            beforeRemoveLiquidity: false,
            afterRemoveLiquidity: false,
            beforeSwap: false,
            afterSwap: true,
            beforeDonate: false,
            afterDonate: false,
            beforeSwapReturnDelta: true,
            afterSwapReturnDelta: false,
            afterAddLiquidityReturnDelta: false,
            afterRemoveLiquidityReturnDelta: false
        });
    }

    // ...
}

beforeSwap
AsyncSwap only works on exact-input swaps and the beforeSwap must take the input currency and return BeforeSwapDelta. The hook should IPoolManager.mint itself the corresponding tokens equal to the amount of the input (amountSpecified). It should then return a BeforeSwapDelta where deltaSpecified = -amountSpecified (the positive amount).
The funds' movements are as follows:
User initiates a swap, specifying -100 tokenA as input
The hook's beforeSwap takes 100 tokenA for itself, and returns a value of 100 to PoolManager.
The PoolManager accounts the 100 tokens against the swap input, leaving 0 tokens remaining
The PoolManager does not execute swap logic, as there are no tokens left to swap
The PoolManager transfers the delta from the hook to the swap router, in step 2 the hook created a debt (that must be paid)
The swap router pays off the debt using the user's tokens
contract AsyncSwapHook is BaseHook {
     // ...

    function _beforeSwap(address, PoolKey calldata key, IPoolManager.SwapParams calldata params, bytes calldata)
        internal
        override
        returns (bytes4, BeforeSwapDelta, uint24)
    {
        // AsyncSwap only works on exact-input swaps
        if (params.amountSpecified < 0) {
            // take the input token so that v3-swap is skipped...
            Currency input = params.zeroForOne ? key.currency0 : key.currency1;
            uint256 amountTaken = uint256(-params.amountSpecified);
            poolManager.mint(address(this), input.toId(), amountTaken);

            // to AsyncSwap the exact input, we return the amount that's taken by the hook
            return (BaseHook.beforeSwap.selector, toBeforeSwapDelta(amountTaken.toInt128(), 0), 0);
        }
        else {
            return (BaseHook.beforeSwap.selector, BeforeSwapDeltaLibrary.ZERO, 0);
        }

    }
}


Testing
To verify the AsyncSwap behaved properly, developers should test the swap and that token balances match expected behavior.
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import {Deployers} from "v4-core/test/utils/Deployers.sol";
// ...

contract AsyncSwapTest is Test, Deployers {
    // ...

    function setUp() public {
        // ... 
    }

    function test_asyncSwap() public {
        assertEq(hook.beforeSwapCount(poolId), 0);

        uint256 balance0Before = currency0.balanceOfSelf();
        uint256 balance1Before = currency1.balanceOfSelf();

        // Perform a test swap //
        int256 amount = -1e18;
        bool zeroForOne = true;
        BalanceDelta swapDelta = swap(poolKey, zeroForOne, amount, ZERO_BYTES);
        // ------------------- //

        uint256 balance0After = currency0.balanceOfSelf();
        uint256 balance1After = currency1.balanceOfSelf();

        // user paid token0
        assertEq(balance0Before - balance0After, 1e18);

        // user did not recieve token1 (AsyncSwap)
        assertEq(balance1Before, balance1After);
    }
}

Subscriber
Context
For developers looking to support custom liquidity mining, Subscriber contracts can be used to receive notifications about position modifications or transfers.
Guide
1. Implement the ISubscriber interface
Can also refer to MockSubscriber for an actual implementation example.
import {ISubscriber} from "v4-periphery/src/interfaces/ISubscriber.sol";

contract MySubscriber is ISubscriber {
    uint256 public notifySubscribeCount;
    uint256 public notifyUnsubscribeCount;
    uint256 public notifyModifyLiquidityCount;
    uint256 public notifyBurnCount;
    // other implementations...

    function notifySubscribe(uint256, bytes memory) external onlyByPosm {
        notifySubscribeCount++;
    }

    function notifyUnsubscribe(uint256) external onlyByPosm {
        notifyUnsubscribeCount++;
    }

    function notifyModifyLiquidity(uint256, int256, BalanceDelta) external onlyByPosm {
        notifyModifyLiquidityCount++;
    }

    function notifyBurn(uint256, address, PositionInfo, uint256, BalanceDelta)
        external
        onlyByPosm
    {
        notifyBurnCount++;
    }
}

2. A caveat on unsubscribe()
To prevent gas griefing during unsubscription, Uniswap v4 sets a fixed variable unsubscribeGasLimit when calling a subscriber’s notifyUnsubscribe() function.
Without this limit, malicious subscribers could prevent liquidity providers from unsubscribing. If notifyUnsubscribe() were to consume too much gas, it would cause the unsubscription transaction to revert, thus leading to a denial-of-service
With the gas limit in place, if the subscriber’s notification fails, the unsubscription will still succeed and only the notification to the subscriber is skipped.
From _unsubscribe() on Notifier:
if (address(_subscriber).code.length > 0) {
    // require that the remaining gas is sufficient to notify the subscriber
    // otherwise, users can select a gas limit where .notifyUnsubscribe hits OutOfGas yet the
    // transaction/unsubscription can still succee
    if (gasleft() < unsubscribeGasLimit) GasLimitTooLow.selector.revertWith();
    try _subscriber.notifyUnsubscribe{gas: unsubscribeGasLimit}(tokenId) {} catch {}
}

3. Opt-in to a subscriber contract
To opt-in to a subscriber contract, call subscribe() on PositionManager.
import {IPositionManager} from "v4-periphery/src/interfaces/IPositionManager.sol";

IPositionManager posm = IPositionManager(<address>);
ISubscriber mySubscriber = ISubscriber(<address>);

bytes memory optionalData = ...;
posm.subscribe(tokenId, mySubscriber, optionalData);

