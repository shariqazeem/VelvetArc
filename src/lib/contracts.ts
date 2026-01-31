// Contract ABIs
export const VAULT_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_usdc", type: "address" },
      { name: "_agent", type: "address" },
    ],
  },
  {
    type: "function",
    name: "deposit",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "getVaultStats",
    inputs: [],
    outputs: [
      { name: "currentState", type: "uint8" },
      { name: "totalDeposited", type: "uint256" },
      { name: "currentlyDeployed", type: "uint256" },
      { name: "availableBalance", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getUserPosition",
    inputs: [{ name: "user", type: "address" }],
    outputs: [
      { name: "depositedAmount", type: "uint256" },
      { name: "shareBalance", type: "uint256" },
      { name: "currentValue", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "state",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalDeposits",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deployedCapital",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "Deposited",
    inputs: [
      { name: "user", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    type: "event",
    name: "StateChanged",
    inputs: [
      { name: "oldState", type: "uint8", indexed: false },
      { name: "newState", type: "uint8", indexed: false },
    ],
  },
] as const;

export const HOOK_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_agent", type: "address" },
      { name: "_usdc", type: "address" },
    ],
  },
  {
    type: "function",
    name: "getHookStatus",
    inputs: [],
    outputs: [
      { name: "currentFee", type: "uint24" },
      { name: "volatility", type: "uint8" },
      { name: "liquidity", type: "uint256" },
      { name: "lastUpdate", type: "uint256" },
      { name: "volume", type: "uint256" },
      { name: "tvl", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "dynamicFee",
    inputs: [],
    outputs: [{ name: "", type: "uint24" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "currentVolatilityLevel",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "totalLiquidity",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "FeeUpdated",
    inputs: [
      { name: "oldFee", type: "uint24", indexed: false },
      { name: "newFee", type: "uint24", indexed: false },
      { name: "reason", type: "string", indexed: false },
    ],
  },
  {
    type: "event",
    name: "VolatilityAlert",
    inputs: [
      { name: "level", type: "uint8", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export const ERC20_ABI = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "allowance",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;
