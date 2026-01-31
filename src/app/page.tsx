"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useVaultData, useHookData, useUserPosition } from "@/hooks/useContracts";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { TerminalLogs } from "@/components/TerminalLogs";

// Dynamic import for Three.js (no SSR)
const VelvetOrb = dynamic(
  () => import("@/components/VelvetOrb").then((mod) => mod.VelvetOrb),
  {
    ssr: false,
    loading: () => (
      <div className="orb-container flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-white/5 animate-pulse-slow" />
      </div>
    ),
  }
);

// State labels
const STATE_LABELS: Record<number, string> = {
  0: "Safe Harbor",
  1: "Deploying",
  2: "Yield Active",
  3: "Returning",
  4: "Protected",
};

export default function Home() {
  const { address, isConnected } = useAccount();
  const {
    vaultState,
    agentState,
    isAgentRunning,
    startAgent,
    stopAgent,
    runAgentStep,
    setVaultState,
  } = useVelvetStore();

  // On-chain data
  const {
    currentState,
    totalDeposits,
    vaultBalance,
    refetch: refetchVault
  } = useVaultData();

  const {
    dynamicFeePercent,
    feesCollected,
    refetch: refetchHook
  } = useHookData();

  const { shares, usdcBalance } = useUserPosition();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync on-chain state with store
  useEffect(() => {
    if (currentState !== undefined) {
      setVaultState(currentState);
    }
  }, [currentState, setVaultState]);

  // Refresh on-chain data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVault();
      refetchHook();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchVault, refetchHook]);

  // Agent loop
  useEffect(() => {
    if (!isAgentRunning) return;
    runAgentStep();
    const interval = setInterval(runAgentStep, 4000);
    return () => clearInterval(interval);
  }, [isAgentRunning, runAgentStep]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  // Format numbers
  const formatUSD = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Calculate APY (simulated based on fee + volume)
  const estimatedAPY = (parseFloat(feesCollected) * 365 * 100 / Math.max(parseFloat(totalDeposits), 1)).toFixed(1);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* The Orb - Full screen background */}
      <VelvetOrb />

      {/* Terminal Logs - Top Left */}
      <TerminalLogs />

      {/* Content Layer */}
      <div className="content-layer">
        {/* Top Center - Minimal Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="fixed top-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse-slow" />
            <span className="text-sm font-medium text-white/60 tracking-tight">
              Velvet Arc
            </span>
          </div>
        </motion.div>

        {/* Top Right - Wallet Connect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="fixed top-6 right-6 z-50"
        >
          <ConnectButton.Custom>
            {({
              account,
              chain,
              openAccountModal,
              openChainModal,
              openConnectModal,
              mounted: walletMounted,
            }) => {
              const ready = walletMounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    "aria-hidden": true,
                    style: {
                      opacity: 0,
                      pointerEvents: "none",
                      userSelect: "none",
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="btn-ghost text-xs"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openChainModal}
                          className="text-xs text-whisper hover:text-white transition-colors"
                        >
                          {chain.name}
                        </button>
                        <button
                          onClick={openAccountModal}
                          className="text-xs font-mono text-ghost hover:text-white transition-colors"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </motion.div>

        {/* Center - State Label */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center mt-[45vh]"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={vaultState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-ghost tracking-widest uppercase"
              >
                {STATE_LABELS[vaultState] || "Unknown"}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bottom - Floating Dock (Vision Pro Style) */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="floating-dock"
        >
          <div className="glass inner-glow px-2 py-2 flex items-center gap-1">
            {/* Stats */}
            <div className="px-6 py-3">
              <div className="text-xs text-whisper mb-1 font-mono">TVL</div>
              <div className="text-lg font-semibold tabular-nums">
                {formatUSD(vaultBalance)}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            <div className="px-6 py-3">
              <div className="text-xs text-whisper mb-1 font-mono">APY</div>
              <div className="text-lg font-semibold tabular-nums text-green-400">
                {estimatedAPY}%
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            <div className="px-6 py-3">
              <div className="text-xs text-whisper mb-1 font-mono">FEE</div>
              <div className="text-lg font-semibold tabular-nums">
                {dynamicFeePercent}%
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            <div className="px-6 py-3">
              <div className="text-xs text-whisper mb-1 font-mono">ACTIONS</div>
              <div className="text-lg font-semibold tabular-nums">
                {agentState.executionHistory.length}
              </div>
            </div>

            <div className="w-px h-10 bg-white/10" />

            {/* Control Button */}
            <button
              onClick={isAgentRunning ? stopAgent : startAgent}
              className="btn-primary ml-2 flex items-center gap-3"
            >
              {isAgentRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse-slow" />
                  <span>Running</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* User Position (if connected) */}
        {isConnected && parseFloat(shares) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="glass-subtle px-4 py-2 text-xs text-ghost">
              Your Position: {parseFloat(shares).toFixed(2)} shares
            </div>
          </motion.div>
        )}

        {/* Bottom Right - Identity */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <span className="text-xs text-whisper font-mono">
            velvet-agent.eth
          </span>
        </motion.div>

        {/* Bottom Left - Network */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="fixed bottom-8 left-8 z-50 flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-xs text-whisper font-mono">
            Arc Testnet
          </span>
        </motion.div>
      </div>
    </main>
  );
}
