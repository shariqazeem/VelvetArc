#!/usr/bin/env npx tsx
/**
 * Velvet Arc - Production Agent Runner
 *
 * This agent integrates with the deployed VelvetVault contract.
 * It monitors market conditions and executes cross-chain yield strategies.
 *
 * Flow:
 *   1. Users deposit USDC into VelvetVault on Arc
 *   2. Agent monitors market and decides to DEPLOY
 *   3. Agent calls vault.bridgeToExecution() → funds go to Base via Circle Gateway
 *   4. Agent manages yield on Base (Uniswap V4 Hook fees)
 *   5. Agent decides to WITHDRAW → bridges back via LI.FI
 *   6. Agent calls vault.confirmReturn() → users can withdraw with yield
 *
 * Usage:
 *   npx tsx scripts/run-agent-production.ts
 *
 * Environment Variables:
 *   PRIVATE_KEY                    - Agent wallet private key
 *   NEXT_PUBLIC_VAULT_ADDRESS_ARC  - VelvetVault contract on Arc
 *   NEXT_PUBLIC_HOOK_ADDRESS_BASE  - VelvetHook contract on Base
 *
 * Demo Mode:
 *   DEMO_MODE=true FORCE_ACTION=DEPLOY npx tsx scripts/run-agent-production.ts
 *   DEMO_MODE=true FORCE_ACTION=WITHDRAW npx tsx scripts/run-agent-production.ts
 */

import { config } from "dotenv";
import { resolve } from "path";
import {
  createWalletClient,
  createPublicClient,
  http,
  formatUnits,
  parseUnits,
  type Chain,
  type PublicClient,
  type WalletClient,
} from "viem";
import { privateKeyToAccount, type PrivateKeyAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import {
  createConfig,
  EVM,
  getRoutes,
  executeRoute,
  type RoutesRequest,
} from "@lifi/sdk";

// Load environment
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/*//////////////////////////////////////////////////////////////
                      CONFIGURATION
//////////////////////////////////////////////////////////////*/

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC as `0x${string}`;
const HOOK_ADDRESS = process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE as `0x${string}`;

// Demo Mode
const DEMO_MODE = process.env.DEMO_MODE === "true";
const FORCE_ACTION = process.env.FORCE_ACTION as "DEPLOY" | "WITHDRAW" | undefined;

// Chains
const arcTestnet: Chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
};

// Tokens
const TOKENS = {
  ARC_USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  BASE_USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
};

// Minimum amounts
const MIN_DEPLOY_AMOUNT = parseUnits("1", 6); // 1 USDC minimum to deploy
const LOOP_INTERVAL = 15000; // 15 seconds between iterations

/*//////////////////////////////////////////////////////////////
                            ABIS
//////////////////////////////////////////////////////////////*/

const VAULT_ABI = [
  {
    name: "bridgeToExecution",
    type: "function",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "destinationChain", type: "uint256" },
      { name: "recipient", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "confirmDeployment",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "signalReturn",
    type: "function",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "confirmReturn",
    type: "function",
    inputs: [{ name: "returnedAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "triggerCircuitBreaker",
    type: "function",
    inputs: [{ name: "reason", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getVaultStats",
    type: "function",
    inputs: [],
    outputs: [
      { name: "currentState", type: "uint8" },
      { name: "totalDeposited", type: "uint256" },
      { name: "totalSharesIssued", type: "uint256" },
      { name: "currentlyDeployed", type: "uint256" },
      { name: "availableBalance", type: "uint256" },
      { name: "yieldEarned", type: "uint256" },
      { name: "sharePrice", type: "uint256" },
    ],
    stateMutability: "view",
  },
  {
    name: "state",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "addressToBytes32",
    type: "function",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "", type: "bytes32" }],
    stateMutability: "pure",
  },
] as const;

const HOOK_ABI = [
  {
    name: "updateDynamicFee",
    type: "function",
    inputs: [
      { name: "newFee", type: "uint24" },
      { name: "reason", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "getHookStatus",
    type: "function",
    inputs: [],
    outputs: [
      { name: "currentFee", type: "uint24" },
      { name: "currentVolatility", type: "uint8" },
      { name: "liquidity", type: "uint256" },
      { name: "lastUpdate", type: "uint256" },
      { name: "feeReason", type: "string" },
    ],
    stateMutability: "view",
  },
] as const;

const ERC20_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

/*//////////////////////////////////////////////////////////////
                          STATE
//////////////////////////////////////////////////////////////*/

type VaultState = "IDLE" | "BRIDGING_OUT" | "DEPLOYED" | "BRIDGING_BACK" | "PROTECTED";
const VAULT_STATES: VaultState[] = ["IDLE", "BRIDGING_OUT", "DEPLOYED", "BRIDGING_BACK", "PROTECTED"];

interface AgentState {
  vaultState: VaultState;
  vaultBalance: bigint;
  deployedAmount: bigint;
  agentBalanceArc: bigint;
  agentBalanceBase: bigint;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  ethPrice: number;
  priceChange24h: number;
  iteration: number;
}

let state: AgentState = {
  vaultState: "IDLE",
  vaultBalance: 0n,
  deployedAmount: 0n,
  agentBalanceArc: 0n,
  agentBalanceBase: 0n,
  volatility: "LOW",
  ethPrice: 0,
  priceChange24h: 0,
  iteration: 0,
};

/*//////////////////////////////////////////////////////////////
                         MAIN
//////////////////////////////////////////////////////////////*/

async function main() {
  console.log("\n╔══════════════════════════════════════════════════════════╗");
  console.log("║       VELVET ARC - PRODUCTION AGENT                      ║");
  console.log("╚══════════════════════════════════════════════════════════╝\n");

  // Validate
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not set");
    process.exit(1);
  }
  if (!VAULT_ADDRESS) {
    console.error("❌ VAULT_ADDRESS not set");
    process.exit(1);
  }

  // Initialize account
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log(`🔑 Agent: ${account.address}`);
  console.log(`🏦 Vault: ${VAULT_ADDRESS}`);
  console.log(`🪝 Hook:  ${HOOK_ADDRESS || "Not set"}`);

  if (DEMO_MODE) {
    console.log(`\n🎬 DEMO MODE: ${FORCE_ACTION || "Enabled"}`);
  }

  // Create clients
  const arcPublic = createPublicClient({ chain: arcTestnet, transport: http() });
  const basePublic = createPublicClient({ chain: baseSepolia, transport: http() });
  const arcWallet = createWalletClient({ account, chain: arcTestnet, transport: http() });
  const baseWallet = createWalletClient({ account, chain: baseSepolia, transport: http() });

  // Initialize LI.FI
  createConfig({ integrator: "velvet-arc" });
  EVM({
    getWalletClient: async () => baseWallet,
    switchChain: async () => baseWallet,
  });
  console.log("✅ LI.FI SDK ready");

  // Initial status
  await refreshState(account, arcPublic, basePublic);
  printStatus();

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Starting agent loop...");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Main loop
  while (true) {
    try {
      await runIteration(account, arcPublic, basePublic, arcWallet, baseWallet);
    } catch (error) {
      console.error("❌ Iteration error:", error);
    }
    await sleep(LOOP_INTERVAL);
  }
}

/*//////////////////////////////////////////////////////////////
                       ITERATION
//////////////////////////////////////////////////////////////*/

async function runIteration(
  account: PrivateKeyAccount,
  arcPublic: PublicClient,
  basePublic: PublicClient,
  arcWallet: WalletClient,
  baseWallet: WalletClient
) {
  state.iteration++;
  const time = new Date().toLocaleTimeString();

  console.log(`\n[${time}] ═══ Iteration #${state.iteration} ═══`);

  // 1. Refresh state
  await refreshState(account, arcPublic, basePublic);

  // 2. Get market conditions
  await fetchMarketConditions();

  console.log(`   Vault: ${state.vaultState} | Balance: $${formatUnits(state.vaultBalance, 6)}`);
  console.log(`   Market: ETH $${state.ethPrice.toFixed(0)} | ${state.volatility} volatility | ${state.priceChange24h > 0 ? "+" : ""}${state.priceChange24h.toFixed(2)}%`);

  // 3. Decide action based on current state
  const action = decideAction();
  console.log(`   Decision: ${action.type} - ${action.reason}`);

  // 4. Execute action
  if (action.type !== "WAIT") {
    await executeAction(action, account, arcPublic, basePublic, arcWallet, baseWallet);
  }

  // 5. Update hook fee if on Base
  if (HOOK_ADDRESS && (state.vaultState === "DEPLOYED" || state.agentBalanceBase > 0n)) {
    await updateHookFee(baseWallet);
  }
}

/*//////////////////////////////////////////////////////////////
                     STATE REFRESH
//////////////////////////////////////////////////////////////*/

async function refreshState(
  account: PrivateKeyAccount,
  arcPublic: PublicClient,
  basePublic: PublicClient
) {
  try {
    // Vault state
    const vaultStats = await arcPublic.readContract({
      address: VAULT_ADDRESS,
      abi: VAULT_ABI,
      functionName: "getVaultStats",
    });

    state.vaultState = VAULT_STATES[vaultStats[0]];
    state.vaultBalance = vaultStats[4]; // availableBalance
    state.deployedAmount = vaultStats[3]; // currentlyDeployed

    // Agent balances
    state.agentBalanceArc = await arcPublic.readContract({
      address: TOKENS.ARC_USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });

    state.agentBalanceBase = await basePublic.readContract({
      address: TOKENS.BASE_USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });
  } catch (error) {
    console.error("   ⚠️ State refresh failed:", error);
  }
}

async function fetchMarketConditions() {
  try {
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true"
    );
    const data = await res.json();
    state.ethPrice = data.ethereum?.usd || 3000;
    state.priceChange24h = data.ethereum?.usd_24h_change || 0;

    // Calculate volatility from 24h change
    const absChange = Math.abs(state.priceChange24h);
    if (absChange < 2) state.volatility = "LOW";
    else if (absChange < 5) state.volatility = "MEDIUM";
    else if (absChange < 10) state.volatility = "HIGH";
    else state.volatility = "EXTREME";
  } catch {
    state.volatility = "MEDIUM";
    state.ethPrice = 3000;
    state.priceChange24h = 0;
  }
}

/*//////////////////////////////////////////////////////////////
                    DECISION ENGINE
//////////////////////////////////////////////////////////////*/

interface Action {
  type: "DEPLOY" | "CONFIRM_DEPLOY" | "WITHDRAW" | "CONFIRM_RETURN" | "EMERGENCY" | "WAIT";
  reason: string;
  amount?: bigint;
}

function decideAction(): Action {
  // Demo mode override
  if (DEMO_MODE && FORCE_ACTION) {
    if (FORCE_ACTION === "DEPLOY") {
      if (state.vaultState === "IDLE" && state.vaultBalance >= MIN_DEPLOY_AMOUNT) {
        return { type: "DEPLOY", reason: "DEMO: Forced deploy", amount: state.vaultBalance };
      }
      if (state.vaultState === "BRIDGING_OUT" && state.agentBalanceBase > 0n) {
        return { type: "CONFIRM_DEPLOY", reason: "DEMO: Confirming deployment" };
      }
    }
    if (FORCE_ACTION === "WITHDRAW") {
      if (state.vaultState === "DEPLOYED") {
        return { type: "WITHDRAW", reason: "DEMO: Forced withdraw" };
      }
      if (state.vaultState === "BRIDGING_BACK" && state.vaultBalance > 0n) {
        return { type: "CONFIRM_RETURN", reason: "DEMO: Confirming return" };
      }
    }
    return { type: "WAIT", reason: `DEMO: Waiting (vault is ${state.vaultState})` };
  }

  // Emergency conditions
  if (state.volatility === "EXTREME") {
    if (state.vaultState === "DEPLOYED") {
      return { type: "EMERGENCY", reason: "CIRCUIT BREAKER: Extreme volatility" };
    }
    return { type: "WAIT", reason: "Extreme volatility - staying safe" };
  }

  // State machine logic
  switch (state.vaultState) {
    case "IDLE":
      // Can we deploy?
      if (state.vaultBalance >= MIN_DEPLOY_AMOUNT) {
        if (state.volatility === "LOW") {
          return { type: "DEPLOY", reason: "Low volatility - deploying to Base", amount: state.vaultBalance };
        }
        if (state.volatility === "MEDIUM" && state.priceChange24h > 0) {
          return { type: "DEPLOY", reason: "Medium vol + positive trend", amount: (state.vaultBalance * 70n) / 100n };
        }
      }
      return { type: "WAIT", reason: "Waiting for better conditions" };

    case "BRIDGING_OUT":
      // Check if funds arrived on Base
      if (state.agentBalanceBase > 0n) {
        return { type: "CONFIRM_DEPLOY", reason: "Funds received on Base" };
      }
      return { type: "WAIT", reason: "Waiting for bridge completion" };

    case "DEPLOYED":
      // Should we withdraw?
      if (state.volatility === "HIGH" || state.priceChange24h < -3) {
        return { type: "WITHDRAW", reason: `${state.volatility} volatility - protecting capital` };
      }
      return { type: "WAIT", reason: "Farming on Base - conditions stable" };

    case "BRIDGING_BACK":
      // Check if funds returned to vault
      if (state.vaultBalance > 0n) {
        return { type: "CONFIRM_RETURN", reason: "Funds received on Arc" };
      }
      return { type: "WAIT", reason: "Waiting for return bridge" };

    case "PROTECTED":
      return { type: "WAIT", reason: "Vault in protected mode - manual intervention required" };

    default:
      return { type: "WAIT", reason: "Unknown state" };
  }
}

/*//////////////////////////////////////////////////////////////
                   ACTION EXECUTOR
//////////////////////////////////////////////////////////////*/

async function executeAction(
  action: Action,
  account: PrivateKeyAccount,
  arcPublic: PublicClient,
  basePublic: PublicClient,
  arcWallet: WalletClient,
  baseWallet: WalletClient
) {
  console.log(`   ⚡ Executing: ${action.type}...`);

  try {
    switch (action.type) {
      case "DEPLOY":
        await executeDeploy(action.amount!, account, arcWallet, arcPublic);
        break;

      case "CONFIRM_DEPLOY":
        await executeConfirmDeploy(arcWallet);
        break;

      case "WITHDRAW":
        await executeWithdraw(account, arcWallet, baseWallet);
        break;

      case "CONFIRM_RETURN":
        await executeConfirmReturn(arcWallet);
        break;

      case "EMERGENCY":
        await executeEmergency(action.reason, arcWallet, baseWallet);
        break;
    }
  } catch (error) {
    console.error(`   ❌ Action failed:`, error);
  }
}

async function executeDeploy(
  amount: bigint,
  account: PrivateKeyAccount,
  arcWallet: WalletClient,
  arcPublic: PublicClient
) {
  console.log(`   📤 Deploying ${formatUnits(amount, 6)} USDC to Base...`);

  // Get recipient bytes32
  const recipientBytes32 = await arcPublic.readContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "addressToBytes32",
    args: [account.address],
  });

  // Call vault.bridgeToExecution
  const txHash = await arcWallet.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "bridgeToExecution",
    args: [amount, 84532n, recipientBytes32],
    account: account,
    chain: arcTestnet,
  });

  console.log(`   ✅ Bridge initiated: ${txHash}`);
  console.log(`   ⏳ Funds will arrive on Base in ~2-5 minutes via Circle Gateway`);
}

async function executeConfirmDeploy(arcWallet: WalletClient) {
  const txHash = await arcWallet.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "confirmDeployment",
    account: arcWallet.account!,
    chain: arcTestnet,
  });

  console.log(`   ✅ Deployment confirmed: ${txHash}`);
}

async function executeWithdraw(
  account: PrivateKeyAccount,
  arcWallet: WalletClient,
  baseWallet: WalletClient
) {
  console.log(`   📥 Withdrawing ${formatUnits(state.agentBalanceBase, 6)} USDC to Arc...`);

  // Signal return on vault
  const signalTx = await arcWallet.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "signalReturn",
    account: account,
    chain: arcTestnet,
  });
  console.log(`   📡 Signaled return: ${signalTx}`);

  // Bridge via LI.FI
  const routeRequest: RoutesRequest = {
    fromChainId: 84532,
    toChainId: 5042002,
    fromTokenAddress: TOKENS.BASE_USDC,
    toTokenAddress: TOKENS.ARC_USDC,
    fromAmount: state.agentBalanceBase.toString(),
    fromAddress: account.address,
    toAddress: VAULT_ADDRESS, // Send directly to vault
    options: { slippage: 0.005 },
  };

  console.log(`   🔄 Getting LI.FI route...`);
  const result = await getRoutes(routeRequest);

  if (!result.routes?.length) {
    console.log(`   ⚠️ No LI.FI routes - will retry next iteration`);
    return;
  }

  console.log(`   ⏳ Executing bridge...`);
  await executeRoute(result.routes[0], {
    updateRouteHook: (updated) => {
      updated.steps.forEach((step, i) => {
        step.execution?.process.forEach((p) => {
          if (p.txHash) console.log(`      Step ${i + 1}: ${p.txHash}`);
        });
      });
    },
  });

  console.log(`   ✅ Bridge complete - funds returning to vault`);
}

async function executeConfirmReturn(arcWallet: WalletClient) {
  // Confirm with the current vault balance as returned amount
  const txHash = await arcWallet.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "confirmReturn",
    args: [state.vaultBalance],
    account: arcWallet.account!,
    chain: arcTestnet,
  });

  console.log(`   ✅ Return confirmed: ${txHash}`);
}

async function executeEmergency(reason: string, arcWallet: WalletClient, baseWallet: WalletClient) {
  console.log(`   🚨 EMERGENCY: ${reason}`);

  // Trigger circuit breaker
  const txHash = await arcWallet.writeContract({
    address: VAULT_ADDRESS,
    abi: VAULT_ABI,
    functionName: "triggerCircuitBreaker",
    args: [reason],
    account: arcWallet.account!,
    chain: arcTestnet,
  });

  console.log(`   🔒 Circuit breaker activated: ${txHash}`);
}

/*//////////////////////////////////////////////////////////////
                      HOOK MANAGEMENT
//////////////////////////////////////////////////////////////*/

async function updateHookFee(baseWallet: WalletClient) {
  const feeMap = {
    LOW: 200,      // 0.02%
    MEDIUM: 500,   // 0.05%
    HIGH: 1500,    // 0.15%
    EXTREME: 5000, // 0.5%
  };

  const newFee = feeMap[state.volatility];

  try {
    const txHash = await baseWallet.writeContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "updateDynamicFee",
      args: [newFee, `Volatility: ${state.volatility}`],
      account: baseWallet.account!,
      chain: baseSepolia,
    });

    console.log(`   🪝 Hook fee → ${newFee} bps: ${txHash}`);
  } catch (error) {
    // Fee update is optional, don't fail the iteration
  }
}

/*//////////////////////////////////////////////////////////////
                       UTILITIES
//////////////////////////////////////////////////////////////*/

function printStatus() {
  console.log(`\n┌─────────────────────────────────────┐`);
  console.log(`│ Vault State:    ${state.vaultState.padEnd(18)} │`);
  console.log(`│ Vault Balance:  $${formatUnits(state.vaultBalance, 6).padEnd(17)} │`);
  console.log(`│ Deployed:       $${formatUnits(state.deployedAmount, 6).padEnd(17)} │`);
  console.log(`│ Agent (Arc):    $${formatUnits(state.agentBalanceArc, 6).padEnd(17)} │`);
  console.log(`│ Agent (Base):   $${formatUnits(state.agentBalanceBase, 6).padEnd(17)} │`);
  console.log(`└─────────────────────────────────────┘`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Agent stopped.");
  process.exit(0);
});

// Run
main().catch(console.error);
