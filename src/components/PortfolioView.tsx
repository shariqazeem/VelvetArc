"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";

interface YieldEvent {
  timestamp: number;
  amount: number;
  reason: string;
}

interface PortfolioViewProps {
  yieldHistory: YieldEvent[];
  totalYield: number;
  feesCaptured: number;
  currentAPY: number;
  protectionEvents: number;
  protectionSavings: number;
  iteration: number;
  isRunning: boolean;
}

export function PortfolioView({
  yieldHistory,
  totalYield,
  feesCaptured,
  currentAPY,
  protectionEvents,
  protectionSavings,
  iteration,
  isRunning,
}: PortfolioViewProps) {
  const [showHistory, setShowHistory] = useState(false);

  // Generate sparkline data
  const sparklineData = useMemo(() => {
    if (yieldHistory.length === 0) return [];
    let cumulative = 0;
    return yieldHistory.map(event => {
      cumulative += event.amount;
      return cumulative;
    });
  }, [yieldHistory]);

  // Generate SVG path
  const sparklinePath = useMemo(() => {
    if (sparklineData.length < 2) return "";
    const max = Math.max(...sparklineData) || 1;
    const width = 200;
    const height = 40;
    const points = sparklineData.map((y, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const yPos = height - (y / max) * height * 0.8 - 4;
      return `${x},${yPos}`;
    });
    return `M ${points.join(" L ")}`;
  }, [sparklineData]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-white">Performance</h4>
        <div className="flex items-center gap-2">
          {isRunning && (
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] text-white/40 font-mono">LIVE</span>
            </div>
          )}
          <span className="text-[10px] text-white/30 font-mono">#{iteration}</span>
        </div>
      </div>

      {/* Main Yield Display */}
      <div className="text-center py-4">
        <div className="text-3xl font-light text-white tracking-tight">
          ${totalYield.toFixed(4)}
        </div>
        <div className="text-[10px] text-white/30 uppercase tracking-wider mt-1">
          Total Yield
        </div>
      </div>

      {/* Sparkline Chart */}
      {sparklineData.length >= 2 && (
        <div className="h-12 -mx-2">
          <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
            <motion.path
              d={sparklinePath}
              fill="none"
              stroke="rgba(255,255,255,0.3)"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>
        </div>
      )}

      {/* Stats Grid - Minimal */}
      <div className="grid grid-cols-3 gap-4 py-3 border-y border-white/5">
        <div className="text-center">
          <div className="text-sm font-light text-white">
            {currentAPY > 0 ? `${currentAPY.toFixed(1)}%` : "—"}
          </div>
          <div className="text-[9px] text-white/30 uppercase">APY</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-light text-white">${feesCaptured.toFixed(2)}</div>
          <div className="text-[9px] text-white/30 uppercase">Fees</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-light text-white">{protectionEvents}</div>
          <div className="text-[9px] text-white/30 uppercase">Protected</div>
        </div>
      </div>

      {/* Yield History Toggle */}
      <button
        onClick={() => setShowHistory(!showHistory)}
        className="w-full flex items-center justify-between py-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
      >
        <span>Activity ({yieldHistory.length})</span>
        <motion.span animate={{ rotate: showHistory ? 180 : 0 }}>↓</motion.span>
      </button>

      {/* Expandable History */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin">
              {yieldHistory.length > 0 ? (
                yieldHistory.slice(0, 10).map((event, i) => (
                  <motion.div
                    key={`${event.timestamp}-${i}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="flex items-center justify-between py-1.5 text-[10px]"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-white/60">+${event.amount.toFixed(4)}</span>
                      <span className="text-white/30 truncate max-w-[100px]">{event.reason}</span>
                    </div>
                    <span className="text-white/20 font-mono">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-4 text-[10px] text-white/20">
                  No yield events yet
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
