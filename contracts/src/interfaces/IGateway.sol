// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title IGateway
/// @notice Interface for Circle Gateway Wallet Contract on Arc
/// @dev Gateway enables chain-abstracted USDC balance and cross-chain transfers
interface IGateway {
    /// @notice Deposit tokens into the Gateway for cross-chain availability
    /// @param token The token address to deposit (USDC)
    /// @param amount The amount to deposit
    function deposit(address token, uint256 amount) external;

    /// @notice Withdraw tokens from the Gateway
    /// @param token The token address to withdraw
    /// @param amount The amount to withdraw
    function withdraw(address token, uint256 amount) external;

    /// @notice Transfer tokens cross-chain via Gateway
    /// @param token The token address
    /// @param amount The amount to transfer
    /// @param destinationChain The destination chain identifier
    /// @param recipient The recipient address on destination chain
    function transfer(
        address token,
        uint256 amount,
        uint256 destinationChain,
        bytes32 recipient
    ) external;

    /// @notice Get the balance of a token in the Gateway for an account
    /// @param account The account address
    /// @param token The token address
    /// @return The balance amount
    function balanceOf(address account, address token) external view returns (uint256);
}
