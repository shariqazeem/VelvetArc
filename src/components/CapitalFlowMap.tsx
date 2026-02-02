"use client";

import { motion } from "framer-motion";
import { useVelvetStore } from "@/hooks/useVelvetStore";
import { useVaultData } from "@/hooks/useContracts";

// Format large numbers
function formatUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
  return `$${value.toFixed(0)}`;
}

export function CapitalFlowMap() {
  const { vaultState, agentState } = useVelvetStore();
  const { vaultBalance } = useVaultData();

  // Calculate balances
  const arcBalance = parseFloat(vaultBalance) || 0;
  const baseBalance = agentState.deployedAmount / 1_000_000; // Convert from micro units
  const totalCapital = arcBalance + baseBalance;

  // Determine flow direction
  const isBridgingOut = vaultState === 1; // BRIDGING_OUT
  const isBridgingBack = vaultState === 3; // BRIDGING_BACK
  const isDeployed = vaultState === 2; // DEPLOYED
  const isProtected = vaultState === 4; // PROTECTED

  // Flow animation variants
  const flowVariants = {
    idle: { pathLength: 0, opacity: 0 },
    bridgingOut: {
      pathLength: [0, 1],
      opacity: 1,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    bridgingBack: {
      pathLength: [1, 0],
      opacity: 1,
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    },
    deployed: { pathLength: 1, opacity: 0.3 }
  };

  const getFlowState = () => {
    if (isBridgingOut) return "bridgingOut";
    if (isBridgingBack) return "bridgingBack";
    if (isDeployed) return "deployed";
    return "idle";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="fixed top-52 left-6 z-40 w-80"
    >
      <div className="glass-subtle rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] text-white/40 uppercase tracking-wider">
            Capital Flow
          </span>
          <span className="text-[10px] text-white/60 font-mono">
            Total: {formatUSD(totalCapital)}
          </span>
        </div>

        {/* Flow Visualization */}
        <div className="relative h-24">
          {/* SVG for animated path */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 320 96">
            {/* Background path */}
            <path
              d="M 60 48 Q 160 48 260 48"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Animated flow path */}
            <motion.path
              d="M 60 48 Q 160 48 260 48"
              fill="none"
              stroke={isBridgingOut ? "#a78bfa" : isBridgingBack ? "#60a5fa" : "#4ade80"}
              strokeWidth="2"
              initial="idle"
              animate={getFlowState()}
              variants={flowVariants}
            />

            {/* Flow particles when bridging */}
            {(isBridgingOut || isBridgingBack) && (
              <>
                <motion.circle
                  r="4"
                  fill={isBridgingOut ? "#a78bfa" : "#60a5fa"}
                  animate={{
                    cx: isBridgingOut ? [60, 260] : [260, 60],
                    cy: [48, 48],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
                <motion.circle
                  r="4"
                  fill={isBridgingOut ? "#a78bfa" : "#60a5fa"}
                  animate={{
                    cx: isBridgingOut ? [60, 260] : [260, 60],
                    cy: [48, 48],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                    delay: 0.5,
                  }}
                />
              </>
            )}
          </svg>

          {/* Arc Node */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
              !isDeployed && !isBridgingOut ? "bg-green-500/20 ring-1 ring-green-500/50" : "bg-white/5"
            }`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-1">
                <span className="text-[8px] font-bold text-white">ARC</span>
              </div>
              <span className="text-[10px] text-white/70 font-mono">
                {formatUSD(arcBalance)}
              </span>
            </div>
            <div className="text-[9px] text-white/40 text-center mt-1">Safe Harbor</div>
          </div>

          {/* LI.FI Bridge Node */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center transition-all ${
              isBridgingOut || isBridgingBack ? "bg-purple-500/20 ring-1 ring-purple-500/50 animate-pulse" : "bg-white/5"
            }`}>
              <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div className="text-[9px] text-purple-400 text-center mt-1 font-mono">LI.FI</div>
          </div>

          {/* Base Node */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all ${
              isDeployed ? "bg-blue-500/20 ring-1 ring-blue-500/50" : "bg-white/5"
            }`}>
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center mb-1">
                <span className="text-[8px] font-bold text-white">BASE</span>
              </div>
              <span className="text-[10px] text-white/70 font-mono">
                {formatUSD(baseBalance)}
              </span>
            </div>
            <div className="text-[9px] text-white/40 text-center mt-1">Yield Zone</div>
          </div>
        </div>

        {/* Agent Status Bar */}
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-white/60 font-mono">velvet-agent.eth</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              isProtected ? "bg-red-500/20 text-red-400" :
              isDeployed ? "bg-green-500/20 text-green-400" :
              isBridgingOut || isBridgingBack ? "bg-purple-500/20 text-purple-400" :
              "bg-white/10 text-white/50"
            }`}>
              {isProtected ? "PROTECTED" :
               isDeployed ? "EARNING" :
               isBridgingOut ? "DEPLOYING" :
               isBridgingBack ? "RETURNING" :
               "MONITORING"}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
