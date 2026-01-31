"use client";

import { useEffect, useState, useRef } from "react";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { useAccount } from "wagmi";
import { useVaultData, useUserPosition } from "@/hooks/useContracts";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

export function TerminalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { agentState, isAgentRunning, vaultState } = useVelvetStore();
  const { isConnected } = useAccount();
  const { shares } = useUserPosition();
  const { vaultBalance } = useVaultData();
  const logIdRef = useRef(0);
  const lastActionRef = useRef<string | null>(null);
  const hasShownIntroRef = useRef(false);

  // Show intro logs when user has deposited but agent not running
  useEffect(() => {
    if (hasShownIntroRef.current) return;
    if (!isConnected || parseFloat(shares) <= 0) return;
    if (isAgentRunning) return;

    hasShownIntroRef.current = true;

    const introLogs: LogEntry[] = [
      {
        id: logIdRef.current++,
        text: `VAULT: $${parseFloat(vaultBalance).toFixed(2)} TVL`,
        type: "success",
        timestamp: Date.now(),
      },
      {
        id: logIdRef.current++,
        text: "POSITION DETECTED",
        type: "info",
        timestamp: Date.now() + 100,
      },
      {
        id: logIdRef.current++,
        text: "AWAITING AGENT START...",
        type: "warning",
        timestamp: Date.now() + 200,
      },
    ];

    setLogs(introLogs);
  }, [isConnected, shares, vaultBalance, isAgentRunning]);

  // Reset intro flag when agent starts
  useEffect(() => {
    if (isAgentRunning) {
      hasShownIntroRef.current = true;
    }
  }, [isAgentRunning]);

  // Generate logs based on agent state
  useEffect(() => {
    if (!isAgentRunning) return;

    const { currentState, lastDecision, lastConditions } = agentState;

    // Only add log if action changed
    const currentAction = `${currentState}-${lastDecision?.action}`;
    if (currentAction === lastActionRef.current) return;
    lastActionRef.current = currentAction;

    const newLogs: LogEntry[] = [];

    // State-based logs with sponsor integrations highlighted
    switch (currentState) {
      case "SCANNING":
        newLogs.push({
          id: logIdRef.current++,
          text: "SCANNING MARKET CONDITIONS...",
          type: "info",
          timestamp: Date.now(),
        });
        break;

      case "ANALYZING":
        if (lastConditions) {
          newLogs.push({
            id: logIdRef.current++,
            text: `ETH 24H: ${lastConditions.priceChange24h?.toFixed(2) || "0"}%`,
            type: lastConditions.priceChange24h > 0 ? "success" : "warning",
            timestamp: Date.now(),
          });
          newLogs.push({
            id: logIdRef.current++,
            text: `VOL: ${lastConditions.volatilityIndex?.toFixed(0) || "0"} [${lastConditions.volatility}]`,
            type: lastConditions.volatility === "LOW" ? "success" :
                  lastConditions.volatility === "HIGH" ? "warning" : "info",
            timestamp: Date.now() + 50,
          });
          newLogs.push({
            id: logIdRef.current++,
            text: `GAS: ${lastConditions.gasPrice?.toFixed(0) || "30"} gwei`,
            type: "info",
            timestamp: Date.now() + 100,
          });
        }
        break;

      case "BRIDGING_TO_BASE":
        newLogs.push({
          id: logIdRef.current++,
          text: "DEPLOYING TO BASE...",
          type: "warning",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "[CIRCLE CCTP] BURN TX",
          type: "info",
          timestamp: Date.now() + 100,
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "[LI.FI] ROUTING...",
          type: "info",
          timestamp: Date.now() + 200,
        });
        break;

      case "FARMING":
        newLogs.push({
          id: logIdRef.current++,
          text: "[UNISWAP V4] HOOK ACTIVE",
          type: "success",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "YIELD GENERATING...",
          type: "success",
          timestamp: Date.now() + 100,
        });
        break;

      case "BRIDGING_TO_ARC":
        newLogs.push({
          id: logIdRef.current++,
          text: "PROTECTING CAPITAL...",
          type: "warning",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "[CIRCLE ARC] RETURN TX",
          type: "info",
          timestamp: Date.now() + 100,
        });
        break;

      case "CIRCUIT_BREAKER":
        newLogs.push({
          id: logIdRef.current++,
          text: "⚠ CIRCUIT BREAKER TRIGGERED",
          type: "error",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "EMERGENCY EXIT TO ARC",
          type: "error",
          timestamp: Date.now() + 100,
        });
        break;

      case "IDLE":
        if (lastDecision?.action === "HOLD") {
          newLogs.push({
            id: logIdRef.current++,
            text: "[CIRCLE ARC] SAFE HARBOR",
            type: "info",
            timestamp: Date.now(),
          });
        }
        break;
    }

    // Decision logs
    if (lastDecision) {
      const confidence = Math.round(lastDecision.confidence * 100);
      newLogs.push({
        id: logIdRef.current++,
        text: `${lastDecision.action} [${confidence}%]`,
        type: lastDecision.action === "DEPLOY" ? "success" :
              lastDecision.action === "WITHDRAW" ? "warning" :
              lastDecision.action === "EMERGENCY_EXIT" ? "error" : "info",
        timestamp: Date.now() + 200,
      });
    }

    if (newLogs.length > 0) {
      setLogs(prev => [...newLogs, ...prev].slice(0, 8));
    }
  }, [agentState, isAgentRunning]);

  // Clear logs when agent stops
  useEffect(() => {
    if (!isAgentRunning) {
      lastActionRef.current = null;
    }
  }, [isAgentRunning]);

  if (logs.length === 0) return null;

  return (
    <div className="fixed top-6 left-6 z-50 terminal max-w-xs">
      {logs.map((log, index) => (
        <div
          key={log.id}
          className={`terminal-line ${log.type}`}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <span className="text-whisper mr-2">{">"}</span>
          {log.text}
        </div>
      ))}
    </div>
  );
}
