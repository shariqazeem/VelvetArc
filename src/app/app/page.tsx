"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import Link from "next/link";
import { parseUnits } from "viem";
import { CONTRACTS, ERC20_ABI, VAULT_ABI } from "@/lib/wagmi-config";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useUserPosition, useVaultData, useWithdraw } from "@/hooks/useContracts";
import { useENSIdentity, formatAddressOrENS } from "@/hooks/useENS";
import { HeroDashboard } from "@/components/HeroDashboard";
import { SponsorShowcase } from "@/components/SponsorShowcase";
import { YellowTerminal } from "@/components/YellowTerminal";
import { LiFiBridgePanel } from "@/components/LiFiBridgePanel";
import { StrategyExplainer } from "@/components/StrategyExplainer";
import { TransactionHistory } from "@/components/TransactionHistory";

const VelvetOrb = dynamic(
  () => import("@/components/VelvetOrb").then((mod) => mod.VelvetOrb),
  { ssr: false, loading: () => null }
);

const ARC_USDC = "0x3600000000000000000000000000000000000000";
const ARC_TESTNET_CHAIN_ID = 5042002;

export default function AppDashboard() {
  const { isConnected, chain, address: userAddress } = useAccount();
  const { openConnectModal } = useConnectModal();
  const { switchChain } = useSwitchChain();
  const {
    state,
    isLoading,
    startAgent,
    runStep,
    totalArcBalance,
    totalBaseBalance,
    totalManagedAssets,
  } = useAgentAPI();

  const [activeTab, setActiveTab] = useState<"overview" | "deposit" | "bridge" | "terminal">("overview");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [depositStep, setDepositStep] = useState<"idle" | "approving" | "depositing" | "success" | "error">("idle");
  const [withdrawStep, setWithdrawStep] = useState<"idle" | "withdrawing" | "success" | "error">("idle");
  const [txStatus, setTxStatus] = useState<string>("");

  const { shares, sharesRaw, shareValue, usdcBalance, allowanceRaw, refetch: refetchPosition } = useUserPosition();
  const { currentState, stateName } = useVaultData();
  const { withdraw: executeWithdraw, isPending: isWithdrawPending, isSuccess: isWithdrawSuccess, error: withdrawError, reset: resetWithdraw } = useWithdraw();
  const { name: agentENSName } = useENSIdentity(state.agentAddress);
  const { name: userENSName } = useENSIdentity(userAddress);
  const agentDisplayName = formatAddressOrENS(state.agentAddress, agentENSName);

  // Can withdraw only when vault is IDLE (0) or PROTECTED (4)
  const canWithdraw = currentState === 0 || currentState === 4;

  const { writeContract, data: txHash, isPending, error: txError, reset: resetTx } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

  // Auto-start agent on mount (runs autonomously)
  useEffect(() => {
    if (!state.isRunning) {
      startAgent();
    }
  }, []);

  useEffect(() => {
    if (isConfirmed && depositStep === "approving") {
      setDepositStep("depositing");
      setTxStatus("Depositing...");
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
      setDepositStep("success");
      setTxStatus("Success");
      setDepositAmount("");
      refetchPosition();
      runStep();
      setTimeout(() => {
        setDepositStep("idle");
        setTxStatus("");
        resetTx();
      }, 2000);
    }
  }, [isConfirmed, depositStep, depositAmount, refetchPosition, runStep, writeContract, resetTx]);

  useEffect(() => {
    if (txError) {
      setDepositStep("error");
      setTxStatus("Failed");
      setTimeout(() => {
        setDepositStep("idle");
        setTxStatus("");
        resetTx();
      }, 3000);
    }
  }, [txError, resetTx]);

  // Handle withdraw success
  useEffect(() => {
    if (isWithdrawSuccess && withdrawStep === "withdrawing") {
      setWithdrawStep("success");
      setWithdrawAmount("");
      refetchPosition();
      setTimeout(() => {
        setWithdrawStep("idle");
        resetWithdraw();
      }, 2000);
    }
  }, [isWithdrawSuccess, withdrawStep, refetchPosition, resetWithdraw]);

  // Handle withdraw error
  useEffect(() => {
    if (withdrawError) {
      setWithdrawStep("error");
      setTimeout(() => {
        setWithdrawStep("idle");
        resetWithdraw();
      }, 3000);
    }
  }, [withdrawError, resetWithdraw]);

  const handleWithdraw = () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return;
    setWithdrawStep("withdrawing");
    executeWithdraw(withdrawAmount);
  };

  const handleDeposit = () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return;
    const amount = parseUnits(depositAmount, 6);
    const currentAllowance = allowanceRaw ?? BigInt(0);

    if (currentAllowance < amount) {
      setDepositStep("approving");
      setTxStatus("Approving...");
      writeContract({
        address: ARC_USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: "approve",
        args: [CONTRACTS.vault as `0x${string}`, amount],
        chainId: ARC_TESTNET_CHAIN_ID,
      });
    } else {
      setDepositStep("depositing");
      setTxStatus("Depositing...");
      writeContract({
        address: CONTRACTS.vault as `0x${string}`,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [amount],
        chainId: ARC_TESTNET_CHAIN_ID,
      });
    }
  };

  const isOnArc = chain?.id === ARC_TESTNET_CHAIN_ID;
  const hasPosition = parseFloat(shares) > 0;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="h-14 px-6 flex items-center justify-between border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white" />
          </div>
          <span className="text-sm text-white/60">Velvet Arc</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 text-xs ${state.isRunning ? "text-white/60" : "text-white/30"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${state.isRunning ? "bg-white animate-pulse" : "bg-white/20"}`} />
            {state.isRunning ? "Live" : "Standby"}
          </div>
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal, mounted }) => {
              const connected = mounted && account && chain;
              return (
                <button
                  onClick={connected ? openAccountModal : openConnectModal}
                  className={`h-8 px-4 rounded text-xs transition-colors ${
                    connected
                      ? "text-white/60 hover:text-white"
                      : "bg-white text-black hover:bg-white/90"
                  }`}
                >
                  {connected ? (userENSName || account.displayName) : "Connect"}
                </button>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </header>

      <div className="flex h-[calc(100vh-56px)]">
        {/* Sidebar */}
        <aside className="w-56 p-4 border-r border-white/5 flex flex-col">
          {/* Agent Status (read-only for users) */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-xs text-white/30 uppercase tracking-wider">Agent</div>
              <div className={`w-1.5 h-1.5 rounded-full ${state.isRunning ? "bg-emerald-500 animate-pulse" : "bg-white/20"}`} />
            </div>
            <div className="text-sm text-white/70 mb-1">{agentDisplayName}</div>
            <div className="text-xs text-white/30 mb-2">
              {state.isRunning ? `Active · Iteration ${state.iteration}` : "Standby"}
            </div>

            {/* Vault Status */}
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40">Vault Status</span>
                <span className={`text-[10px] font-medium ${
                  canWithdraw ? "text-emerald-400" : "text-amber-400"
                }`}>
                  {stateName}
                </span>
              </div>
              <div className="text-[9px] text-white/30 mt-1">
                {canWithdraw ? "Withdrawals enabled" : "Capital deployed - withdrawals locked"}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1">
            {[
              { id: "overview", label: "Overview" },
              { id: "deposit", label: "Deposit" },
              { id: "bridge", label: "Bridge" },
              { id: "terminal", label: "Terminal" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-white/5 text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Position */}
          {isConnected && hasPosition && (
            <div className="pt-4 border-t border-white/5">
              <div className="text-xs text-white/30 mb-1">Your Position</div>
              <div className="text-xl font-light">${parseFloat(shareValue).toFixed(2)}</div>
            </div>
          )}
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-8">
            {activeTab === "overview" && (
              <div className="space-y-12">
                <HeroDashboard
                  capitalState={state.capitalState}
                  volatility={state.volatility}
                  arcBalance={totalArcBalance}
                  baseBalance={totalBaseBalance}
                  totalManaged={totalManagedAssets}
                  ethPrice={state.ethPrice}
                  priceChange24h={state.priceChange24h}
                  currentFee={state.hookFee}
                  isRunning={state.isRunning}
                  iteration={state.iteration}
                  lastDecision={state.lastDecision}
                />

                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <StrategyExplainer
                      volatility={state.volatility}
                      currentFee={state.hookFee}
                      capitalState={state.capitalState}
                      ethPrice={state.ethPrice}
                      aiReasoning={state.aiReasoning}
                      hookFee={state.hookFee}
                      hookVolatilityLevel={state.hookVolatilityLevel}
                      hookLiquidity={state.hookLiquidity}
                    />
                  </div>
                  <div>
                    <SponsorShowcase
                      hookFee={state.hookFee}
                      isVaultActive={parseFloat(state.vaultTotalDeposits) > 0}
                      hasENS={!!agentENSName}
                    />
                  </div>
                </div>

                {/* Transaction History */}
                <div className="pt-8 border-t border-white/5">
                  <TransactionHistory maxItems={8} />
                </div>

                {/* Contracts */}
                <div className="pt-8 border-t border-white/5">
                  <div className="text-xs text-white/30 uppercase tracking-wider mb-4">Contracts</div>
                  <div className="grid grid-cols-2 gap-4">
                    <a
                      href="https://testnet.arcscan.app/address/0xC4a486Ef5dce0655983F7aF31682E1AE107995dB"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                    >
                      <span>Arc Vault</span>
                      <span className="text-xs">View ↗</span>
                    </a>
                    <a
                      href="https://sepolia.basescan.org/address/0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between py-3 text-sm text-white/40 hover:text-white/60 transition-colors"
                    >
                      <span>Base Hook</span>
                      <span className="text-xs">View ↗</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "deposit" && (
              <div className="max-w-md mx-auto space-y-8">
                {/* Your Position Summary */}
                {isConnected && hasPosition && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10">
                    <div className="text-xs text-white/40 uppercase tracking-wider mb-4">Your Position</div>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <div className="text-3xl font-light">${parseFloat(shareValue).toFixed(2)}</div>
                        <div className="text-xs text-white/40 mt-1">Current Value</div>
                      </div>
                      <div>
                        <div className="text-3xl font-light text-emerald-400">
                          +{state.performance?.currentAPY?.toFixed(1) || "0.0"}%
                        </div>
                        <div className="text-xs text-white/40 mt-1">Projected APY</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-white/30">
                      {parseFloat(shares).toFixed(4)} shares · Earning from dynamic LP fees
                    </div>
                  </div>
                )}

                {/* Deposit Section */}
                <div>
                  <h2 className="text-xl font-light mb-6">Deposit</h2>

                  {!isConnected ? (
                    <div className="text-center py-12 rounded-xl border border-white/10">
                      <p className="text-white/40 mb-4">Connect wallet to deposit</p>
                      <button
                        onClick={openConnectModal}
                        className="px-6 py-2 bg-white text-black rounded text-sm hover:bg-white/90 transition-colors"
                      >
                        Connect
                      </button>
                    </div>
                  ) : !isOnArc ? (
                    <div className="text-center py-12 rounded-xl border border-white/10">
                      <p className="text-white/40 mb-4">Switch to Arc Testnet</p>
                      <button
                        onClick={() => switchChain?.({ chainId: ARC_TESTNET_CHAIN_ID })}
                        className="px-6 py-2 bg-white/10 text-white rounded text-sm hover:bg-white/20 transition-colors"
                      >
                        Switch Network
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between text-xs text-white/30">
                        <span>Amount</span>
                        <span>Balance: {parseFloat(usdcBalance).toFixed(2)} USDC</span>
                      </div>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          placeholder="0.00"
                          disabled={depositStep !== "idle"}
                          className="flex-1 h-12 bg-white/5 border border-white/10 rounded px-4 text-lg font-mono focus:border-white/30 focus:outline-none disabled:opacity-50"
                        />
                        <button
                          onClick={handleDeposit}
                          disabled={isPending || isConfirming || !depositAmount || depositStep !== "idle"}
                          className="h-12 px-6 bg-white text-black rounded text-sm font-medium hover:bg-white/90 disabled:opacity-50 transition-colors"
                        >
                          {depositStep !== "idle" ? txStatus : "Deposit"}
                        </button>
                      </div>
                      <a
                        href="https://faucet.circle.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-xs text-white/30 hover:text-white/50 transition-colors"
                      >
                        Get testnet USDC →
                      </a>
                    </div>
                  )}
                </div>

                {/* Withdraw Section */}
                {isConnected && hasPosition && (
                  <div>
                    <h2 className="text-xl font-light mb-6">Withdraw</h2>

                    {!canWithdraw ? (
                      <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/5">
                        <div className="flex items-center gap-2 text-amber-400 text-sm mb-2">
                          <span>⏳</span>
                          <span>Withdrawals Temporarily Locked</span>
                        </div>
                        <p className="text-xs text-white/40">
                          Capital is currently deployed on Base for yield generation.
                          Withdrawals will be available when capital returns to the vault.
                          Current status: <span className="text-amber-400">{stateName}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between text-xs text-white/30">
                          <span>Shares to Withdraw</span>
                          <button
                            onClick={() => setWithdrawAmount(shares)}
                            className="text-white/50 hover:text-white/70"
                          >
                            Max: {parseFloat(shares).toFixed(4)}
                          </button>
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.00"
                            disabled={withdrawStep !== "idle"}
                            className="flex-1 h-12 bg-white/5 border border-white/10 rounded px-4 text-lg font-mono focus:border-white/30 focus:outline-none disabled:opacity-50"
                          />
                          <button
                            onClick={handleWithdraw}
                            disabled={isWithdrawPending || !withdrawAmount || withdrawStep !== "idle"}
                            className="h-12 px-6 bg-white/10 text-white rounded text-sm font-medium hover:bg-white/20 disabled:opacity-50 transition-colors"
                          >
                            {withdrawStep === "withdrawing" ? "Withdrawing..." :
                             withdrawStep === "success" ? "Success!" :
                             withdrawStep === "error" ? "Failed" : "Withdraw"}
                          </button>
                        </div>
                        <p className="text-xs text-white/20">
                          Withdraw your shares + earned yield. Value includes fees captured during your deposit period.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* How It Works */}
                <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="text-xs text-white/40 uppercase tracking-wider mb-4">How You Earn</div>
                  <div className="space-y-3 text-xs text-white/50">
                    <div className="flex items-start gap-3">
                      <span className="text-white/30">1.</span>
                      <span>Deposit USDC → Receive vault shares proportionally</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-white/30">2.</span>
                      <span>Agent deploys capital to Uniswap V4 pool on Base</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-white/30">3.</span>
                      <span>Dynamic fees capture premium during high volatility</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-white/30">4.</span>
                      <span>Withdraw anytime (when vault is IDLE) with your share of fees</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "bridge" && (
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-light mb-8">Bridge</h2>
                <LiFiBridgePanel
                  destinationAddress={state.agentAddress as `0x${string}`}
                />
              </div>
            )}

            {activeTab === "terminal" && (
              <div>
                <h2 className="text-2xl font-light mb-8">Yellow Terminal</h2>
                <YellowTerminal />
              </div>
            )}
          </div>
        </main>

        {/* Right Panel - Stats */}
        <aside className="w-56 p-4 border-l border-white/5">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs text-white/30 uppercase tracking-wider">Market</div>
                {state.isRunning && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">ETH</span>
                  <span className="text-sm font-mono">${state.ethPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">24h</span>
                  <span className={`text-sm font-mono ${state.priceChange24h >= 0 ? "text-emerald-400/80" : "text-red-400/80"}`}>
                    {state.priceChange24h >= 0 ? "+" : ""}{state.priceChange24h.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-white/40">Volatility</span>
                  <span className={`text-sm font-medium ${
                    state.volatility === "HIGH" ? "text-amber-400" :
                    state.volatility === "EXTREME" ? "text-red-400" :
                    "text-white/70"
                  }`}>{state.volatility}</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="text-xs text-white/30 uppercase tracking-wider">Hook</div>
                {state.transactions.length > 0 && (
                  <span className="text-[9px] text-white/20">{state.transactions.length} tx</span>
                )}
              </div>
              <div className={`text-2xl font-light ${
                state.hookFee >= 5000 ? "text-amber-400" :
                state.hookFee >= 10000 ? "text-red-400" : ""
              }`}>
                {(state.hookFee / 10000 * 100).toFixed(2)}%
              </div>
              <div className="text-xs text-white/30">Dynamic fee</div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Vault</div>
              <div className="text-2xl font-light font-mono">${totalArcBalance.toFixed(2)}</div>
              <div className="text-xs text-white/30">Arc balance</div>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-3">Base</div>
              <div className="text-2xl font-light font-mono">${totalBaseBalance.toFixed(2)}</div>
              <div className="text-xs text-white/30">Deployed</div>
            </div>

            {/* Live Indicator */}
            {state.isRunning && (
              <div className="pt-6 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-white/40">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Iteration {state.iteration}</span>
                </div>
                <div className="text-[10px] text-white/20 mt-1">
                  Polling every 5s
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
