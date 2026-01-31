// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script, console} from "forge-std/Script.sol";
import {VelvetHook} from "../src/VelvetHook.sol";
import {IPoolManager} from "@uniswap/v4-core/src/interfaces/IPoolManager.sol";

contract DeployHook is Script {
    // Base Sepolia addresses
    address constant BASE_USDC = 0x036CbD53842c5426634e7929541eC2318f3dCF7e;

    // Uniswap V4 PoolManager on Base Sepolia
    // Note: Check latest deployment address at docs.uniswap.org
    address constant BASE_POOL_MANAGER = 0x7Da1D65F8B249183667cdE74C5CBD46dD38AA829;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("=== Velvet Hook Deployment ===");
        console.log("Network: Base Sepolia (Chain ID: 84532)");
        console.log("Deployer:", deployer);
        console.log("");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy VelvetHook
        VelvetHook hook = new VelvetHook(
            IPoolManager(BASE_POOL_MANAGER),
            BASE_USDC,
            deployer // Agent is deployer initially
        );

        console.log("VelvetHook deployed at:", address(hook));
        console.log("");
        console.log("Configuration:");
        console.log("  PoolManager:", BASE_POOL_MANAGER);
        console.log("  USDC:", BASE_USDC);
        console.log("  Agent:", deployer);
        console.log("");
        console.log("Initial Fee Config:");
        console.log("  Default Fee:", hook.dynamicFee(), "bps");
        console.log("  Max Fee:", hook.MAX_FEE(), "bps");
        console.log("  Min Fee:", hook.MIN_FEE(), "bps");

        vm.stopBroadcast();

        console.log("");
        console.log("=== Deployment Complete ===");
        console.log("Add to .env: NEXT_PUBLIC_HOOK_ADDRESS_BASE=", address(hook));
    }
}
