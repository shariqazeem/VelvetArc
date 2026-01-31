// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title ITokenMessenger
/// @notice Interface for Circle's CCTP TokenMessenger contract
/// @dev Used to burn USDC on source chain and mint on destination chain
interface ITokenMessenger {
    /**
     * @notice Deposits and burns tokens from sender to be minted on destination domain.
     * @dev Emits a `DepositForBurn` event.
     * @param amount Amount of tokens to burn (in smallest unit, 6 decimals for USDC)
     * @param destinationDomain Destination domain identifier
     * @param mintRecipient Address of mint recipient on destination domain (as bytes32)
     * @param burnToken Address of contract to burn deposited tokens
     * @return nonce Unique nonce reserved by message
     */
    function depositForBurn(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken
    ) external returns (uint64 nonce);

    /**
     * @notice Deposits and burns tokens from sender to be minted on destination domain.
     * @dev Allows specifying a destination caller. Emits a `DepositForBurn` event.
     * @param amount Amount of tokens to burn
     * @param destinationDomain Destination domain identifier
     * @param mintRecipient Address of mint recipient on destination domain (as bytes32)
     * @param burnToken Address of contract to burn deposited tokens
     * @param destinationCaller Authorized caller on destination (bytes32(0) = any)
     * @return nonce Unique nonce reserved by message
     */
    function depositForBurnWithCaller(
        uint256 amount,
        uint32 destinationDomain,
        bytes32 mintRecipient,
        address burnToken,
        bytes32 destinationCaller
    ) external returns (uint64 nonce);
}

/// @title IMessageTransmitter
/// @notice Interface for Circle's CCTP MessageTransmitter contract
/// @dev Used to receive and process cross-chain messages
interface IMessageTransmitter {
    /**
     * @notice Receive a message. Messages with a given nonce can only be received once.
     * @param message Message bytes
     * @param attestation Attestation bytes (signature from Circle attestation service)
     * @return success Boolean indicating success
     */
    function receiveMessage(
        bytes calldata message,
        bytes calldata attestation
    ) external returns (bool success);

    /**
     * @notice Returns the next available nonce for a domain
     * @param domain Domain identifier
     * @return nonce Next available nonce
     */
    function nextAvailableNonce(uint32 domain) external view returns (uint64 nonce);
}
