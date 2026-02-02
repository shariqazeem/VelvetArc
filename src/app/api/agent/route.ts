/**
 * Velvet Arc - Agent API Route
 *
 * This API route handles:
 * 1. GET - Returns current agent state (for frontend polling)
 * 2. POST - Triggers agent actions (start/stop/step)
 *
 * The agent:
 * - Fetches REAL market data from CoinGecko
 * - Reads REAL on-chain data from Arc vault and Base hook
 * - Executes REAL transactions to update hook fees
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, formatUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Arc Testnet chain definition
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 6, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
} as const;

// Contract addresses from env
const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB") as `0x${string}`;
const HOOK_ADDRESS = (process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2") as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

// ABIs
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
    name: "dynamicFee",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint24" }],
    stateMutability: "view",
  },
] as const;

const VAULT_ABI = [
  {
    name: "state",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint8" }],
    stateMutability: "view",
  },
  {
    name: "totalDeposits",
    type: "function",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
] as const;

// Agent state (in-memory, persists during server runtime)
interface AgentLog {
  timestamp: number;
  type: "info" | "decision" | "action" | "error" | "success";
  message: string;
}

interface AgentState {
  isRunning: boolean;
  lastUpdate: number;
  iteration: number;
  position: "ARC" | "BASE";

  // Market data (real from CoinGecko)
  ethPrice: number;
  priceChange24h: number;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  volatilityIndex: number;

  // On-chain data (real from contracts)
  vaultState: number;
  vaultBalance: string;
  hookFee: number;

  // Agent wallet
  agentAddress: string;
  agentBalance: string; // ETH on Base Sepolia

  // Agent decisions
  lastDecision: {
    action: string;
    reason: string;
    confidence: number;
    timestamp: number;
  } | null;

  // Activity log
  logs: AgentLog[];

  // Transactions executed
  transactions: {
    hash: string;
    type: string;
    timestamp: number;
  }[];
}

// Get agent address from private key
const AGENT_ADDRESS = PRIVATE_KEY
  ? privateKeyToAccount(PRIVATE_KEY).address
  : "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E";

// Global state (persists during Next.js server runtime)
let agentState: AgentState = {
  isRunning: false,
  lastUpdate: Date.now(),
  iteration: 0,
  position: "ARC",
  ethPrice: 0,
  priceChange24h: 0,
  volatility: "LOW",
  volatilityIndex: 0,
  vaultState: 0,
  vaultBalance: "0",
  hookFee: 3000,
  agentAddress: AGENT_ADDRESS,
  agentBalance: "0",
  lastDecision: null,
  logs: [],
  transactions: [],
};

// Add log entry
function addLog(type: AgentLog["type"], message: string) {
  agentState.logs.unshift({
    timestamp: Date.now(),
    type,
    message,
  });
  if (agentState.logs.length > 30) {
    agentState.logs = agentState.logs.slice(0, 30);
  }
}

// Fetch market data from CoinGecko
async function fetchMarketData() {
  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
      { cache: "no-store" }
    );
    const data = await response.json();

    const ethPrice = data.ethereum?.usd || 3000;
    const priceChange24h = data.ethereum?.usd_24h_change || 0;

    const absChange = Math.abs(priceChange24h);
    let volatility: AgentState["volatility"];
    let volatilityIndex: number;

    if (absChange < 2) {
      volatility = "LOW";
      volatilityIndex = absChange * 10;
    } else if (absChange < 5) {
      volatility = "MEDIUM";
      volatilityIndex = 20 + (absChange - 2) * 10;
    } else if (absChange < 10) {
      volatility = "HIGH";
      volatilityIndex = 50 + (absChange - 5) * 10;
    } else {
      volatility = "EXTREME";
      volatilityIndex = 100;
    }

    return { ethPrice, priceChange24h, volatility, volatilityIndex };
  } catch (e) {
    console.error("Market data fetch failed:", e);
    return { ethPrice: 3000, priceChange24h: 0, volatility: "MEDIUM" as const, volatilityIndex: 30 };
  }
}

// Fetch on-chain data from both chains
async function fetchOnChainData() {
  try {
    const arcClient = createPublicClient({
      chain: arcTestnet,
      transport: http(),
    });

    const baseClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const [vaultState, totalDeposits, hookFee] = await Promise.all([
      arcClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "state",
      }).catch(() => 0),
      arcClient.readContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "totalDeposits",
      }).catch(() => BigInt(0)),
      baseClient.readContract({
        address: HOOK_ADDRESS,
        abi: HOOK_ABI,
        functionName: "dynamicFee",
      }).catch(() => 3000),
    ]);

    return {
      vaultState: Number(vaultState),
      vaultBalance: formatUnits(totalDeposits as bigint, 6),
      hookFee: Number(hookFee),
    };
  } catch (e) {
    console.error("On-chain data fetch failed:", e);
    return { vaultState: 0, vaultBalance: "0", hookFee: 3000 };
  }
}

// Calculate dynamic fee based on volatility index (more granular)
function calculateDynamicFee(volatilityIndex: number): number {
  // Fee ranges from 100 (0.01%) to 5000 (0.5%) based on volatility
  // Using 100-unit increments for Uniswap V4 hook compatibility
  if (volatilityIndex < 10) return 100;
  if (volatilityIndex < 20) return 200;
  if (volatilityIndex < 30) return 300;
  if (volatilityIndex < 40) return 500;
  if (volatilityIndex < 50) return 800;
  if (volatilityIndex < 60) return 1000;
  if (volatilityIndex < 70) return 1500;
  if (volatilityIndex < 80) return 2000;
  if (volatilityIndex < 90) return 3000;
  return 5000;
}

// Make agent decision based on conditions
function makeDecision() {
  const { volatility, volatilityIndex, priceChange24h, position, vaultBalance, hookFee } = agentState;

  // Calculate precise fee based on volatility index
  const suggestedFee = calculateDynamicFee(volatilityIndex);

  if (volatility === "EXTREME") {
    return {
      action: "EMERGENCY",
      reason: `Extreme volatility (${volatilityIndex.toFixed(0)}). Maximum protection mode.`,
      confidence: 0.95,
      suggestedFee,
    };
  }

  if (volatility === "HIGH" && position === "BASE") {
    return {
      action: "WITHDRAW",
      reason: `High volatility (${Math.abs(priceChange24h).toFixed(1)}%). Returning to safe harbor.`,
      confidence: 0.85,
      suggestedFee,
    };
  }

  // Check if fee needs adjustment (with tolerance)
  const feeDiff = Math.abs(hookFee - suggestedFee);
  if (feeDiff >= 100) {
    const direction = suggestedFee > hookFee ? "Raising" : "Lowering";
    return {
      action: "ADJUST_FEE",
      reason: `${direction} fee: ${(hookFee/100).toFixed(2)}% → ${(suggestedFee/100).toFixed(2)}% (vol: ${volatilityIndex.toFixed(0)})`,
      confidence: 0.80 + (feeDiff / 5000) * 0.15, // Higher confidence for bigger changes
      suggestedFee,
    };
  }

  if (volatility === "LOW" && position === "ARC" && parseFloat(vaultBalance) > 0) {
    return {
      action: "DEPLOY",
      reason: `Low volatility (${volatilityIndex.toFixed(0)}). Optimal yield window.`,
      confidence: 0.88,
      suggestedFee,
    };
  }

  return {
    action: "MONITOR",
    reason: `ETH $${agentState.ethPrice.toFixed(0)} | ${priceChange24h >= 0 ? "+" : ""}${priceChange24h.toFixed(2)}% | Fee optimal at ${(hookFee/100).toFixed(2)}%`,
    confidence: 0.75,
    suggestedFee,
  };
}

// Check agent wallet balance on Base Sepolia
async function checkAgentBalance(): Promise<string> {
  if (!PRIVATE_KEY) return "0";

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);
    const baseClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const balance = await baseClient.getBalance({ address: account.address });
    return formatUnits(balance, 18);
  } catch {
    return "0";
  }
}

// Execute fee update transaction on Base
async function updateHookFee(newFee: number, reason: string): Promise<string | null> {
  if (!PRIVATE_KEY) {
    addLog("error", "No private key configured - cannot execute transactions");
    return null;
  }

  try {
    const account = privateKeyToAccount(PRIVATE_KEY);

    // Check balance first
    const baseClient = createPublicClient({
      chain: baseSepolia,
      transport: http(),
    });

    const balance = await baseClient.getBalance({ address: account.address });
    const balanceEth = parseFloat(formatUnits(balance, 18));

    if (balanceEth < 0.001) {
      addLog("error", `Insufficient gas: ${balanceEth.toFixed(6)} ETH on Base Sepolia`);
      addLog("info", `Fund ${account.address.slice(0, 10)}... with Base Sepolia ETH`);
      return null;
    }

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    addLog("action", `Sending tx to Base (${balanceEth.toFixed(4)} ETH available)...`);

    const hash = await walletClient.writeContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "updateDynamicFee",
      args: [newFee, reason],
    });

    agentState.transactions.unshift({
      hash,
      type: "FEE_UPDATE",
      timestamp: Date.now(),
    });

    if (agentState.transactions.length > 10) {
      agentState.transactions = agentState.transactions.slice(0, 10);
    }

    return hash;
  } catch (e) {
    console.error("Fee update failed:", e);
    const errorMsg = (e as Error).message || "";
    if (errorMsg.includes("insufficient funds")) {
      addLog("error", "Need Base Sepolia ETH for gas");
    } else {
      addLog("error", `TX failed: ${errorMsg.slice(0, 40)}`);
    }
    return null;
  }
}

// Run one agent iteration
async function runAgentStep() {
  agentState.iteration++;
  agentState.lastUpdate = Date.now();

  // 0. Check agent balance on first run
  if (agentState.iteration === 1) {
    const balance = await checkAgentBalance();
    agentState.agentBalance = balance;
    if (parseFloat(balance) < 0.001) {
      addLog("error", `Agent needs Base Sepolia ETH (current: ${parseFloat(balance).toFixed(4)})`);
    } else {
      addLog("info", `Agent wallet: ${parseFloat(balance).toFixed(4)} ETH on Base`);
    }
  }

  // 1. Fetch market data
  addLog("info", "Fetching CoinGecko data...");
  const market = await fetchMarketData();
  agentState.ethPrice = market.ethPrice;
  agentState.priceChange24h = market.priceChange24h;
  agentState.volatility = market.volatility;
  agentState.volatilityIndex = market.volatilityIndex;

  addLog("info", `ETH $${market.ethPrice.toFixed(0)} | ${market.priceChange24h >= 0 ? "+" : ""}${market.priceChange24h.toFixed(2)}% | ${market.volatility}`);

  // 2. Fetch on-chain data
  const onChain = await fetchOnChainData();
  agentState.vaultState = onChain.vaultState;
  agentState.vaultBalance = onChain.vaultBalance;
  agentState.hookFee = onChain.hookFee;

  addLog("info", `Vault: $${parseFloat(onChain.vaultBalance).toFixed(2)} | Hook: ${onChain.hookFee/100}%`);

  // 3. Make decision
  const decision = makeDecision();
  agentState.lastDecision = {
    action: decision.action,
    reason: decision.reason,
    confidence: decision.confidence,
    timestamp: Date.now(),
  };

  addLog("decision", `${decision.action}: ${decision.reason}`);

  // 4. Execute action if needed
  if (decision.action === "ADJUST_FEE" && decision.suggestedFee) {
    const txHash = await updateHookFee(decision.suggestedFee, `Volatility-based adjustment`);
    if (txHash) {
      agentState.hookFee = decision.suggestedFee;
      addLog("success", `Fee updated on Base! TX: ${txHash.slice(0, 16)}...`);
    }
  }

  // On first iteration, always try to set fee to sync with current market
  if (agentState.iteration === 1 && decision.suggestedFee && decision.action !== "ADJUST_FEE") {
    addLog("info", "First run - syncing hook fee with market conditions");
    const txHash = await updateHookFee(decision.suggestedFee, "Initial market sync");
    if (txHash) {
      agentState.hookFee = decision.suggestedFee;
      addLog("success", `Initial sync TX: ${txHash.slice(0, 16)}...`);
    }
  }
}

// GET - Return current agent state
export async function GET() {
  return NextResponse.json({
    success: true,
    state: agentState,
  });
}

// POST - Control agent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start":
        agentState.isRunning = true;
        addLog("success", "velvet-agent.eth activated");
        break;

      case "stop":
        agentState.isRunning = false;
        addLog("info", "Agent paused");
        break;

      case "step":
        if (agentState.isRunning) {
          await runAgentStep();
        }
        break;

      case "reset":
        agentState = {
          isRunning: false,
          lastUpdate: Date.now(),
          iteration: 0,
          position: "ARC",
          ethPrice: 0,
          priceChange24h: 0,
          volatility: "LOW",
          volatilityIndex: 0,
          vaultState: 0,
          vaultBalance: "0",
          hookFee: 3000,
          agentAddress: AGENT_ADDRESS,
          agentBalance: "0",
          lastDecision: null,
          logs: [],
          transactions: [],
        };
        break;

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: agentState });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
