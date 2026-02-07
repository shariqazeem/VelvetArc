"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { YellowClient } from "@/lib/yellow/YellowClient";

interface EnrichedTransaction {
  hash: string;
  type: string;
  chain: "arc" | "base" | "yellow";
  timestamp: number;
  description?: string;
}

const TX_CONFIG: Record<string, { label: string; chain: "arc" | "base" | "yellow" }> = {
  FEE_UPDATE: { label: "Hook Fee Update", chain: "base" },
  LIQUIDITY_DEPLOY: { label: "Deploy Liquidity", chain: "base" },
  BRIDGE: { label: "Cross-chain Bridge", chain: "base" },
  VOLATILITY_UPDATE: { label: "Volatility Update", chain: "base" },
  DEPOSIT: { label: "Vault Deposit", chain: "arc" },
  WITHDRAW: { label: "Vault Withdraw", chain: "arc" },
  CIRCUIT_BREAKER: { label: "Circuit Breaker", chain: "arc" },
  YELLOW_PAYMENT: { label: "Instant Payment", chain: "yellow" },
  YELLOW_SESSION: { label: "State Channel", chain: "yellow" },
};

function getExplorerUrl(hash: string, chain: "arc" | "base" | "yellow"): string | null {
  switch (chain) {
    case "arc":
      return `https://testnet.arcscan.app/tx/${hash}`;
    case "base":
      return `https://sepolia.basescan.org/tx/${hash}`;
    case "yellow":
      return null; // Off-chain, no explorer
    default:
      return `https://sepolia.basescan.org/tx/${hash}`;
  }
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return new Date(timestamp).toLocaleDateString();
}

function getChainFromType(type: string): "arc" | "base" | "yellow" {
  return TX_CONFIG[type]?.chain || "base";
}

interface TransactionHistoryProps {
  showTitle?: boolean;
  maxItems?: number;
  className?: string;
}

export function TransactionHistory({
  showTitle = true,
  maxItems = 10,
  className = ""
}: TransactionHistoryProps) {
  const { state } = useAgentAPI();
  const [filter, setFilter] = useState<"all" | "arc" | "base" | "yellow">("all");
  const [yellowTxCount, setYellowTxCount] = useState(0);

  // Track Yellow Network transactions
  useEffect(() => {
    const client = YellowClient.getInstance();
    const unsubscribe = client.subscribe((yellowState) => {
      const txLogs = yellowState.logs.filter(l => l.type === "tx");
      setYellowTxCount(txLogs.length);
    });
    return unsubscribe;
  }, []);

  // Enrich transactions with chain info
  const enrichedTx: EnrichedTransaction[] = (state.transactions || []).map((tx) => ({
    ...tx,
    chain: getChainFromType(tx.type),
    description: TX_CONFIG[tx.type]?.label || tx.type.replace(/_/g, " "),
  }));

  // Filter transactions
  const filteredTx = filter === "all"
    ? enrichedTx
    : enrichedTx.filter((tx) => tx.chain === filter);

  const displayedTx = filteredTx.slice(0, maxItems);

  // Count by chain
  const arcCount = enrichedTx.filter(t => t.chain === "arc").length;
  const baseCount = enrichedTx.filter(t => t.chain === "base").length;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/30 uppercase tracking-wider">Transactions</span>
          <div className="flex gap-1">
            {(["all", "arc", "base", "yellow"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-0.5 text-[10px] rounded transition-colors ${
                  filter === f
                    ? "bg-white/10 text-white/70"
                    : "text-white/30 hover:text-white/50"
                }`}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transaction list */}
      <div className="space-y-1">
        <AnimatePresence mode="popLayout">
          {displayedTx.length > 0 ? (
            displayedTx.map((tx, i) => {
              const explorerUrl = getExplorerUrl(tx.hash, tx.chain);

              const content = (
                <div className="flex items-center gap-3 w-full">
                  {/* Chain indicator */}
                  <div
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      tx.chain === "arc"
                        ? "bg-blue-400/60"
                        : tx.chain === "yellow"
                        ? "bg-yellow-400/60"
                        : "bg-white/40"
                    }`}
                  />

                  {/* Type */}
                  <span className="text-xs text-white/50 flex-1 truncate">
                    {tx.description}
                  </span>

                  {/* Hash */}
                  <span className="text-[10px] text-white/20 font-mono shrink-0">
                    {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                  </span>

                  {/* Time */}
                  <span className="text-[10px] text-white/20 shrink-0 w-8 text-right">
                    {formatTimeAgo(tx.timestamp)}
                  </span>
                </div>
              );

              return (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.02 }}
                >
                  {explorerUrl ? (
                    <a
                      href={explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center py-2 px-3 -mx-3 rounded hover:bg-white/[0.02] transition-colors group"
                    >
                      {content}
                      <span className="text-xs text-white/20 group-hover:text-white/40 ml-2">↗</span>
                    </a>
                  ) : (
                    <div className="flex items-center py-2 px-3 -mx-3">
                      {content}
                      <span className="text-[9px] text-white/20 ml-2">off-chain</span>
                    </div>
                  )}
                </motion.div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-xs text-white/20">No transactions yet</p>
              <p className="text-[10px] text-white/10 mt-1">Start the agent to see on-chain activity</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer stats */}
      {(enrichedTx.length > 0 || yellowTxCount > 0) && (
        <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-white/20">
          <span>{enrichedTx.length + yellowTxCount} total</span>
          <div className="flex gap-3">
            {arcCount > 0 && <span>Arc: {arcCount}</span>}
            {baseCount > 0 && <span>Base: {baseCount}</span>}
            {yellowTxCount > 0 && <span>Yellow: {yellowTxCount}</span>}
          </div>
        </div>
      )}

      {/* Explorer links */}
      {state.agentAddress && (
        <div className="flex gap-4 text-[10px]">
          <a
            href={`https://testnet.arcscan.app/address/${state.agentAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            Arc Explorer ↗
          </a>
          <a
            href={`https://sepolia.basescan.org/address/${state.agentAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 hover:text-white/40 transition-colors"
          >
            Base Explorer ↗
          </a>
        </div>
      )}
    </div>
  );
}
