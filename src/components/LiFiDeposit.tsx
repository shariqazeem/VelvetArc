"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import to avoid SSR issues with LI.FI Widget
const LiFiWidgetDynamic = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  { ssr: false, loading: () => <div className="h-[480px] flex items-center justify-center text-white/40">Loading LI.FI...</div> }
);

interface LiFiDepositProps {
  isOpen: boolean;
  onClose: () => void;
  agentAddress: string;
}

export function LiFiDeposit({ isOpen, onClose, agentAddress }: LiFiDepositProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-sm rounded-t-2xl px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              Fund the Agent
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">via LI.FI</span>
            </h2>
            <p className="text-xs text-white/70">Deposit from any chain - arrives as USDC on Base</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Widget Container */}
        <div className="bg-[#0a0a0a] rounded-b-2xl overflow-hidden" style={{ height: 520 }}>
          <LiFiWidgetDynamic
            integrator="velvet-arc-hackmoney"
            config={{
              appearance: "dark",
              theme: {
                palette: {
                  primary: { main: "#a855f7" },
                  secondary: { main: "#ec4899" },
                  background: {
                    default: "#0a0a0a",
                    paper: "#171717",
                  },
                },
                shape: {
                  borderRadius: 12,
                  borderRadiusSecondary: 8,
                },
              },
              // Send to agent's wallet on Base
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              toAddress: agentAddress as any,
              toChain: 84532, // Base Sepolia
              toToken: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // USDC Base Sepolia
              // Testnets + Mainnets
              chains: {
                allow: [1, 10, 137, 42161, 8453, 84532, 11155111, 11155420, 421614],
              },
              hiddenUI: ["poweredBy"],
            }}
          />
        </div>

        {/* Footer Info */}
        <div className="mt-3 px-4 py-3 bg-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs text-white/60">Cross-Chain Liquidity Aggregation</span>
          </div>
          <p className="text-[10px] text-white/40 mb-2">
            LI.FI routes your funds through the best DEXs and bridges. Supports 60+ chains.
          </p>
          <div className="flex items-center gap-2 text-[10px]">
            <span className="text-white/30">Destination:</span>
            <code className="text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
              {agentAddress.slice(0, 8)}...{agentAddress.slice(-6)}
            </code>
            <span className="text-white/30">on Base</span>
          </div>
        </div>
      </div>
    </div>
  );
}
