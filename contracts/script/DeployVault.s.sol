// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VelvetVault} from "../src/VelvetVault.sol";

contract DeployVault is Script {
    // Arc Testnet addresses
    // USDC is the native gas token wrapper
    address constant ARC_USDC = 0x3600000000000000000000000000000000000000;

    // CCTP TokenMessenger V2 on Arc Testnet (Domain 26)
    address constant ARC_TOKEN_MESSENGER = 0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Velvet Arc Vault Deployment ===");
        console.log("Network: Arc Testnet (Chain ID: 5042002)");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy VelvetVault with CCTP integration
        VelvetVault vault = new VelvetVault(
            ARC_USDC,
            ARC_TOKEN_MESSENGER,
            deployer // Agent is deployer initially
        );

        console.log("VelvetVault deployed at:", address(vault));
        console.log("");
        console.log("Configuration:");
        console.log("  USDC:", ARC_USDC);
        console.log("  TokenMessenger:", ARC_TOKEN_MESSENGER);
        console.log("  Agent:", deployer);
        console.log("");
        console.log("CCTP Domain IDs:");
        console.log("  Arc:", vault.DOMAIN_ARC());
        console.log("  Base:", vault.DOMAIN_BASE());
        console.log("  Ethereum:", vault.DOMAIN_ETHEREUM());

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Add to .env: NEXT_PUBLIC_VAULT_ADDRESS_ARC=", address(vault));
    }
}
