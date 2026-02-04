"use client";

import { useState } from "react";
import { useAgentAPI } from "@/hooks/useAgentAPI";
import { motion, AnimatePresence } from "framer-motion";

interface Step {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "complete";
  txHash?: string;
  chain?: "arc" | "base";
  details?: string[];
}

export function HowItWorks() {
  const [isOpen, setIsOpen] = useState(false);
  const { state } = useAgentAPI();

  const steps: Step[] = [
    {
      id: "deposit",
      title: "1. Deposit USDC",
      description: "Your USDC goes to VelvetVault on Circle Arc",
      status: parseFloat(state.vaultTotalDeposits) > 0 ? "complete" : "pending",
      chain: "arc",
      details: [
        "Approve USDC spend → Real transaction",
        "Deposit to vault → Real transaction",
        "Receive shares proportional to deposit",
        "Vault address: " + (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB"),
      ],
    },
    {
      id: "monitor",
      title: "2. Agent Monitors Market",
      description: "Fetches real ETH price and calculates volatility",
      status: state.ethPrice > 0 ? "complete" : "pending",
      details: [
        `Current ETH: $${state.ethPrice.toFixed(2)}`,
        `24h Change: ${state.priceChange24h >= 0 ? "+" : ""}${state.priceChange24h.toFixed(2)}%`,
        `Volatility Level: ${state.volatility}`,
        "Data source: CoinGecko API (real)",
      ],
    },
    {
      id: "decide",
      title: "3. Agent Makes Decision",
      description: "Calculates optimal fee based on volatility",
      status: state.lastDecision ? "complete" : "pending",
      details: [
        "LOW volatility (<3%) → 0.05% fee (attract volume)",
        "MEDIUM volatility (3-7%) → 0.30% fee (balanced)",
        "HIGH volatility (7-10%) → 1.00% fee (capture premium)",
        "EXTREME volatility (>10%) → Circuit breaker",
        `Current decision: ${state.lastDecision?.action || "Waiting..."}`,
      ],
    },
    {
      id: "execute",
      title: "4. Execute On-Chain",
      description: "Updates Uniswap V4 hook fee via real transaction",
      status: state.transactions.length > 0 ? "complete" : "pending",
      chain: "base",
      details: [
        `Current fee: ${(state.hookFee / 100).toFixed(2)}%`,
        `Transactions sent: ${state.transactions.length}`,
        "Hook address: " + (process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2"),
        "Every fee update is a real Base Sepolia transaction",
      ],
    },
    {
      id: "earn",
      title: "5. Earn from Swaps",
      description: "Fees collected when traders swap through the pool",
      status: "pending",
      details: [
        "When someone swaps ETH/USDC through our pool...",
        "They pay the dynamic fee we set",
        "Fee revenue goes to liquidity providers",
        "⚠️ On testnet: No real swaps happening",
        "On mainnet: Real yield from real trading volume",
      ],
    },
  ];

  return (
    <>
      {/* Trigger Button - positioned above sponsor badges */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white/80 hover:text-white transition-all flex items-center gap-2 backdrop-blur-sm"
      >
        <span className="text-sm">?</span>
        <span>How It Works</span>
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-6 border-b border-white/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">How Velvet Arc Works</h2>
                    <p className="text-sm text-white/50 mt-1">Real transactions, real data, autonomous agent</p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Steps */}
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div
                      key={step.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        step.status === "complete"
                          ? "bg-emerald-500/10 border-emerald-500/30"
                          : step.status === "active"
                          ? "bg-blue-500/10 border-blue-500/30"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            step.status === "complete"
                              ? "bg-emerald-500 text-black"
                              : step.status === "active"
                              ? "bg-blue-500 text-white"
                              : "bg-white/10 text-white/50"
                          }`}
                        >
                          {step.status === "complete" ? "✓" : index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{step.title}</h3>
                            {step.chain && (
                              <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                                step.chain === "arc" ? "bg-blue-500/20 text-blue-400" : "bg-purple-500/20 text-purple-400"
                              }`}>
                                {step.chain === "arc" ? "Arc Testnet" : "Base Sepolia"}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/60 mt-1">{step.description}</p>

                          {step.details && (
                            <div className="mt-3 space-y-1">
                              {step.details.map((detail, i) => (
                                <div key={i} className="text-[11px] text-white/40 flex items-start gap-2">
                                  <span className="text-white/20">•</span>
                                  <span className={detail.startsWith("⚠️") ? "text-amber-400/80" : ""}>
                                    {detail}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* What's Real Section */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20">
                  <h3 className="font-bold text-emerald-400 mb-2">✓ What's Verifiably Real</h3>
                  <ul className="text-sm text-white/70 space-y-1">
                    <li>• Every deposit/withdrawal → Real Arc testnet transaction</li>
                    <li>• Every fee update → Real Base Sepolia transaction</li>
                    <li>• Market data → Real CoinGecko API</li>
                    <li>• All transactions verifiable on block explorers</li>
                  </ul>
                </div>

                {/* Testnet Note */}
                <div className="mt-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                  <h3 className="font-bold text-amber-400 mb-2">⚠️ Testnet Status</h3>
                  <p className="text-sm text-white/70 mb-2">
                    <strong>Real & Verifiable:</strong> Deposits, fee updates, and market monitoring
                    are all real on-chain transactions you can verify on block explorers.
                  </p>
                  <p className="text-sm text-white/70">
                    <strong>Swap Volume:</strong> The V4 pool needs liquidity for real swaps.
                    The dynamic fee mechanism is fully functional - when swaps occur,
                    fees adjust based on volatility to maximize LP returns.
                  </p>
                </div>

                {/* Technical Architecture */}
                <div className="mt-4 p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20">
                  <h3 className="font-bold text-blue-400 mb-2">🏗️ Architecture</h3>
                  <div className="text-sm text-white/70 space-y-1">
                    <p>• <strong>Arc Testnet:</strong> VelvetVault (deposits, shares, yield distribution)</p>
                    <p>• <strong>Base Sepolia:</strong> VelvetHook (Uniswap V4 dynamic fees)</p>
                    <p>• <strong>Agent:</strong> Monitors ETH volatility, updates fees on-chain</p>
                    <p>• <strong>Cross-chain:</strong> LI.FI integration for bridging</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/5 flex justify-between items-center">
                <div className="text-[10px] text-white/30">
                  Velvet Arc • ETHGlobal HackMoney 2026
                </div>
                <div className="flex gap-2">
                  <a
                    href={`https://testnet.arcscan.app/address/${process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-3 py-1.5 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                  >
                    View Vault on Arc
                  </a>
                  <a
                    href={`https://sepolia.basescan.org/address/${process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] px-3 py-1.5 rounded-full bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors"
                  >
                    View Hook on Base
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
