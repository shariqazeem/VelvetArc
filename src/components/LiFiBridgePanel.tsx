"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import type { WidgetConfig } from "@lifi/widget";
import { ChainType } from "@lifi/widget";

// Dynamic import for LiFiWidget (client-side only)
const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
          <span className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
            Initializing Bridge...
          </span>
        </div>
      </div>
    ),
  }
);

// Chain configurations - LI.FI only supports mainnet (no testnet support)
const CHAINS = {
  BASE: 8453,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  POLYGON: 137,
  ETHEREUM: 1,
} as const;

interface LiFiBridgePanelProps {
  destinationAddress?: `0x${string}`;
  className?: string;
  compact?: boolean;
}

export function LiFiBridgePanel({
  destinationAddress,
  className = "",
  compact = false,
}: LiFiBridgePanelProps) {
  const { openConnectModal } = useConnectModal();

  // LI.FI Widget configuration - mainnet only (LI.FI doesn't support testnets)
  const widgetConfig: Partial<WidgetConfig> = useMemo(() => {
    return {
      appearance: "dark",
      variant: compact ? "compact" : "wide",
      subvariant: compact ? "default" : "split",

      // Default to Base -> Optimism (low gas L2s recommended by LI.FI for testing)
      fromChain: CHAINS.BASE,
      toChain: CHAINS.OPTIMISM,

      // If destination address provided, set it
      ...(destinationAddress && {
        toAddress: {
          address: destinationAddress,
          chainType: ChainType.EVM,
        },
      }),

      // Dark theme matching the app's minimalist aesthetic
      theme: {
        container: {
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: compact ? "12px" : "16px",
          background: "rgba(8,8,8,0.9)",
        },
        palette: {
          primary: { main: "#ffffff" },
          secondary: { main: "#666666" },
          background: {
            default: "transparent",
            paper: "rgba(255,255,255,0.03)",
          },
          text: {
            primary: "#ffffff",
            secondary: "#888888",
          },
          grey: {
            200: "#333333",
            300: "#444444",
            700: "#888888",
            800: "#aaaaaa",
          },
        },
        shape: {
          borderRadius: 8,
          borderRadiusSecondary: 6,
        },
        typography: {
          fontFamily: "inherit",
        },
      },

      // Hide unnecessary UI elements for cleaner integration
      hiddenUI: ["appearance", "language", "poweredBy"],

      // Connect wallet callback
      walletConfig: {
        onConnect() {
          openConnectModal?.();
        },
      },
    };
  }, [destinationAddress, openConnectModal, compact]);

  return (
    <div className={`bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="text-sm text-white/80">Cross-Chain Bridge</h3>
          <p className="text-[10px] text-white/30">Powered by LI.FI</p>
        </div>
        <span className="text-[10px] text-white/30">Mainnet</span>
      </div>

      {/* Info */}
      <div className="px-4 py-2 bg-white/[0.02] border-b border-white/5">
        <p className="text-[10px] text-white/40">
          LI.FI recommends testing on L2s with low gas fees (Base, Optimism, Arbitrum)
        </p>
      </div>

      {/* LI.FI Widget */}
      <div className={compact ? "p-3" : "p-4"}>
        <LiFiWidget integrator="velvet-arc-hackmoney2026" config={widgetConfig} />
      </div>

      {/* Footer Info */}
      <div className="px-4 py-3 border-t border-white/5">
        <div className="flex items-center justify-between text-[9px] text-white/20">
          <span>Best route automatically selected</span>
          <a
            href="https://li.fi"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/40 transition-colors"
          >
            li.fi ↗
          </a>
        </div>
      </div>
    </div>
  );
}
