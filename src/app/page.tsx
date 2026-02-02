"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useVaultData, useHookData, useUserPosition } from "@/hooks/useContracts";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { VaultModal } from "@/components/VaultModal";
import { LiFiDeposit } from "@/components/LiFiDeposit";

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

export default function Home() {
  const { isConnected } = useAccount();
  const { isDemoMode, demoStep, startDemo, stopDemo, agentState: demoAgentState } = useVelvetStore();
  const { state: apiAgentState, startAgent, stopAgent } = useAgentAPI();
  const { vaultBalance, refetch: refetchVault } = useVaultData();
  const { dynamicFeePercent, refetch: refetchHook } = useHookData();
  const { shares, shareValue, refetch: refetchUser } = useUserPosition();

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [showLiFi, setShowLiFi] = useState(false);

  useEffect(() => setMounted(true), []);

  // Sync on-chain data periodically
  useEffect(() => {
    if (isDemoMode) return;
    const interval = setInterval(() => {
      refetchVault();
      refetchHook();
      refetchUser();
    }, 15000);
    return () => clearInterval(interval);
  }, [refetchVault, refetchHook, refetchUser, isDemoMode]);

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const isAgentRunning = isDemoMode ? demoAgentState.isRunning : apiAgentState.isRunning;

  // Get current mode
  const getMode = () => {
    if (isDemoMode) {
      const vol = demoAgentState.lastConditions?.volatility;
      if (vol === "LOW") return { label: "Yield", color: "text-green-400", bg: "bg-green-500" };
      if (vol === "HIGH" || vol === "EXTREME") return { label: "Protect", color: "text-red-400", bg: "bg-red-500" };
      return { label: "Balance", color: "text-yellow-400", bg: "bg-yellow-500" };
    }
    if (!apiAgentState.isRunning) return { label: "Idle", color: "text-white/40", bg: "bg-white/20" };
    const vol = apiAgentState.volatility;
    if (vol === "LOW") return { label: "Yield", color: "text-green-400", bg: "bg-green-500" };
    if (vol === "HIGH" || vol === "EXTREME") return { label: "Protect", color: "text-red-400", bg: "bg-red-500" };
    return { label: "Balance", color: "text-yellow-400", bg: "bg-yellow-500" };
  };

  const mode = getMode();
  const ethPrice = apiAgentState.ethPrice || 0;
  const priceChange = apiAgentState.priceChange24h || 0;
  const hookFee = apiAgentState.hookFee ? (apiAgentState.hookFee / 100).toFixed(2) : dynamicFeePercent;

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Demo Banner */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-white/5 backdrop-blur-sm border-b border-white/10"
          >
            <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-sm text-white/70">Demo Mode</span>
              </div>
              <button onClick={stopDemo} className="text-xs text-white/50 hover:text-white">
                Exit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb */}
      <VelvetOrb />

      {/* Content Layer */}
      <div className="content-layer">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-white/30" />
              <span className="text-sm font-medium">Velvet Arc</span>
            </div>
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, mounted: walletMounted }) => {
                const ready = walletMounted;
                const connected = ready && account && chain;
                return (
                  <div {...(!ready && { style: { opacity: 0, pointerEvents: "none" } })}>
                    {!connected ? (
                      <button onClick={openConnectModal} className="text-xs text-white/50 hover:text-white">
                        Connect
                      </button>
                    ) : (
                      <button onClick={openAccountModal} className="text-xs text-white/50 hover:text-white font-mono">
                        {account.displayName}
                      </button>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* Center Content */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center"
          >
            {/* Agent Identity */}
            <p className="text-xs text-white/30 tracking-widest uppercase mb-2">
              velvet-agent.eth
            </p>

            {/* Mode */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <span className={`w-2 h-2 rounded-full ${mode.bg} ${isAgentRunning ? 'animate-pulse' : ''}`} />
              <span className={`text-sm ${mode.color}`}>{mode.label} Mode</span>
            </div>

            {/* Live Data (when agent running) */}
            {apiAgentState.isRunning && ethPrice > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-1"
              >
                <p className="text-2xl font-light tabular-nums">
                  ${ethPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className={`text-xs ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}% · {hookFee}% fee
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Left Panel - Minimal Stats */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed left-6 top-1/2 -translate-y-1/2 z-40"
        >
          <div className="space-y-6">
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Vault</p>
              <p className="text-lg font-light">${parseFloat(vaultBalance || "0").toFixed(2)}</p>
            </div>
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-wider">Fee</p>
              <p className="text-lg font-light">{hookFee}%</p>
            </div>
            {apiAgentState.transactions.length > 0 && (
              <div>
                <p className="text-[10px] text-white/30 uppercase tracking-wider">Last TX</p>
                <a
                  href={`https://sepolia.basescan.org/tx/${apiAgentState.transactions[0].hash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  {apiAgentState.transactions[0].hash.slice(0, 8)}...
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Right Panel - Activity Log */}
        {apiAgentState.logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="fixed right-6 top-1/2 -translate-y-1/2 z-40 w-64"
          >
            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Activity</p>
            <div className="space-y-2">
              {apiAgentState.logs.slice(0, 5).map((log, i) => (
                <p
                  key={i}
                  className={`text-xs font-mono truncate ${
                    log.type === 'success' ? 'text-green-400' :
                    log.type === 'error' ? 'text-red-400' :
                    log.type === 'decision' ? 'text-blue-400' :
                    'text-white/40'
                  }`}
                >
                  {log.message}
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bottom Dock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="flex items-center gap-3 px-2 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10">
            {/* Start/Stop Agent */}
            <button
              onClick={apiAgentState.isRunning ? stopAgent : startAgent}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                apiAgentState.isRunning
                  ? 'bg-white/10 text-white'
                  : 'bg-white text-black hover:bg-white/90'
              }`}
            >
              {apiAgentState.isRunning ? 'Stop' : 'Start Agent'}
            </button>

            {/* Fund Agent */}
            <button
              onClick={() => setShowLiFi(true)}
              className="px-4 py-2 rounded-full text-sm text-white/60 hover:text-white hover:bg-white/5 transition-all"
            >
              Fund
            </button>

            {/* Demo */}
            {!apiAgentState.isRunning && !isDemoMode && (
              <button
                onClick={startDemo}
                className="px-4 py-2 rounded-full text-sm text-white/40 hover:text-white/60 transition-all"
              >
                Demo
              </button>
            )}

            {/* Vault (when connected) */}
            {isConnected && (
              <button
                onClick={() => { setModalMode("deposit"); setShowModal(true); }}
                className="px-4 py-2 rounded-full text-sm text-white/40 hover:text-white/60 transition-all"
              >
                Vault
              </button>
            )}
          </div>
        </motion.div>

        {/* Sponsors */}
        <div className="fixed bottom-8 left-6 z-40">
          <div className="flex items-center gap-3 text-[10px] text-white/20">
            <span>Circle Arc</span>
            <span>·</span>
            <span>Uniswap V4</span>
            <span>·</span>
            <span>LI.FI</span>
            <span>·</span>
            <span>ENS</span>
          </div>
        </div>

        {/* Tagline */}
        <div className="fixed bottom-8 right-6 z-40">
          <p className="text-[10px] text-white/20">
            The Sovereign Liquidity Agent
          </p>
        </div>
      </div>

      {/* Modals */}
      <VaultModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
      />
      <LiFiDeposit
        isOpen={showLiFi}
        onClose={() => setShowLiFi(false)}
        agentAddress={apiAgentState.agentAddress || "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E"}
      />
    </main>
  );
}
