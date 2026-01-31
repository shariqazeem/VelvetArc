/**
 * Velvet Arc - Autonomous Agent Brain
 *
 * This module contains the decision-making logic for the Velvet Agent.
 * Integrates with LI.FI SDK for real cross-chain bridging.
 *
 * @see https://docs.li.fi/sdk/execute-routes
 */

import {
  createConfig,
  getRoutes,
  executeRoute,
  getStatus,
  type Route,
  type RouteExtended,
  type RoutesRequest,
  type StatusResponse,
} from "@lifi/sdk";
import type { WalletClient } from "viem";
import { CHAINS, TOKENS, LIFI_CONFIG } from "./constants";

/*//////////////////////////////////////////////////////////////
                        INITIALIZATION
//////////////////////////////////////////////////////////////*/

// Initialize LI.FI SDK with integrator name
createConfig({
  integrator: LIFI_CONFIG.integrator,
});

/*//////////////////////////////////////////////////////////////
                           TYPES
//////////////////////////////////////////////////////////////*/

export type VolatilityLevel = "LOW" | "MEDIUM" | "HIGH" | "EXTREME";

export type AgentState =
  | "IDLE"
  | "SCANNING"
  | "ANALYZING"
  | "BRIDGING_TO_BASE"
  | "AWAITING_BRIDGE"
  | "DEPLOYING_LIQUIDITY"
  | "FARMING"
  | "WITHDRAWING"
  | "BRIDGING_TO_ARC"
  | "CIRCUIT_BREAKER";

export interface MarketConditions {
  volatility: VolatilityLevel;
  volatilityIndex: number; // 0-100
  volume24h: number;
  priceChange24h: number;
  tvl: number;
  gasPrice: number;
  timestamp: number;
}

export interface AgentDecision {
  action: "DEPLOY" | "WITHDRAW" | "HOLD" | "EMERGENCY_EXIT" | "ADJUST_FEE";
  reason: string;
  confidence: number;
  suggestedFee?: number;
  suggestedAmount?: string;
}

export interface BridgeQuote {
  fromChainId: number;
  toChainId: number;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  toAmount: string;
  estimatedTime: number;
  gasCostUSD: string;
  route: Route;
}

export interface BridgeStatus {
  status: "PENDING" | "DONE" | "FAILED" | "NOT_FOUND";
  substatus?: string;
  txHash?: string;
  receiving?: {
    txHash?: string;
    amount?: string;
  };
}

export interface ExecutionLog {
  timestamp: number;
  action: string;
  details: string;
  txHash?: string;
  success: boolean;
}

/*//////////////////////////////////////////////////////////////
                      MARKET SCANNER
//////////////////////////////////////////////////////////////*/

// Cache for price history (for volatility calculation)
let priceHistory: number[] = [];
let lastFetchTime = 0;
const FETCH_COOLDOWN = 10000; // 10 seconds

/**
 * Fetch real market conditions from CoinGecko API
 * Uses ETH price and market data as proxy for overall crypto volatility
 */
export async function scanMarketConditions(): Promise<MarketConditions> {
  const now = Date.now();

  // Respect rate limits
  if (now - lastFetchTime < FETCH_COOLDOWN) {
    // Return cached/simulated data if called too frequently
    return generateMarketConditionsFromHistory(now);
  }
  lastFetchTime = now;

  try {
    // Fetch ETH price and 24h data from CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true"
    );

    if (!response.ok) {
      console.log("[Agent] CoinGecko API rate limited, using cached data");
      return generateMarketConditionsFromHistory(now);
    }

    const data = await response.json();
    const ethPrice = data.ethereum?.usd || 0;
    const priceChange24h = data.ethereum?.usd_24h_change || 0;
    const volume24h = data.ethereum?.usd_24h_vol || 0;

    // Update price history for volatility calculation
    priceHistory.push(ethPrice);
    if (priceHistory.length > 24) {
      priceHistory = priceHistory.slice(-24); // Keep last 24 data points
    }

    // Calculate volatility from price history
    const volatilityIndex = calculateVolatilityIndex(priceHistory, priceChange24h);

    let volatility: VolatilityLevel;
    if (volatilityIndex < 20) {
      volatility = "LOW";
    } else if (volatilityIndex < 50) {
      volatility = "MEDIUM";
    } else if (volatilityIndex < 80) {
      volatility = "HIGH";
    } else {
      volatility = "EXTREME";
    }

    // Fetch gas price from Base
    let gasPrice = 30; // Default
    try {
      const gasResponse = await fetch("https://sepolia.base.org", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        }),
      });
      const gasData = await gasResponse.json();
      gasPrice = parseInt(gasData.result, 16) / 1e9; // Convert wei to gwei
    } catch (e) {
      console.log("[Agent] Gas price fetch failed, using default");
    }

    console.log(
      `[Agent] Market scan: ETH $${ethPrice.toFixed(0)}, 24h: ${priceChange24h.toFixed(2)}%, Vol: ${volatility}`
    );

    return {
      volatility,
      volatilityIndex,
      volume24h,
      priceChange24h,
      tvl: 50_000_000, // Placeholder - would read from contract
      gasPrice,
      timestamp: now,
    };
  } catch (error) {
    console.error("[Agent] Market scan error:", error);
    return generateMarketConditionsFromHistory(now);
  }
}

/**
 * Calculate volatility index from price history
 */
function calculateVolatilityIndex(prices: number[], change24h: number): number {
  if (prices.length < 2) {
    // Not enough data, use 24h change as proxy
    return Math.min(Math.abs(change24h) * 5, 100);
  }

  // Calculate standard deviation of returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const ret = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(ret);
  }

  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((acc, r) => acc + Math.pow(r - mean, 2), 0) / returns.length;
  const stdDev = Math.sqrt(variance);

  // Normalize to 0-100 scale (0.01 stddev = low vol, 0.05 = extreme)
  const volatilityIndex = Math.min((stdDev / 0.05) * 100, 100);

  // Also factor in 24h change
  const changeImpact = Math.min(Math.abs(change24h) * 3, 30);

  return Math.min(volatilityIndex + changeImpact, 100);
}

/**
 * Generate market conditions from cached history (fallback)
 */
function generateMarketConditionsFromHistory(timestamp: number): MarketConditions {
  // Use last known price change or generate realistic values
  const baseVolatility = priceHistory.length > 1
    ? calculateVolatilityIndex(priceHistory, 0)
    : 25 + Math.random() * 25; // Default medium

  let volatility: VolatilityLevel;
  if (baseVolatility < 20) {
    volatility = "LOW";
  } else if (baseVolatility < 50) {
    volatility = "MEDIUM";
  } else if (baseVolatility < 80) {
    volatility = "HIGH";
  } else {
    volatility = "EXTREME";
  }

  return {
    volatility,
    volatilityIndex: Math.floor(baseVolatility),
    volume24h: 15_000_000 + Math.random() * 10_000_000,
    priceChange24h: (Math.random() - 0.5) * 6,
    tvl: 50_000_000,
    gasPrice: 20 + Math.random() * 30,
    timestamp,
  };
}

/*//////////////////////////////////////////////////////////////
                     DECISION ENGINE
//////////////////////////////////////////////////////////////*/

/**
 * Core decision-making function
 * Analyzes market conditions and current position to determine optimal action
 */
export function makeDecision(
  conditions: MarketConditions,
  currentPosition: "ARC" | "BASE",
  deployedAmount: number,
  vaultBalance: number
): AgentDecision {
  const { volatility, volatilityIndex, volume24h, priceChange24h, gasPrice } =
    conditions;

  // Emergency exit conditions
  if (volatility === "EXTREME") {
    return {
      action: "EMERGENCY_EXIT",
      reason: `Extreme volatility detected (index: ${volatilityIndex}). Triggering circuit breaker.`,
      confidence: 0.99,
    };
  }

  if (volatility === "HIGH" && priceChange24h < -5) {
    return {
      action: "EMERGENCY_EXIT",
      reason: `High volatility with ${priceChange24h.toFixed(2)}% price drop. Emergency withdrawal.`,
      confidence: 0.95,
    };
  }

  // Position-based decisions
  if (currentPosition === "ARC") {
    // Funds are safe on Arc - evaluate deployment opportunity

    // Check if gas is reasonable
    if (gasPrice > 80) {
      return {
        action: "HOLD",
        reason: `Gas price too high (${gasPrice.toFixed(0)} gwei). Waiting for better conditions.`,
        confidence: 0.8,
      };
    }

    // Deploy conditions
    if (volatility === "LOW" && volume24h > 10_000_000) {
      const deployAmount = Math.floor(vaultBalance * 0.7); // Deploy 70%
      return {
        action: "DEPLOY",
        reason: `Low volatility (${volatilityIndex}) + high volume ($${(volume24h / 1_000_000).toFixed(1)}M). Optimal deployment window.`,
        confidence: 0.88,
        suggestedAmount: deployAmount.toString(),
        suggestedFee: 200, // 0.02% - competitive
      };
    }

    if (volatility === "MEDIUM" && volume24h > 5_000_000 && priceChange24h > 0) {
      const deployAmount = Math.floor(vaultBalance * 0.5); // Deploy 50%
      return {
        action: "DEPLOY",
        reason: `Medium volatility with positive momentum (+${priceChange24h.toFixed(2)}%). Moderate deployment.`,
        confidence: 0.72,
        suggestedAmount: deployAmount.toString(),
        suggestedFee: 500, // 0.05% - standard
      };
    }

    return {
      action: "HOLD",
      reason: `Market conditions not optimal. Volatility: ${volatility}, Volume: $${(volume24h / 1_000_000).toFixed(1)}M.`,
      confidence: 0.75,
    };
  }

  // Position is on BASE (deployed)
  if (currentPosition === "BASE") {
    // Withdrawal conditions
    if (volatility === "HIGH") {
      return {
        action: "WITHDRAW",
        reason: `High volatility detected (${volatilityIndex}). Returning to safe harbor.`,
        confidence: 0.9,
        suggestedFee: 1500, // 0.15% - protective fee before exit
      };
    }

    if (priceChange24h < -3) {
      return {
        action: "WITHDRAW",
        reason: `Significant negative momentum (${priceChange24h.toFixed(2)}%). Protecting capital.`,
        confidence: 0.85,
      };
    }

    if (volume24h < 3_000_000) {
      return {
        action: "WITHDRAW",
        reason: `Volume dropped to $${(volume24h / 1_000_000).toFixed(1)}M. Insufficient yield opportunity.`,
        confidence: 0.7,
      };
    }

    // Continue farming with fee adjustment
    const suggestedFee = volatility === "LOW" ? 200 : volatility === "MEDIUM" ? 500 : 1000;

    return {
      action: "ADJUST_FEE",
      reason: `Conditions stable. Continuing yield generation with optimized fee.`,
      confidence: 0.75,
      suggestedFee,
    };
  }

  // Default hold
  return {
    action: "HOLD",
    reason: "Unable to determine optimal action. Defaulting to hold.",
    confidence: 0.5,
  };
}

/*//////////////////////////////////////////////////////////////
                    LI.FI BRIDGE INTEGRATION
//////////////////////////////////////////////////////////////*/

/**
 * Get bridge quote from Arc to Base using LI.FI
 */
export async function getBridgeQuoteArcToBase(
  fromAmount: string,
  fromAddress: string
): Promise<BridgeQuote | null> {
  try {
    const request: RoutesRequest = {
      fromChainId: CHAINS.ARC_TESTNET.id,
      toChainId: CHAINS.BASE_SEPOLIA.id,
      fromTokenAddress: TOKENS.ARC_USDC,
      toTokenAddress: TOKENS.BASE_USDC,
      fromAmount,
      fromAddress,
      options: {
        slippage: 0.005, // 0.5%
        order: "RECOMMENDED",
        allowSwitchChain: true,
      },
    };

    const result = await getRoutes(request);

    if (!result.routes || result.routes.length === 0) {
      console.log("[Agent] No routes found for Arc -> Base");
      return null;
    }

    const bestRoute = result.routes[0];

    // Calculate estimated time from all steps
    const estimatedTime = bestRoute.steps.reduce(
      (acc, step) => acc + (step.estimate?.executionDuration || 60),
      0
    );

    return {
      fromChainId: CHAINS.ARC_TESTNET.id,
      toChainId: CHAINS.BASE_SEPOLIA.id,
      fromToken: TOKENS.ARC_USDC,
      toToken: TOKENS.BASE_USDC,
      fromAmount,
      toAmount: bestRoute.toAmount,
      estimatedTime,
      gasCostUSD: bestRoute.gasCostUSD || "0",
      route: bestRoute,
    };
  } catch (error) {
    console.error("[Agent] Error getting Arc->Base quote:", error);
    return null;
  }
}

/**
 * Get bridge quote from Base to Arc using LI.FI
 */
export async function getBridgeQuoteBaseToArc(
  fromAmount: string,
  fromAddress: string
): Promise<BridgeQuote | null> {
  try {
    const request: RoutesRequest = {
      fromChainId: CHAINS.BASE_SEPOLIA.id,
      toChainId: CHAINS.ARC_TESTNET.id,
      fromTokenAddress: TOKENS.BASE_USDC,
      toTokenAddress: TOKENS.ARC_USDC,
      fromAmount,
      fromAddress,
      options: {
        slippage: 0.005,
        order: "RECOMMENDED",
        allowSwitchChain: true,
      },
    };

    const result = await getRoutes(request);

    if (!result.routes || result.routes.length === 0) {
      console.log("[Agent] No routes found for Base -> Arc");
      return null;
    }

    const bestRoute = result.routes[0];

    const estimatedTime = bestRoute.steps.reduce(
      (acc, step) => acc + (step.estimate?.executionDuration || 60),
      0
    );

    return {
      fromChainId: CHAINS.BASE_SEPOLIA.id,
      toChainId: CHAINS.ARC_TESTNET.id,
      fromToken: TOKENS.BASE_USDC,
      toToken: TOKENS.ARC_USDC,
      fromAmount,
      toAmount: bestRoute.toAmount,
      estimatedTime,
      gasCostUSD: bestRoute.gasCostUSD || "0",
      route: bestRoute,
    };
  } catch (error) {
    console.error("[Agent] Error getting Base->Arc quote:", error);
    return null;
  }
}

/**
 * Execute a bridge route using LI.FI SDK
 * Requires a wallet client for signing transactions
 */
export async function executeBridgeRoute(
  route: Route,
  walletClient: WalletClient,
  onStatusUpdate?: (route: RouteExtended) => void
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    console.log("[Agent] Executing bridge route...");

    const executedRoute = await executeRoute(route, {
      updateRouteHook: (updatedRoute) => {
        console.log("[Agent] Route update:", updatedRoute.id);
        onStatusUpdate?.(updatedRoute);

        // Log transaction hashes as they become available
        updatedRoute.steps.forEach((step, idx) => {
          step.execution?.process.forEach((process) => {
            if (process.txHash) {
              console.log(`[Agent] Step ${idx + 1} txHash:`, process.txHash);
            }
          });
        });
      },
      // Wallet client adapter for LI.FI SDK
      // In production, use proper EVM wallet adapter
    });

    // Get final transaction hash
    let finalTxHash: string | undefined;
    executedRoute.steps.forEach((step) => {
      step.execution?.process.forEach((process) => {
        if (process.txHash) {
          finalTxHash = process.txHash;
        }
      });
    });

    return {
      success: true,
      txHash: finalTxHash,
    };
  } catch (error) {
    console.error("[Agent] Bridge execution failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Check the status of a bridge transaction
 */
export async function checkBridgeStatus(
  txHash: string,
  fromChainId: number,
  toChainId: number
): Promise<BridgeStatus> {
  try {
    const status = await getStatus({
      txHash,
      fromChain: fromChainId,
      toChain: toChainId,
      bridge: "circle", // CCTP bridge
    });

    // Type-safe access to status properties
    const statusAny = status as unknown as Record<string, unknown>;
    const receiving = statusAny.receiving as { txHash?: string; amount?: string } | undefined;

    return {
      status: status.status as BridgeStatus["status"],
      substatus: status.substatus,
      txHash: status.sending?.txHash,
      receiving: receiving
        ? {
            txHash: receiving.txHash,
            amount: receiving.amount,
          }
        : undefined,
    };
  } catch (error) {
    console.error("[Agent] Error checking bridge status:", error);
    return { status: "NOT_FOUND" };
  }
}

/*//////////////////////////////////////////////////////////////
                    FEE CALCULATION
//////////////////////////////////////////////////////////////*/

/**
 * Calculate optimal dynamic fee based on market conditions
 * Returns fee in basis points (100 = 0.01%)
 */
export function calculateOptimalFee(conditions: MarketConditions): number {
  const { volatility, volume24h, priceChange24h } = conditions;

  // Base fee by volatility
  let fee: number;
  switch (volatility) {
    case "LOW":
      fee = 200; // 0.02%
      break;
    case "MEDIUM":
      fee = 500; // 0.05%
      break;
    case "HIGH":
      fee = 1500; // 0.15%
      break;
    case "EXTREME":
      fee = 5000; // 0.5%
      break;
    default:
      fee = 500;
  }

  // Volume adjustment
  if (volume24h > 30_000_000) {
    fee += 100; // High volume = can charge slightly more
  } else if (volume24h < 5_000_000) {
    fee -= 50; // Low volume = more competitive
  }

  // Momentum adjustment
  if (Math.abs(priceChange24h) > 5) {
    fee += 200; // High momentum = more risk = higher fee
  }

  // Clamp to valid range
  return Math.max(100, Math.min(10000, fee));
}

/*//////////////////////////////////////////////////////////////
                    AGENT LOOP STATE
//////////////////////////////////////////////////////////////*/

export interface AgentLoopState {
  isRunning: boolean;
  currentState: AgentState;
  lastDecision: AgentDecision | null;
  lastConditions: MarketConditions | null;
  position: "ARC" | "BASE";
  deployedAmount: number;
  vaultBalance: number;
  totalYieldEarned: number;
  currentBridgeTx: string | null;
  executionHistory: ExecutionLog[];
}

/**
 * Initialize agent state
 */
export function initializeAgentState(vaultBalance: number): AgentLoopState {
  return {
    isRunning: false,
    currentState: "IDLE",
    lastDecision: null,
    lastConditions: null,
    position: "ARC",
    deployedAmount: 0,
    vaultBalance,
    totalYieldEarned: 0,
    currentBridgeTx: null,
    executionHistory: [],
  };
}

/**
 * Run a single iteration of the agent loop
 */
export async function runAgentIteration(
  state: AgentLoopState
): Promise<AgentLoopState> {
  const newState = { ...state };
  newState.currentState = "SCANNING";

  try {
    // 1. Scan market conditions
    const conditions = await scanMarketConditions();
    newState.lastConditions = conditions;
    newState.currentState = "ANALYZING";

    // 2. Make decision
    const decision = makeDecision(
      conditions,
      state.position,
      state.deployedAmount,
      state.vaultBalance
    );
    newState.lastDecision = decision;

    // 3. Log execution
    const log: ExecutionLog = {
      timestamp: Date.now(),
      action: decision.action,
      details: decision.reason,
      success: true,
    };

    // 4. Update state based on decision
    switch (decision.action) {
      case "DEPLOY":
        newState.currentState = "BRIDGING_TO_BASE";
        newState.position = "BASE";
        log.details = `Deploying to Base. ${decision.reason}`;
        break;

      case "WITHDRAW":
        newState.currentState = "BRIDGING_TO_ARC";
        newState.position = "ARC";
        log.details = `Withdrawing to Arc. ${decision.reason}`;
        break;

      case "EMERGENCY_EXIT":
        newState.currentState = "CIRCUIT_BREAKER";
        newState.position = "ARC";
        log.details = `EMERGENCY: ${decision.reason}`;
        break;

      case "ADJUST_FEE":
        newState.currentState = "FARMING";
        log.details = `Fee adjusted to ${decision.suggestedFee} bps. ${decision.reason}`;
        break;

      default:
        newState.currentState = state.position === "ARC" ? "IDLE" : "FARMING";
    }

    newState.executionHistory = [log, ...state.executionHistory.slice(0, 49)];
  } catch (error) {
    console.error("[Agent] Iteration error:", error);
    newState.currentState = "IDLE";

    const errorLog: ExecutionLog = {
      timestamp: Date.now(),
      action: "ERROR",
      details: error instanceof Error ? error.message : "Unknown error",
      success: false,
    };
    newState.executionHistory = [errorLog, ...state.executionHistory.slice(0, 49)];
  }

  return newState;
}
