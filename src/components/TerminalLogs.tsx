"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useAccount } from "wagmi";
import { useUserPosition } from "@/hooks/useContracts";

interface DisplayLog {
  id: string;
  text: string;
  type: "info" | "success" | "warning" | "error" | "action" | "decision";
  timestamp: number;
  txHash?: string;
}

// Format time as HH:MM:SS
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toTimeString().slice(0, 8);
}

// Extract tx hash from log message if present
function extractTxHash(message: string): { text: string; txHash?: string } {
  // Match patterns like "(tx: 0x...)" or "TX: 0x..."
  const txMatch = message.match(/\(?tx:\s*(0x[a-fA-F0-9]{64})\)?/i);
  if (txMatch) {
    const txHash = txMatch[1];
    const text = message.replace(txMatch[0], "").trim();
    return { text: text || "Transaction sent", txHash };
  }

  // Match standalone hash patterns
  const hashMatch = message.match(/(0x[a-fA-F0-9]{64})/);
  if (hashMatch) {
    const txHash = hashMatch[1];
    const text = message.replace(txHash, "[tx]").trim();
    return { text, txHash };
  }

  return { text: message };
}

// Map agent log type to display type
function mapLogType(type: string): DisplayLog["type"] {
  switch (type) {
    case "success":
      return "success";
    case "error":
      return "error";
    case "decision":
      return "decision";
    case "action":
      return "action";
    default:
      return "info";
  }
}

// Truncate hash for display
function truncateHash(hash: string): string {
  return `${hash.slice(0, 10)}...${hash.slice(-6)}`;
}

export function TerminalLogs() {
  const { state, isConnected: agentConnected } = useAgentAPI();
  const { isConnected: walletConnected } = useAccount();
  const { shares } = useUserPosition();
  const [introShown, setIntroShown] = useState(false);
  const [introLogs, setIntroLogs] = useState<DisplayLog[]>([]);
  const prevLogsLengthRef = useRef(0);

  // Convert agent logs to display format
  const agentLogs = useMemo((): DisplayLog[] => {
    if (!state.logs || state.logs.length === 0) return [];

    return state.logs.slice(0, 15).map((log, index) => {
      const { text, txHash } = extractTxHash(log.message);
      return {
        id: `agent-${log.timestamp}-${index}`,
        text,
        type: mapLogType(log.type),
        timestamp: log.timestamp,
        txHash,
      };
    });
  }, [state.logs]);

  // Show intro logs when user has deposited (shares > 0) and agent not running
  useEffect(() => {
    if (introShown) return;
    if (!walletConnected) return;

    const userShares = parseFloat(shares || "0");
    if (userShares <= 0) return;
    if (state.isRunning) return;

    setIntroShown(true);
    const now = Date.now();

    setIntroLogs([
      {
        id: "intro-3",
        text: "Deposit detected in vault",
        type: "success",
        timestamp: now,
      },
      {
        id: "intro-2",
        text: `Your shares: ${userShares.toFixed(2)}`,
        type: "info",
        timestamp: now + 100,
      },
      {
        id: "intro-1",
        text: "Click START to activate agent",
        type: "action",
        timestamp: now + 200,
      },
    ]);
  }, [walletConnected, shares, state.isRunning, introShown]);

  // Clear intro logs when agent starts and has real logs
  useEffect(() => {
    if (state.isRunning && agentLogs.length > 0) {
      setIntroLogs([]);
    }
  }, [state.isRunning, agentLogs.length]);

  // Reset intro shown flag when wallet disconnects
  useEffect(() => {
    if (!walletConnected) {
      setIntroShown(false);
      setIntroLogs([]);
    }
  }, [walletConnected]);

  // Combine logs: agent logs take priority, then intro logs
  const displayLogs = useMemo(() => {
    if (agentLogs.length > 0) {
      return agentLogs;
    }
    return introLogs;
  }, [agentLogs, introLogs]);

  // Don't render if no logs
  if (displayLogs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-sm"
    >
      <div className="glass-subtle rounded-lg overflow-hidden">
        {/* Header */}
        <div className="px-3 py-2 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                state.isRunning
                  ? "bg-green-500 animate-pulse"
                  : agentConnected
                  ? "bg-yellow-500"
                  : "bg-white/30"
              }`}
            />
            <span className="text-[10px] text-white/50 font-mono uppercase tracking-wider">
              velvet-agent.eth
            </span>
          </div>
          <div className="flex items-center gap-2">
            {state.iteration > 0 && (
              <span className="text-[10px] text-white/30 font-mono">
                #{state.iteration}
              </span>
            )}
            <span className="text-[10px] text-white/30 font-mono">
              {formatTime(Date.now())}
            </span>
          </div>
        </div>

        {/* Logs */}
        <div className="p-2 space-y-1 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          <AnimatePresence mode="popLayout">
            {displayLogs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -10, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className={`text-xs font-mono px-2 py-1.5 rounded flex items-start gap-2 ${
                  log.type === "success"
                    ? "bg-green-500/10 text-green-400"
                    : log.type === "warning"
                    ? "bg-yellow-500/10 text-yellow-400"
                    : log.type === "error"
                    ? "bg-red-500/10 text-red-400"
                    : log.type === "action"
                    ? "bg-purple-500/10 text-purple-400"
                    : log.type === "decision"
                    ? "bg-blue-500/10 text-blue-400"
                    : "bg-white/5 text-white/60"
                }`}
              >
                <span className="text-white/30 shrink-0 text-[10px]">
                  {formatTime(log.timestamp).slice(0, 5)}
                </span>
                <span className="leading-relaxed flex-1">
                  {log.text}
                  {log.txHash && (
                    <>
                      {" "}
                      <a
                        href={`https://sepolia.basescan.org/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
                        title={log.txHash}
                      >
                        {truncateHash(log.txHash)}
                      </a>
                    </>
                  )}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Transaction count footer */}
        {state.transactions && state.transactions.length > 0 && (
          <div className="px-3 py-1.5 border-t border-white/5 flex items-center justify-between">
            <span className="text-[10px] text-white/30 font-mono">
              {state.transactions.length} tx{state.transactions.length !== 1 ? "s" : ""} executed
            </span>
            <a
              href={`https://sepolia.basescan.org/address/${state.agentAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-blue-400/60 hover:text-blue-400 font-mono transition-colors"
            >
              View all
            </a>
          </div>
        )}
      </div>
    </motion.div>
  );
}
