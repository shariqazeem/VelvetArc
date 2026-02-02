"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { useVaultData, useHookData, useUserPosition } from "@/hooks/useContracts";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useENSIdentity, formatAddressOrENS } from "@/hooks/useENS";
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

// State labels
const STATE_LABELS: Record<number, string> = {
  0: "Safe Harbor",
  1: "Deploying",
  2: "Yield Active",
  3: "Returning",
  4: "Protected",
};

// Demo step labels
const DEMO_STEP_LABELS: Record<string, string> = {
  IDLE: "Initializing...",
  DEPOSIT: "User deposits $10,000",
  SCANNING: "Scanning markets",
  ANALYZING_LOW: "Low volatility - deploy!",
  DEPLOYING: "Deploying to Base",
  BRIDGING: "Bridging via LI.FI",
  FARMING: "Earning on Uniswap V4",
  ANALYZING_HIGH: "Volatility spike!",
  RETREATING: "Emergency exit",
  RETURNING: "Returning to Arc",
  COMPLETE: "Safe +$50 yield",
};

export default function Home() {
  const { address, isConnected } = useAccount();

  // Demo mode from local store
  const {
    isDemoMode,
    demoStep,
    startDemo,
    stopDemo,
    agentState: demoAgentState,
    vaultState: demoVaultState,
  } = useVelvetStore();

  // REAL agent from API (connected to backend)
  const {
    state: apiAgentState,
    startAgent: startAPIAgent,
    stopAgent: stopAPIAgent,
  } = useAgentAPI();

  // On-chain data (REAL)
  const {
    currentState,
    vaultBalance,
    refetch: refetchVault
  } = useVaultData();

  const {
    dynamicFeePercent,
    volatilityLabel,
    refetch: refetchHook
  } = useHookData();

  const { shares, shareValue, usdcBalance, refetch: refetchUser } = useUserPosition();
  const { name: ensName, avatar: ensAvatar } = useENSIdentity(address);

  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"deposit" | "withdraw">("deposit");
  const [showLiFi, setShowLiFi] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleModalClose = () => {
    setShowModal(false);
    setTimeout(() => {
      refetchVault();
      refetchHook();
      refetchUser();
    }, 1000);
  };

  // Sync on-chain data periodically
  useEffect(() => {
    if (isDemoMode) return;
    const interval = setInterval(() => {
      refetchVault();
      refetchHook();
      refetchUser();
    }, 10000);
    return () => clearInterval(interval);
  }, [refetchVault, refetchHook, refetchUser, isDemoMode]);

  // Determine which state to use (demo or API)
  const isAgentRunning = isDemoMode ? demoAgentState.isRunning : apiAgentState.isRunning;
  const agentState = isDemoMode ? demoAgentState : null;
  const vaultState = isDemoMode ? demoVaultState : (currentState ?? 0);

  const openDeposit = () => { setModalMode("deposit"); setShowModal(true); };
  const openWithdraw = () => { setModalMode("withdraw"); setShowModal(true); };

  if (!mounted) return <div className="min-h-screen bg-black" />;

  const formatUSD = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(num)) return "$0";
    if (num >= 1000000) return `$${(num / 1000000).toFixed(2)}M`;
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`;
    return `$${num.toFixed(2)}`;
  };

  // Get display values (demo or API or on-chain)
  const displayTVL = isDemoMode
    ? formatUSD(demoAgentState.vaultBalance / 1_000_000)
    : apiAgentState.vaultBalance !== "0"
      ? formatUSD(apiAgentState.vaultBalance)
      : formatUSD(vaultBalance);

  const displayFee = isDemoMode && demoAgentState.lastDecision?.suggestedFee
    ? (demoAgentState.lastDecision.suggestedFee / 100).toFixed(2)
    : apiAgentState.hookFee
      ? (apiAgentState.hookFee / 100).toFixed(2)
      : dynamicFeePercent;

  const displayVol = isDemoMode && demoAgentState.lastConditions
    ? demoAgentState.lastConditions.volatility
    : apiAgentState.volatility || volatilityLabel;

  const estimatedAPY = (parseFloat(displayFee) * 12).toFixed(1);

  // Agent status text
  const getAgentStatus = () => {
    if (isDemoMode) return { text: DEMO_STEP_LABELS[demoStep], color: "text-purple-400" };
    if (!apiAgentState.isRunning) return { text: "Idle", color: "text-white/40" };

    const decision = apiAgentState.lastDecision?.action;
    if (decision === "DEPLOY") return { text: "Deploying", color: "text-green-400" };
    if (decision === "WITHDRAW") return { text: "Withdrawing", color: "text-yellow-400" };
    if (decision === "ADJUST_FEE") return { text: "Adjusting fees", color: "text-blue-400" };
    if (decision === "EMERGENCY") return { text: "Emergency!", color: "text-red-400" };
    return { text: "Monitoring", color: "text-white/60" };
  };

  const agentStatus = getAgentStatus();

  // Get logs to display (demo or API)
  const displayLogs = isDemoMode
    ? demoAgentState.executionHistory.slice(0, 8).map(e => ({ message: e.details, type: e.action === "ERROR" ? "error" : "info" }))
    : apiAgentState.logs.slice(0, 8);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Demo Mode Banner */}
      <AnimatePresence>
        {isDemoMode && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-r from-purple-600/90 via-blue-600/90 to-purple-600/90 backdrop-blur-sm"
          >
            <div className="max-w-4xl mx-auto px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="text-sm font-medium">Demo Mode</span>
                <span className="text-xs text-white/70">{DEMO_STEP_LABELS[demoStep]}</span>
              </div>
              <button onClick={stopDemo} className="text-xs px-3 py-1 rounded-full bg-white/10 hover:bg-white/20">
                Exit Demo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The Orb */}
      <VelvetOrb />

      {/* CLEAN LAYOUT */}
      <div className="content-layer">

        {/* TOP BAR */}
        <div className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">

            {/* Left: Logo + Tagline */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/40 animate-pulse-slow" />
                <span className="text-base font-semibold">Velvet Arc</span>
              </div>
              <span className="text-xs text-white/40 hidden sm:block">
                The Sovereign Liquidity Agent
              </span>
            </div>

            {/* Right: Wallet */}
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted: walletMounted }) => {
                const ready = walletMounted;
                const connected = ready && account && chain;
                return (
                  <div {...(!ready && { "aria-hidden": true, style: { opacity: 0, pointerEvents: "none" } })}>
                    {!connected ? (
                      <button onClick={openConnectModal} className="btn-ghost text-xs px-4 py-2">
                        Connect
                      </button>
                    ) : (
                      <div className="flex items-center gap-3">
                        <button onClick={openChainModal} className="text-xs text-white/40 hover:text-white">
                          {chain.name}
                        </button>
                        <button onClick={openAccountModal} className="text-xs font-mono text-white/60 hover:text-white">
                          {account.displayName}
                        </button>
                      </div>
                    )}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>

        {/* LEFT PANEL - Agent + Flow */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="fixed left-6 top-20 bottom-24 w-72 z-40 flex flex-col gap-4"
        >
          {/* Agent Identity */}
          <div className="glass-subtle rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold flex items-center gap-2">
                  velvet-agent.eth
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400">ENS</span>
                </div>
                <a
                  href={`https://sepolia.basescan.org/address/${apiAgentState.agentAddress || "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] text-white/40 font-mono hover:text-white/60"
                >
                  {apiAgentState.agentAddress ? `${apiAgentState.agentAddress.slice(0, 6)}...${apiAgentState.agentAddress.slice(-4)}` : "0x55c3...592E"}
                </a>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase">Status</span>
                <span className={`text-xs font-medium ${agentStatus.color}`}>{agentStatus.text}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase">Location</span>
                <span className="text-xs text-white/70 font-mono">
                  {(isDemoMode ? demoAgentState.position : apiAgentState.position) === "BASE" ? "Base (Uniswap)" : "Arc (Safe)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-white/40 uppercase">Iterations</span>
                <span className="text-xs text-white/70">{isDemoMode ? demoAgentState.executionHistory.length : apiAgentState.iteration}</span>
              </div>
              {/* Agent Gas Balance */}
              {!isDemoMode && apiAgentState.agentBalance && (
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-white/40 uppercase">Gas (Base)</span>
                  <span className={`text-xs font-mono ${parseFloat(apiAgentState.agentBalance) < 0.001 ? "text-red-400" : "text-green-400"}`}>
                    {parseFloat(apiAgentState.agentBalance).toFixed(4)} ETH
                  </span>
                </div>
              )}
            </div>

            {/* Agent Mode Indicator */}
            {!isDemoMode && apiAgentState.isRunning && (
              <div className={`mt-3 px-3 py-2 rounded-lg ${
                apiAgentState.volatility === "LOW" ? "bg-green-500/10 ring-1 ring-green-500/30" :
                apiAgentState.volatility === "HIGH" || apiAgentState.volatility === "EXTREME" ? "bg-red-500/10 ring-1 ring-red-500/30" :
                "bg-yellow-500/10 ring-1 ring-yellow-500/30"
              }`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-semibold ${
                    apiAgentState.volatility === "LOW" ? "text-green-400" :
                    apiAgentState.volatility === "HIGH" || apiAgentState.volatility === "EXTREME" ? "text-red-400" :
                    "text-yellow-400"
                  }`}>
                    {apiAgentState.volatility === "LOW" ? "Yield Mode" :
                     apiAgentState.volatility === "HIGH" || apiAgentState.volatility === "EXTREME" ? "Protection Mode" :
                     "Balanced Mode"}
                  </span>
                  <span className="text-[10px] text-white/50">
                    Fee: {(apiAgentState.hookFee / 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-[9px] text-white/40 mt-1">
                  {apiAgentState.volatility === "LOW" ? "Low fees to attract volume" :
                   apiAgentState.volatility === "HIGH" || apiAgentState.volatility === "EXTREME" ? "High fees to profit from volatility" :
                   "Balanced fee for current conditions"}
                </p>
              </div>
            )}
          </div>

          {/* Capital Flow */}
          <div className="glass-subtle rounded-2xl p-4 flex-1">
            <div className="text-[10px] text-white/40 uppercase mb-4">Capital Flow</div>

            <div className="relative h-32 flex items-center justify-center">
              {/* Arc */}
              <div className="absolute left-0 text-center">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center mb-1 ${
                  vaultState === 0 || vaultState === 4 ? "bg-green-500/20 ring-1 ring-green-500/50" : "bg-white/5"
                }`}>
                  <span className="text-[8px] font-bold text-green-400">ARC</span>
                  <span className="text-[10px] text-white/70 mt-1">
                    {isDemoMode ? formatUSD((demoAgentState.vaultBalance - demoAgentState.deployedAmount) / 1_000_000) : formatUSD(vaultBalance)}
                  </span>
                </div>
                <span className="text-[9px] text-white/30">Safe</span>
              </div>

              {/* Arrow/Bridge */}
              <div className="flex items-center gap-1">
                <div className={`w-16 h-0.5 ${
                  vaultState === 1 ? "bg-gradient-to-r from-green-400 to-purple-400 animate-pulse" :
                  vaultState === 3 ? "bg-gradient-to-l from-green-400 to-blue-400 animate-pulse" :
                  "bg-white/10"
                }`} />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  vaultState === 1 || vaultState === 3 ? "bg-purple-500/20" : "bg-white/5"
                }`}>
                  <span className="text-[8px] text-purple-400 font-mono">LI.FI</span>
                </div>
                <div className={`w-16 h-0.5 ${
                  vaultState === 1 ? "bg-gradient-to-r from-purple-400 to-blue-400 animate-pulse" :
                  vaultState === 3 ? "bg-gradient-to-l from-purple-400 to-green-400 animate-pulse" :
                  "bg-white/10"
                }`} />
              </div>

              {/* Base */}
              <div className="absolute right-0 text-center">
                <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center mb-1 ${
                  vaultState === 2 ? "bg-blue-500/20 ring-1 ring-blue-500/50" : "bg-white/5"
                }`}>
                  <span className="text-[8px] font-bold text-blue-400">BASE</span>
                  <span className="text-[10px] text-white/70 mt-1">
                    {isDemoMode ? formatUSD(demoAgentState.deployedAmount / 1_000_000) : "$0"}
                  </span>
                </div>
                <span className="text-[9px] text-white/30">Yield</span>
              </div>
            </div>

            {/* Yield earned */}
            {(isDemoMode && demoAgentState.totalYieldEarned > 0) && (
              <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                <span className="text-[10px] text-white/40">Yield Earned</span>
                <span className="text-sm font-semibold text-green-400">
                  +{formatUSD(demoAgentState.totalYieldEarned / 1_000_000)}
                </span>
              </div>
            )}
          </div>

          {/* Sponsor Integrations */}
          <div className="glass-subtle rounded-xl p-3">
            <div className="text-[9px] text-white/30 uppercase mb-2">Powered By</div>
            <div className="flex flex-wrap gap-2">
              {[
                { name: "Circle Arc", color: "bg-green-400", desc: "Safe L1" },
                { name: "Uniswap V4", color: "bg-pink-400", desc: "Hooks" },
                { name: "LI.FI", color: "bg-purple-400", desc: "Deposits" },
                { name: "ENS", color: "bg-blue-400", desc: "Identity" },
              ].map((s) => (
                <div key={s.name} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5">
                  <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                  <span className="text-[9px] text-white/60 font-medium">{s.name}</span>
                  <span className="text-[8px] text-white/30">{s.desc}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* RIGHT PANEL - Live Data + Logs */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="fixed right-6 top-20 w-80 z-40 flex flex-col gap-3"
        >
          {/* Real-Time Market Data */}
          {!isDemoMode && apiAgentState.ethPrice > 0 && (
            <div className="glass-subtle rounded-2xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-3">Live Market Data</div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-white/70">ETH/USD</span>
                <span className="text-lg font-bold tabular-nums">${apiAgentState.ethPrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50">24h Change</span>
                <span className={`text-sm font-semibold ${apiAgentState.priceChange24h >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {apiAgentState.priceChange24h >= 0 ? "+" : ""}{apiAgentState.priceChange24h.toFixed(2)}%
                </span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-white/50">Volatility Index</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        apiAgentState.volatility === "LOW" ? "bg-green-500" :
                        apiAgentState.volatility === "MEDIUM" ? "bg-yellow-500" :
                        apiAgentState.volatility === "HIGH" ? "bg-orange-500" :
                        "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, apiAgentState.volatilityIndex)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-mono ${
                    apiAgentState.volatility === "LOW" ? "text-green-400" :
                    apiAgentState.volatility === "MEDIUM" ? "text-yellow-400" :
                    apiAgentState.volatility === "HIGH" ? "text-orange-400" :
                    "text-red-400"
                  }`}>{apiAgentState.volatility}</span>
                </div>
              </div>
            </div>
          )}

          {/* Real Transactions */}
          {!isDemoMode && apiAgentState.transactions.length > 0 && (
            <div className="glass-subtle rounded-2xl p-4">
              <div className="text-[10px] text-white/40 uppercase mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                Real Transactions
              </div>
              <div className="space-y-2">
                {apiAgentState.transactions.slice(0, 3).map((tx, i) => (
                  <a
                    key={i}
                    href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-blue-400 font-mono">{tx.hash.slice(0, 10)}...{tx.hash.slice(-6)}</span>
                    <span className="text-white/40">{tx.type}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Activity Logs */}
          <div className="glass-subtle rounded-2xl overflow-hidden">
            <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isAgentRunning || isDemoMode ? "bg-green-500 animate-pulse" : "bg-white/20"}`} />
                <span className="text-[10px] text-white/50 uppercase tracking-wider">Activity</span>
              </div>
              {!isDemoMode && apiAgentState.iteration > 0 && (
                <span className="text-[10px] text-white/30">#{apiAgentState.iteration}</span>
              )}
            </div>
            <div className="p-3 max-h-48 overflow-hidden space-y-1.5">
              {displayLogs.map((log, i) => (
                <div
                  key={i}
                  className={`text-[11px] font-mono px-2 py-1.5 rounded ${
                    log.type === "success" || log.type === "decision" ? "bg-green-500/10 text-green-400" :
                    log.type === "action" ? "bg-blue-500/10 text-blue-400" :
                    log.type === "error" ? "bg-red-500/10 text-red-400" :
                    "bg-white/5 text-white/50"
                  }`}
                >
                  {log.message.length > 50 ? log.message.slice(0, 50) + "..." : log.message}
                </div>
              ))}
              {displayLogs.length === 0 && (
                <div className="text-[11px] text-white/30 text-center py-4">
                  {isAgentRunning || isDemoMode ? "Waiting for activity..." : "Start agent to begin"}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* CENTER - State Label */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="text-center mt-[40vh]"
          >
            <AnimatePresence mode="wait">
              <motion.p
                key={vaultState}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-white/30 tracking-widest uppercase"
              >
                {STATE_LABELS[vaultState]}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>

        {/* BOTTOM DOCK */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="floating-dock max-w-[95vw]"
        >
          <div className="glass inner-glow px-4 py-3 flex items-center gap-3 flex-wrap justify-center">
            {/* Stats - Compact */}
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-[8px] text-white/40 uppercase">TVL</div>
                <div className="text-sm font-semibold tabular-nums">{displayTVL}</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-white/40 uppercase">APY</div>
                <div className="text-sm font-semibold tabular-nums text-green-400">{estimatedAPY}%</div>
              </div>
              <div className="text-center">
                <div className="text-[8px] text-white/40 uppercase">Vol</div>
                <div className={`text-sm font-semibold ${
                  displayVol === "LOW" ? "text-green-400" :
                  displayVol === "HIGH" || displayVol === "EXTREME" ? "text-red-400" :
                  "text-yellow-400"
                }`}>{displayVol}</div>
              </div>
            </div>

            <div className="w-px h-8 bg-white/10" />

            {/* Actions - Always show Start Agent button prominently */}
            <div className="flex items-center gap-2">
              {/* MAIN ACTION: Start/Stop Agent */}
              {!isDemoMode && (
                <button
                  onClick={apiAgentState.isRunning ? stopAPIAgent : startAPIAgent}
                  className={`flex items-center gap-2 px-5 py-2 text-sm font-medium rounded-full transition-all ${
                    apiAgentState.isRunning
                      ? "bg-green-500/20 text-green-400 ring-1 ring-green-500/50"
                      : "bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50 hover:bg-blue-500/30"
                  }`}
                >
                  {apiAgentState.isRunning ? (
                    <>
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      Agent Live
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Start Agent
                    </>
                  )}
                </button>
              )}

              {/* Fund Agent via LI.FI - The KEY integration */}
              {!isDemoMode && (
                <button
                  onClick={() => setShowLiFi(true)}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 ring-1 ring-purple-500/30 hover:ring-purple-500/50 transition-all"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  Fund Agent
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300">LI.FI</span>
                </button>
              )}

              {/* Demo Mode button */}
              {!isDemoMode && !apiAgentState.isRunning && (
                <button
                  onClick={startDemo}
                  className="flex items-center gap-2 px-4 py-2 text-xs rounded-full bg-white/5 text-white/50 hover:bg-white/10 transition-all"
                >
                  Demo
                </button>
              )}

              {/* Deposit/Withdraw on Arc when connected */}
              {isConnected && !isDemoMode && (
                <>
                  <div className="w-px h-6 bg-white/10" />
                  <button onClick={openDeposit} className="btn-ghost px-3 py-1.5 text-xs">
                    Arc Vault
                  </button>
                  <button
                    onClick={openWithdraw}
                    disabled={parseFloat(shares) <= 0}
                    className="btn-ghost px-3 py-1.5 text-xs disabled:opacity-30"
                  >
                    Withdraw
                  </button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* User Position (if connected) */}
        {isConnected && !isDemoMode && parseFloat(shares) > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="glass-subtle px-5 py-2 rounded-full flex items-center gap-4 text-xs">
              <span className="text-white/40">Your Position:</span>
              <span className="font-semibold">{parseFloat(shares).toFixed(2)} shares</span>
              <span className="text-green-400 font-semibold">${parseFloat(shareValue).toFixed(2)}</span>
            </div>
          </motion.div>
        )}

        {/* Network indicator */}
        <div className="fixed bottom-4 left-6 z-50 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          <span className="text-[10px] text-white/30 font-mono">Arc Testnet</span>
        </div>

        {/* Tagline */}
        <div className="fixed bottom-4 right-6 z-50">
          <span className="text-[10px] text-white/20">
            Your money has a home. Your agent has a name.
          </span>
        </div>
      </div>

      {/* Vault Modal */}
      <VaultModal isOpen={showModal} onClose={handleModalClose} mode={modalMode} />

      {/* LI.FI Cross-Chain Deposit Modal */}
      <LiFiDeposit
        isOpen={showLiFi}
        onClose={() => setShowLiFi(false)}
        agentAddress={apiAgentState.agentAddress || "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E"}
      />
    </main>
  );
}
