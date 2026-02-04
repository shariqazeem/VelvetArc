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
import { useUserPosition, useWithdraw } from "@/hooks/useContracts";
import { useENSIdentity, formatAddressOrENS } from "@/hooks/useENS";
import { TerminalLogs } from "@/components/TerminalLogs";
import { SponsorBadges } from "@/components/SponsorBadges";
import { PerformanceDashboard } from "@/components/PerformanceDashboard";
import { EventFeed } from "@/components/EventFeed";
import { Leaderboard } from "@/components/Leaderboard";
import { FeeHistoryChart } from "@/components/FeeHistoryChart";
import { HowItWorks } from "@/components/HowItWorks";
import { SwapInterface } from "@/components/SwapInterface";
import { YieldTracker } from "@/components/YieldTracker";
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
  const [fundingTab, setFundingTab] = useState<"arc" | "swap" | "lifi">("arc");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositStep, setDepositStep] = useState<"idle" | "approving" | "depositing" | "success" | "error">("idle");
  const [txStatus, setTxStatus] = useState<string>("");

  // User position data
  const { shares, shareValue, usdcBalance, allowanceRaw, refetch: refetchPosition } = useUserPosition();
  const { withdraw, isPending: isWithdrawing, isSuccess: withdrawSuccess, reset: resetWithdraw } = useWithdraw();

  // ENS resolution for agent identity (queries Ethereum Mainnet)
  const { name: agentENSName, avatar: agentAvatar, isLoading: ensLoading } = useENSIdentity(state.agentAddress);
  const agentDisplayName = formatAddressOrENS(state.agentAddress, agentENSName);

  // ENS resolution for connected user
  const { address: userAddress } = useAccount();
  const { name: userENSName, avatar: userAvatar } = useENSIdentity(userAddress);

  // Contract interactions
  const { writeContract, data: txHash, isPending, error: txError, reset: resetTx } = useWriteContract();
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

  // Handle transaction confirmation - chain approve → deposit
  useEffect(() => {
    if (isConfirmed && depositStep === "approving") {
      // Approval confirmed, now do the actual deposit
      setDepositStep("depositing");
      setTxStatus("Depositing to vault...");
      const amount = parseUnits(depositAmount, 6);
      resetTx();
      setTimeout(() => {
        writeContract({
          address: CONTRACTS.vault as `0x${string}`,
          abi: VAULT_ABI,
          functionName: "deposit",
          args: [amount],
          chainId: ARC_TESTNET_CHAIN_ID,
        });
      }, 500);
    } else if (isConfirmed && depositStep === "depositing") {
      // Deposit confirmed!
      setDepositStep("success");
      setTxStatus("Deposit successful!");
      setDepositAmount("");
      refetchPosition();
      runStep();
      // Reset after 3 seconds
      setTimeout(() => {
        setDepositStep("idle");
        setTxStatus("");
        resetTx();
      }, 3000);
    } else if (isConfirmed) {
      // Other transaction confirmed (like Base transfer)
      setDepositAmount("");
      setWithdrawAmount("");
      refetchPosition();
      runStep();
    }
  }, [isConfirmed, depositStep, depositAmount, refetchPosition, runStep, writeContract, resetTx]);

  // Handle transaction errors
  useEffect(() => {
    if (txError) {
      setDepositStep("error");
      setTxStatus(`Error: ${txError.message?.slice(0, 50) || "Transaction failed"}`);
      setTimeout(() => {
        setDepositStep("idle");
        setTxStatus("");
        resetTx();
      }, 5000);
    }
  }, [txError, resetTx]);

  // Handle withdraw success
  useEffect(() => {
    if (withdrawSuccess) {
      setWithdrawAmount("");
      refetchPosition();
      resetWithdraw();
    }
  }, [withdrawSuccess, refetchPosition, resetWithdraw]);

  // Handle withdraw
  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    withdraw(withdrawAmount);
  };

  // Check if user has position
  const hasPosition = parseFloat(shares) > 0;

  // Handlers
  const handleArcDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const amount = parseUnits(depositAmount, 6);
    const currentAllowance = allowanceRaw ?? BigInt(0);

    // Check if we need approval first
    if (currentAllowance < amount) {
      setDepositStep("approving");
      setTxStatus("Approving USDC spend...");
      writeContract({
        address: ARC_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.vault as `0x${string}`, amount],
        chainId: ARC_TESTNET_CHAIN_ID,
      });
    } else {
      // Already approved, go straight to deposit
      setDepositStep("depositing");
      setTxStatus("Depositing to vault...");
      writeContract({
        address: CONTRACTS.vault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [amount],
        chainId: ARC_TESTNET_CHAIN_ID,
      });
    }
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

      {/* Sponsor Integration Badges - Bottom Center */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <SponsorBadges />
      </div>

      {/* How It Works Explainer - Shows what's real vs simulated */}
      <HowItWorks />

      {/* 2. Left Column: Terminal + Events - Scrollable */}
      <div className="fixed top-[88px] left-6 bottom-24 z-30 w-[340px] pointer-events-auto space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
        <TerminalLogs />
        <EventFeed />
        <FeeHistoryChart />
      </div>

      {/* 3. Right Column: Capital, Performance, User Position - Scrollable */}
      <div className="fixed top-[88px] right-6 bottom-24 z-30 w-80 pointer-events-auto space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 pr-1">
        {/* Capital Allocation */}
        <div className="glass-panel rounded-2xl p-5 hover:bg-black/40 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-mono text-[var(--ghost)] uppercase tracking-wider">Capital Allocation</h3>
            <div className={`w-2 h-2 rounded-full ${state.capitalState === "PROTECTED" ? "bg-blue-500" : "bg-emerald-500"} shadow-[0_0_10px_currentColor]`} />
          </div>

          <div className="space-y-4">
            {/* Arc */}
            <div className="group">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-medium text-white/60 group-hover:text-blue-400 transition-colors">Circle Arc (Safe)</span>
                <span className="font-mono text-xs">${totalArcBalance.toFixed(2)}</span>
              </div>
              <div className="h-[2px] w-full bg-white/5 overflow-hidden">
                <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${totalManagedAssets > 0 ? (totalArcBalance / totalManagedAssets) * 100 : 0}%` }} />
              </div>
            </div>

            {/* Base */}
            <div className="group">
              <div className="flex justify-between items-end mb-1.5">
                <span className="text-xs font-medium text-white/60 group-hover:text-purple-400 transition-colors">Base (Yield)</span>
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

        {/* Performance Dashboard */}
        <PerformanceDashboard />

        {/* User Position & Actions - Integrated into right column */}
        <div className="glass-panel rounded-2xl p-5">
          {isConnected ? (
            <>
              <div className="flex items-center gap-2 mb-4">
                {userAvatar ? (
                  <img src={userAvatar} alt="User" className="w-8 h-8 rounded-full object-cover border border-white/10" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-xs font-bold">
                    {userENSName ? userENSName.charAt(0).toUpperCase() : userAddress?.slice(2, 4).toUpperCase()}
                  </div>
                )}
                <div className="flex-1">
                  <div className="text-xs font-medium">
                    {userENSName || `${userAddress?.slice(0, 6)}...${userAddress?.slice(-4)}`}
                  </div>
                  <div className="text-[10px] text-[var(--ghost)]">
                    {hasPosition ? "Active Depositor" : "No Position"}
                  </div>
                </div>
                {hasPosition && (
                  <span className="text-[9px] px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    ${parseFloat(shareValue).toFixed(2)}
                  </span>
                )}
              </div>

              {hasPosition && (
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)]">Shares</div>
                    <div className="text-sm font-mono font-bold">{parseFloat(shares).toFixed(2)}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)]">Value</div>
                    <div className="text-sm font-mono font-bold text-emerald-400">${parseFloat(shareValue).toFixed(2)}</div>
                  </div>
                </div>
              )}

              {hasPosition && (
                <div className="flex gap-2 mb-4">
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="Shares to exit"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono focus:border-white/30 focus:outline-none"
                  />
                  <button
                    onClick={handleWithdraw}
                    disabled={isWithdrawing || !withdrawAmount}
                    className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-[10px] font-bold uppercase transition-all disabled:opacity-50"
                  >
                    {isWithdrawing ? "..." : "Exit"}
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowFunding(true)}
                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-bold text-sm tracking-wide rounded-xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] transition-all flex items-center justify-center gap-2"
              >
                <span>{hasPosition ? "Add Funds" : "Deposit Now"}</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                <svg className="w-6 h-6 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <p className="text-sm text-white/60 mb-1">Connect Wallet</p>
              <p className="text-[10px] text-white/30">to deposit and start earning</p>
            </div>
          )}
        </div>

        {/* Yield Tracker - Real-time fee analytics */}
        <YieldTracker />

        {/* Leaderboard - Real on-chain depositors */}
        <Leaderboard />
      </div>

      {/* 4. Bottom-Left: Agent Status HUD */}
      <div className="fixed bottom-6 left-6 z-30 w-[340px] glass-panel rounded-2xl p-5 pointer-events-auto">
        <div className="flex items-center gap-3 mb-4">
          {/* Agent Avatar - ENS or fallback */}
          {agentAvatar ? (
            <img src={agentAvatar} alt="Agent" className="w-10 h-10 rounded-xl object-cover border border-white/10" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-lg font-bold">
              {agentENSName ? agentENSName.charAt(0).toUpperCase() : "V"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold leading-tight truncate">{agentDisplayName}</h2>
              {agentENSName && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">ENS</span>
              )}
              {ensLoading && (
                <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/10 text-white/40 animate-pulse">resolving...</span>
              )}
            </div>
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
              <div className="flex gap-1 p-1 bg-white/5 rounded-xl">
                <button
                  onClick={() => setFundingTab("arc")}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fundingTab === "arc" ? "bg-white text-black shadow-lg" : "text-[var(--ghost)] hover:text-white"}`}
                >
                  Deposit
                </button>
                <button
                  onClick={() => setFundingTab("swap")}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fundingTab === "swap" ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg" : "text-[var(--ghost)] hover:text-white"}`}
                >
                  Swap
                </button>
                <button
                  onClick={() => setFundingTab("lifi")}
                  className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${fundingTab === "lifi" ? "bg-white text-black shadow-lg" : "text-[var(--ghost)] hover:text-white"}`}
                >
                  Bridge (LI.FI)
                </button>
              </div>
            </div>

            <div className="p-6 h-[480px] overflow-y-auto custom-scrollbar">
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

                  {/* Transaction Status Banner */}
                  {txStatus && (
                    <div className={`p-4 rounded-xl border text-center text-sm font-medium animate-pulse ${
                      depositStep === "success" ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-400" :
                      depositStep === "error" ? "bg-red-500/20 border-red-500/50 text-red-400" :
                      "bg-blue-500/20 border-blue-500/50 text-blue-400"
                    }`}>
                      {depositStep === "approving" && "⏳ "}
                      {depositStep === "depositing" && "⏳ "}
                      {depositStep === "success" && "✓ "}
                      {depositStep === "error" && "✗ "}
                      {txStatus}
                    </div>
                  )}

                  {/* Input Actions */}
                  {isConnected ? (
                    <div className="space-y-4 animate-fade-up">
                      {isOnArc && (
                        <div className="group">
                          <div className="flex justify-between items-center mb-2">
                            <label className="text-xs font-medium ml-2">Deposit to Arc Vault</label>
                            <span className="text-[10px] text-[var(--ghost)]">Balance: {parseFloat(usdcBalance).toFixed(2)} USDC</span>
                          </div>
                          <div className="flex gap-2">
                            <input
                              type="number"
                              value={depositAmount}
                              onChange={e => setDepositAmount(e.target.value)}
                              placeholder="0.00"
                              disabled={depositStep !== "idle"}
                              className="flex-1 bg-transparent border-b border-white/20 px-4 py-3 text-xl font-mono focus:border-white focus:outline-none transition-colors placeholder:text-white/10 disabled:opacity-50"
                            />
                            <button
                              onClick={handleArcDeposit}
                              disabled={isPending || isConfirming || !depositAmount || depositStep !== "idle"}
                              className={`px-6 rounded-xl font-medium transition-all min-w-[100px] ${
                                depositStep !== "idle"
                                  ? "bg-blue-500/30 text-blue-400 cursor-wait"
                                  : "bg-white/10 hover:bg-white text-white hover:text-black"
                              }`}
                            >
                              {depositStep === "approving" ? "Approving..." :
                               depositStep === "depositing" ? "Depositing..." :
                               isPending ? "Confirm..." :
                               isConfirming ? "Waiting..." :
                               "Deposit"}
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
              ) : fundingTab === "swap" ? (
                <div className="space-y-4">
                  {/* Swap Header */}
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-bold">Swap with Dynamic Fees</h3>
                    <p className="text-xs text-white/50 mt-1">
                      Fees adjust automatically based on market volatility
                    </p>
                  </div>

                  {/* Network Check */}
                  {!isOnBaseSepolia && isConnected && (
                    <button
                      onClick={() => switchChain?.({ chainId: BASE_SEPOLIA_CHAIN_ID })}
                      className="w-full p-4 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium hover:bg-purple-500/30 transition-all"
                    >
                      Switch to Base Sepolia to Swap
                    </button>
                  )}

                  {/* Swap Interface */}
                  {(isOnBaseSepolia || !isConnected) && (
                    <SwapInterface
                      onSwapComplete={(txHash, feeApplied) => {
                        console.log("Swap completed:", txHash, "Fee:", feeApplied);
                        runStep(); // Trigger agent to process the swap
                      }}
                    />
                  )}

                  {/* Bounty Info */}
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm">🦄</span>
                      <span className="text-xs font-bold text-purple-400">Uniswap V4 Agentic Finance</span>
                    </div>
                    <p className="text-[10px] text-white/60">
                      This swap uses our VelvetHook which dynamically adjusts fees based on
                      market volatility - demonstrating AI-controlled DeFi infrastructure.
                    </p>
                  </div>
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
