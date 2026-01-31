import { http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

// Arc Testnet chain definition
export const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 6,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
    public: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
} as const;

// Contract addresses
export const CONTRACTS = {
  vault: "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB" as `0x${string}`,
  hook: "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2" as `0x${string}`,
  agent: "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E" as `0x${string}`,
  arcUsdc: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  baseUsdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  arcTokenMessenger: "0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA" as `0x${string}`,
} as const;

// Wagmi config with RainbowKit
export const config = getDefaultConfig({
  appName: "Velvet Arc",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [arcTestnet, baseSepolia],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
  ssr: true,
});

// Vault ABI (minimal for reading)
export const VAULT_ABI = [
  {
    inputs: [],
    name: "currentState",
    outputs: [{ type: "uint8", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalDeposits",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getVaultBalance",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalShares",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "agent",
    outputs: [{ type: "address", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "address", name: "user" }],
    name: "shares",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ type: "uint256", name: "amount" }],
    name: "deposit",
    outputs: [{ type: "uint256", name: "sharesMinted" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [{ type: "uint256", name: "shareAmount" }],
    name: "withdraw",
    outputs: [{ type: "uint256", name: "amountOut" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

// Hook ABI (minimal for reading)
export const HOOK_ABI = [
  {
    inputs: [],
    name: "dynamicFee",
    outputs: [{ type: "uint24", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalVolume",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feesCollected",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

// ERC20 ABI for USDC
export const ERC20_ABI = [
  {
    inputs: [{ type: "address", name: "account" }],
    name: "balanceOf",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { type: "address", name: "spender" },
      { type: "uint256", name: "amount" },
    ],
    name: "approve",
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
