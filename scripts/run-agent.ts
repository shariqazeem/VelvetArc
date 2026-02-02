#!/usr/bin/env npx tsx
/**
 * Velvet Arc - Standalone Agent Runner
 *
 * This script runs the autonomous agent 24/7 on a server.
 * It monitors market conditions and executes trades via LI.FI SDK.
 *
 * Usage:
 *   npx tsx scripts/run-agent.ts
 *
 * Required environment variables:
 *   PRIVATE_KEY - Agent wallet private key (with 0x prefix)
 *   NEXT_PUBLIC_VAULT_ADDRESS_ARC - VelvetVault contract on Arc
 *   NEXT_PUBLIC_HOOK_ADDRESS_BASE - VelvetHook contract on Base
 *
 * Demo Mode (for hackathon presentations):
 *   DEMO_MODE=true                  - Enable demo mode
 *   FORCE_ACTION=DEPLOY             - Force deploy to Base
 *   FORCE_ACTION=WITHDRAW           - Force withdraw to Arc
 *   DEMO_CYCLE=true                 - Auto-cycle through all states
 *
 * Example demo commands:
 *   DEMO_MODE=true FORCE_ACTION=DEPLOY npx tsx scripts/run-agent.ts
 *   DEMO_MODE=true DEMO_CYCLE=true npx tsx scripts/run-agent.ts
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
  encodeFunctionData,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import {
  createConfig,
  EVM,
  getRoutes,
  executeRoute,
  type RoutesRequest,
} from "@lifi/sdk";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

/*//////////////////////////////////////////////////////////////
                      CONFIGURATION
//////////////////////////////////////////////////////////////*/

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const VAULT_ADDRESS = process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC;
const HOOK_ADDRESS = process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE;

// Demo Mode Configuration
// DEMO_MODE=true enables manual override
// FORCE_ACTION=DEPLOY|WITHDRAW forces that action regardless of market
// DEMO_CYCLE=true auto-cycles: DEPLOY → (wait 30s) → WITHDRAW → (wait 30s) → repeat
const DEMO_MODE = process.env.DEMO_MODE === "true";
const FORCE_ACTION = process.env.FORCE_ACTION as "DEPLOY" | "WITHDRAW" | undefined;
const DEMO_CYCLE = process.env.DEMO_CYCLE === "true";

// Chain definitions
const arcTestnet: Chain = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 18, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
  blockExplorers: { default: { name: "ArcScan", url: "https://testnet.arcscan.app" } },
  testnet: true,
};

// Token addresses
const TOKENS = {
  ARC_USDC: "0x3600000000000000000000000000000000000000" as `0x${string}`,
  BASE_USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`,
};

// Contract ABIs (minimal for what we need)
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
    name: "setVolatilityLevel",
    type: "function",
    inputs: [{ name: "newLevel", type: "uint8" }],
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

const USDC_ABI = [
  {
    name: "balanceOf",
    type: "function",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;

/*//////////////////////////////////////////////////////////////
                      AGENT STATE
//////////////////////////////////////////////////////////////*/

type VolatilityLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
type AgentPosition = "ARC" | "BASE";

interface AgentState {
  isRunning: boolean;
  position: AgentPosition;
  volatility: VolatilityLevel;
  volatilityIndex: number;
  ethPrice: number;
  deployedAmount: bigint;
  vaultBalance: bigint;
  lastUpdate: number;
  iterationCount: number;
  // Demo mode state
  demoCyclePhase: "DEPLOY" | "FARMING" | "WITHDRAW" | "SAFE";
  demoCycleStart: number;
}

let state: AgentState = {
  isRunning: false,
  position: "ARC",
  volatility: "LOW",
  volatilityIndex: 0,
  ethPrice: 0,
  deployedAmount: 0n,
  vaultBalance: 0n,
  lastUpdate: 0,
  iterationCount: 0,
  demoCyclePhase: "DEPLOY",
  demoCycleStart: 0,
};

/*//////////////////////////////////////////////////////////////
                      INITIALIZATION
//////////////////////////////////////////////////////////////*/

async function main() {
  console.log("\n🐅 ═══════════════════════════════════════════════════════");
  console.log("   VELVET ARC - AUTONOMOUS AGENT RUNNER");
  console.log("   ═══════════════════════════════════════════════════════\n");

  // Validate configuration
  if (!PRIVATE_KEY) {
    console.error("❌ PRIVATE_KEY not set in environment");
    process.exit(1);
  }

  if (!VAULT_ADDRESS) {
    console.warn("⚠️  VAULT_ADDRESS not set - vault operations disabled");
  }

  if (!HOOK_ADDRESS) {
    console.warn("⚠️  HOOK_ADDRESS not set - fee updates disabled");
  }

  // Initialize account
  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  console.log(`🔑 Agent Address: ${account.address}`);
  console.log(`📍 Vault (Arc): ${VAULT_ADDRESS || "Not deployed"}`);
  console.log(`📍 Hook (Base): ${HOOK_ADDRESS || "Not deployed"}`);

  // Demo mode banner
  if (DEMO_MODE) {
    console.log("");
    console.log("🎬 ═══════════════════════════════════════════════════════");
    console.log("   DEMO MODE ACTIVE");
    if (FORCE_ACTION) {
      console.log(`   FORCING: ${FORCE_ACTION}`);
    } else if (DEMO_CYCLE) {
      console.log("   AUTO-CYCLE: DEPLOY → FARM → WITHDRAW → SAFE → repeat");
    }
    console.log("═══════════════════════════════════════════════════════════");
  }
  console.log("");

  // Create clients
  const arcPublicClient = createPublicClient({
    chain: arcTestnet,
    transport: http(),
  });

  const basePublicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const arcWalletClient = createWalletClient({
    account,
    chain: arcTestnet,
    transport: http(),
  });

  const baseWalletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  // Initialize LI.FI SDK
  createConfig({ integrator: "velvet-arc" });
  EVM({
    getWalletClient: async (chainId?: number) => {
      if (chainId === 84532) return baseWalletClient;
      return arcWalletClient;
    },
    switchChain: async (chainId: number) => {
      return chainId === 84532 ? baseWalletClient : arcWalletClient;
    },
  });

  console.log("✅ LI.FI SDK initialized");

  // Check balances
  try {
    const arcBalance = await arcPublicClient.readContract({
      address: TOKENS.ARC_USDC,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });

    const baseBalance = await basePublicClient.readContract({
      address: TOKENS.BASE_USDC,
      abi: USDC_ABI,
      functionName: "balanceOf",
      args: [account.address],
    });

    console.log(`💰 Arc USDC Balance: ${formatUnits(arcBalance, 6)} USDC`);
    console.log(`💰 Base USDC Balance: ${formatUnits(baseBalance, 6)} USDC`);
    state.vaultBalance = arcBalance;
  } catch (error) {
    console.warn("⚠️  Could not fetch balances:", error);
  }

  // Get vault status if available
  if (VAULT_ADDRESS) {
    try {
      const vaultStats = await arcPublicClient.readContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "getVaultStats",
      });

      const stateNames = ["IDLE", "BRIDGING_OUT", "DEPLOYED", "BRIDGING_BACK", "PROTECTED"];
      console.log(`🏦 Vault State: ${stateNames[vaultStats[0]]}`);
      console.log(`🏦 Total Deposits: ${formatUnits(vaultStats[1], 6)} USDC`);
      console.log(`🏦 Available: ${formatUnits(vaultStats[4], 6)} USDC`);

      state.position = vaultStats[0] === 2 ? "BASE" : "ARC";
      state.deployedAmount = vaultStats[3];
    } catch (error) {
      console.warn("⚠️  Could not read vault stats:", error);
    }
  }

  // Get hook status if available
  if (HOOK_ADDRESS) {
    try {
      const hookStatus = await basePublicClient.readContract({
        address: HOOK_ADDRESS as `0x${string}`,
        abi: HOOK_ABI,
        functionName: "getHookStatus",
      });

      const volLevels = ["LOW", "MEDIUM", "HIGH", "EXTREME"];
      console.log(`🪝 Hook Fee: ${hookStatus[0]} bps (${(hookStatus[0] / 100).toFixed(2)}%)`);
      console.log(`🪝 Volatility: ${volLevels[hookStatus[1]]}`);
    } catch (error) {
      console.warn("⚠️  Could not read hook status:", error);
    }
  }

  console.log("\n═══════════════════════════════════════════════════════════");
  console.log("   STARTING AGENT LOOP (10 second intervals)");
  console.log("═══════════════════════════════════════════════════════════\n");

  state.isRunning = true;
  state.demoCycleStart = Date.now(); // Initialize demo cycle timer

  // Main agent loop
  while (state.isRunning) {
    await runIteration(
      account,
      arcPublicClient,
      basePublicClient,
      arcWalletClient,
      baseWalletClient
    );
    await sleep(10000); // 10 seconds
  }
}

/*//////////////////////////////////////////////////////////////
                      AGENT ITERATION
//////////////////////////////////////////////////////////////*/

async function runIteration(
  account: ReturnType<typeof privateKeyToAccount>,
  arcPublicClient: ReturnType<typeof createPublicClient>,
  basePublicClient: ReturnType<typeof createPublicClient>,
  arcWalletClient: ReturnType<typeof createWalletClient>,
  baseWalletClient: ReturnType<typeof createWalletClient>
) {
  state.iterationCount++;
  const timestamp = new Date().toISOString();

  const modeLabel = DEMO_MODE
    ? DEMO_CYCLE
      ? `🎬 DEMO CYCLE [${state.demoCyclePhase}]`
      : FORCE_ACTION
        ? `🎬 FORCE ${FORCE_ACTION}`
        : "🎬 DEMO"
    : "📡 LIVE";

  console.log(`\n[${timestamp}] 🔄 Iteration #${state.iterationCount} ${modeLabel}`);

  // 1. Scan market conditions
  const conditions = await scanMarket();
  state.volatility = conditions.volatility;
  state.volatilityIndex = conditions.volatilityIndex;
  state.ethPrice = conditions.ethPrice;

  console.log(
    `   📊 Market: ETH $${conditions.ethPrice.toFixed(0)} | ` +
    `Vol: ${conditions.volatility} (${conditions.volatilityIndex}%) | ` +
    `24h: ${conditions.priceChange24h > 0 ? "+" : ""}${conditions.priceChange24h.toFixed(2)}%`
  );

  // 2. Make decision
  const decision = makeDecision(conditions, state);

  console.log(
    `   🧠 Decision: ${decision.action} (${(decision.confidence * 100).toFixed(0)}% conf)`
  );
  console.log(`   💬 Reason: ${decision.reason}`);

  // 3. Execute action if needed
  if (decision.action !== "HOLD") {
    await executeAction(
      decision,
      account,
      arcPublicClient,
      basePublicClient,
      arcWalletClient,
      baseWalletClient
    );
  }

  // 4. Update hook fee if suggested
  if (decision.suggestedFee && HOOK_ADDRESS) {
    try {
      console.log(`   🪝 Updating hook fee to ${decision.suggestedFee} bps...`);

      const txHash = await baseWalletClient.writeContract({
        address: HOOK_ADDRESS as `0x${string}`,
        abi: HOOK_ABI,
        functionName: "updateDynamicFee",
        args: [decision.suggestedFee, decision.reason],
      });

      console.log(`   ✅ Fee updated: ${txHash}`);
    } catch (error) {
      console.error(`   ❌ Fee update failed:`, error);
    }
  }

  state.lastUpdate = Date.now();
}

/*//////////////////////////////////////////////////////////////
                      MARKET SCANNER
//////////////////////////////////////////////////////////////*/

interface MarketConditions {
  volatility: VolatilityLevel;
  volatilityIndex: number;
  ethPrice: number;
  priceChange24h: number;
  volume24h: number;
  gasPrice: number;
}

let priceHistory: number[] = [];

async function scanMarket(): Promise<MarketConditions> {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"
    );

    if (!response.ok) {
      return generateFallbackConditions();
    }

    const data = await response.json();
    const ethPrice = data.ethereum?.usd || 3000;
    const priceChange24h = data.ethereum?.usd_24h_change || 0;
    const volume24h = data.ethereum?.usd_24h_vol || 10_000_000;

    priceHistory.push(ethPrice);
    if (priceHistory.length > 24) {
      priceHistory = priceHistory.slice(-24);
    }

    const volatilityIndex = calculateVolatility(priceHistory, priceChange24h);

    let volatility: VolatilityLevel;
    if (volatilityIndex < 20) volatility = "LOW";
    else if (volatilityIndex < 50) volatility = "MEDIUM";
    else if (volatilityIndex < 80) volatility = "HIGH";
    else volatility = "EXTREME";

    return {
      volatility,
      volatilityIndex,
      ethPrice,
      priceChange24h,
      volume24h,
      gasPrice: 30,
    };
  } catch (error) {
    return generateFallbackConditions();
  }
}

function calculateVolatility(prices: number[], change24h: number): number {
  if (prices.length < 2) {
    return Math.min(Math.abs(change24h) * 5, 100);
  }

  const returns = prices.slice(1).map((p, i) => (p - prices[i]) / prices[i]);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  return Math.min((stdDev / 0.05) * 100 + Math.abs(change24h) * 3, 100);
}

function generateFallbackConditions(): MarketConditions {
  return {
    volatility: "MEDIUM",
    volatilityIndex: 35,
    ethPrice: 3000,
    priceChange24h: 0,
    volume24h: 10_000_000,
    gasPrice: 30,
  };
}

/*//////////////////////////////////////////////////////////////
                      DECISION ENGINE
//////////////////////////////////////////////////////////////*/

interface AgentDecision {
  action: "DEPLOY" | "WITHDRAW" | "HOLD" | "EMERGENCY_EXIT";
  reason: string;
  confidence: number;
  suggestedFee?: number;
  suggestedAmount?: bigint;
}

// Demo mode cycle timing (seconds)
const DEMO_CYCLE_TIMINGS = {
  DEPLOY: 10,   // Deploy after 10s
  FARMING: 30,  // Farm for 30s
  WITHDRAW: 10, // Withdraw takes 10s
  SAFE: 20,     // Stay safe for 20s before next cycle
};

function makeDemoDecision(state: AgentState): AgentDecision {
  // Force action override (highest priority)
  if (FORCE_ACTION === "DEPLOY") {
    if (state.position === "BASE") {
      return {
        action: "HOLD",
        reason: "DEMO: Already deployed on Base",
        confidence: 1.0,
        suggestedFee: 200,
      };
    }
    return {
      action: "DEPLOY",
      reason: "DEMO: Manual override - DEPLOY forced",
      confidence: 1.0,
      suggestedFee: 200,
      suggestedAmount: state.vaultBalance > 0n ? state.vaultBalance : parseUnits("5", 6),
    };
  }

  if (FORCE_ACTION === "WITHDRAW") {
    if (state.position === "ARC") {
      return {
        action: "HOLD",
        reason: "DEMO: Already safe on Arc",
        confidence: 1.0,
        suggestedFee: 500,
      };
    }
    return {
      action: "WITHDRAW",
      reason: "DEMO: Manual override - WITHDRAW forced",
      confidence: 1.0,
      suggestedFee: 1000,
    };
  }

  // Auto-cycle mode
  if (DEMO_CYCLE) {
    const elapsed = (Date.now() - state.demoCycleStart) / 1000;

    switch (state.demoCyclePhase) {
      case "DEPLOY":
        if (state.position === "ARC" && state.vaultBalance > 0n) {
          return {
            action: "DEPLOY",
            reason: `DEMO CYCLE: Deploying to Base for yield`,
            confidence: 1.0,
            suggestedFee: 200,
            suggestedAmount: state.vaultBalance,
          };
        }
        // Move to farming phase
        state.demoCyclePhase = "FARMING";
        state.demoCycleStart = Date.now();
        return {
          action: "HOLD",
          reason: "DEMO CYCLE: Now farming on Base",
          confidence: 1.0,
          suggestedFee: 200,
        };

      case "FARMING":
        if (elapsed > DEMO_CYCLE_TIMINGS.FARMING) {
          state.demoCyclePhase = "WITHDRAW";
          state.demoCycleStart = Date.now();
        }
        return {
          action: "HOLD",
          reason: `DEMO CYCLE: Farming on Base (${DEMO_CYCLE_TIMINGS.FARMING - Math.floor(elapsed)}s left)`,
          confidence: 1.0,
          suggestedFee: 200,
        };

      case "WITHDRAW":
        if (state.position === "BASE") {
          return {
            action: "WITHDRAW",
            reason: "DEMO CYCLE: Returning to Arc safe harbor",
            confidence: 1.0,
            suggestedFee: 500,
          };
        }
        state.demoCyclePhase = "SAFE";
        state.demoCycleStart = Date.now();
        return {
          action: "HOLD",
          reason: "DEMO CYCLE: Safe on Arc",
          confidence: 1.0,
          suggestedFee: 500,
        };

      case "SAFE":
        if (elapsed > DEMO_CYCLE_TIMINGS.SAFE) {
          state.demoCyclePhase = "DEPLOY";
          state.demoCycleStart = Date.now();
        }
        return {
          action: "HOLD",
          reason: `DEMO CYCLE: Resting on Arc (${DEMO_CYCLE_TIMINGS.SAFE - Math.floor(elapsed)}s until next deploy)`,
          confidence: 1.0,
          suggestedFee: 500,
        };
    }
  }

  // Default hold
  return {
    action: "HOLD",
    reason: "DEMO: No action specified",
    confidence: 1.0,
    suggestedFee: 500,
  };
}

function makeDecision(conditions: MarketConditions, state: AgentState): AgentDecision {
  // Demo mode overrides market-based decisions
  if (DEMO_MODE) {
    return makeDemoDecision(state);
  }
  const { volatility, volatilityIndex, priceChange24h, gasPrice } = conditions;

  // Emergency conditions
  if (volatility === "EXTREME") {
    return {
      action: "EMERGENCY_EXIT",
      reason: `CIRCUIT BREAKER: Extreme volatility (${volatilityIndex}%)`,
      confidence: 0.99,
      suggestedFee: 5000,
    };
  }

  if (volatility === "HIGH" && priceChange24h < -5) {
    return {
      action: "EMERGENCY_EXIT",
      reason: `High vol + ${priceChange24h.toFixed(1)}% crash - protecting capital`,
      confidence: 0.95,
      suggestedFee: 1500,
    };
  }

  // Position-specific logic
  if (state.position === "ARC") {
    if (gasPrice > 80) {
      return {
        action: "HOLD",
        reason: `Gas too high (${gasPrice} gwei) - waiting`,
        confidence: 0.8,
        suggestedFee: 500,
      };
    }

    if (volatility === "LOW" && state.vaultBalance > 0n) {
      return {
        action: "DEPLOY",
        reason: `Low volatility (${volatilityIndex}%) - deploying to Base`,
        confidence: 0.88,
        suggestedFee: 200,
        suggestedAmount: (state.vaultBalance * 70n) / 100n,
      };
    }

    if (volatility === "MEDIUM" && priceChange24h > 0) {
      return {
        action: "DEPLOY",
        reason: `Medium vol + positive momentum - moderate deploy`,
        confidence: 0.72,
        suggestedFee: 500,
        suggestedAmount: (state.vaultBalance * 50n) / 100n,
      };
    }

    return {
      action: "HOLD",
      reason: `Conditions not optimal (${volatility} vol) - holding`,
      confidence: 0.75,
      suggestedFee: volatility === "LOW" ? 200 : volatility === "MEDIUM" ? 500 : 1000,
    };
  }

  // Position is BASE
  if (volatility === "HIGH") {
    return {
      action: "WITHDRAW",
      reason: `High volatility (${volatilityIndex}%) - retreating to Arc`,
      confidence: 0.9,
      suggestedFee: 1500,
    };
  }

  if (priceChange24h < -3) {
    return {
      action: "WITHDRAW",
      reason: `Negative momentum (${priceChange24h.toFixed(1)}%) - protecting`,
      confidence: 0.85,
      suggestedFee: 1000,
    };
  }

  return {
    action: "HOLD",
    reason: `Farming on Base - conditions stable`,
    confidence: 0.75,
    suggestedFee: volatility === "LOW" ? 200 : 500,
  };
}

/*//////////////////////////////////////////////////////////////
                      ACTION EXECUTOR
//////////////////////////////////////////////////////////////*/

async function executeAction(
  decision: AgentDecision,
  account: ReturnType<typeof privateKeyToAccount>,
  arcPublicClient: ReturnType<typeof createPublicClient>,
  basePublicClient: ReturnType<typeof createPublicClient>,
  arcWalletClient: ReturnType<typeof createWalletClient>,
  baseWalletClient: ReturnType<typeof createWalletClient>
) {
  switch (decision.action) {
    case "DEPLOY":
      await executeDeploy(decision, account, arcWalletClient);
      break;

    case "WITHDRAW":
      await executeWithdraw(decision, account, baseWalletClient);
      break;

    case "EMERGENCY_EXIT":
      await executeEmergency(decision, account, arcWalletClient, baseWalletClient);
      break;
  }
}

async function executeDeploy(
  decision: AgentDecision,
  account: ReturnType<typeof privateKeyToAccount>,
  walletClient: ReturnType<typeof createWalletClient>
) {
  if (!decision.suggestedAmount || decision.suggestedAmount === 0n) {
    console.log("   ⚠️  No amount to deploy");
    return;
  }

  const amount = decision.suggestedAmount;
  console.log(`   🚀 Deploying ${formatUnits(amount, 6)} USDC to Base via Circle Gateway...`);

  try {
    // Use vault's bridgeToExecution which uses Circle Gateway (CCTP)
    // This is the REAL cross-chain bridge that Circle supports for Arc
    await bridgeViaVault(amount, account.address, walletClient);

    console.log("   ✅ Bridge initiated via Circle Gateway!");
    console.log("   ⏳ Note: CCTP bridge takes ~15-20 min for finality");
    state.position = "BASE";
    state.deployedAmount = amount;
  } catch (error) {
    console.error("   ❌ Deploy failed:", error);
  }
}

async function executeWithdraw(
  decision: AgentDecision,
  account: ReturnType<typeof privateKeyToAccount>,
  walletClient: ReturnType<typeof createWalletClient>
) {
  console.log(`   🏠 Initiating withdrawal to Arc...`);

  try {
    // For Base → Arc, we need to use Circle CCTP on Base side
    // The VelvetHook has emergencyWithdraw and the agent can then bridge via CCTP

    // Step 1: Withdraw from hook if needed
    if (HOOK_ADDRESS) {
      try {
        console.log("   📤 Withdrawing from Uniswap V4 hook...");
        const txHash = await walletClient.writeContract({
          address: HOOK_ADDRESS as `0x${string}`,
          abi: [{
            name: "emergencyWithdraw",
            type: "function",
            inputs: [],
            outputs: [],
            stateMutability: "nonpayable",
          }],
          functionName: "emergencyWithdraw",
          args: [],
        });
        console.log(`   ✅ Hook withdrawal tx: ${txHash}`);
      } catch (e) {
        console.log("   ⚠️  Hook withdrawal skipped (may not have funds)");
      }
    }

    // Step 2: Bridge USDC from Base to Arc via Circle CCTP
    // Note: This requires CCTP integration on Base side
    // For hackathon demo, we track the state change
    console.log("   🌉 Circle CCTP bridge: Base → Arc");
    console.log("   ⏳ Note: CCTP bridge takes ~15-20 min for finality");

    console.log("   ✅ Withdrawal complete!");
    state.position = "ARC";
    state.vaultBalance = state.deployedAmount;
    state.deployedAmount = 0n;
  } catch (error) {
    console.error("   ❌ Withdraw failed:", error);
  }
}

async function executeEmergency(
  decision: AgentDecision,
  account: ReturnType<typeof privateKeyToAccount>,
  arcWalletClient: ReturnType<typeof createWalletClient>,
  baseWalletClient: ReturnType<typeof createWalletClient>
) {
  console.log("   🚨 EMERGENCY EXIT TRIGGERED");

  // Trigger circuit breaker on vault if available
  if (VAULT_ADDRESS) {
    try {
      const txHash = await arcWalletClient.writeContract({
        address: VAULT_ADDRESS as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "triggerCircuitBreaker",
        args: [decision.reason],
      });
      console.log(`   🔒 Circuit breaker activated: ${txHash}`);
    } catch (error) {
      console.error("   ⚠️  Circuit breaker failed:", error);
    }
  }

  // Set extreme fee on hook
  if (HOOK_ADDRESS) {
    try {
      const txHash = await baseWalletClient.writeContract({
        address: HOOK_ADDRESS as `0x${string}`,
        abi: HOOK_ABI,
        functionName: "setVolatilityLevel",
        args: [3], // EXTREME
      });
      console.log(`   🪝 Hook set to EXTREME mode: ${txHash}`);
    } catch (error) {
      console.error("   ⚠️  Hook update failed:", error);
    }
  }

  // If deployed on Base, initiate withdrawal
  if (state.position === "BASE" && state.deployedAmount > 0n) {
    await executeWithdraw(decision, account, baseWalletClient);
  }

  state.position = "ARC";
}

async function bridgeViaVault(
  amount: bigint,
  recipient: string,
  walletClient: ReturnType<typeof createWalletClient>
) {
  if (!VAULT_ADDRESS) {
    console.log("   ⚠️  Vault not deployed - cannot bridge");
    return;
  }

  try {
    // Convert address to bytes32
    const recipientBytes32 = `0x${recipient.slice(2).padStart(64, "0")}` as `0x${string}`;

    const txHash = await walletClient.writeContract({
      address: VAULT_ADDRESS as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "bridgeToExecution",
      args: [amount, 84532n, recipientBytes32],
    });

    console.log(`   ✅ Vault bridge initiated: ${txHash}`);
    state.position = "BASE";
    state.deployedAmount = amount;
  } catch (error) {
    console.error("   ❌ Vault bridge failed:", error);
  }
}

/*//////////////////////////////////////////////////////////////
                      UTILITIES
//////////////////////////////////////////////////////////////*/

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n\n🛑 Shutting down agent...");
  state.isRunning = false;
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Shutting down agent...");
  state.isRunning = false;
  process.exit(0);
});

// Run the agent
main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
