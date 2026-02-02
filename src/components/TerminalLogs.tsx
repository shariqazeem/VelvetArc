"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { useAccount } from "wagmi";
import { useVaultData, useUserPosition } from "@/hooks/useContracts";

interface LogEntry {
  id: number;
  text: string;
  type: "info" | "success" | "warning" | "error" | "action";
  timestamp: number;
}

// Format time as HH:MM:SS
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toTimeString().slice(0, 8);
}

export function TerminalLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const { agentState, isAgentRunning, vaultState } = useVelvetStore();
  const { isConnected } = useAccount();
  const { shares } = useUserPosition();
  const { vaultBalance } = useVaultData();
  const logIdRef = useRef(0);
  const lastStateRef = useRef<string | null>(null);
  const hasShownIntroRef = useRef(false);

  const addLog = (text: string, type: LogEntry["type"]) => {
    const newLog: LogEntry = {
      id: logIdRef.current++,
      text,
      type,
      timestamp: Date.now(),
    };
    setLogs(prev => [newLog, ...prev].slice(0, 10));
  };

  // Show intro logs when user has deposited but agent not running
  useEffect(() => {
    if (hasShownIntroRef.current) return;
    if (!isConnected || parseFloat(shares) <= 0) return;
    if (isAgentRunning) return;

    hasShownIntroRef.current = true;

    const now = Date.now();
    setLogs([
      {
        id: logIdRef.current++,
        text: `Vault ready: $${parseFloat(vaultBalance).toFixed(2)} TVL`,
        type: "success",
        timestamp: now + 200,
      },
      {
        id: logIdRef.current++,
        text: "Your position detected",
        type: "info",
        timestamp: now + 100,
      },
      {
        id: logIdRef.current++,
        text: "Click START to activate agent",
        type: "warning",
        timestamp: now,
      },
    ]);
  }, [isConnected, shares, vaultBalance, isAgentRunning]);

  // Reset intro flag when agent starts
  useEffect(() => {
    if (isAgentRunning) {
      hasShownIntroRef.current = true;
      addLog("velvet-agent.eth activated", "success");
    }
  }, [isAgentRunning]);

  // Generate enhanced storytelling logs based on agent state
  useEffect(() => {
    if (!isAgentRunning) return;

    const { currentState, lastDecision, lastConditions } = agentState;

    // Only add log if state changed
    const stateKey = `${currentState}-${lastDecision?.action}-${lastConditions?.volatility}`;
    if (stateKey === lastStateRef.current) return;
    lastStateRef.current = stateKey;

    // State-based storytelling logs
    switch (currentState) {
      case "SCANNING":
        if (lastConditions) {
          const priceChange = lastConditions.priceChange24h?.toFixed(2) || "0";
          const sign = parseFloat(priceChange) >= 0 ? "+" : "";
          addLog(
            `Scanning... ETH $${lastConditions.ethPrice?.toFixed(0) || "3000"} (${sign}${priceChange}%)`,
            "info"
          );
        } else {
          addLog("Scanning market conditions...", "info");
        }
        break;

      case "ANALYZING":
        if (lastConditions) {
          const volEmoji = lastConditions.volatility === "LOW" ? "" :
                          lastConditions.volatility === "MEDIUM" ? "" :
                          lastConditions.volatility === "HIGH" ? "" : "";
          addLog(
            `${volEmoji} Volatility: ${lastConditions.volatility} (index: ${lastConditions.volatilityIndex?.toFixed(0) || "0"})`,
            lastConditions.volatility === "LOW" ? "success" :
            lastConditions.volatility === "EXTREME" ? "error" : "warning"
          );
        }
        break;

      case "BRIDGING_TO_BASE":
        addLog("DECISION: Deploy capital to Base", "action");
        setTimeout(() => addLog("LI.FI bridge initiated...", "info"), 500);
        setTimeout(() => addLog("Circle Gateway: TX pending", "info"), 1000);
        break;

      case "FARMING":
        addLog("Deployed on Uniswap V4!", "success");
        if (lastDecision?.suggestedFee) {
          addLog(`Dynamic fee: ${(lastDecision.suggestedFee / 100).toFixed(2)}%`, "success");
        }
        addLog("Yield generation active", "success");
        break;

      case "BRIDGING_TO_ARC":
        addLog("DECISION: Return to safe harbor", "action");
        setTimeout(() => addLog("Withdrawing from Base...", "warning"), 500);
        setTimeout(() => addLog("LI.FI bridge: Arc bound", "info"), 1000);
        break;

      case "CIRCUIT_BREAKER":
        addLog("CIRCUIT BREAKER TRIGGERED", "error");
        addLog("Emergency exit to Arc", "error");
        addLog("Capital protected", "warning");
        break;

      case "IDLE":
        if (lastDecision?.action === "HOLD") {
          addLog("Safe harbor: Monitoring markets", "info");
        }
        break;
    }

    // Decision reasoning
    if (lastDecision && lastDecision.action !== "HOLD") {
      const confidence = Math.round(lastDecision.confidence * 100);
      setTimeout(() => {
        addLog(`Confidence: ${confidence}%`, "info");
      }, 300);
    }
  }, [agentState, isAgentRunning]);

  // Clear logs when agent stops
  useEffect(() => {
    if (!isAgentRunning && lastStateRef.current !== null) {
      lastStateRef.current = null;
      addLog("Agent paused", "warning");
    }
  }, [isAgentRunning]);

  if (logs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-6 left-6 z-50 max-w-sm"
    >
      <div className="glass-subtle rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isAgentRunning ? "bg-green-500 animate-pulse" : "bg-white/30"}`} />
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              Agent Log
            </span>
          </div>
          <span className="text-[10px] text-white/30 font-mono">
            {formatTime(Date.now())}
          </span>
        </div>

        {/* Logs */}
        <div className="p-2 space-y-1 max-h-48 overflow-hidden">
          <AnimatePresence mode="popLayout">
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-xs font-mono px-2 py-1 rounded flex items-start gap-2 ${
                  log.type === "success" ? "bg-green-500/10 text-green-400" :
                  log.type === "warning" ? "bg-yellow-500/10 text-yellow-400" :
                  log.type === "error" ? "bg-red-500/10 text-red-400" :
                  log.type === "action" ? "bg-purple-500/10 text-purple-400" :
                  "bg-white/5 text-white/60"
                }`}
              >
                <span className="text-white/30 shrink-0">
                  {formatTime(log.timestamp).slice(0, 5)}
                </span>
                <span className="leading-relaxed">{log.text}</span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
