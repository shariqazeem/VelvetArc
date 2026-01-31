// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {IERC20} from "./interfaces/IERC20.sol";
import {IGateway} from "./interfaces/IGateway.sol";

/// @title VelvetVault
/// @notice Home base vault on Circle Arc for the Velvet Agent
/// @dev Integrates with Circle Gateway for cross-chain USDC transfers
/// @author Velvet Arc - ETHGlobal HackMoney 2026
contract VelvetVault {
    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event GatewayDeposit(uint256 amount, uint256 destinationChain, bytes32 recipient);
    event BridgeCompleted(uint256 amount, uint256 yieldEarned);
    event AgentUpdated(address indexed oldAgent, address indexed newAgent);
    event StateChanged(VaultState oldState, VaultState newState);
    event CircuitBreakerTriggered(address indexed triggeredBy, string reason);

    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error NotAgent();
    error NotOwner();
    error ZeroAmount();
    error InsufficientBalance();
    error InvalidState();
    error ZeroAddress();
    error TransferFailed();
    error ApprovalFailed();

    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    enum VaultState {
        IDLE,           // Funds sitting in vault (safe harbor)
        BRIDGING_OUT,   // Gateway deposit initiated
        DEPLOYED,       // Funds deployed on execution chain
        BRIDGING_BACK,  // Funds returning via Gateway
        PROTECTED       // Emergency state - no outbound allowed
    }

    struct UserPosition {
        uint256 depositedAmount;
        uint256 shares;
        uint256 lastDepositTime;
    }

    struct BridgeRecord {
        uint256 amount;
        uint256 destinationChain;
        bytes32 recipient;
        uint256 timestamp;
    }

    /*//////////////////////////////////////////////////////////////
                             CONSTANTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Chain ID for Base Sepolia
    uint256 public constant CHAIN_BASE_SEPOLIA = 84532;

    /// @notice Chain ID for Arc Testnet
    uint256 public constant CHAIN_ARC_TESTNET = 5042002;

    /// @notice Chain ID for Ethereum Sepolia
    uint256 public constant CHAIN_ETH_SEPOLIA = 11155111;

    /*//////////////////////////////////////////////////////////////
                                 STATE
    //////////////////////////////////////////////////////////////*/

    /// @notice USDC token on Arc
    IERC20 public immutable USDC;

    /// @notice Circle Gateway Wallet Contract on Arc
    IGateway public immutable GATEWAY;

    /// @notice Contract owner (admin)
    address public owner;

    /// @notice Agent address (can trigger bridge operations)
    address public agent;

    /// @notice Current vault state
    VaultState public state;

    /// @notice Total USDC deposited by users
    uint256 public totalDeposits;

    /// @notice Total shares issued
    uint256 public totalShares;

    /// @notice Amount currently deployed via Gateway
    uint256 public deployedCapital;

    /// @notice Total yield earned across all operations
    uint256 public totalYieldEarned;

    /// @notice Current bridge operation record
    BridgeRecord public currentBridge;

    /// @notice User positions
    mapping(address => UserPosition) public positions;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    modifier onlyAgent() {
        if (msg.sender != agent) revert NotAgent();
        _;
    }

    modifier nonZero(uint256 amount) {
        if (amount == 0) revert ZeroAmount();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @param _usdc USDC token address on Arc (0x3600000000000000000000000000000000000000)
    /// @param _gateway Circle Gateway Wallet address (0x0077777d7EBA4688BDeF3E311b846F25870A19B9)
    /// @param _agent Initial agent address
    constructor(
        address _usdc,
        address _gateway,
        address _agent
    ) {
        if (_usdc == address(0) || _gateway == address(0) || _agent == address(0)) {
            revert ZeroAddress();
        }

        USDC = IERC20(_usdc);
        GATEWAY = IGateway(_gateway);
        owner = msg.sender;
        agent = _agent;
        state = VaultState.IDLE;
    }

    /*//////////////////////////////////////////////////////////////
                            USER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deposit USDC into the vault
    /// @param amount Amount of USDC to deposit (6 decimals)
    /// @return shares Amount of shares minted
    function deposit(uint256 amount) external nonZero(amount) returns (uint256 shares) {
        // Calculate shares based on current exchange rate
        if (totalShares == 0 || totalDeposits == 0) {
            shares = amount;
        } else {
            shares = (amount * totalShares) / totalDeposits;
        }

        // Transfer USDC from user
        bool success = USDC.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        // Update user position
        positions[msg.sender].depositedAmount += amount;
        positions[msg.sender].shares += shares;
        positions[msg.sender].lastDepositTime = block.timestamp;

        // Update totals
        totalDeposits += amount;
        totalShares += shares;

        emit Deposited(msg.sender, amount, shares);
    }

    /// @notice Withdraw USDC from the vault
    /// @param sharesToRedeem Amount of shares to redeem
    /// @return amount Amount of USDC withdrawn
    function withdraw(uint256 sharesToRedeem) external nonZero(sharesToRedeem) returns (uint256 amount) {
        UserPosition storage position = positions[msg.sender];

        if (position.shares < sharesToRedeem) revert InsufficientBalance();
        if (state != VaultState.IDLE && state != VaultState.PROTECTED) {
            revert InvalidState();
        }

        // Calculate USDC amount based on share value
        amount = (sharesToRedeem * totalDeposits) / totalShares;

        // Check vault has sufficient balance
        uint256 vaultBalance = USDC.balanceOf(address(this));
        if (amount > vaultBalance) revert InsufficientBalance();

        // Update user position
        position.shares -= sharesToRedeem;
        if (position.depositedAmount > amount) {
            position.depositedAmount -= amount;
        } else {
            position.depositedAmount = 0;
        }

        // Update totals
        totalShares -= sharesToRedeem;
        totalDeposits -= amount;

        // Transfer USDC to user
        bool success = USDC.transfer(msg.sender, amount);
        if (!success) revert TransferFailed();

        emit Withdrawn(msg.sender, amount, sharesToRedeem);
    }

    /*//////////////////////////////////////////////////////////////
                         AGENT BRIDGE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Deploy capital to execution chain via Circle Gateway
    /// @dev Only callable by agent when vault is IDLE
    /// @param amount Amount of USDC to bridge
    /// @param destinationChain Chain ID of destination (e.g., 84532 for Base Sepolia)
    /// @param recipient Address to receive USDC on destination (as bytes32)
    function bridgeToExecution(
        uint256 amount,
        uint256 destinationChain,
        bytes32 recipient
    ) external onlyAgent nonZero(amount) {
        if (state != VaultState.IDLE) revert InvalidState();
        if (amount > USDC.balanceOf(address(this))) revert InsufficientBalance();

        // Step 1: Approve Gateway to spend USDC
        bool approved = USDC.approve(address(GATEWAY), amount);
        if (!approved) revert ApprovalFailed();

        // Step 2: Deposit to Gateway - this burns USDC on Arc
        // and makes it available for minting on destination chain
        GATEWAY.deposit(address(USDC), amount);

        // Step 3: Transfer via Gateway to destination
        GATEWAY.transfer(address(USDC), amount, destinationChain, recipient);

        // Update state
        VaultState oldState = state;
        state = VaultState.BRIDGING_OUT;
        deployedCapital = amount;

        // Record bridge operation
        currentBridge = BridgeRecord({
            amount: amount,
            destinationChain: destinationChain,
            recipient: recipient,
            timestamp: block.timestamp
        });

        emit StateChanged(oldState, state);
        emit GatewayDeposit(amount, destinationChain, recipient);
    }

    /// @notice Confirm capital has been deployed on execution chain
    /// @dev Called by agent after verifying funds arrived on destination
    function confirmDeployment() external onlyAgent {
        if (state != VaultState.BRIDGING_OUT) revert InvalidState();

        VaultState oldState = state;
        state = VaultState.DEPLOYED;

        emit StateChanged(oldState, state);
    }

    /// @notice Signal that capital is returning from execution chain
    /// @dev Called by agent when initiating return bridge
    function signalReturn() external onlyAgent {
        if (state != VaultState.DEPLOYED) revert InvalidState();

        VaultState oldState = state;
        state = VaultState.BRIDGING_BACK;

        emit StateChanged(oldState, state);
    }

    /// @notice Confirm capital has returned to vault
    /// @dev Called by agent after Gateway mint completes on Arc
    /// @param returnedAmount Actual amount returned (may include yield)
    function confirmReturn(uint256 returnedAmount) external onlyAgent {
        if (state != VaultState.BRIDGING_BACK) revert InvalidState();

        VaultState oldState = state;
        state = VaultState.IDLE;

        // Calculate and record yield
        if (returnedAmount > deployedCapital) {
            uint256 yield = returnedAmount - deployedCapital;
            totalYieldEarned += yield;
            totalDeposits += yield; // Distribute yield to depositors via share value increase
            emit BridgeCompleted(returnedAmount, yield);
        } else {
            emit BridgeCompleted(returnedAmount, 0);
        }

        deployedCapital = 0;
        delete currentBridge;

        emit StateChanged(oldState, state);
    }

    /// @notice Emergency circuit breaker
    /// @dev Locks vault and prevents outbound bridges
    /// @param reason Reason for triggering circuit breaker
    function triggerCircuitBreaker(string calldata reason) external onlyAgent {
        VaultState oldState = state;
        state = VaultState.PROTECTED;

        emit CircuitBreakerTriggered(msg.sender, reason);
        emit StateChanged(oldState, state);
    }

    /// @notice Reset from protected state
    /// @dev Only owner can reset after circuit breaker
    function resetFromProtected() external onlyOwner {
        if (state != VaultState.PROTECTED) revert InvalidState();

        VaultState oldState = state;
        state = VaultState.IDLE;
        deployedCapital = 0;

        emit StateChanged(oldState, state);
    }

    /*//////////////////////////////////////////////////////////////
                            ADMIN FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Update the agent address
    /// @param newAgent New agent address
    function setAgent(address newAgent) external onlyOwner {
        if (newAgent == address(0)) revert ZeroAddress();
        address oldAgent = agent;
        agent = newAgent;
        emit AgentUpdated(oldAgent, newAgent);
    }

    /// @notice Transfer ownership
    /// @param newOwner New owner address
    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        owner = newOwner;
    }

    /// @notice Emergency withdraw stuck tokens (owner only)
    /// @param token Token address to rescue
    /// @param amount Amount to rescue
    function rescueTokens(address token, uint256 amount) external onlyOwner {
        // Don't allow rescuing deposited USDC unless in protected state
        if (token == address(USDC) && state != VaultState.PROTECTED) {
            revert InvalidState();
        }
        IERC20(token).transfer(owner, amount);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Get comprehensive vault statistics
    function getVaultStats() external view returns (
        VaultState currentState,
        uint256 totalDeposited,
        uint256 totalSharesIssued,
        uint256 currentlyDeployed,
        uint256 availableBalance,
        uint256 yieldEarned,
        uint256 sharePrice
    ) {
        uint256 price = totalShares > 0 ? (totalDeposits * 1e18) / totalShares : 1e18;
        return (
            state,
            totalDeposits,
            totalShares,
            deployedCapital,
            USDC.balanceOf(address(this)),
            totalYieldEarned,
            price
        );
    }

    /// @notice Get user's position details
    /// @param user User address
    function getUserPosition(address user) external view returns (
        uint256 depositedAmount,
        uint256 shareBalance,
        uint256 currentValue,
        uint256 lastDeposit
    ) {
        UserPosition memory pos = positions[user];
        uint256 value = totalShares > 0
            ? (pos.shares * totalDeposits) / totalShares
            : 0;
        return (pos.depositedAmount, pos.shares, value, pos.lastDepositTime);
    }

    /// @notice Get current bridge operation details
    function getCurrentBridge() external view returns (
        uint256 amount,
        uint256 destinationChain,
        bytes32 recipient,
        uint256 timestamp
    ) {
        BridgeRecord memory br = currentBridge;
        return (br.amount, br.destinationChain, br.recipient, br.timestamp);
    }

    /// @notice Convert address to bytes32 for Gateway
    /// @param addr Address to convert
    function addressToBytes32(address addr) external pure returns (bytes32) {
        return bytes32(uint256(uint160(addr)));
    }
}
