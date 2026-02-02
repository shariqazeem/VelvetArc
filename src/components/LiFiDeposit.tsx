"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { WidgetConfig } from "@lifi/widget";

// Dynamic import to avoid SSR issues
const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    )
  }
);

interface LiFiDepositProps {
  isOpen: boolean;
  onClose: () => void;
  agentAddress: string;
}

export function LiFiDeposit({ isOpen, onClose, agentAddress }: LiFiDepositProps) {
  const [mode, setMode] = useState<"mainnet" | "testnet">("testnet");

  // LI.FI config for mainnet
  const widgetConfig = useMemo((): Partial<WidgetConfig> => ({
    appearance: "dark",
    variant: "compact",
    subvariant: "default",
    toChain: 8453, // Base mainnet
    toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    theme: {
      palette: {
        primary: { main: "#ffffff" },
        secondary: { main: "#a3a3a3" },
        background: { default: "#000000", paper: "#0a0a0a" },
        text: { primary: "#ffffff", secondary: "#a3a3a3" },
      },
      shape: { borderRadius: 12, borderRadiusSecondary: 8 },
      typography: { fontFamily: "inherit" },
      container: { boxShadow: "none", borderRadius: "16px" },
    },
    hiddenUI: ["appearance", "poweredBy", "language"],
    chains: { allow: [1, 10, 137, 42161, 8453] },
  }), []);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative z-10 w-full max-w-[420px] mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Fund Agent</h2>
                <p className="text-xs text-white/40">Send USDC to the agent treasury</p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setMode("testnet")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === "testnet"
                    ? "bg-white/10 text-white"
                    : "bg-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                Testnet (Demo)
              </button>
              <button
                onClick={() => setMode("mainnet")}
                className={`flex-1 py-2 rounded-lg text-sm transition-all ${
                  mode === "mainnet"
                    ? "bg-white/10 text-white"
                    : "bg-white/5 text-white/40 hover:text-white/60"
                }`}
              >
                Mainnet (LI.FI)
              </button>
            </div>

            {/* Content */}
            <div className="rounded-2xl border border-white/10 bg-[#0a0a0a] overflow-hidden">
              {mode === "testnet" ? (
                /* Testnet Instructions */
                <div className="p-6 space-y-4">
                  <div className="text-center mb-6">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm text-white/60">Demo uses Base Sepolia testnet</p>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40 uppercase mb-1">Step 1: Get Base Sepolia ETH</p>
                      <a
                        href="https://www.alchemy.com/faucets/base-sepolia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Alchemy Faucet →
                      </a>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40 uppercase mb-1">Step 2: Get Base Sepolia USDC</p>
                      <a
                        href="https://faucet.circle.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-400 hover:text-blue-300"
                      >
                        Circle USDC Faucet →
                      </a>
                    </div>

                    <div className="p-3 rounded-lg bg-white/5">
                      <p className="text-[10px] text-white/40 uppercase mb-1">Step 3: Agent Wallet</p>
                      <div className="flex items-center justify-between">
                        <code className="text-xs text-white/60 font-mono">
                          {agentAddress.slice(0, 10)}...{agentAddress.slice(-8)}
                        </code>
                        <button
                          onClick={() => navigator.clipboard.writeText(agentAddress)}
                          className="text-xs text-white/40 hover:text-white/60"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/5">
                    <p className="text-[10px] text-white/30 text-center">
                      Send test USDC to the agent address, then click "Start Agent" to watch it work
                    </p>
                  </div>
                </div>
              ) : (
                /* LI.FI Widget for Mainnet */
                <div>
                  <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/40">Destination</span>
                      <code className="text-white/60 font-mono">
                        {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)} (Base)
                      </code>
                    </div>
                  </div>
                  <LiFiWidget integrator="velvet-arc" config={widgetConfig} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-white/30">
                {mode === "testnet"
                  ? "Testnet tokens have no real value"
                  : "Powered by LI.FI cross-chain aggregation"
                }
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
