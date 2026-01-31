Overview
Uniswap v4 inherits all of the capital efficiency gains of Uniswap v3, but provides flexibility via hooks and gas optimizations across the entire lifecycle.
For additional information, see the Uniswap v4 whitepaper
Hooks
Developers can attach solidity logic to the swap lifecycle through Hooks. The logic is executed before and/or after major operations such as pool creation, liquidity addition and removal, swapping, and donations. Hooks are deployed contracts, and are called by the Uniswap v4 PoolManager, for permissionless execution.
The flexibility of hooks can enable:
Limit orders
Custom oracles
Fee management
Automated liquidity management
Dynamic Fees
Uniswap v4 supports dynamic fees, allowing pools to adjust their fees up or down. While other AMMs may have hard-coded logic for dynamic fees, v4 provides no opinionated calculation of the fee. The frequency of liquidity fee updates is also flexible and determined by the developer. Fee updates can occur on every swap, every block, or on an arbitrary schedule (weekly, monthly, yearly, etc).
Dynamic fees open up the design space for fee optimization, value redistribution, and research.
Singleton Design
Architecturally, all pool state and operations are managed by a single contract -- PoolManager.sol. The singleton design provides major gas savings. For example, creating a pool is now a state update instead of the deployment of a new contract. Swapping through multiple pools no longer requires transferring tokens for intermediate pools.
Flash Accounting
By leveraging EIP-1153 Transient Storage, v4 provides an optimization referred to as flash accounting. Swapping, liquidity modification, and donations incur balance changes, i.e. tokens to be sent in and tokens to be taken out. With flash accounting these balance changes are efficiently recorded in transient storage and netted against each other. This system allows users to only pay the final balance change, without the need for resolving intermediate balance changes.
Native ETH
Uniswap v4 supports native token assets (Ether), without the need to wrap/unwrap the native token to Wrapped Ether (WETH9).
Custom Accounting
The flexibility of custom accounting allows developers to alter token amounts for swaps and liquidity modifications. The feature opens up the design space for hooks to charge fees or forgo the underlying concentrated liquidity model.
Example use-cases:
Custom curves, opt-out of the concentrated liquidity curve in favor of an entirely independent pricing mechanism
Hook swap fees, charge and collect fees on swaps
Liquidity withdrawal fees, penalize and/or redistribute fee revenue


Overview
Uniswap v4 inherits all of the capital efficiency gains of Uniswap v3, but provides flexibility via hooks and gas optimizations across the entire lifecycle.
For additional information, see the Uniswap v4 whitepaper
Hooks
Developers can attach solidity logic to the swap lifecycle through Hooks. The logic is executed before and/or after major operations such as pool creation, liquidity addition and removal, swapping, and donations. Hooks are deployed contracts, and are called by the Uniswap v4 PoolManager, for permissionless execution.
The flexibility of hooks can enable:
Limit orders
Custom oracles
Fee management
Automated liquidity management
Dynamic Fees
Uniswap v4 supports dynamic fees, allowing pools to adjust their fees up or down. While other AMMs may have hard-coded logic for dynamic fees, v4 provides no opinionated calculation of the fee. The frequency of liquidity fee updates is also flexible and determined by the developer. Fee updates can occur on every swap, every block, or on an arbitrary schedule (weekly, monthly, yearly, etc).
Dynamic fees open up the design space for fee optimization, value redistribution, and research.
Singleton Design
Architecturally, all pool state and operations are managed by a single contract -- PoolManager.sol. The singleton design provides major gas savings. For example, creating a pool is now a state update instead of the deployment of a new contract. Swapping through multiple pools no longer requires transferring tokens for intermediate pools.
Flash Accounting
By leveraging EIP-1153 Transient Storage, v4 provides an optimization referred to as flash accounting. Swapping, liquidity modification, and donations incur balance changes, i.e. tokens to be sent in and tokens to be taken out. With flash accounting these balance changes are efficiently recorded in transient storage and netted against each other. This system allows users to only pay the final balance change, without the need for resolving intermediate balance changes.
Native ETH
Uniswap v4 supports native token assets (Ether), without the need to wrap/unwrap the native token to Wrapped Ether (WETH9).
Custom Accounting
The flexibility of custom accounting allows developers to alter token amounts for swaps and liquidity modifications. The feature opens up the design space for hooks to charge fees or forgo the underlying concentrated liquidity model.
Example use-cases:
Custom curves, opt-out of the concentrated liquidity curve in favor of an entirely independent pricing mechanism
Hook swap fees, charge and collect fees on swaps
Liquidity withdrawal fees, penalize and/or redistribute fee revenue


v4 vs v3
While Uniswap v4's underlying concentrated liquidity is the same as Uniswap v3, there are some key differences in the architecture and accounting.
Singleton Design
Pool Creation
v4: The singleton contract facilitates the creation of a pool and also stores its state. This pattern reduces costs when creating a pool and doing multi-hop swaps. Because pools are contract state and not entirely new contracts themselves, pool creation is significantly cheaper.
v3: A factory contract is responsible for pool creation. The pool is a separate contract instance that manages its own state. Pool initialization is costly because contract creation is gas-intensive
Flash Accounting
v4: The singleton uses flash accounting, meaning a caller that unlocks the PoolManager is allowed to cause balance-changing operations (multiple swaps, multiple liquidity modifications, etc) and only needs to perform token transfers at the very end of the sequence.
v3: Because flash accounting is missing from v3, it is the responsibility of the integrating contract to perform token transfers, after each individual call, to each individual pool contract
Liquidity Fee Accounting
v4: Accrued fees act like a credit when modifying liquidity. Increasing liquidity will convert the fee revenue to liquidity inside the position while decreasing liquidity will automatically require the withdrawal of unclaimed fee revenue.
An additional parameter salt can be provided when creating liquidity. The salt is used to distinguish positions of the same range on the same pool. This separation may be preferred to simplify fee accounting. If two users share the same range and state in PoolManager, integrating contracts must be careful in managing fees
v3: Liquidity positions of the same range and pool will share the same state. While believed to be more gas efficient at the time, integrating contracts will need to handle fee management since the state is shared on the core pool contract
Native ETH
v4: Pool pairs support native tokens, in doing so ETH swappers and liquidity providers benefit from gas cost reductions from cheaper transfers and removal of additional wrapping costs.
v3: ETH needs to be wrapped first before being paired with other tokens. This results in higher gas costs because of wrapping and transferring a wrapped native token.
Subscribers
Only v4: Owners can now set a subscriber for their positions. A subscriber contract will get notified every time the position's liquidity or owner changes. Subscribers enable staking / liquidity-mining, but users do not need to transfer their ERC-721 token.
v3: Staking in v3 requires users to transfer their ERC-721 token to a contract, putting the underlying assets at risk for malicious behavior.
Previous


Flash Accounting
Flash Accounting
In previous versions of Uniswap, every time a swap was made - including multi-hop swap - tokens were transferred between Pool contracts for intermediate steps.
This design incurred inefficiencies because transferring tokens with external calls to their smart contracts - especially in a multi-hop swap - is quite expensive. This design was required since each pool was its own contract and token transfers were required to maintain accounting and solvency.
With the singleton architecture, a better design was possible and is referred to as Flash Accounting. The design became practical with gas efficiencies of Transient Storage. Flash Accounting further reduces the gas cost of trades that cross multiple pools and supports more complex integrations with Uniswap v4.
With flash accounting, each balance-changing operation (e.g. swap and liquidity modification) updates an internal net balance known as delta. Only the final balance-changes require token transfers.
Flash Accounting Step 1Flash Accounting Step 2
For example from the above diagrams - let's say you have 20 USDC and 20 USDT but you want to add liquidity with 15 USDC and 25 USDT. Previously this would require multiple external calls as tokens were transferred between Pool contracts when swapping from USDC to USDT. But now with v4's Flash Accounting we only need to keep track of delta - thus we can swap and modifyLiquidity in a single call and only the final balance-changes involve actual token transfers.
In the above example, we are swapping 5 USDC to 5 USDT to create liquidity with 15 USDC and 25 USDT. In between the operations (swap, modifyLiquidity), no token transfers are made
Mechanism
Locking
To ensure correctness and atomicity in complex operations like a multi-hop swap - v4 uses a locking mechanism. Anytime key actions need to take place within the PoolManager - e.g. swaps and liquidity modification - a periphery contract must unlock the PoolManager first. Then integrators implement the unlockCallback and proceed with any of the following actions on the pools:
swap
modifyLiquidity
donate
take
settle
mint
burn
sync
Note that pool initialization can happen outside the context of unlocking the PoolManager, as there are no balance-changing operations associated with pool creation.
The following diagrams visualize how the above steps will be implemented:
unlock the PoolManager Flash Accounting Locking Mechanism Step 1
Implement unlockCallback and proceed with any desired pool actions Flash Accounting Locking Mechanism Step 2
The actual token transfer happens at the end and the delta should be resolved Flash Accounting Locking Mechanism Step 3
Balance Delta
Inside unlockCallback, a periphery contract performs balance-changing operations i.e. conduct swaps, modify positions, etc. After returning execution context back to PoolManager, the core contract checks that balances are resolved - nothing is owed to or from the PoolManager.
The balances resolved above is what we refer as the delta, a field held in the transient state. The value(s) represent the debts and credits of assets owed to or from the PoolManager.
Swapping
Multi-hop swaps on V3 vs V4
As shown in the above diagram, for example - let's say you want to swap ETH for DAI. Assuming this requires a multi-hop swap going from ETH to USDC and then from USDC to DAI.
Previously on v3
ETH is transferred to ETH <> USDC pool contract
USDC is withdrawn from ETH <> USDC contract and transferred to USDC <> DAI contract
DAI is withdrawn from USDC <> DAI contract and transferred to the user
Now on v4
Call swap() on ETH <> USDC
Call swap() on USDC <> DAI, with the credit of USDC from above being used as the input amount
User resolves deltas by paying ETH and receiving DAI
Therefore we can skip the step of actually calling transfer() on the USDC contract.
The optimization scales infinitely, any number of arbitrary hops only requires two token transfers - input and output tokens.
Liquidity Management
The optimization becomes more evident for complex liquidity operations
For example, a user wanted to add liquidity to ETH <> DAI but does not have DAI. The user can swap some ETH to DAI in order to add liquidity with both tokens. In addition, the user can multi-hop swap going from ETH to USDC to DAI. If properly integrated, the user would only need to transfer ETH once.
Developer Resources
To see how unlock callback and delta work in a smart contract read Unlock Callback & Deltas.


ERC-6909
Uniswap v4 uses ERC-6909 to further improve gas-efficiency on token claims and redemptions.
ERC-6909 is a minimal and gas-efficient standard for managing multiple ERC-20 tokens from a single contract. It provides a simplified alternative to the more complex ERC-1155 multi-token standard.
ERC-6909 vs ERC-1155
ERC-6909 offers several advantages over ERC-1155:
Simplified interface: ERC-6909 removes unnecessary safe transfer callbacks and batching constraints presented in ERC-1155.
Improved transfer delegation: ERC-6909 provides a more efficient system for transfer delegation.
Gas efficiency: ERC-6909 reduces gas costs for deployment, transfers, and burning operations.
Reduced code size: Implementing ERC-6909 results in smaller contract sizes compared to ERC-1155.
However, it's worth noting that ERC-6909 does introduce a totalSupply variable, which leads to an additional disk write on mint and burn operations.
How it works
Instead of choosing to move tokens in/out of the PoolManager, developers can opt-in and leave the ERC-20 tokens within the PoolManager. In exchange, the PoolManager can mint them an ERC-6909 token representing their claim. In subsequent interactions requiring paying tokens, users will not need to transfer ERC-20 tokens into the PoolManager - users can simply burn some (or all) of their claim tokens they have
Doing real ERC-20 token transfers requires calls to external smart contracts - incurring gas overhead compared to internal accounting. Secondly, these external smart contracts have their own custom logic within their transfer functions - for example USDC's blocked-address list - which is a further gas overhead. Thus, minting and burning ERC-6909 tokens are more gas-efficient because they don't require external function calls and have a constant-size gas overhead regardless of the underlying ERC-20 token.
This mechanism therefore helps further reduce gas costs. All these gas cost reductions overall make pools much more competitive based on the fees they charge.
Examples
High-frequency traders / MEV bots
These users are often conducting a lot of swaps in relatively short durations of time, while staying within the Uniswap Protocol. These power-users can trade using ERC-6909 tokens for improved gas-efficiency.
Liquidity management
ERC-6909 does not only benefit swappers. For power-users that may be opening and closing liquidity positions frequently, liquidity managers can opt-in and receive their capital as ERC-6909.

Hooks
Uniswap v4 introduces Hooks, a system that allows developers to customize and extend the behavior of liquidity pools.
Hooks are external smart contracts that can be attached to individual pools. Every pool can have one hook but a hook can serve an infinite amount of pools to intercept and modify the execution flow at specific points during pool-related actions.
Key Concepts
Pool-Specific Hooks
Each liquidity pool in Uniswap v4 can have its own hook contract attached to it. Hooks are optional for Uniswap v4 pools.
The hook contract is specified when creating a new pool in the PoolManager.initialize function.
Having pool-specific hooks allows for fine-grained control and customization of individual pools.
Core Hook Functions
Uniswap v4 provides a set of core hook functions that can be implemented by developers. Developers do not have to implement every hook, you can mix&match them to whatever your liking is. You can use one or all of them!
Hook contracts specify the permissions that determine which hook functions they implement, which is encoded in the address of the contract.
The PoolManager uses these permissions to determine which hook functions to call for a given pool based on its Key.
Initialize Hooks
beforeInitialize: Called before a new pool is initialized.
afterInitialize: Called after a new pool is initialized.
These hooks allow developers to perform custom actions or validations during pool initialization, but these hooks can only be invoked once.
Liquidity Modification Hooks
The liquidity modification hooks are extremely granular for security purposes.
beforeAddLiquidity: Called before liquidity is added to a pool.
afterAddLiquidity: Called after liquidity is added to a pool.
beforeRemoveLiquidity: Called before liquidity is removed from a pool.
afterRemoveLiquidity: Called after liquidity is removed from a pool.
Swap Hooks
beforeSwap: Called before a swap is executed in a pool.
afterSwap: Called after a swap is executed in a pool.
Donate Hooks
beforeDonate: Called before a donation is made to a pool.
afterDonate: Called after a donation is made to a pool.
Donate hooks provide a way to customize the behavior of token donations to liquidity providers.
Innovation and Potential
The introduction of hooks in Uniswap v4 opens up a world of possibilities for developers to innovate and build new DeFi protocols. Some potential use cases include:
Customized AMMs with different pricing curves than xy = k.
Yield farming and liquidity mining protocols that incentivize liquidity provision.
Derivative and synthetic asset platforms built on top of Uniswap v4 liquidity.
Lending hooks integrated with Uniswap v4 pools.
As a hook developer you can easily bootstrap the codebase of an entirely new DeFi protocol through hook designs, which subsequently drives down your audit costs and allows you to develop faster. However, it's important to note that just because you made a hook, that does not mean you will get liquidity routed to your hook from the Uniswap frontend.
Previous


Subscribers
Subscribers, new in Uniswap v4, allow for liquidity-position owners to opt-in to a contract that receives notifications. The new design is intended to support liquidity mining, additional rewards given to in-range liquidity providers. Through notification logic, position owners do not need to risk their liquidity position and its underlying assets. In Uniswap v3, liquidity mining was supported by fully transferring the liquidity position to an external contract; this old design would give the external contract full ownership and control of the liquidity position.
When a position owner subscribes to a contract, the contract will receive notifcations when:
The position is initially subscribed
The position increases or decreases its liquidity
The position is transferred
The position is unsubscribed
Previous


PoolManager
In Uniswap v3, each liquidity pool was represented by a separate smart contract deployed through the Uniswapv3Factory contract. While this approach provided flexibility, it also led to increased gas costs for pool creation and multi-hop swaps.
Uniswap v4 addresses this issue by introducing the Singleton design pattern. The PoolManager contract now serves as a single entry point for all liquidity pools. Instead of deploying separate contracts for each pool, the pool state and logic are encapsulated within the PoolManager itself.
Purpose
The primary purpose of the PoolManager is to:
Efficiently manage liquidity pools
Facilitate token swaps
Reduce gas costs compared to the factory-based approach in Uniswap v3
Enable extensibility through hooks
Architecture
Singleton Design
Uniswap v4 uses a Singleton design pattern for the PoolManager
All pool state and logic are encapsulated within the PoolManager contract
Locking Mechanism
The PoolManager uses a locking mechanism to allow for flash accounting (also known as deferred balance accounting)
When unlocked, the calling contract can perform various operations and zero-out outstanding balances before returning control to the PoolManager for final solvency checks
Pool State
The Pool.State struct contains information such as:
Current price
Liquidity
Tick bitmap
Fee growth
Position information
Libraries
The pool logic is implemented using Solidity libraries to keep the PoolManager contract modular and gas-efficient
These libraries are:
Pool: Contains core pool functionality, such as swaps and liquidity management
Hooks: Handles the execution of hook functions
Position: Manages liquidity positions within a pool
Core Functionality
Pool Creation
New pools are created by calling the initialize function on the PoolManager
The pool creator specifies the token pair, fee tier, tick spacing, and optional hook contract address
The PoolManager initializes the pool state and associates it with a unique PoolId
Swaps
Swaps are initiated through the swap function on the PoolManager, typically via a swap router contract
The PoolManager executes the following steps:
Checks if the pool is valid and initialized
Executes the beforeSwap hook, if applicable
Performs the actual swap, updating the pool state and charging fees
Executes the afterSwap hook, if applicable
Calculates the net token amounts owed to the user and the pool, represented by the BalanceDelta struct
Swaps utilize flash accounting, where tokens are moved into the PoolManager, and only the final output tokens are withdrawn
Liquidity Management
Liquidity providers can add or remove liquidity using the modifyLiquidity function on the PoolManager. However, you wouldn't call this directly from your application, you would call this from a periphery contract to handle the locking & unlocking a particular pool.
The PoolManager executes the following steps:
Checks if the pool is valid and initialized
Determines if the modification is an addition or removal of liquidity
Executes the appropriate beforeAddLiquidity or beforeRemoveLiquidity hook, if applicable
Performs the actual liquidity modification and updates the pool state
Emits the ModifyLiquidity event
Executes the appropriate afterAddLiquidity or afterRemoveLiquidity hook, if applicable
Calculates the balance delta and returns it to the caller
Flash Accounting
The PoolManager employs flash accounting to reduce gas costs and simplify multi-hop swaps
Tokens are moved into the PoolManager contract, and all subsequent actions are performed within the contract's context
Only the final output tokens are withdrawn from the PoolManager at the end of the transaction
Transient Storage
The PoolManager utilizes transient storage (EIP-1153) to store temporary data during complex operations
Transient storage reduces gas costs by avoiding regular storage operations for data only needed within a single transaction


Dynamic Fees
Uniswap v4 introduces dynamic fees, allowing for flexible and responsive fee structures managed through hooks. This feature enables pools to adapt fees to changing market conditions, potentially improving liquidity provider profitability and overall market efficiency.
What are Dynamic Fees?
Dynamic fees in Uniswap v4 are a specific type of swap fee paid by swappers that directly accrue to liquidity providers. These fees are distinct from protocol fees and hook fees (Optional fees that can be implemented by custom hooks), and represent a significant advancement over the fee structures in previous Uniswap versions.
Unlike the static fee tiers in Uniswap v3 (0.05%, 0.30%, 1.0%) or the single fee in v2, dynamic fees in v4 offer much more flexibility. Dynamic fees can:
Adjust in real-time based on various market conditions
Change on a per-swap basis
Allow for any fee percentage (e.g., 4.9 bips, 10 bips)
Be updated at various intervals (yearly, per block, or per transaction)
This dynamic nature allows for more efficient fee pricing, potentially benefiting both liquidity providers and traders by adapting to current market conditions. By allowing fees to fluctuate based on market dynamics, Uniswap v4 aims to optimize liquidity provision and trading across a wide range of market scenarios.
Motivation and Benefits of Dynamic Fees
Improved Pricing of Volatility: Adapt fees to market volatility, similar to traditional exchanges adjusting bid-ask spreads.
Order Flow Discrimination: Price different types of trades (e.g., arbitrage vs. uninformed) more accurately.
Improved Market Efficiency and Stability: Fees can adjust to reflect real-time market conditions, optimizing for both liquidity providers and traders. Dynamic fees could help dampen extreme market movements by adjusting incentives in real-time.
Enhanced Capital Efficiency and Liquidity Provider Returns: By optimizing fees, pools can attract more liquidity and facilitate more efficient trading. More accurate fee pricing could lead to better returns for liquidity providers, potentially attracting more capital to pools.
Better Risk Management: During high volatility, fees can increase to protect liquidity providers from impermanent loss.
Customizable Strategies: Enable complex fee strategies for specific token pairs or market segments.
Dynamic Fees Use Cases
Volatility-Based Fees: Adjust fees based on the historical or realized volatility of the asset pair.
Volume-Based Fees: Lower fees during high-volume periods to attract more trades, and increase fees during low-volume periods to compensate liquidity providers.
Time-Based Fees: Implement different fee structures for different times of day or days of the week, based on historical trading patterns.
Market Depth-Based Fees: Adjust fees based on the current liquidity depth in the pool.
Cross-Pool Arbitrage Mitigation: Dynamically adjust fees to discourage harmful arbitrage between different pools or exchanges.
Gas Price-Responsive Fees: Adjust fees based on network congestion and gas prices to ensure profitability for liquidity providers.
Event-Driven Fees: Implement special fee structures during significant market events or token-specific occurrences.
Lookback approach: Set the fee to match the most profitable fee tier of external pools with the same asset pair over a recent period.
Price oracle approach: Use an external price oracle to determine the correct asset price and adjust fees based on how trades move the pool price relative to this external price.
Price momentum approach: Analyze recent price history and asymmetrically adjust fees based on trade direction.
Asset composition approach: Lower fees for trades that balance the pool and higher fees for trades that imbalance it.
Transaction-source based approach: Provide lower fees for transactions routed through certain aggregators or sources less likely to be arbitrage trades.
Dynamic Fees Mechanism
In Uniswap v4, the dynamic fee capability of a pool is determined at pool creation and is immutable. This means that whether a pool uses dynamic fees or not is set when the pool is initially created and cannot be changed afterwards. For pools that do use dynamic fees, Uniswap v4 supports two primary methods for updating the fee:
Periodic Updates via PoolManager: Fees can be updated by calling the updateDynamicLPFee function on the PoolManager contract at specified intervals.
Per-Swap Updates via beforeSwap Hook: Fees can be dynamically set for each swap by returning the fee from the beforeSwap hook. This allows hooks to override the LP fee for each swap in dynamic fee pools.
These methods offer flexibility in implementing various fee strategies.
Below is an example of how to set dynamic fees using the beforeSwap hook:

Before a swap occurs, the beforeSwap hook is invoked to determine the fee based on the defined logic. This hook calls the updateDynamicLPFee function on the PoolManager contract to update the fee.

The updateDynamicLPFee function in the PoolManager contract updates the pool's fee accordingly.
For more detailed information on implementing these methods, please refer to our Dynamic Fees Implementation Guide.
Considerations and Best Practices
The optimal fee depends on at least two factors: asset volatility and volume of uninformed flow.
For volatile pairs in systems like Uniswap v3, which don't discriminate between flows, low fee-tier pools are only sensible when uninformed flow is large and asset volatility is relatively low.
Performance implications of frequent fee updates should be carefully considered.
Security measures should be implemented to prevent manipulation of fee-setting mechanisms.
Balance responsiveness with gas costs to optimize for both performance and cost-effectiveness.
For more detailed implementation guidance and best practices, refer to our Dynamic Fees Implementation Guide.

Integrated Routing with UniswapX
The Uniswap Interface will be ramping up support for hooks in its standard routing system progressively over time. Hook builders looking to get immediate access to flow from the interface can do so by running a UniswapX filler for their hooked pools.
At a high level, hook builders' filler implementations will need to do the following:
(On Mainnet) Subscribe to the UniswapX RFQ system and submit fillable bids from orders they receive
Listen to the public feed for orders they won or that are open to be filled publicly
Execute those orders against pools that use their hooks
Developers should check UniswapX Documentation to get started.

v4 Fee Structure Guide
Overview of Fee Types
In Uniswap v4, there are three main types of fees to understand:
LP Fee: Fees earned by liquidity providers
Protocol Fee: Fees collected by the protocol
Swap Fee: Total fee paid by swappers (calculated by applying protocol fee and LP fee sequentially)
LP Fees
LP fees are set by the pool initializer at pool creation and may be static or dynamic.
Fee Range:
Maximum LP Fee: 100%
Minimum LP Fee: 0%
Granularity: Fees are set at pip-level precision
Static LP Fees
Immutable once set during pool initialization
Unlimited fee options in v4 (major improvement from v3)
In v3, LP fee options were limited to: 0.01%, 0.05%, 0.30%, and 1.00%
Dynamic LP Fees
Dynamic fees offer more flexibility and real-time adjustability:
A dynamic fee pool signals this capability by setting its LP fee to 0x800000 (where the first bit = 1)
Only the pool's hook can update the dynamic fee—no additional permissions required
A hook cannot update fees if the pool's fee is not set to 0x800000
Protocol Fees
Protocol fees are configured per pool with the following characteristics:
Controlled by the protocol fee controller (set by the pool manager owner)
Maximum protocol fee: 0.1% (1,000 pips)
Granularity: Fees are set at pip-level precision (not basis points)
Unit conversion: 1 basis point = 100 pips
Directional fees: Separate fees can be set for:
token0 → token1 swaps
token1 → token0 swaps
Swap Fees
Key Change from v3 to v4
v3 behavior: Swap fee = LP fee (protocol fee was a percentage taken from LP fees)
v4 behavior: Swap fee = effective total fee after applying both protocol and LP fees sequentially
Application Order
Protocol fee applied first to the input amount
LP fee applied second to the remaining input (after protocol fee deduction)
Impact on LP Earnings:
Note that this sequential application means introducing or increasing protocol fees will reduce LP earnings even if swap volume remains constant, since LPs now earn fees on a smaller base amount.
Fee Cap
Total swap fee capped at 100% of input amount
Important: If swap fee = 100%, exact output swaps become impossible (entire input consumed by fees)
Fee Calculation Formula

// Method 1: Sequential application
uint256 swapFee = protocolFee + (lpFee * (1_000_000 - protocolFee)) / 1_000_000; (rounded up)

// Method 2: Mathematically equivalent
uint256 swapFee = protocolFee + lpFee - (protocolFee * lpFee) / 1_000_000;


Mathematical Derivation
Starting with input amount:
amountIn

Step 1: Protocol fee takes:
amountIn × (protocolFee / 1_000_000)

Step 2: Remaining after protocol fee:

amountIn × (1 - protocolFee / 1_000_000)

Step 3: LP fee applies to remaining:
lpFee × (remaining amount)

Final formula:
swapFee = protocolFee + (lpFee × (1 - protocolFee / 1_000_000))

Which simplifies to:
swapFee = protocolFee + lpFee - (protocolFee × lpFee) / 1_000_000

Example Calculation
Given:
protocolFee = 50 pips → 0.005%
lpFee = 3000 pips → 0.30%
Calculation:
swapFee = 50 + 3000 - (50 × 3000) / 1_000_000
        = 50 + 3000 - 150 / 1_000_000
        = 50 + 3000 - 0.15
        = 3049.85 pips

Result: 3049.85 pips = 0.304985% total swap fee
Key Takeaways
Sequential application: Protocol fees are deducted first, then LP fees apply to the remainder
Dynamic flexibility: v4 introduces unlimited static fee tiers and dynamic fee capabilities
Directional control: Protocol fees can differ by swap direction
Fee interaction: The combined effect is slightly less than simple addition due to sequential application

Security
When building on Uniswap v4, security should be a primary consideration. This section covers emergency response resources and security best practices specific to v4 implementations.
Emergency Response
SEAL 911 Emergency Hotline
If you encounter a security incident (exploit, vulnerability, or other urgent security matter) while working with Uniswap v4, the SEAL 911 Emergency Hotline provides immediate access to security experts.
Emergency Contact: https://t.me/seal_911_bot
SEAL 911 is a community-operated Telegram bot that connects you directly with vetted security responders who can provide immediate assistance during security incidents.
How It Works
Send a message through the bot during a security emergency
Automatic alert routing to a vetted group of white hat security professionals
Immediate response from trusted security experts in the space
Additional Resources
SEAL 911 GitHub Repository
Security Alliance Website
NOTE
SEAL 911 is a third-party service operated by the Security Alliance. Exercise appropriate judgment when sharing sensitive information during emergency situations.
v4-Specific Security Considerations
Hook Security
When developing custom hooks for v4, ensure proper validation and access controls. Malicious or poorly implemented hooks can compromise pool security.
Flash Accounting
v4's flash accounting system requires careful implementation to prevent exploitation. Always ensure proper settlement of deltas.
Pool Manager Interactions
Direct interactions with the PoolManager require thorough understanding of the locking mechanism and callback patterns.
Audits
Uniswap's V4 core contracts have undergone a handful of extensive security reviews by multiple providers, with some reviews still ongoing. Below is a list of completed and draft reports. The full list can be found in the respective repositories' audits directory:
Open Zeppelin report from July 17th 2024.
Certora draft report from July 2024.
Trail of Bits report from September 5th 2024.
Spearbit draft report from September 5th 2024.
ABDK draft report from September 5th 2024.
Similarly, the V4 periphery contracts have been reviewed by various audit providers, and the full list is inside the periphery repository's audits directory:
Open Zeppelin report from September 5th 2024.
Spearbit draft report from September 5th 2024.
ABDK draft report from September 5th 2024.
Bug Bounty Program
In November 2024 Uniswap announced a $15.5 million dollar bug bounty for their V4 contracts. You can view the full bounty page on Cantina.
Additional Security Resources
Review the v4 Core contracts for implementation details
Follow security best practices outlined in the Hooks documentation
Test thoroughly using the provided test contracts

