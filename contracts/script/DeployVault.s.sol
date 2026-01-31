// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VelvetVault} from "../src/VelvetVault.sol";

contract DeployVault is Script {
    // Arc Testnet addresses
    // USDC is the native gas token wrapper on Arc
    address constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    // Circle Gateway Wallet Contract on Arc
    address constant ARC_GATEWAY = 0x0077777d7EBA4688BDeF3E311b846F25870A19B9;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Velvet Arc Vault Deployment ===");
        console.log("Network: Arc Testnet (Chain ID: 5042002)");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy VelvetVault with Circle Gateway integration
        VelvetVault vault = new VelvetVault(
            ARC_USDC,
            ARC_GATEWAY,
            deployer // Agent is deployer initially
        );

        console.log("VelvetVault deployed at:", address(vault));
        console.log("");
        console.log("Configuration:");
        console.log("  USDC:", ARC_USDC);
        console.log("  Gateway:", ARC_GATEWAY);
        console.log("  Agent:", deployer);
        console.log("");
        console.log("Chain IDs for bridging:");
        console.log("  Arc Testnet:", vault.CHAIN_ARC_TESTNET());
        console.log("  Base Sepolia:", vault.CHAIN_BASE_SEPOLIA());
        console.log("  Ethereum Sepolia:", vault.CHAIN_ETH_SEPOLIA());

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Add to .env: NEXT_PUBLIC_VAULT_ADDRESS_ARC=", address(vault));
    }
}
