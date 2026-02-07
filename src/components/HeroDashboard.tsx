"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface HeroDashboardProps {
  capitalState: "PROTECTED" | "EARNING" | "CIRCUIT_BREAKER";
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  arcBalance: number;
  baseBalance: number;
  totalManaged: number;
  ethPrice: number;
  priceChange24h: number;
  currentFee: number;
  isRunning: boolean;
  iteration: number;
  lastDecision: {
    action: string;
    reason: string;
    confidence: number;
    timestamp: number;
  } | null;
}

export function HeroDashboard({
  capitalState,
  volatility,
  arcBalance,
  baseBalance,
  totalManaged,
  ethPrice,
  priceChange24h,
  currentFee,
  isRunning,
  iteration,
  lastDecision,
}: HeroDashboardProps) {
  const [countdown, setCountdown] = useState(5);
  const [priceFlash, setPriceFlash] = useState(false);
  const prevPriceRef = useRef(ethPrice);
  const prevFeeRef = useRef(currentFee);
  const [feeFlash, setFeeFlash] = useState(false);

  // Countdown timer for next agent action
  useEffect(() => {
    if (!isRunning) {
      setCountdown(5);
      return;
    }

    const interval = setInterval(() => {
      setCountdown(prev => prev <= 1 ? 5 : prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Flash on price change
  useEffect(() => {
    if (prevPriceRef.current !== ethPrice && ethPrice > 0) {
      setPriceFlash(true);
      setTimeout(() => setPriceFlash(false), 500);
    }
    prevPriceRef.current = ethPrice;
  }, [ethPrice]);

  // Flash on fee change
  useEffect(() => {
    if (prevFeeRef.current !== currentFee && currentFee > 0) {
      setFeeFlash(true);
      setTimeout(() => setFeeFlash(false), 500);
    }
    prevFeeRef.current = currentFee;
  }, [currentFee]);

  const arcPercent = totalManaged > 0 ? (arcBalance / totalManaged) * 100 : 100;

  const getStatusLabel = () => {
    switch (capitalState) {
      case "PROTECTED": return "Safe Harbor";
      case "EARNING": return "Earning";
      case "CIRCUIT_BREAKER": return "Protected";
    }
  };

  const getStatusDescription = () => {
    switch (capitalState) {
      case "PROTECTED": return "Capital secured on Arc";
      case "EARNING": return "Active on Uniswap V4";
      case "CIRCUIT_BREAKER": return "Emergency withdrawal";
    }
  };

  return (
    <div className="space-y-8">
      {/* Status Section */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <motion.span
              className={`w-2 h-2 rounded-full ${
                capitalState === "EARNING" ? "bg-white" :
                capitalState === "CIRCUIT_BREAKER" ? "bg-white/50" : "bg-white/70"
              }`}
              animate={isRunning ? { scale: [1, 1.3, 1], opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <h1 className="text-3xl font-light tracking-tight">{getStatusLabel()}</h1>
            {isRunning && (
              <span className="text-xs text-white/30 font-mono">
                next: {countdown}s
              </span>
            )}
          </div>
          <p className="text-sm text-white/40 ml-5">{getStatusDescription()}</p>
        </div>
        <div className="text-right">
          <motion.div
            className="text-4xl font-light tracking-tight"
            animate={isRunning ? { opacity: [1, 0.8, 1] } : {}}
            transition={{ duration: 3, repeat: Infinity }}
          >
            ${totalManaged.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </motion.div>
          <div className="text-xs text-white/30 mt-1">Total Managed</div>
        </div>
      </div>

      {/* Capital Distribution */}
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-white/40">
          <span>Arc · ${arcBalance.toFixed(2)}</span>
          <span>Base · ${baseBalance.toFixed(2)}</span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-white/40"
            animate={{ width: `${arcPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6">
        <div>
          <div className="text-xs text-white/30 mb-1">ETH</div>
          <motion.div
            className="text-xl font-light"
            animate={priceFlash ? { color: ["#fff", "#22c55e", "#fff"] } : {}}
            transition={{ duration: 0.5 }}
          >
            ${ethPrice.toLocaleString()}
          </motion.div>
          <div className={`text-xs ${priceChange24h >= 0 ? "text-white/50" : "text-white/40"}`}>
            {priceChange24h >= 0 ? "+" : ""}{priceChange24h.toFixed(2)}%
          </div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Volatility</div>
          <motion.div
            key={volatility}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-xl font-light ${
              volatility === "HIGH" ? "text-amber-400" :
              volatility === "EXTREME" ? "text-red-400" : ""
            }`}
          >
            {volatility}
          </motion.div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Hook Fee</div>
          <motion.div
            className="text-xl font-light"
            animate={feeFlash ? { color: ["#fff", "#f59e0b", "#fff"] } : {}}
            transition={{ duration: 0.5 }}
          >
            {(currentFee / 10000 * 100).toFixed(2)}%
          </motion.div>
        </div>
        <div>
          <div className="text-xs text-white/30 mb-1">Confidence</div>
          <div className="text-xl font-light">
            {lastDecision ? `${(lastDecision.confidence * 100).toFixed(0)}%` : "—"}
          </div>
        </div>
      </div>

      {/* Last Decision */}
      {lastDecision && (
        <motion.div
          key={lastDecision.timestamp}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-4 border-t border-white/5"
        >
          <div className="flex items-center gap-3">
            <motion.span
              className="w-1.5 h-1.5 rounded-full bg-white/50"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <span className="text-xs text-white/30 uppercase tracking-wider">Decision</span>
            <span className="text-sm text-white/70">{lastDecision.action}</span>
            <span className="text-xs text-white/30">·</span>
            <span className="text-xs text-white/40 truncate max-w-md">{lastDecision.reason}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
