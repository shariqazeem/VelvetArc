// Chain configurations
export const CHAINS = {
  ARC_TESTNET: {
    id: 5042002,
    name: "Arc Testnet",
    rpc: "https://rpc.testnet.arc.network",
    explorer: "https://testnet.arcscan.app",
    nativeCurrency: {
      name: "USDC",
      symbol: "USDC",
      decimals: 18,
    },
  },
  BASE_SEPOLIA: {
    id: 84532,
    name: "Base Sepolia",
    rpc: "https://sepolia.base.org",
    explorer: "https://sepolia.basescan.org",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
  },
} as const;

// Token addresses
export const TOKENS = {
  ARC_USDC: "0x3600000000000000000000000000000000000000",
  BASE_USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
} as const;

// Contract addresses (update after deployment)
export const CONTRACTS = {
  VAULT_ARC: process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "",
  HOOK_BASE: process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "",
} as const;

// Vault states mapping
export const VAULT_STATES = {
  0: { name: "IDLE", color: "#3b82f6", label: "Safe Harbor" },
  1: { name: "BRIDGING_OUT", color: "#8b5cf6", label: "Deploying" },
  2: { name: "DEPLOYED", color: "#f97316", label: "Yield Hunting" },
  3: { name: "BRIDGING_BACK", color: "#8b5cf6", label: "Retreating" },
  4: { name: "PROTECTED", color: "#1a1a1a", label: "Protected" },
} as const;

// Volatility levels
export const VOLATILITY_LEVELS = {
  LOW: 0,
  MEDIUM: 1,
  HIGH: 2,
} as const;

// LI.FI configuration
export const LIFI_CONFIG = {
  integrator: "velvet-arc",
} as const;
