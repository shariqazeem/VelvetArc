"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { useReadContract } from "wagmi";
import { formatUnits } from "viem";

// VelvetHook ABI (view functions only)
const VELVET_HOOK_ABI = [
  {
    name: "dynamicFee",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint24" }],
  },
  {
    name: "volatilityLevel",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint8" }],
  },
  {
    name: "totalLiquidity",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "lastFeeUpdate",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "lastFeeReason",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "string" }],
  },
  {
    name: "getHookStatus",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "currentFee", type: "uint24" },
      { name: "currentVolatility", type: "uint8" },
      { name: "liquidity", type: "uint256" },
      { name: "lastUpdate", type: "uint256" },
      { name: "feeReason", type: "string" },
    ],
  },
  {
    name: "getFeeConfig",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "baseFee", type: "uint24" },
          { name: "lowVolFee", type: "uint24" },
          { name: "medVolFee", type: "uint24" },
          { name: "highVolFee", type: "uint24" },
          { name: "extremeFee", type: "uint24" },
        ],
      },
    ],
  },
  {
    name: "MAX_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint24" }],
  },
  {
    name: "MIN_FEE",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint24" }],
  },
] as const;

// Hook contract address on Base Sepolia
const HOOK_ADDRESS = "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2" as const;
const BASE_SEPOLIA_CHAIN_ID = 84532;

// Fee thresholds for visualization
const FEE_CONFIG = {
  MIN: 100, // 0.01%
  LOW: 200, // 0.02%
  MEDIUM: 500, // 0.05%
  HIGH: 1500, // 0.15%
  EXTREME: 5000, // 0.5%
  MAX: 10000, // 1.0%
};

interface StrategyExplainerProps {
  volatility: string;
  currentFee: number;
  capitalState: string;
  ethPrice: number;
  aiReasoning: {
    currentStrategy: string;
    factors: string[];
    confidence: number;
    nextAction: string;
  };
  // New props for real-time hook data
  hookFee?: number;
  hookVolatilityLevel?: number;
  hookLiquidity?: string;
}

const STRATEGIES = {
  LOW: {
    name: "Yield Mode",
    description: "Deploying capital for maximum yield capture.",
    color: "emerald",
  },
  MEDIUM: {
    name: "Balanced",
    description: "Maintaining balanced exposure with moderate fees.",
    color: "blue",
  },
  HIGH: {
    name: "Protective",
    description: "Elevated volatility. Increasing fees for protection.",
    color: "amber",
  },
  EXTREME: {
    name: "Circuit Breaker",
    description: "Capital returning to safe harbor.",
    color: "red",
  },
};

const VOLATILITY_LABELS = ["LOW", "MEDIUM", "HIGH", "EXTREME"] as const;

// Volatility Bar Component - Minimalist
function VolatilityBar({
  level,
  isLive,
}: {
  level: number;
  isLive: boolean;
}) {
  const bars = [
    { label: "Low" },
    { label: "Med" },
    { label: "High" },
    { label: "Ext" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">
          Volatility Scalar
        </span>
        {isLive && (
          <span className="flex items-center gap-1 text-[9px] text-white/40">
            <span className="w-1 h-1 rounded-full bg-white/50 animate-pulse" />
            LIVE
          </span>
        )}
      </div>
      <div className="flex gap-1 h-6">
        {bars.map((bar, i) => (
          <motion.div
            key={i}
            className="flex-1 relative rounded overflow-hidden"
            initial={false}
          >
            {/* Background */}
            <div className="absolute inset-0 bg-white/5" />
            {/* Fill */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 bg-white/40"
              initial={{ height: "0%" }}
              animate={{
                height: level >= i ? "100%" : "0%",
                opacity: level >= i ? (level === i ? 0.6 : 0.3) : 0.1,
              }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {/* Label */}
            <span className="absolute inset-0 flex items-center justify-center text-[8px] text-white/50">
              {bar.label}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Fee Gauge Component
function FeeGauge({
  fee,
  maxFee,
  isVolatilityHigh,
}: {
  fee: number;
  maxFee: number;
  isVolatilityHigh: boolean;
}) {
  const feePercent = (fee / 10000) * 100;
  const fillPercent = Math.min((fee / maxFee) * 100, 100);

  // Color based on fee level - solid colors, no gradients
  const getColor = () => {
    if (fee >= FEE_CONFIG.EXTREME) return "bg-white/60";
    if (fee >= FEE_CONFIG.HIGH) return "bg-white/50";
    if (fee >= FEE_CONFIG.MEDIUM) return "bg-white/40";
    return "bg-white/30";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">
          Current Fee
        </span>
        <motion.span
          key={fee}
          initial={{ scale: 1.2, color: "#ffffff" }}
          animate={{ scale: 1, color: "rgba(255,255,255,0.9)" }}
          className="text-lg font-light tabular-nums"
        >
          {feePercent.toFixed(2)}%
        </motion.span>
      </div>

      {/* Fee bar */}
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 ${getColor()} rounded-full`}
          initial={{ width: "0%" }}
          animate={{ width: `${fillPercent}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Threshold markers */}
        {[FEE_CONFIG.MEDIUM, FEE_CONFIG.HIGH, FEE_CONFIG.EXTREME].map(
          (threshold) => (
            <div
              key={threshold}
              className="absolute top-0 bottom-0 w-px bg-white/20"
              style={{ left: `${(threshold / maxFee) * 100}%` }}
            />
          )
        )}

        {/* Subtle pulse when high volatility */}
        {isVolatilityHigh && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </div>

      {/* Fee range labels */}
      <div className="flex justify-between text-[8px] text-white/30">
        <span>0.01%</span>
        <span>0.05%</span>
        <span>0.15%</span>
        <span>0.5%</span>
        <span>1.0%</span>
      </div>
    </div>
  );
}

// Hook Status Badge - Minimal
function HookStatusBadge({
  isConnected,
}: {
  isConnected: boolean;
}) {
  if (!isConnected) {
    return (
      <span className="flex items-center gap-1 text-[9px] text-white/40">
        <span className="w-1 h-1 rounded-full bg-white/30" />
        API
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1 text-[9px] text-white/50">
      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
      On-Chain
    </span>
  );
}

export function StrategyExplainer({
  volatility,
  currentFee,
  capitalState,
  ethPrice,
  aiReasoning,
  hookFee,
  hookVolatilityLevel,
  hookLiquidity,
}: StrategyExplainerProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showHookParams, setShowHookParams] = useState(true);

  // Read hook data from contract
  const { data: onChainFee, isSuccess: feeSuccess } = useReadContract({
    address: HOOK_ADDRESS,
    abi: VELVET_HOOK_ABI,
    functionName: "dynamicFee",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const { data: onChainVolatility, isSuccess: volSuccess } = useReadContract({
    address: HOOK_ADDRESS,
    abi: VELVET_HOOK_ABI,
    functionName: "volatilityLevel",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const { data: onChainLiquidity, isSuccess: liqSuccess } = useReadContract({
    address: HOOK_ADDRESS,
    abi: VELVET_HOOK_ABI,
    functionName: "totalLiquidity",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  const { data: feeReason } = useReadContract({
    address: HOOK_ADDRESS,
    abi: VELVET_HOOK_ABI,
    functionName: "lastFeeReason",
    chainId: BASE_SEPOLIA_CHAIN_ID,
  });

  // Determine if we have live data
  const hasLiveData = feeSuccess && volSuccess;

  // Use on-chain data if available, otherwise use props/simulation
  const effectiveFee = useMemo(() => {
    if (hasLiveData && onChainFee !== undefined) {
      return Number(onChainFee);
    }
    if (hookFee !== undefined) return hookFee;
    // Simulate based on volatility
    switch (volatility) {
      case "LOW":
        return FEE_CONFIG.LOW;
      case "MEDIUM":
        return FEE_CONFIG.MEDIUM;
      case "HIGH":
        return FEE_CONFIG.HIGH;
      case "EXTREME":
        return FEE_CONFIG.EXTREME;
      default:
        return currentFee;
    }
  }, [hasLiveData, onChainFee, hookFee, volatility, currentFee]);

  const effectiveVolatilityLevel = useMemo(() => {
    if (hasLiveData && onChainVolatility !== undefined) {
      return Number(onChainVolatility);
    }
    if (hookVolatilityLevel !== undefined) return hookVolatilityLevel;
    // Map string volatility to level
    const levelMap: Record<string, number> = {
      LOW: 0,
      MEDIUM: 1,
      HIGH: 2,
      EXTREME: 3,
    };
    return levelMap[volatility] ?? 1;
  }, [hasLiveData, onChainVolatility, hookVolatilityLevel, volatility]);

  const effectiveLiquidity = useMemo(() => {
    if (liqSuccess && onChainLiquidity !== undefined) {
      return formatUnits(onChainLiquidity, 6);
    }
    return hookLiquidity || "0";
  }, [liqSuccess, onChainLiquidity, hookLiquidity]);

  const isVolatilityHigh =
    effectiveVolatilityLevel >= 2 ||
    volatility === "HIGH" ||
    volatility === "EXTREME";

  const strategy =
    STRATEGIES[volatility as keyof typeof STRATEGIES] || STRATEGIES.MEDIUM;
  const feePercent = (effectiveFee / 10000).toFixed(2);
  const confidencePercent = (aiReasoning.confidence * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Strategy Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white">{strategy.name}</h4>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-white/40 font-mono uppercase">
              {volatility}
            </span>
            <HookStatusBadge isConnected={hasLiveData} />
          </div>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">
          {strategy.description}
        </p>
      </div>

      {/* Key Metrics - Clean Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-light text-white">
            ${ethPrice.toLocaleString()}
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">
            ETH
          </div>
        </div>
        <div className="text-center border-x border-white/5">
          <motion.div
            key={effectiveFee}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-lg font-light ${
              isVolatilityHigh ? "text-amber-400" : "text-white"
            }`}
          >
            {feePercent}%
          </motion.div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">
            Fee
          </div>
        </div>
        <div className="text-center">
          <div className="text-lg font-light text-white">
            {confidencePercent}%
          </div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">
            Conf
          </div>
        </div>
      </div>

      {/* Live Hook Parameters Section */}
      <div className="border-t border-white/5 pt-4">
        <button
          onClick={() => setShowHookParams(!showHookParams)}
          className="w-full flex items-center justify-between py-1 text-[10px] text-white/50 hover:text-white/70 transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="uppercase tracking-wider">
              Live Hook Parameters
            </span>
            <span className="text-[8px] text-white/30">
              Uniswap V4
            </span>
          </span>
          <motion.span
            animate={{ rotate: showHookParams ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            ↓
          </motion.span>
        </button>

        <AnimatePresence>
          {showHookParams && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 pt-3">
                {/* Fee Gauge */}
                <FeeGauge
                  fee={effectiveFee}
                  maxFee={FEE_CONFIG.MAX}
                  isVolatilityHigh={isVolatilityHigh}
                />

                {/* Volatility Bar Chart */}
                <VolatilityBar
                  level={effectiveVolatilityLevel}
                  isLive={hasLiveData}
                />

                {/* Hook Stats */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase mb-1">
                      Hook Liquidity
                    </div>
                    <div className="text-sm font-light text-white">
                      ${parseFloat(effectiveLiquidity).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                    <div className="text-[9px] text-white/30 uppercase mb-1">
                      Fee Reason
                    </div>
                    <div className="text-[10px] text-white/60 truncate">
                      {feeReason || strategy.description}
                    </div>
                  </div>
                </div>

                {/* Dynamic Fee Impact Visualization */}
                {isVolatilityHigh && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-lg bg-white/[0.03] border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full bg-white/60"
                      />
                      <span className="text-[10px] text-white/60 uppercase tracking-wider">
                        Fee Spike Active
                      </span>
                    </div>
                    <p className="text-[11px] text-white/40">
                      High volatility detected. Dynamic fee increased to{" "}
                      <span className="text-white/70">
                        {feePercent}%
                      </span>{" "}
                      to protect LPs from adverse selection.
                      {effectiveFee >= FEE_CONFIG.EXTREME && (
                        <span className="text-white/50">
                          {" "}
                          Approaching MAX_FEE threshold.
                        </span>
                      )}
                    </p>
                  </motion.div>
                )}

                {/* Hook Contract Info */}
                <div className="flex items-center justify-between text-[9px] text-white/20 pt-2 border-t border-white/5">
                  <span>Hook: {HOOK_ADDRESS.slice(0, 10)}...</span>
                  <a
                    href={`https://sepolia.basescan.org/address/${HOOK_ADDRESS}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white/40 transition-colors flex items-center gap-1"
                  >
                    View on BaseScan
                    <svg
                      className="w-2.5 h-2.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI Reasoning Toggle */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between py-2 border-t border-white/5 text-[10px] text-white/30 hover:text-white/50 transition-colors"
      >
        <span>AI Reasoning</span>
        <motion.span
          animate={{ rotate: showDetails ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ↓
        </motion.span>
      </button>

      {/* Expandable Details */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-3 pb-2">
              {/* Current Strategy */}
              <div>
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                  Strategy
                </div>
                <p className="text-xs text-white/70">
                  {aiReasoning.currentStrategy}
                </p>
              </div>

              {/* Decision Factors */}
              {aiReasoning.factors.length > 0 && (
                <div>
                  <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">
                    Factors
                  </div>
                  <div className="space-y-1">
                    {aiReasoning.factors.slice(0, 4).map((factor, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-start gap-2 text-[11px] text-white/50"
                      >
                        <span className="text-white/20 mt-0.5">·</span>
                        <span>{factor}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Next Action */}
              <div className="pt-2 border-t border-white/5">
                <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">
                  Next
                </div>
                <p className="text-xs text-white/60">{aiReasoning.nextAction}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Technology Stack - Sponsor Integrations */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
        {["Uniswap V4", "Circle Arc", "LI.FI", "Yellow", "ENS"].map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[9px] text-white/30 border border-white/10 rounded hover:text-white/50 hover:border-white/20 transition-colors"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
