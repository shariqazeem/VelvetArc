"use client";

import { useEffect, useState, useRef } from "react";
import { useVelvetStore } from "@/hooks/useVelvetStore";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "error";
  timestamp: number;
}

export function TerminalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { agentState, isAgentRunning } = useVelvetStore();
  const logIdRef = useRef(0);
  const lastActionRef = useRef<string | null>(null);

  // Generate logs based on agent state
  useEffect(() => {
    if (!isAgentRunning) return;

    const { currentState, lastDecision, lastConditions } = agentState;

    // Only add log if action changed
    const currentAction = `${currentState}-${lastDecision?.action}`;
    if (currentAction === lastActionRef.current) return;
    lastActionRef.current = currentAction;

    const newLogs: LogEntry[] = [];

    // State-based logs
    switch (currentState) {
      case "SCANNING":
        newLogs.push({
          id: logIdRef.current++,
          text: "SCANNING VOLATILITY...",
          type: "info",
          timestamp: Date.now(),
        });
        break;

      case "ANALYZING":
        if (lastConditions) {
          newLogs.push({
            id: logIdRef.current++,
            text: `VOL_INDEX: ${lastConditions.volatilityIndex} [${lastConditions.volatility}]`,
            type: lastConditions.volatility === "LOW" ? "success" :
                  lastConditions.volatility === "HIGH" ? "warning" : "info",
            timestamp: Date.now(),
          });
        }
        break;

      case "BRIDGING_TO_BASE":
        newLogs.push({
          id: logIdRef.current++,
          text: "BRIDGE DETECTED... [LI.FI]",
          type: "info",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "CCTP BURN INITIATED",
          type: "warning",
          timestamp: Date.now() + 100,
        });
        break;

      case "FARMING":
        newLogs.push({
          id: logIdRef.current++,
          text: "YIELD ACTIVE [UNISWAP V4]",
          type: "success",
          timestamp: Date.now(),
        });
        break;

      case "BRIDGING_TO_ARC":
        newLogs.push({
          id: logIdRef.current++,
          text: "WITHDRAWAL INITIATED",
          type: "warning",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "RETURNING TO ARC...",
          type: "info",
          timestamp: Date.now() + 100,
        });
        break;

      case "CIRCUIT_BREAKER":
        newLogs.push({
          id: logIdRef.current++,
          text: "⚠ CIRCUIT BREAKER",
          type: "error",
          timestamp: Date.now(),
        });
        newLogs.push({
          id: logIdRef.current++,
          text: "EMERGENCY EXIT COMPLETE",
          type: "error",
          timestamp: Date.now() + 100,
        });
        break;

      case "IDLE":
        if (lastDecision?.action === "HOLD") {
          newLogs.push({
            id: logIdRef.current++,
            text: "HOLDING... [SAFE HARBOR]",
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
