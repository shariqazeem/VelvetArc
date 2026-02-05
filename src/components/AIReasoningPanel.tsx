"use client";

import { motion } from "framer-motion";

interface AIReasoningPanelProps {
  reasoning: {
    currentStrategy: string;
    factors: string[];
    confidence: number;
    nextAction: string;
  };
  poolMetrics: {
    totalVolume: string;
    swapCount: number;
    lastSwapTime: number;
    netFlow: string;
  };
  performance: {
    totalYieldGenerated: number;
    currentAPY: number;
    feesCaptured: number;
  };
  ethPrice: number;
}

export function AIReasoningPanel({ reasoning, poolMetrics, performance, ethPrice }: AIReasoningPanelProps) {
  const volumeUSD = parseFloat(poolMetrics.totalVolume) * ethPrice;
  const confidencePercent = (reasoning.confidence * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Current Strategy */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🧠</span>
          <h3 className="font-bold text-purple-400">AI Strategy</h3>
          <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300">
            {confidencePercent}% confident
          </span>
        </div>
        <p className="text-sm text-white/80">{reasoning.currentStrategy}</p>
      </div>

      {/* Decision Factors */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
        <h4 className="text-xs font-bold text-white/60 mb-3 uppercase tracking-wider">Decision Factors</h4>
        <div className="space-y-2">
          {reasoning.factors.map((factor, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-2 text-xs"
            >
              <span className="text-emerald-400 mt-0.5">•</span>
              <span className="text-white/70">{factor}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Next Action */}
      <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-center gap-2">
          <span className="text-blue-400">→</span>
          <span className="text-xs text-white/60">Next Action:</span>
        </div>
        <p className="text-sm text-blue-300 mt-1">{reasoning.nextAction}</p>
      </div>

      {/* Real Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase">Real Volume</div>
          <div className="text-lg font-mono text-white/90">${volumeUSD.toFixed(2)}</div>
          <div className="text-[10px] text-white/40">{poolMetrics.swapCount} swaps</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase">Fees Captured</div>
          <div className="text-lg font-mono text-emerald-400">${performance.feesCaptured.toFixed(4)}</div>
          <div className="text-[10px] text-white/40">from real swaps</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase">Total Yield</div>
          <div className="text-lg font-mono text-white/90">${performance.totalYieldGenerated.toFixed(4)}</div>
          <div className="text-[10px] text-white/40">lifetime</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
          <div className="text-[10px] text-white/40 uppercase">Projected APY</div>
          <div className="text-lg font-mono text-purple-400">{performance.currentAPY.toFixed(1)}%</div>
          <div className="text-[10px] text-white/40">based on volume</div>
        </div>
      </div>

      {/* Confidence Meter */}
      <div className="p-3 rounded-xl bg-white/5 border border-white/10">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[10px] text-white/40 uppercase">AI Confidence</span>
          <span className="text-xs font-mono text-white/60">{confidencePercent}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${reasoning.confidence * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </div>
  );
}
