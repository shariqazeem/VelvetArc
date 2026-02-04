/**
 * Velvet Arc - Agent API Route
 *
 * The Sovereign Liquidity Agent (velvet-agent.eth) that:
 * - Monitors real ETH price and volatility from CoinGecko
 * - Reads on-chain state from Arc vault and Base hook
 * - Executes real transactions to update hook fees based on volatility
 * - Manages capital flow between Arc (safe harbor) and Base (yield zone)
 */

import { NextRequest, NextResponse } from "next/server";
import { createPublicClient, createWalletClient, http, formatUnits, parseUnits } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Chain definitions
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 6, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
} as const;

// Contract addresses
const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB") as `0x${string}`;
const HOOK_ADDRESS = (process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2") as `0x${string}`;
const BASE_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e" as `0x${string}`;
const ARC_USDC = "0x3600000000000000000000000000000000000000" as `0x${string}`;
const PRIVATE_KEY = process.env.PRIVATE_KEY as `0x${string}` | undefined;

// ABIs
const HOOK_ABI = [
  { name: "updateDynamicFee", type: "function", inputs: [{ name: "newFee", type: "uint24" }, { name: "reason", type: "string" }], outputs: [], stateMutability: "nonpayable" },
  { name: "dynamicFee", type: "function", inputs: [], outputs: [{ name: "", type: "uint24" }], stateMutability: "view" },
  { name: "totalLiquidity", type: "function", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { name: "depositLiquidity", type: "function", inputs: [{ name: "amount", type: "uint256" }], outputs: [], stateMutability: "nonpayable" },
  { name: "volatilityLevel", type: "function", inputs: [], outputs: [{ name: "", type: "uint8" }], stateMutability: "view" },
] as const;

const VAULT_ABI = [
  { name: "state", type: "function", inputs: [], outputs: [{ name: "", type: "uint8" }], stateMutability: "view" },
  { name: "totalDeposits", type: "function", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { name: "totalShares", type: "function", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { name: "deployedCapital", type: "function", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { name: "totalYieldEarned", type: "function", inputs: [], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
] as const;

const ERC20_ABI = [
  { name: "balanceOf", type: "function", inputs: [{ name: "account", type: "address" }], outputs: [{ name: "", type: "uint256" }], stateMutability: "view" },
  { name: "approve", type: "function", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
  { name: "transfer", type: "function", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ name: "", type: "bool" }], stateMutability: "nonpayable" },
] as const;

// Agent state interface
interface AgentLog {
  timestamp: number;
  type: "info" | "decision" | "action" | "error" | "success";
  message: string;
}

interface AgentTransaction {
  hash: string;
  type: "FEE_UPDATE" | "LIQUIDITY_DEPLOY" | "BRIDGE" | "VOLATILITY_UPDATE";
  timestamp: number;
}

interface AgentState {
  isRunning: boolean;
  lastUpdate: number;
  iteration: number;

  // Agent identity
  agentAddress: string;
  agentEthBalance: string;
  agentUsdcBalance: string;
  agentArcUsdcBalance: string;

  // Market data (CoinGecko)
  ethPrice: number;
  priceChange24h: number;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  volatilityIndex: number;

  // Arc Vault state (VaultState enum: 0=IDLE, 1=BRIDGING_OUT, 2=DEPLOYED, 3=BRIDGING_BACK, 4=PROTECTED)
  vaultState: number;
  vaultTotalDeposits: string;
  vaultTotalShares: string;
  vaultDeployedCapital: string;
  vaultYieldEarned: string;
  vaultAvailableBalance: string;

  // Base Hook state
  hookFee: number;
  hookLiquidity: string;
  hookVolatilityLevel: number;

  // Capital location state
  capitalState: "PROTECTED" | "EARNING" | "CIRCUIT_BREAKER";

  // Agent decisions
  lastDecision: {
    action: string;
    reason: string;
    confidence: number;
    timestamp: number;
  } | null;

  // Activity
  logs: AgentLog[];
  transactions: AgentTransaction[];
}

// Get agent address from private key
const AGENT_ADDRESS = PRIVATE_KEY
  ? privateKeyToAccount(PRIVATE_KEY).address
  : "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E";

// Create public clients
const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Global state
let agentState: AgentState = {
  isRunning: false,
  lastUpdate: Date.now(),
  iteration: 0,
  agentAddress: AGENT_ADDRESS,
  agentEthBalance: "0",
  agentUsdcBalance: "0",
  agentArcUsdcBalance: "0",
  ethPrice: 0,
  priceChange24h: 0,
  volatility: "LOW",
  volatilityIndex: 0,
  vaultState: 0,
  vaultTotalDeposits: "0",
  vaultTotalShares: "0",
  vaultDeployedCapital: "0",
  vaultYieldEarned: "0",
  vaultAvailableBalance: "0",
  hookFee: 3000,
  hookLiquidity: "0",
  hookVolatilityLevel: 0,
  capitalState: "PROTECTED",
  lastDecision: null,
  logs: [],
  transactions: [],
};

// Transaction lock to prevent concurrent transactions causing nonce issues
let txPending = false;
let lastTxTime = 0;
const TX_COOLDOWN = 10000; // 10 seconds between transactions

// Step lock to prevent concurrent agent iterations
let stepRunning = false;

// CoinGecko cache to avoid 429 rate limiting
let cachedMarketData: {
  ethPrice: number;
  priceChange24h: number;
  volatility: AgentState["volatility"];
  volatilityIndex: number;
  timestamp: number;
} | null = null;
const MARKET_CACHE_TTL = 30000; // Cache for 30 seconds

// Utility functions
function addLog(type: AgentLog["type"], message: string) {
  agentState.logs.unshift({ timestamp: Date.now(), type, message });
  if (agentState.logs.length > 50) agentState.logs = agentState.logs.slice(0, 50);
}

function addTransaction(hash: string, type: AgentTransaction["type"]) {
  agentState.transactions.unshift({ hash, type, timestamp: Date.now() });
  if (agentState.transactions.length > 20) agentState.transactions = agentState.transactions.slice(0, 20);
}

// Fetch market data from CoinGecko (with caching)
async function fetchMarketData(): Promise<{
  ethPrice: number;
  priceChange24h: number;
  volatility: AgentState["volatility"];
  volatilityIndex: number;
}> {
  // Return cached data if fresh
  const now = Date.now();
  if (cachedMarketData && now - cachedMarketData.timestamp < MARKET_CACHE_TTL) {
    return {
      ethPrice: cachedMarketData.ethPrice,
      priceChange24h: cachedMarketData.priceChange24h,
      volatility: cachedMarketData.volatility,
      volatilityIndex: cachedMarketData.volatilityIndex,
    };
  }

  try {
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true",
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();

    const ethPrice = data.ethereum?.usd || 3000;
    const priceChange24h = data.ethereum?.usd_24h_change || 0;
    const absChange = Math.abs(priceChange24h);

    // Volatility calculation per requirements:
    // LOW if < 3%, MEDIUM if < 7%, HIGH if >= 7%
    // volatilityIndex = Math.abs(priceChange24h) * 10
    let volatility: AgentState["volatility"];

    if (absChange >= 10) {
      volatility = "EXTREME";
    } else if (absChange >= 7) {
      volatility = "HIGH";
    } else if (absChange >= 3) {
      volatility = "MEDIUM";
    } else {
      volatility = "LOW";
    }

    const volatilityIndex = absChange * 10;

    // Cache the result
    cachedMarketData = { ethPrice, priceChange24h, volatility, volatilityIndex, timestamp: now };

    return { ethPrice, priceChange24h, volatility, volatilityIndex };
  } catch (e) {
    console.error("Market data fetch failed:", e);
    addLog("error", `Market data fetch failed: ${(e as Error).message?.slice(0, 40)}`);
    // Return cached data if available, otherwise defaults
    if (cachedMarketData) {
      return {
        ethPrice: cachedMarketData.ethPrice,
        priceChange24h: cachedMarketData.priceChange24h,
        volatility: cachedMarketData.volatility,
        volatilityIndex: cachedMarketData.volatilityIndex,
      };
    }
    return { ethPrice: 3000, priceChange24h: 0, volatility: "MEDIUM", volatilityIndex: 30 };
  }
}

// Read real on-chain data from Arc and Base
async function fetchOnChainData() {
  try {
    // Read hook dynamicFee from Base
    const hookFee = await baseClient.readContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "dynamicFee",
    }).catch(() => 3000);

    // Read hook totalLiquidity from Base
    const hookLiquidity = await baseClient.readContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "totalLiquidity",
    }).catch(() => BigInt(0));

    // Read hook volatilityLevel from Base
    const hookVolLevel = await baseClient.readContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "volatilityLevel",
    }).catch(() => 0);

    // Read agent USDC balance on Base
    const agentUsdcBase = await baseClient.readContract({
      address: BASE_USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [AGENT_ADDRESS as `0x${string}`],
    }).catch(() => BigInt(0));

    // Read agent ETH balance on Base (for gas)
    const agentEthBase = await baseClient.getBalance({
      address: AGENT_ADDRESS as `0x${string}`,
    }).catch(() => BigInt(0));

    // Read agent USDC balance on Arc
    const agentUsdcArc = await arcClient.readContract({
      address: ARC_USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [AGENT_ADDRESS as `0x${string}`],
    }).catch(() => BigInt(0));

    // Read vault USDC balance on Arc (available balance)
    const vaultUsdcBalance = await arcClient.readContract({
      address: ARC_USDC,
      abi: ERC20_ABI,
      functionName: "balanceOf",
      args: [VAULT_ADDRESS],
    }).catch(() => BigInt(0));

    // Read vault state from Arc
    const [vaultState, totalDeposits, totalShares, deployedCapital, yieldEarned] = await Promise.all([
      arcClient.readContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "state" }).catch(() => 0),
      arcClient.readContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "totalDeposits" }).catch(() => BigInt(0)),
      arcClient.readContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "totalShares" }).catch(() => BigInt(0)),
      arcClient.readContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "deployedCapital" }).catch(() => BigInt(0)),
      arcClient.readContract({ address: VAULT_ADDRESS, abi: VAULT_ABI, functionName: "totalYieldEarned" }).catch(() => BigInt(0)),
    ]);

    return {
      hookFee: Number(hookFee),
      hookLiquidity: formatUnits(hookLiquidity as bigint, 6),
      hookVolatilityLevel: Number(hookVolLevel),
      agentUsdcBalance: formatUnits(agentUsdcBase as bigint, 6),
      agentEthBalance: formatUnits(agentEthBase, 18),
      agentArcUsdcBalance: formatUnits(agentUsdcArc as bigint, 6),
      vaultAvailableBalance: formatUnits(vaultUsdcBalance as bigint, 6),
      vaultState: Number(vaultState),
      vaultTotalDeposits: formatUnits(totalDeposits as bigint, 6),
      vaultTotalShares: formatUnits(totalShares as bigint, 6),
      vaultDeployedCapital: formatUnits(deployedCapital as bigint, 6),
      vaultYieldEarned: formatUnits(yieldEarned as bigint, 6),
    };
  } catch (e) {
    console.error("On-chain data fetch failed:", e);
    addLog("error", `On-chain read failed: ${(e as Error).message?.slice(0, 40)}`);
    return {
      hookFee: 3000,
      hookLiquidity: "0",
      hookVolatilityLevel: 0,
      agentUsdcBalance: "0",
      agentEthBalance: "0",
      agentArcUsdcBalance: "0",
      vaultAvailableBalance: "0",
      vaultState: 0,
      vaultTotalDeposits: "0",
      vaultTotalShares: "0",
      vaultDeployedCapital: "0",
      vaultYieldEarned: "0",
    };
  }
}

// Calculate target fee based on volatility level
function getTargetFee(volatility: AgentState["volatility"]): { fee: number; reason: string } {
  switch (volatility) {
    case "LOW":
      return { fee: 500, reason: "Low volatility detected - reducing fees to attract volume" };
    case "MEDIUM":
      return { fee: 3000, reason: "Medium volatility - maintaining standard fees for balanced returns" };
    case "HIGH":
      return { fee: 10000, reason: "High volatility detected - increasing fees to capture premium" };
    case "EXTREME":
      return { fee: 10000, reason: "EXTREME volatility - maximum fees for circuit breaker protection" };
    default:
      return { fee: 3000, reason: "Default fee level" };
  }
}

// Determine capital state based on where majority of capital is
function determineCapitalState(
  arcBalance: number,
  baseBalance: number,
  hookLiquidity: number,
  volatility: AgentState["volatility"]
): AgentState["capitalState"] {
  // Check for circuit breaker condition (extreme volatility > 10%)
  if (volatility === "EXTREME") {
    return "CIRCUIT_BREAKER";
  }

  const totalArc = arcBalance;
  const totalBase = baseBalance + hookLiquidity;

  if (totalArc > totalBase) {
    return "PROTECTED"; // Majority on Arc (safe harbor)
  } else {
    return "EARNING"; // Majority on Base (yield zone)
  }
}

// Execute fee update on Base hook
async function updateHookFee(newFee: number, reason: string): Promise<string | null> {
  if (!PRIVATE_KEY) {
    addLog("error", "No private key configured - cannot execute transaction");
    return null;
  }

  // Check transaction lock to prevent concurrent transactions
  const now = Date.now();
  if (txPending) {
    addLog("info", "Transaction already pending - skipping to prevent nonce collision");
    return null;
  }
  if (now - lastTxTime < TX_COOLDOWN) {
    addLog("info", `Cooldown active (${Math.ceil((TX_COOLDOWN - (now - lastTxTime)) / 1000)}s remaining) - skipping`);
    return null;
  }

  try {
    txPending = true;
    const account = privateKeyToAccount(PRIVATE_KEY);

    // Check gas balance
    const gasBalance = await baseClient.getBalance({ address: account.address });
    const gasBalanceEth = parseFloat(formatUnits(gasBalance, 18));

    if (gasBalanceEth < 0.0001) {
      addLog("error", `Insufficient gas on Base: ${gasBalanceEth.toFixed(6)} ETH`);
      txPending = false;
      return null;
    }

    // Get current nonce to avoid conflicts
    const nonce = await baseClient.getTransactionCount({
      address: account.address,
      blockTag: "pending",
    });

    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });

    addLog("action", `Sending fee update to ${(newFee / 100).toFixed(2)}%...`);

    // Send real transaction to update dynamic fee with explicit nonce
    const hash = await walletClient.writeContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "updateDynamicFee",
      args: [newFee, reason],
      nonce,
    });

    // Wait for receipt
    const receipt = await baseClient.waitForTransactionReceipt({ hash, timeout: 60_000 });

    lastTxTime = Date.now();
    txPending = false;

    if (receipt.status === "success") {
      addTransaction(hash, "FEE_UPDATE");
      addLog("success", `Fee updated to ${(newFee / 100).toFixed(2)}% (tx: ${hash})`);
      return hash;
    } else {
      addLog("error", `Fee update transaction reverted: ${hash}`);
      return null;
    }
  } catch (e) {
    txPending = false;
    const errorMsg = (e as Error).message || String(e);
    addLog("error", `Fee update failed: ${errorMsg.slice(0, 60)}`);
    console.error("Fee update error:", e);
    return null;
  }
}

// Deploy USDC liquidity to hook on Base
async function deployLiquidity(amount: string): Promise<string | null> {
  if (!PRIVATE_KEY) {
    addLog("error", "No private key - cannot deploy liquidity");
    return null;
  }

  // Check transaction lock
  const now = Date.now();
  if (txPending) {
    addLog("info", "Transaction already pending - skipping liquidity deploy");
    return null;
  }
  if (now - lastTxTime < TX_COOLDOWN) {
    addLog("info", `Cooldown active - skipping liquidity deploy`);
    return null;
  }

  try {
    txPending = true;
    const account = privateKeyToAccount(PRIVATE_KEY);
    const walletClient = createWalletClient({
      account,
      chain: baseSepolia,
      transport: http(),
    });
    const amountWei = parseUnits(amount, 6);

    // Get current nonce
    let nonce = await baseClient.getTransactionCount({
      address: account.address,
      blockTag: "pending",
    });

    // First approve hook to spend USDC
    addLog("action", `Approving ${parseFloat(amount).toFixed(2)} USDC for hook...`);
    const approveHash = await walletClient.writeContract({
      address: BASE_USDC,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [HOOK_ADDRESS, amountWei],
      nonce: nonce++,
    });

    // Wait for approval
    await baseClient.waitForTransactionReceipt({ hash: approveHash, timeout: 60_000 });

    // Deposit liquidity with incremented nonce
    addLog("action", `Depositing ${parseFloat(amount).toFixed(2)} USDC to hook...`);
    const depositHash = await walletClient.writeContract({
      address: HOOK_ADDRESS,
      abi: HOOK_ABI,
      functionName: "depositLiquidity",
      args: [amountWei],
      nonce,
    });

    const receipt = await baseClient.waitForTransactionReceipt({ hash: depositHash, timeout: 60_000 });

    lastTxTime = Date.now();
    txPending = false;

    if (receipt.status === "success") {
      addTransaction(depositHash, "LIQUIDITY_DEPLOY");
      addLog("success", `Liquidity deployed! (tx: ${depositHash})`);
      return depositHash;
    } else {
      addLog("error", `Liquidity deposit reverted: ${depositHash}`);
      return null;
    }
  } catch (e) {
    txPending = false;
    addLog("error", `Deploy failed: ${(e as Error).message?.slice(0, 50)}`);
    return null;
  }
}

// Main agent step - runs every ~30s
async function runAgentStep() {
  // Prevent concurrent step execution
  if (stepRunning) {
    return; // Silently skip if already running
  }

  stepRunning = true;

  try {
    agentState.iteration++;
    agentState.lastUpdate = Date.now();

    addLog("info", `--- Agent Iteration #${agentState.iteration} ---`);

    // 1. Fetch real market data from CoinGecko
    addLog("info", "Fetching ETH price from CoinGecko...");
    const market = await fetchMarketData();
    agentState.ethPrice = market.ethPrice;
    agentState.priceChange24h = market.priceChange24h;
    agentState.volatility = market.volatility;
    agentState.volatilityIndex = market.volatilityIndex;

    addLog("info", `ETH: $${market.ethPrice.toFixed(2)} | 24h: ${market.priceChange24h >= 0 ? "+" : ""}${market.priceChange24h.toFixed(2)}% | Volatility: ${market.volatility}`);

    // 2. Read real on-chain data
    addLog("info", "Reading on-chain state (Arc + Base)...");
    const onChain = await fetchOnChainData();

    agentState.hookFee = onChain.hookFee;
    agentState.hookLiquidity = onChain.hookLiquidity;
    agentState.hookVolatilityLevel = onChain.hookVolatilityLevel;
    agentState.agentUsdcBalance = onChain.agentUsdcBalance;
    agentState.agentEthBalance = onChain.agentEthBalance;
    agentState.agentArcUsdcBalance = onChain.agentArcUsdcBalance;
    agentState.vaultAvailableBalance = onChain.vaultAvailableBalance;
    agentState.vaultState = onChain.vaultState;
    agentState.vaultTotalDeposits = onChain.vaultTotalDeposits;
    agentState.vaultTotalShares = onChain.vaultTotalShares;
    agentState.vaultDeployedCapital = onChain.vaultDeployedCapital;
    agentState.vaultYieldEarned = onChain.vaultYieldEarned;

    const arcTotal = parseFloat(onChain.agentArcUsdcBalance) + parseFloat(onChain.vaultAvailableBalance);
    const baseTotal = parseFloat(onChain.agentUsdcBalance) + parseFloat(onChain.hookLiquidity);

    addLog("info", `Arc USDC: $${arcTotal.toFixed(2)} | Base USDC: $${baseTotal.toFixed(2)} | Hook fee: ${(onChain.hookFee / 100).toFixed(2)}%`);

    // 3. Update capital state based on where majority is
    agentState.capitalState = determineCapitalState(
      arcTotal,
      parseFloat(onChain.agentUsdcBalance),
      parseFloat(onChain.hookLiquidity),
      agentState.volatility
    );

    addLog("info", `Capital State: ${agentState.capitalState}`);

    // 4. Determine target fee based on volatility
    const { fee: targetFee, reason: feeReason } = getTargetFee(agentState.volatility);
    const currentFee = onChain.hookFee;

    addLog("decision", `Current fee: ${(currentFee / 100).toFixed(2)}% | Target fee: ${(targetFee / 100).toFixed(2)}%`);

    // 5. Execute fee update if needed
    if (currentFee !== targetFee) {
      addLog("decision", `Fee adjustment needed: ${feeReason}`);

      agentState.lastDecision = {
        action: "ADJUST_FEE",
        reason: feeReason,
        confidence: 0.95,
        timestamp: Date.now(),
      };

      const txHash = await updateHookFee(targetFee, feeReason);
      if (txHash) {
        agentState.hookFee = targetFee;
      }
    } else {
      // Fee is already optimal
      const totalManaged = arcTotal + baseTotal;
      const monitorReason = `Monitoring $${totalManaged.toFixed(2)} total | Fee ${(currentFee / 100).toFixed(2)}% optimal for ${agentState.volatility} volatility`;

      agentState.lastDecision = {
        action: "MONITOR",
        reason: monitorReason,
        confidence: 0.80,
        timestamp: Date.now(),
      };

      addLog("info", monitorReason);
    }

    // 6. Log circuit breaker warning if extreme volatility
    if (agentState.volatility === "EXTREME") {
      addLog("decision", "CIRCUIT_BREAKER: Extreme volatility (>10%) - recommending capital return to Arc safe harbor");
    }

    addLog("info", `--- Iteration #${agentState.iteration} complete ---`);
  } finally {
    stepRunning = false;
  }
}

// API Handlers
export async function GET() {
  return NextResponse.json({ success: true, state: agentState });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "start":
        agentState.isRunning = true;
        addLog("success", "velvet-agent.eth activated - autonomous mode enabled");
        break;

      case "stop":
        agentState.isRunning = false;
        addLog("info", "Agent paused - autonomous mode disabled");
        break;

      case "step":
        // Run single agent iteration (manual or automated)
        await runAgentStep();
        break;

      case "reset":
        agentState = {
          isRunning: false,
          lastUpdate: Date.now(),
          iteration: 0,
          agentAddress: AGENT_ADDRESS,
          agentEthBalance: "0",
          agentUsdcBalance: "0",
          agentArcUsdcBalance: "0",
          ethPrice: 0,
          priceChange24h: 0,
          volatility: "LOW",
          volatilityIndex: 0,
          vaultState: 0,
          vaultTotalDeposits: "0",
          vaultTotalShares: "0",
          vaultDeployedCapital: "0",
          vaultYieldEarned: "0",
          vaultAvailableBalance: "0",
          hookFee: 3000,
          hookLiquidity: "0",
          hookVolatilityLevel: 0,
          capitalState: "PROTECTED",
          lastDecision: null,
          logs: [],
          transactions: [],
        };
        addLog("info", "Agent state reset");
        break;

      // Demo simulation functions - allows forcing volatility states for demo
      case "simulate_high_volatility":
        addLog("info", "[DEMO] Simulating HIGH volatility scenario (-8.5%)");
        agentState.priceChange24h = -8.5;
        agentState.volatility = "HIGH";
        agentState.volatilityIndex = 85;
        await runAgentStep();
        break;

      case "simulate_low_volatility":
        addLog("info", "[DEMO] Simulating LOW volatility scenario (+1.2%)");
        agentState.priceChange24h = 1.2;
        agentState.volatility = "LOW";
        agentState.volatilityIndex = 12;
        await runAgentStep();
        break;

      case "simulate_extreme_volatility":
        addLog("info", "[DEMO] Simulating EXTREME volatility scenario (-12%)");
        agentState.priceChange24h = -12;
        agentState.volatility = "EXTREME";
        agentState.volatilityIndex = 120;
        await runAgentStep();
        break;

      case "deploy_liquidity":
        // Manual liquidity deployment trigger
        if (parseFloat(agentState.agentUsdcBalance) > 1) {
          const txHash = await deployLiquidity(agentState.agentUsdcBalance);
          if (txHash) {
            addLog("success", `Manual liquidity deployment complete: ${txHash}`);
          }
        } else {
          addLog("info", "No USDC available on Base for deployment");
        }
        break;

      default:
        return NextResponse.json({ success: false, error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({ success: true, state: agentState });
  } catch (e) {
    console.error("Agent API error:", e);
    return NextResponse.json({ success: false, error: (e as Error).message }, { status: 500 });
  }
}
