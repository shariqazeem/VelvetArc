"use client";

import { motion } from "framer-motion";
import { useState } from "react";

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
}

const STRATEGIES = {
  LOW: {
    name: "Yield Mode",
    description: "Deploying capital for maximum yield capture.",
  },
  MEDIUM: {
    name: "Balanced",
    description: "Maintaining balanced exposure with moderate fees.",
  },
  HIGH: {
    name: "Protective",
    description: "Elevated volatility. Increasing fees for protection.",
  },
  EXTREME: {
    name: "Circuit Breaker",
    description: "Capital returning to safe harbor.",
  },
};

export function StrategyExplainer({
  volatility,
  currentFee,
  capitalState,
  ethPrice,
  aiReasoning,
}: StrategyExplainerProps) {
  const [showDetails, setShowDetails] = useState(false);

  const strategy = STRATEGIES[volatility as keyof typeof STRATEGIES] || STRATEGIES.MEDIUM;
  const feePercent = (currentFee / 10000).toFixed(2);
  const confidencePercent = (aiReasoning.confidence * 100).toFixed(0);

  return (
    <div className="space-y-4">
      {/* Strategy Header */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium text-white">{strategy.name}</h4>
          <span className="text-[10px] text-white/40 font-mono uppercase">{volatility}</span>
        </div>
        <p className="text-xs text-white/50 leading-relaxed">{strategy.description}</p>
      </div>

      {/* Key Metrics - Clean Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center">
          <div className="text-lg font-light text-white">${ethPrice.toLocaleString()}</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">ETH</div>
        </div>
        <div className="text-center border-x border-white/5">
          <div className="text-lg font-light text-white">{feePercent}%</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Fee</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-light text-white">{confidencePercent}%</div>
          <div className="text-[9px] text-white/30 uppercase tracking-wider">Conf</div>
        </div>
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
      <motion.div
        initial={false}
        animate={{ height: showDetails ? "auto" : 0, opacity: showDetails ? 1 : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <div className="space-y-3 pb-2">
          {/* Current Strategy */}
          <div>
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Strategy</div>
            <p className="text-xs text-white/70">{aiReasoning.currentStrategy}</p>
          </div>

          {/* Decision Factors */}
          {aiReasoning.factors.length > 0 && (
            <div>
              <div className="text-[9px] text-white/30 uppercase tracking-wider mb-2">Factors</div>
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
            <div className="text-[9px] text-white/30 uppercase tracking-wider mb-1">Next</div>
            <p className="text-xs text-white/60">{aiReasoning.nextAction}</p>
          </div>
        </div>
      </motion.div>

      {/* Technology Stack - Subtle */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
        {["Uniswap V4", "Circle Arc", "LI.FI", "ENS"].map((tech) => (
          <span
            key={tech}
            className="px-2 py-0.5 text-[9px] text-white/30 border border-white/5 rounded"
          >
            {tech}
          </span>
        ))}
      </div>
    </div>
  );
}
