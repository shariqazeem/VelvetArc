"use client";

import { useState, useEffect, useCallback, useRef } from "react";

interface AgentLog {
  timestamp: number;
  type: "info" | "decision" | "action" | "error" | "success";
  message: string;
}

interface AgentTransaction {
  hash: string;
  type: string;
  timestamp: number;
}

export interface APIAgentState {
  isRunning: boolean;
  lastUpdate: number;
  iteration: number;
  position: "ARC" | "BASE";

  // Market data
  ethPrice: number;
  priceChange24h: number;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  volatilityIndex: number;

  // On-chain data
  vaultState: number;
  vaultBalance: string;
  hookFee: number;

  // Agent wallet
  agentAddress: string;
  agentBalance: string;

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

const DEFAULT_STATE: APIAgentState = {
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
  agentAddress: "",
  agentBalance: "0",
  lastDecision: null,
  logs: [],
  transactions: [],
};

export function useAgentAPI() {
  const [state, setState] = useState<APIAgentState>(DEFAULT_STATE);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch current state from API
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch("/api/agent");
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      }
    } catch (e) {
      console.error("Failed to fetch agent state:", e);
    }
  }, []);

  // Send action to API
  const sendAction = useCallback(async (action: "start" | "stop" | "step" | "reset") => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success && data.state) {
        setState(data.state);
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start agent
  const startAgent = useCallback(async () => {
    await sendAction("start");
  }, [sendAction]);

  // Stop agent
  const stopAgent = useCallback(async () => {
    await sendAction("stop");
  }, [sendAction]);

  // Run single step
  const runStep = useCallback(async () => {
    await sendAction("step");
  }, [sendAction]);

  // Reset agent
  const resetAgent = useCallback(async () => {
    await sendAction("reset");
  }, [sendAction]);

  // Poll for state updates
  useEffect(() => {
    fetchState();
    intervalRef.current = setInterval(fetchState, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchState]);

  // Auto-run steps when agent is running
  useEffect(() => {
    if (state.isRunning) {
      // Run a step immediately
      runStep();
      // Then run steps every 5 seconds
      stepIntervalRef.current = setInterval(runStep, 5000);
    } else {
      if (stepIntervalRef.current) {
        clearInterval(stepIntervalRef.current);
        stepIntervalRef.current = null;
      }
    }
    return () => {
      if (stepIntervalRef.current) clearInterval(stepIntervalRef.current);
    };
  }, [state.isRunning, runStep]);

  return {
    state,
    isLoading,
    error,
    startAgent,
    stopAgent,
    runStep,
    resetAgent,
    fetchState,
  };
}
