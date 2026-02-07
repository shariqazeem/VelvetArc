"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HeroDashboardProps {
  capitalState: "PROTECTED" | "EARNING" | "CIRCUIT_BREAKER";
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  arcBalance: number;
  baseBalance: number;
  totalManaged: number;
  ethPrice: number;
  priceChange24h: number;
  currentFee: number;
  isRunning: boolean;
  iteration: number;
  transactions: Array<{
    hash: string;
    type: string;
    timestamp: number;
  }>;
  lastDecision: {
    action: string;
    reason: string;
    confidence: number;
    timestamp: number;
  } | null;
}

export function HeroDashboard({
  capitalState,
  volatility,
  arcBalance,
  baseBalance,
  totalManaged,
  ethPrice,
  priceChange24h,
  currentFee,
  isRunning,
  iteration,
  transactions,
  lastDecision,
}: HeroDashboardProps) {
  const [showAllTx, setShowAllTx] = useState(false);
  const displayedTx = showAllTx ? transactions.slice(0, 8) : transactions.slice(0, 3);

  const arcPercent = totalManaged > 0 ? (arcBalance / totalManaged) * 100 : 100;

  const getStatusLabel = () => {
    switch (capitalState) {
      case "PROTECTED": return "Safe Harbor";
      case "EARNING": return "Earning";
      case "CIRCUIT_BREAKER": return "Protected";
    }
  };

  const getStatusDescription = () => {
    switch (capitalState) {
      case "PROTECTED": return "Capital secured on Arc";
      case "EARNING": return "Active on Uniswap V4";
      case "CIRCUIT_BREAKER": return "Emergency withdrawal";
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className={`w-2 h-2 rounded-full ${
              capitalState === "EARNING" ? "bg-white" :
              capitalState === "CIRCUIT_BREAKER" ? "bg-white/50" : "bg-white/70"
            }`} />
            <h1 className="text-3xl font-light tracking-tight">{getStatusLabel()}</h1>
          </div>
          <p className="text-sm text-white/40 ml-5">{getStatusDescription()}</p>
        </div>
        <div className="text-right">
          <div className="text-4xl font-light tracking-tight">
            ${totalManaged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-white/30 mt-1">Total Managed</div>
        </div>
      </div>

      {/* Capital Distribution */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-white/40">
          <span>Arc · ${arcBalance.toFixed(2)}</span>
          <span>Base · ${baseBalance.toFixed(2)}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40"
            animate={{ width: `${arcPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div>
          <div className="text-xs text-white/30 mb-1">ETH</div>
          <div className="text-xl font-light">${ethPrice.toLocaleString()}</div>
          <div className={`text-xs ${priceChange24h >= 0 ? "text-white/50" : "text-white/40"}`}>
            {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Volatility</div>
          <div className="text-xl font-light">{volatility}</div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Hook Fee</div>
          <div className="text-xl font-light">{(currentFee / 100).toFixed(2)}%</div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Confidence</div>
          <div className="text-xl font-light">
            {lastDecision ? `${(lastDecision.confidence * 100).toFixed(0)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Last Decision */}
      {lastDecision && (
        <div className="py-4 border-t border-white/5">
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/30 uppercase tracking-wider">Decision</span>
            <span className="text-sm text-white/70">{lastDecision.action}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/40">{lastDecision.reason}</span>
          </div>
        </div>
      )}

      {/* Transactions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/30 uppercase tracking-wider">Transactions</span>
          {transactions.length > 3 && (
            <button
              onClick={() => setShowAllTx(!showAllTx)}
              className="text-xs text-white/30 hover:text-white/50"
            >
              {showAllTx ? "Show less" : `All (${transactions.length})`}
            </button>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {displayedTx.length > 0 ? (
            <div className="space-y-1">
              {displayedTx.map((tx, i) => (
                <motion.a
                  key={tx.hash}
                  href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between py-2 px-3 -mx-3 rounded hover:bg-white/[0.02] transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50">{tx.type.replace(/_/g, " ")}</span>
                    <span className="text-xs text-white/20 font-mono">
                      {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                    </span>
                  </div>
                  <span className="text-xs text-white/20 group-hover:text-white/40">
                    View ↗
                  </span>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-white/20">
              No transactions yet
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
