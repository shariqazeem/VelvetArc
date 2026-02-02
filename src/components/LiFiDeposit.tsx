"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import type { WidgetConfig } from "@lifi/widget";

// Dynamic import to avoid SSR issues
const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[480px] flex items-center justify-center">
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
  // Memoize config to prevent re-renders
  const widgetConfig = useMemo((): Partial<WidgetConfig> => ({
    appearance: "dark",
    variant: "compact",
    subvariant: "default",
    // Pre-configure destination
    toChain: 8453, // Base mainnet
    toToken: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // USDC on Base
    // Styling to match our minimalist design
    theme: {
      palette: {
        primary: { main: "#ffffff" },
        secondary: { main: "#a3a3a3" },
        background: {
          default: "#000000",
          paper: "#0a0a0a",
        },
        text: {
          primary: "#ffffff",
          secondary: "#a3a3a3",
        },
      },
      shape: {
        borderRadius: 12,
        borderRadiusSecondary: 8,
      },
      typography: {
        fontFamily: "inherit",
      },
      container: {
        boxShadow: "none",
        borderRadius: "16px",
      },
    },
    // Hide unnecessary UI for cleaner look
    hiddenUI: ["appearance", "poweredBy", "language"],
    // Allow popular chains
    chains: {
      allow: [1, 10, 137, 42161, 8453, 84532], // ETH, OP, Polygon, Arb, Base, Base Sepolia
    },
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
            className="relative z-10 w-full max-w-[392px] mx-4"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-medium text-white">Fund Agent</h2>
                <p className="text-xs text-white/40">Cross-chain via LI.FI</p>
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

            {/* Destination info */}
            <div className="mb-3 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/40">Destination</span>
                <code className="text-white/60 font-mono">
                  {agentAddress.slice(0, 6)}...{agentAddress.slice(-4)} (Base)
                </code>
              </div>
            </div>

            {/* Widget Container */}
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-black">
              <LiFiWidget integrator="velvet-arc" config={widgetConfig} />
            </div>

            {/* Footer */}
            <div className="mt-4 text-center">
              <p className="text-[10px] text-white/30">
                Funds arrive as USDC on Base → Agent deploys to Uniswap V4
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
