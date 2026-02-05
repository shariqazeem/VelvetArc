"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CrossChainFlowPanelProps {
  capitalState: "PROTECTED" | "EARNING" | "CIRCUIT_BREAKER";
  arcBalance: number;
  baseBalance: number;
  totalManaged: number;
  bridgeDecision: {
    action: string;
    reason: string;
    confidence: number;
    timestamp: number;
  } | null;
  transactions: {
    hash: string;
    type: string;
    timestamp: number;
  }[];
  ethPrice: number;
  volatility: string;
}

const CHAIN_EXPLORERS = {
  arc: "https://testnet.arcscan.io/tx/",
  base: "https://sepolia.basescan.org/tx/",
};

export function CrossChainFlowPanel({
  capitalState,
  arcBalance,
  baseBalance,
  totalManaged,
  bridgeDecision,
  transactions,
  ethPrice,
  volatility,
}: CrossChainFlowPanelProps) {
  const [showTxHistory, setShowTxHistory] = useState(false);

  // Calculate flow percentages
  const arcPercent = totalManaged > 0 ? (arcBalance / totalManaged) * 100 : 50;
  const basePercent = totalManaged > 0 ? (baseBalance / totalManaged) * 100 : 50;

  // Determine flow state
  const isFlowingToBase = capitalState === "EARNING";
  const isFlowingToArc = capitalState === "PROTECTED" || capitalState === "CIRCUIT_BREAKER";
  const isAnimating = isFlowingToBase || isFlowingToArc;

  // Get state config - clean, minimal
  const getStateLabel = () => {
    switch (capitalState) {
      case "EARNING": return "Yield Active";
      case "PROTECTED": return "Safe Harbor";
      case "CIRCUIT_BREAKER": return "Protected";
      default: return "Monitoring";
    }
  };

  // Filter bridge transactions
  const bridgeTxs = transactions
    .filter(tx => tx.type === "BRIDGE" || tx.type === "LIQUIDITY_DEPLOY")
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* State Indicator - Minimal */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${
            capitalState === "EARNING" ? "bg-white" :
            capitalState === "CIRCUIT_BREAKER" ? "bg-white/40" :
            "bg-white/60"
          }`} />
          <span className="text-sm font-medium text-white/90">{getStateLabel()}</span>
        </div>
        <span className="text-xs text-white/40 font-mono">
          ${ethPrice.toLocaleString()} · {volatility}
        </span>
      </div>

      {/* Flow Visualization - Clean Lines */}
      <div className="relative h-20">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 300 80">
          {/* Connection Line */}
          <line
            x1="50" y1="40" x2="250" y2="40"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="1"
          />

          {/* Animated Flow Indicator */}
          {isAnimating && (
            <motion.circle
              r="3"
              fill="white"
              initial={{ opacity: 0 }}
              animate={{
                cx: isFlowingToBase ? [50, 250] : [250, 50],
                cy: 40,
                opacity: [0, 1, 1, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          )}
        </svg>

        {/* Arc Node */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ opacity: capitalState !== "EARNING" ? 1 : 0.5 }}
            className="text-center"
          >
            <div className={`w-12 h-12 rounded-full border ${
              capitalState !== "EARNING" ? "border-white/30 bg-white/5" : "border-white/10"
            } flex items-center justify-center mx-auto`}>
              <span className="text-[10px] font-bold text-white/80">ARC</span>
            </div>
            <div className="mt-2 text-xs font-mono text-white/60">${arcBalance.toFixed(2)}</div>
          </motion.div>
        </div>

        {/* Bridge Indicator */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <motion.div
            animate={{ scale: isAnimating ? [1, 1.1, 1] : 1 }}
            transition={{ duration: 2, repeat: isAnimating ? Infinity : 0 }}
            className={`w-8 h-8 rounded-lg border ${
              isAnimating ? "border-white/30" : "border-white/10"
            } flex items-center justify-center`}
          >
            <svg className="w-4 h-4 text-white/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 7h12M20 7l-4-4m4 4l-4 4M16 17H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </motion.div>
        </div>

        {/* Base Node */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <motion.div
            animate={{ opacity: capitalState === "EARNING" ? 1 : 0.5 }}
            className="text-center"
          >
            <div className={`w-12 h-12 rounded-full border ${
              capitalState === "EARNING" ? "border-white/30 bg-white/5" : "border-white/10"
            } flex items-center justify-center mx-auto`}>
              <span className="text-[10px] font-bold text-white/80">BASE</span>
            </div>
            <div className="mt-2 text-xs font-mono text-white/60">${baseBalance.toFixed(2)}</div>
          </motion.div>
        </div>
      </div>

      {/* Capital Distribution - Minimal Bar */}
      <div className="space-y-2">
        <div className="h-1 bg-white/5 rounded-full overflow-hidden flex">
          <motion.div
            className="h-full bg-white/40"
            initial={{ width: 0 }}
            animate={{ width: `${arcPercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <motion.div
            className="h-full bg-white/20"
            initial={{ width: 0 }}
            animate={{ width: `${basePercent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-white/30">
          <span>Arc {arcPercent.toFixed(0)}%</span>
          <span>Base {basePercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Bridge Decision - If Available */}
      {bridgeDecision && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg bg-white/[0.02] border border-white/5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Agent Decision</span>
            <span className="text-[10px] text-white/30 font-mono">
              {bridgeDecision.confidence}%
            </span>
          </div>
          <p className="text-xs text-white/70">{bridgeDecision.action}</p>
        </motion.div>
      )}

      {/* Transaction History Toggle */}
      <button
        onClick={() => setShowTxHistory(!showTxHistory)}
        className="w-full flex items-center justify-between py-2 text-[10px] text-white/30 hover:text-white/50 transition-colors"
      >
        <span>Transactions ({bridgeTxs.length})</span>
        <motion.span animate={{ rotate: showTxHistory ? 180 : 0 }}>↓</motion.span>
      </button>

      <AnimatePresence>
        {showTxHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-1 overflow-hidden"
          >
            {bridgeTxs.length > 0 ? bridgeTxs.map((tx, i) => (
              <a
                key={tx.hash}
                href={`${CHAIN_EXPLORERS.base}${tx.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2 rounded bg-white/[0.02] hover:bg-white/[0.04] transition-colors group"
              >
                <span className="text-[10px] font-mono text-white/40 group-hover:text-white/60">
                  {tx.hash.slice(0, 8)}...{tx.hash.slice(-6)}
                </span>
                <span className="text-[9px] text-white/20">
                  {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </a>
            )) : (
              <div className="text-center py-3 text-[10px] text-white/20">
                No transactions yet
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
