import { http } from "wagmi";
import { baseSepolia, mainnet } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

// Arc Testnet chain definition using viem's defineChain for proper typing
// Note: MetaMask requires 18 decimals for native currency, even though Arc uses USDC (6 decimals)
// The actual USDC transactions still use 6 decimals - this is just for wallet compatibility
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: { http: ["https://rpc.testnet.arc.network"] },
  },
  blockExplorers: {
    default: { name: "ArcScan", url: "https://testnet.arcscan.app" },
  },
  testnet: true,
});

// Contract addresses
export const CONTRACTS = {
  vault: (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB") as `0x${string}`,
  hook: (process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2") as `0x${string}`,
  agent: "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E" as `0x${string}`,
  arcUsdc: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  baseUsdc: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
  arcGateway: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9" as `0x${string}`,
} as const;

// Wagmi config with RainbowKit
export const config = getDefaultConfig({
  appName: "Velvet Arc",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo",
  chains: [arcTestnet, baseSepolia, mainnet],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [mainnet.id]: http("https://eth.llamarpc.com"), // For ENS resolution
  },
  ssr: true,
});

// Vault ABI - matching actual VelvetVault.sol
export const VAULT_ABI = [
  {
    inputs: [],
    name: "state",
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
    inputs: [],
    name: "owner",
    outputs: [{ type: "address", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  // getUserPosition returns all user data
  {
    inputs: [{ type: "address", name: "user" }],
    name: "getUserPosition",
    outputs: [
      { type: "uint256", name: "depositedAmount" },
      { type: "uint256", name: "shareBalance" },
      { type: "uint256", name: "currentValue" },
      { type: "uint256", name: "lastDeposit" },
    ],
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
    inputs: [{ type: "uint256", name: "sharesToRedeem" }],
    name: "withdraw",
    outputs: [{ type: "uint256", name: "amount" }],
    stateMutability: "nonpayable",
    type: "function",
  },
  // getVaultStats for comprehensive data
  {
    inputs: [],
    name: "getVaultStats",
    outputs: [
      { type: "uint8", name: "currentState" },
      { type: "uint256", name: "totalDeposited" },
      { type: "uint256", name: "totalSharesIssued" },
      { type: "uint256", name: "currentlyDeployed" },
      { type: "uint256", name: "availableBalance" },
      { type: "uint256", name: "yieldEarned" },
      { type: "uint256", name: "sharePrice" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

// Hook ABI - matching actual VelvetHook.sol
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
    name: "totalLiquidity",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "volatilityLevel",
    outputs: [{ type: "uint8", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastFeeUpdate",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lastFeeReason",
    outputs: [{ type: "string", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "AGENT",
    outputs: [{ type: "address", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getHookStatus",
    outputs: [
      { type: "uint24", name: "currentFee" },
      { type: "uint8", name: "currentVolatility" },
      { type: "uint256", name: "liquidity" },
      { type: "uint256", name: "lastUpdate" },
      { type: "string", name: "feeReason" },
    ],
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
  {
    inputs: [
      { type: "address", name: "owner" },
      { type: "address", name: "spender" },
    ],
    name: "allowance",
    outputs: [{ type: "uint256", name: "" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      { type: "address", name: "to" },
      { type: "uint256", name: "amount" },
    ],
    name: "transfer",
    outputs: [{ type: "bool", name: "" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;
