"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useVaultData, useHookData, useUserPosition } from "@/hooks/useContracts";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { TerminalLogs } from "@/components/TerminalLogs";
import { VaultModal } from "@/components/VaultModal";

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
    syncVaultData,
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
    volatilityLabel,
    refetch: refetchHook
  } = useHookData();

  const { shares, shareValue, usdcBalance, refetch: refetchUser } = useUserPosition();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Refresh all data when modal closes
  const handleModalClose = () => {
    setShowModal(false);
    // Refresh all data after any transaction
    setTimeout(() => {
      refetchVault();
      refetchHook();
      refetchUser();
    }, 1000);
  };

  // Sync on-chain state with store
  useEffect(() => {
    if (currentState !== undefined) {
      setVaultState(currentState);
    }
  }, [currentState, setVaultState]);

  // Sync vault data with store for agent
  useEffect(() => {
    if (vaultBalance && shares) {
      syncVaultData(vaultBalance, shares);
    }
  }, [vaultBalance, shares, syncVaultData]);

  // Refresh on-chain data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchVault();
      refetchHook();
      refetchUser();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchVault, refetchHook, refetchUser]);

  // Agent loop
  useEffect(() => {
    if (!isAgentRunning) return;
    runAgentStep();
    const interval = setInterval(runAgentStep, 4000);
    return () => clearInterval(interval);
  }, [isAgentRunning, runAgentStep]);

  const openDeposit = () => {
    setModalMode("deposit");
    setShowModal(true);
  };

  const openWithdraw = () => {
    setModalMode("withdraw");
    setShowModal(true);
  };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  // Format numbers
  const formatUSD = (value: string) => {
    const num = parseFloat(value);
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Calculate APY (simulated based on fee)
  const estimatedAPY = (parseFloat(dynamicFeePercent) * 12).toFixed(1);

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
            {/* Stats - Compact */}
            <div className="px-4 py-2">
              <div className="text-[10px] text-whisper mb-0.5 font-mono">TVL</div>
              <div className="text-base font-semibold tabular-nums">
                {formatUSD(vaultBalance)}
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="px-4 py-2">
              <div className="text-[10px] text-whisper mb-0.5 font-mono">APY</div>
              <div className="text-base font-semibold tabular-nums text-green-400">
                {estimatedAPY}%
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="px-3 py-2">
              <div className="text-[10px] text-whisper mb-0.5 font-mono">FEE</div>
              <div className="text-base font-semibold tabular-nums">
                {dynamicFeePercent}%
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            <div className="px-3 py-2">
              <div className="text-[10px] text-whisper mb-0.5 font-mono">VOL</div>
              <div className="text-base font-semibold tabular-nums">
                {volatilityLabel}
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* User Actions */}
            {isConnected ? (
              <div className="flex items-center gap-1.5 px-2">
                <button
                  onClick={openDeposit}
                  className="btn-primary px-3 py-1.5 text-xs"
                >
                  Deposit
                </button>
                <button
                  onClick={openWithdraw}
                  disabled={parseFloat(shares) <= 0}
                  className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
                >
                  Withdraw
                </button>
              </div>
            ) : (
              <div className="px-2">
                <ConnectButton.Custom>
                  {({ openConnectModal }) => (
                    <button
                      onClick={openConnectModal}
                      className="btn-primary px-3 py-1.5 text-xs"
                    >
                      Connect
                    </button>
                  )}
                </ConnectButton.Custom>
              </div>
            )}

            <div className="w-px h-8 bg-white/10" />

            {/* Agent Control */}
            <button
              onClick={isAgentRunning ? stopAgent : startAgent}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-all ${
                isAgentRunning
                  ? "bg-green-500/20 text-green-400"
                  : "btn-ghost"
              }`}
            >
              {isAgentRunning ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span>Live</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>Start</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* User Position Card (if connected) */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="glass-subtle px-6 py-3 rounded-xl flex items-center gap-6">
              <div>
                <div className="text-xs text-ghost mb-1">Wallet</div>
                <div className="text-lg font-semibold tabular-nums">
                  {parseFloat(usdcBalance).toFixed(2)} USDC
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-xs text-ghost mb-1">Deposited</div>
                <div className="text-lg font-semibold tabular-nums">
                  {parseFloat(shares).toFixed(2)} shares
                </div>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div>
                <div className="text-xs text-ghost mb-1">Value</div>
                <div className="text-lg font-semibold tabular-nums text-green-400">
                  ${parseFloat(shareValue).toFixed(2)}
                </div>
              </div>
              {parseFloat(shares) > 0 && !isAgentRunning && (
                <>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="text-center">
                    <div className="text-xs text-yellow-400 mb-1">Next Step</div>
                    <div className="text-sm text-yellow-400/80">Click Start</div>
                  </div>
                </>
              )}
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

      {/* Vault Modal */}
      <VaultModal
        isOpen={showModal}
        onClose={handleModalClose}
        mode={modalMode}
      />
    </main>
  );
}
