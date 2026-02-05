"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ProofItem {
  label: string;
  value: string;
  link?: string;
  verified: boolean;
}

export function OnChainProof() {
  const [expanded, setExpanded] = useState(false);

  const proofItems: ProofItem[] = [
    {
      label: "VelvetHook Contract",
      value: "0xa7b8...90C0",
      link: "https://sepolia.basescan.org/address/0xa7b8467208f2416E7691F0a15B83DC108e8D90C0",
      verified: true,
    },
    {
      label: "Pool Manager",
      value: "0x05E7...3408",
      link: "https://sepolia.basescan.org/address/0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408",
      verified: true,
    },
    {
      label: "Pool ID (USDC/WETH)",
      value: "0x1d5f...77e1",
      link: "https://sepolia.basescan.org/address/0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408#readContract",
      verified: true,
    },
    {
      label: "Agent Wallet",
      value: "0x55c3...592E",
      link: "https://sepolia.basescan.org/address/0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E",
      verified: true,
    },
  ];

  const hookFeatures = [
    "beforeSwap: Returns dynamic fee based on volatility",
    "afterSwap: Emits SwapProcessed event with fee applied",
    "afterInitialize: Stores pool configuration",
    "Dynamic fee range: 0.1% (low vol) to 5% (extreme vol)",
  ];

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <h3 className="text-[10px] font-mono text-[var(--ghost)] uppercase tracking-wider">
            On-Chain Proof
          </h3>
        </div>
        <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Base Sepolia
        </span>
      </div>

      {/* Deployed Contracts */}
      <div className="space-y-2 mb-4">
        {proofItems.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] group"
          >
            <div className="flex items-center gap-2">
              {item.verified && (
                <svg className="w-3 h-3 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              <span className="text-[10px] text-white/60">{item.label}</span>
            </div>
            {item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-mono text-white/40 hover:text-white/80 transition-colors"
              >
                {item.value} ↗
              </a>
            ) : (
              <span className="text-[10px] font-mono text-white/40">{item.value}</span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Hook Features Toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between py-2 border-t border-white/5 text-[10px] text-white/30 hover:text-white/50 transition-colors"
      >
        <span>Hook Capabilities</span>
        <motion.span animate={{ rotate: expanded ? 180 : 0 }}>↓</motion.span>
      </button>

      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="space-y-1 pt-2"
        >
          {hookFeatures.map((feature, i) => (
            <div key={i} className="flex items-start gap-2 text-[10px] text-white/50">
              <span className="text-emerald-400/60 mt-0.5">→</span>
              <span>{feature}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Real Swap Trace Evidence */}
      <div className="mt-4 pt-3 border-t border-white/5">
        <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Swap Trace Evidence</div>
        <div className="p-2 rounded bg-black/20 font-mono text-[9px] text-emerald-400/80 overflow-x-auto">
          <div>beforeSwap → fee: 4204304 (dynamic!)</div>
          <div>emit Swap → fee: 10000 (1%)</div>
          <div>afterSwap → SwapProcessed ✓</div>
        </div>
        <p className="text-[9px] text-white/30 mt-2">
          Hook logic verified via swap traces. Liquidity pending for live swaps.
        </p>
      </div>
    </div>
  );
}
