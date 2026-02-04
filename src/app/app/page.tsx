"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import Link from "next/link";
import type { WidgetConfig } from "@lifi/widget";
import { ChainType } from "@lifi/widget";
import { parseUnits } from "viem";
import { CONTRACTS, ERC20_ABI, VAULT_ABI, arcTestnet } from "@/lib/wagmi-config";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { TerminalLogs } from "@/components/TerminalLogs";
import Head from "next/head";

// Dynamic imports
const VelvetOrb = dynamic(
  () => import("@/components/VelvetOrb").then((mod) => mod.VelvetOrb),
  { ssr: false, loading: () => <div className="w-[500px] h-[500px] flex items-center justify-center"><div className="w-32 h-32 rounded-full bg-white/5 animate-pulse" /></div> }
);

const LiFiWidget = dynamic(
  () => import("@lifi/widget").then((mod) => mod.LiFiWidget),
  { ssr: false, loading: () => <div className="h-[480px] flex items-center justify-center text-white/40 font-mono text-sm">INITIALIZING BRIDGE PROTOCOL...</div> }
);

// Constants
const BASE_SEPOLIA_USDC = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";
const ARC_USDC = "0x3600000000000000000000000000000000000000";
const BASE_MAINNET_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const BASE_MAINNET_CHAIN_ID = 8453;
const BASE_SEPOLIA_CHAIN_ID = 84532;
const ARC_TESTNET_CHAIN_ID = 5042002;
const ENS_NAME = "velvet-agent.eth";

export default function AppDashboard() {
  const { isConnected, chain } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const {
    state,
    isLoading,
    startAgent,
    stopAgent,
    runStep,
    simulateHighVolatility,
    simulateLowVolatility,
    simulateExtremeVolatility,
    totalArcBalance,
    totalBaseBalance,
    totalManagedAssets,
  } = useAgentAPI();

  const [showFunding, setShowFunding] = useState(false);
  const [fundingTab, setFundingTab] = useState<"arc" | "lifi">("arc");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // Contract interactions
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // LI.FI Widget configuration with Premium Styling
  const widgetConfig: WidgetConfig = useMemo(() => ({
    integrator: "velvet-arc",
    appearance: "dark",
    variant: "wide",
    subvariant: "split",
    toChain: BASE_MAINNET_CHAIN_ID,
    toToken: BASE_MAINNET_USDC,
    toAddress: {
      address: state.agentAddress as `0x${string}`,
      chainType: ChainType.EVM,
    },
    theme: {
      container: {
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px",
        background: "rgba(10,10,10,0.6)",
        backdropFilter: "blur(20px)",
      },
      palette: {
        primary: { main: "#ffffff" },
        secondary: { main: "#888888" },
        background: {
          default: "transparent",
          paper: "rgba(255,255,255,0.02)",
        },
        text: {
          primary: "#ffffff",
          secondary: "#888888",
        },
      },
      shape: {
        borderRadius: 16,
        borderRadiusSecondary: 12,
      },
    },
    hiddenUI: ["appearance", "language", "poweredBy"],
    walletConfig: {
      onConnect() {
        openConnectModal?.();
      },
    },
  }), [state.agentAddress, openConnectModal]);

  // Reset form on success
  useEffect(() => {
    if (isConfirmed) {
      setDepositAmount("");
      setWithdrawAmount("");
      runStep();
    }
  }, [isConfirmed, runStep]);

  // Handlers
  const handleArcDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const amount = parseUnits(depositAmount, 6);
    writeContract({
      address: ARC_USDC as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [CONTRACTS.vault as `0x${string}`, amount],
    });
  };

  const handleArcWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    const shares = parseUnits(withdrawAmount, 6);
    writeContract({
      address: CONTRACTS.vault as `0x${string}`,
      abi: VAULT_ABI,
      functionName: "withdraw",
      args: [shares],
    });
  };

  const handleBaseTransfer = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    writeContract({
      address: BASE_SEPOLIA_USDC as `0x${string}`,
      abi: ERC20_ABI,
      functionName: "transfer",
      args: [state.agentAddress as `0x${string}`, parseUnits(depositAmount, 6)],
    });
  };

  // UI State Logic
  const getAgentMode = () => {
    if (state.volatility === "EXTREME") return { mode: "CIRCUIT BREAKER", color: "text-red-500", glow: "shadow-red-500/20" };
    if (state.volatility === "HIGH") return { mode: "PROTECT", color: "text-amber-400", glow: "shadow-amber-500/20" };
    if (state.volatility === "MEDIUM") return { mode: "BALANCE", color: "text-blue-400", glow: "shadow-blue-500/20" };
    return { mode: "YIELD", color: "text-emerald-400", glow: "shadow-emerald-500/20" };
  };

  const agentMode = getAgentMode();
  const currentFee = (state.hookFee / 10000).toFixed(2);
  const isOnArc = chain?.id === ARC_TESTNET_CHAIN_ID;
  const isOnBaseSepolia = chain?.id === BASE_SEPOLIA_CHAIN_ID;

  return (
    <main className="min-h-screen bg-[var(--void-deep)] text-[var(--light)] overflow-hidden font-sans selection:bg-white/20">
      <Head>
        <title>Dashboard | Velvet Arc</title>
      </Head>

      {/* Background Atmos */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.03),transparent_60%)]" />
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[url('/noise.png')] opacity-[0.03] animate-[noise_20s_infinite]" />
      </div>

      {/* Header */}
      <header className="fixed top-6 left-6 right-6 z-40 flex items-center justify-between pointer-events-none">
        <Link href="/" className="pointer-events-auto flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center group-hover:scale-105 transition-transform">
            <div className="w-4 h-4 rounded-full bg-white group-hover:shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-shadow" />
          </div>
          <span className="text-sm font-medium tracking-wide text-white/50 group-hover:text-white transition-colors">Velvet Arc</span>
        </Link>

        <div className="pointer-events-auto flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full border border-white/5 bg-[#0A0A0A]/50 backdrop-blur-md text-xs font-bold tracking-wider ${agentMode.color} ${agentMode.glow} shadow-lg transition-all`}>
            {agentMode.mode}
          </div>

          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className={`h-10 px-6 rounded-full text-xs font-medium tracking-wide uppercase transition-all duration-300 ${connected
                      ? "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                      : "bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]"
                    }`}
                >
                  {connected ? account.displayName : "Connect Identity"}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      {/* MAIN SPATIAL LAYOUT */}

      {/* 1. The Orb (Center Stage) */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="orb-glow animate-pulse opacity-30" />
        <div className="w-[600px] h-[600px] pointer-events-auto opacity-90 hover:opacity-100 transition-opacity duration-1000">
          <VelvetOrb />
        </div>
      </div>

      {/* 2. Top-Left: Terminal (Floating) - Below header with safe margin */}
      <div className="fixed top-[88px] left-6 z-30 w-[340px] pointer-events-auto">
        <TerminalLogs />
      </div>

      {/* 3. Top-Right: Capital Flow HUD - Below header with safe margin */}
      <div className="fixed top-[88px] right-6 z-30 w-72 glass-panel rounded-2xl p-5 pointer-events-auto hover:bg-black/40 transition-colors">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-mono text-[var(--ghost)] uppercase tracking-wider">Capital Allocation</h3>
          <div className={`w-2 h-2 rounded-full ${state.capitalState === "PROTECTED" ? "bg-blue-500" : "bg-emerald-500"} shadow-[0_0_10px_currentColor]`} />
        </div>

        <div className="space-y-4">
          {/* Arc */}
          <div className="group">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-medium text-white/60 group-hover:text-blue-400 transition-colors">Circle Arc</span>
              <span className="font-mono text-xs">${totalArcBalance.toFixed(2)}</span>
            </div>
            <div className="h-[2px] w-full bg-white/5 overflow-hidden">
              <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${totalManagedAssets > 0 ? (totalArcBalance / totalManagedAssets) * 100 : 0}%` }} />
            </div>
          </div>

          {/* Base */}
          <div className="group">
            <div className="flex justify-between items-end mb-1.5">
              <span className="text-xs font-medium text-white/60 group-hover:text-purple-400 transition-colors">Base</span>
              <span className="font-mono text-xs">${totalBaseBalance.toFixed(2)}</span>
            </div>
            <div className="h-[2px] w-full bg-white/5 overflow-hidden">
              <div className="h-full bg-purple-500 transition-all duration-1000 ease-out" style={{ width: `${totalManagedAssets > 0 ? (totalBaseBalance / totalManagedAssets) * 100 : 0}%` }} />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-between items-center">
            <span className="text-[10px] text-[var(--ghost)] uppercase">Total AUM</span>
            <span className="text-lg font-light tracking-tighter">${totalManagedAssets.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 4. Bottom-Left: Agent Status HUD */}
      <div className="fixed bottom-6 left-6 z-30 w-[340px] glass-panel rounded-2xl p-5 pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg font-bold">
            V
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold leading-tight truncate">{ENS_NAME}</h2>
            <span className="text-[10px] font-mono text-[var(--ghost)]">ITERATION #{state.iteration}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-[9px] font-bold border shrink-0 ${state.isRunning ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/10" : "border-white/10 text-white/40"}`}>
            {state.isRunning ? "ONLINE" : "STANDBY"}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {/* Metric Pills */}
          <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center gap-0.5 group">
            <span className="text-[9px] text-[var(--ghost)] uppercase">ETH</span>
            <span className="text-xs font-mono font-medium group-hover:text-white transition-colors">
              ${state.ethPrice > 0 ? state.ethPrice.toLocaleString() : "---"}
            </span>
          </div>
          <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center gap-0.5 group">
            <span className="text-[9px] text-[var(--ghost)] uppercase">Fee</span>
            <span className="text-xs font-mono font-medium group-hover:text-white transition-colors">
              {currentFee}%
            </span>
          </div>
          <div className="p-2 bg-white/5 rounded-lg border border-white/5 flex flex-col items-center justify-center gap-0.5 group">
            <span className="text-[9px] text-[var(--ghost)] uppercase">Vol</span>
            <span className={`text-xs font-mono font-medium ${agentMode.color}`}>
              {state.volatility}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <button
            onClick={() => state.isRunning ? stopAgent() : startAgent()}
            disabled={isLoading}
            className={`h-10 rounded-lg text-[10px] font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 ${state.isRunning
                ? "bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20"
                : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
              }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${state.isRunning ? "bg-red-500" : "bg-emerald-500"}`} />
            {state.isRunning ? "Stop" : "Start"}
          </button>

          <button
            onClick={() => runStep()}
            disabled={isLoading}
            className="h-10 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/5 text-[10px] font-bold tracking-wider uppercase transition-all"
          >
            Step
          </button>
        </div>

        <div className="flex gap-1.5 opacity-60 hover:opacity-100 transition-opacity justify-center">
          {["Low", "High", "Ext"].map((vol) => (
            <button
              key={vol}
              onClick={() => {
                if (vol === "Low") simulateLowVolatility();
                if (vol === "High") simulateHighVolatility();
                if (vol === "Ext") simulateExtremeVolatility();
              }}
              className="px-2.5 py-1 rounded-md bg-black/50 border border-white/5 text-[9px] font-medium text-[var(--ghost)] hover:text-white hover:border-white/20 transition-all"
            >
              {vol}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Bottom-Right: Action & Funding */}
      <div className="fixed bottom-6 right-6 z-30 w-72 glass-panel rounded-2xl p-5 pointer-events-auto">
        <div className="mb-3">
          <div className="text-[10px] font-mono text-[var(--ghost)] mb-1 uppercase">Last Action</div>
          <div className="text-xs font-medium text-white/90">
            {state.lastDecision ? state.lastDecision.action.replace(/_/g, " ") : "Waiting for signal..."}
          </div>
          {state.lastDecision && (
            <div className="mt-2 text-[10px] text-[var(--ghost)] leading-relaxed border-l border-white/10 pl-2 line-clamp-2">
              {state.lastDecision.reason}
            </div>
          )}
        </div>

        <button
          onClick={() => setShowFunding(true)}
          className="w-full h-11 bg-white text-black font-bold text-xs tracking-wide rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all flex items-center justify-center gap-2"
        >
          <span>Fund Treasury</span>
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* FUNDING MODAL OVERLAY */}
      {showFunding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl animate-fade-up">
          <div className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Treasury Deposit</h2>
                <p className="text-sm text-[var(--ghost)]">Select funding method</p>
              </div>
              <button onClick={() => setShowFunding(false)} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>

            {/* Modal Sub-nav */}
            <div className="px-6 pt-6 pb-2">
              <div className="flex gap-2 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setFundingTab("arc")}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${fundingTab === "arc" ? "bg-white text-black shadow-lg" : "text-[var(--ghost)] hover:text-white"}`}
                >
                  Direct (Testnet)
                </button>
                <button
                  onClick={() => setFundingTab("lifi")}
                  className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${fundingTab === "lifi" ? "bg-white text-black shadow-lg" : "text-[var(--ghost)] hover:text-white"}`}
                >
                  Cross-Chain (LI.FI)
                </button>
              </div>
            </div>

            <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
              {fundingTab === "arc" ? (
                <div className="space-y-6">
                  {/* Network Switchers */}
                  <div className="grid grid-cols-2 gap-4">
                    <button onClick={() => switchChain?.({ chainId: ARC_TESTNET_CHAIN_ID })} className={`p-4 rounded-2xl border transition-all text-left ${isOnArc ? "bg-blue-500/10 border-blue-500/50" : "bg-white/5 border-white/5 hover:border-white/20"}`}>
                      <div className="text-xs text-[var(--ghost)] mb-1">Network</div>
                      <div className={`font-bold ${isOnArc ? "text-blue-400" : "text-white"}`}>Arc Testnet</div>
                    </button>
                    <button onClick={() => switchChain?.({ chainId: BASE_SEPOLIA_CHAIN_ID })} className={`p-4 rounded-2xl border transition-all text-left ${isOnBaseSepolia ? "bg-purple-500/10 border-purple-500/50" : "bg-white/5 border-white/5 hover:border-white/20"}`}>
                      <div className="text-xs text-[var(--ghost)] mb-1">Network</div>
                      <div className={`font-bold ${isOnBaseSepolia ? "text-purple-400" : "text-white"}`}>Base Sepolia</div>
                    </button>
                  </div>

                  <div className="text-xs text-center text-[var(--ghost)] bg-white/5 p-3 rounded-lg">
                    Need testnet funds? <a href="https://faucet.circle.com/" target="_blank" className="text-white underline decoration-white/30 hover:decoration-white">Circle Faucet</a>
                  </div>

                  {/* Input Actions */}
                  {isConnected ? (
                    <div className="space-y-4 animate-fade-up">
                      {isOnArc && (
                        <div className="group">
                          <label className="text-xs font-medium ml-2 mb-2 block">Deposit to Arc Vault</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={e => setDepositAmount(e.target.value)}
                              placeholder="0.00"
                              className="flex-1 bg-transparent border-b border-white/20 px-4 py-3 text-xl font-mono focus:border-white focus:outline-none transition-colors placeholder:text-white/10"
                            />
                            <button
                              onClick={handleArcDeposit}
                              disabled={isPending || isConfirming || !depositAmount}
                              className="px-6 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black font-medium transition-all"
                            >
                              {isPending ? "..." : "Deposit"}
                            </button>
                          </div>
                        </div>
                      )}
                      {isOnBaseSepolia && (
                        <div className="group">
                          <label className="text-xs font-medium ml-2 mb-2 block">Transfer to Agent</label>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={e => setDepositAmount(e.target.value)}
                              placeholder="0.00"
                              className="flex-1 bg-transparent border-b border-white/20 px-4 py-3 text-xl font-mono focus:border-white focus:outline-none transition-colors placeholder:text-white/10"
                            />
                            <button
                              onClick={handleBaseTransfer}
                              disabled={isPending || isConfirming || !depositAmount}
                              className="px-6 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-medium transition-all"
                            >
                              {isPending ? "..." : "Send"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <p className="text-[var(--ghost)]">Connect wallet to fund treasury</p>
                    </div>
                  )}

                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <LiFiWidget integrator="velvet-arc" config={widgetConfig} />
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
