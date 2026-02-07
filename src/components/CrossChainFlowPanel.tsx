"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useAccount } from "wagmi";
import type { WidgetConfig } from "@lifi/widget";

// Dynamic import to avoid SSR issues with LiFi widget
const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[300px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-[10px] font-mono text-white/30">Loading bridge...</span>
        </div>
      </div>
    ),
  }
);

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

const widgetConfig: Partial<WidgetConfig> = {
  theme: {
    container: {
      border: "1px solid rgba(255, 255, 255, 0.05)",
      borderRadius: "16px",
      backgroundColor: "rgba(0, 0, 0, 0.2)",
    },
    palette: {
      primary: { main: "#ffffff" },
      secondary: { main: "#EAB308" },
    },
    shape: {
      borderRadius: 12,
      borderRadiusSecondary: 12,
    },
  },
  appearance: "dark",
  hiddenUI: ["walletMenu", "appearance", "language"],
  variant: "compact",
  subvariant: "default",
  fromChain: 84532, // Base Sepolia
  toChain: 11155111, // Sepolia
  fromToken: "0x0000000000000000000000000000000000000000",
  toToken: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
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
  const { isConnected } = useAccount();

  const getStateLabel = () => {
    switch (capitalState) {
      case "EARNING": return "Yield Active";
      case "PROTECTED": return "Safe Harbor";
      case "CIRCUIT_BREAKER": return "Protected";
      default: return "Monitoring";
    }
  };

  const bridgeTxs = transactions
    .filter(tx => tx.type === "BRIDGE" || tx.type === "LIQUIDITY_DEPLOY")
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* State Indicator */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${capitalState === "EARNING" ? "bg-emerald-500" :
              capitalState === "CIRCUIT_BREAKER" ? "bg-amber-500" :
                "bg-white/60"
            }`} />
          <span className="text-sm font-medium text-white/90">{getStateLabel()}</span>
        </div>
        <span className="text-xs text-white/40 font-mono">
          ${ethPrice.toLocaleString()} · {volatility}
        </span>
      </div>

      {/* LI.FI Widget */}
      <div className="relative z-10">
        <LiFiWidget integrator="velvet-arc-hackmoney2026" config={widgetConfig} />
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl z-20 pointer-events-none">
            <span className="text-xs text-white/50 font-mono">Connect wallet to bridge</span>
          </div>
        )}
      </div>

      {/* Bridge Decision */}
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
            {bridgeTxs.length > 0 ? bridgeTxs.map((tx) => (
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
