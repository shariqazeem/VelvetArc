"use client";

import { useState, useEffect, useCallback, useRef } from "react";

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

export interface APIAgentState {
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

  // Activity log
  logs: AgentLog[];

  // Transactions
  transactions: AgentTransaction[];
}

type AgentAction =
  | "start"
  | "stop"
  | "step"
  | "reset"
  | "simulate_high_volatility"
  | "simulate_low_volatility"
  | "simulate_extreme_volatility"
  | "deploy_liquidity";

const DEFAULT_STATE: APIAgentState = {
  isRunning: false,
  lastUpdate: Date.now(),
  iteration: 0,
  agentAddress: "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E",
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

const POLL_INTERVAL = 5000; // Poll every 5 seconds when running

export function useAgentAPI() {
  const [state, setState] = useState<APIAgentState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  // Fetch current state from API
  const fetchState = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch("/api/agent", {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!isMountedRef.current) return false;

      if (data.success && data.state) {
        setState(data.state);
        setIsConnected(true);
        setError(null);
        return true;
      } else {
        throw new Error(data.error || "Invalid response from agent API");
      }
    } catch (e) {
      if (!isMountedRef.current) return false;

      const errorMsg = (e as Error).message || "Failed to connect to agent";
      console.error("Failed to fetch agent state:", errorMsg);
      setError(errorMsg);
      setIsConnected(false);
      return false;
    }
  }, []);

  // Send action to API
  const sendAction = useCallback(async (action: AgentAction): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();

      if (!isMountedRef.current) return false;

      if (data.success && data.state) {
        setState(data.state);
        setIsConnected(true);
        return true;
      } else {
        throw new Error(data.error || "Action failed");
      }
    } catch (e) {
      if (!isMountedRef.current) return false;

      const errorMsg = (e as Error).message || "Failed to send action";
      console.error(`Agent action '${action}' failed:`, errorMsg);
      setError(errorMsg);
      return false;
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  // Start agent (enables autonomous mode)
  const startAgent = useCallback(async () => {
    return sendAction("start");
  }, [sendAction]);

  // Stop agent (disables autonomous mode)
  const stopAgent = useCallback(async () => {
    return sendAction("stop");
  }, [sendAction]);

  // Run single agent step manually
  const runStep = useCallback(async () => {
    return sendAction("step");
  }, [sendAction]);

  // Reset agent state
  const resetAgent = useCallback(async () => {
    return sendAction("reset");
  }, [sendAction]);

  // Demo: Simulate high volatility (triggers fee increase to 10000 = 1%)
  const simulateHighVolatility = useCallback(async () => {
    return sendAction("simulate_high_volatility");
  }, [sendAction]);

  // Demo: Simulate low volatility (triggers fee decrease to 500 = 0.05%)
  const simulateLowVolatility = useCallback(async () => {
    return sendAction("simulate_low_volatility");
  }, [sendAction]);

  // Demo: Simulate extreme volatility (triggers circuit breaker)
  const simulateExtremeVolatility = useCallback(async () => {
    return sendAction("simulate_extreme_volatility");
  }, [sendAction]);

  // Manual: Deploy liquidity to hook
  const deployLiquidity = useCallback(async () => {
    return sendAction("deploy_liquidity");
  }, [sendAction]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initial fetch and setup polling
  useEffect(() => {
    isMountedRef.current = true;

    // Initial state fetch
    fetchState().then((success) => {
      if (success && isMountedRef.current) {
        // Run initial step to populate on-chain data
        sendAction("step");
      }
    });

    // Poll for state updates every 5 seconds
    pollIntervalRef.current = setInterval(() => {
      if (isMountedRef.current) {
        fetchState();
      }
    }, POLL_INTERVAL);

    return () => {
      isMountedRef.current = false;
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [fetchState, sendAction]);

  // Auto-run steps when agent is in running mode
  useEffect(() => {
    if (state.isRunning) {
      // Run a step immediately when starting
      runStep();

      // Then run steps every 5 seconds (the core ~30s loop is server-side decision,
      // but we poll/trigger every 5s for responsiveness)
      stepIntervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          runStep();
        }
      }, POLL_INTERVAL);
    } else {
      // Stop running steps when agent is paused
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }

    return () => {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    };
  }, [state.isRunning, runStep]);

  // Computed values for convenience
  const totalArcBalance = parseFloat(state.agentArcUsdcBalance) + parseFloat(state.vaultAvailableBalance);
  const totalBaseBalance = parseFloat(state.agentUsdcBalance) + parseFloat(state.hookLiquidity);
  const totalManagedAssets = totalArcBalance + totalBaseBalance;

  return {
    // State
    state,
    isLoading,
    error,
    isConnected,

    // Actions
    startAgent,
    stopAgent,
    runStep,
    resetAgent,
    fetchState,
    clearError,

    // Demo simulations
    simulateHighVolatility,
    simulateLowVolatility,
    simulateExtremeVolatility,

    // Manual operations
    deployLiquidity,

    // Computed values
    totalArcBalance,
    totalBaseBalance,
    totalManagedAssets,
  };
}
