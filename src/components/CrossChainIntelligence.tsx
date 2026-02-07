"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LiFiService, type CrossChainQuote, type RebalanceRecommendation, CHAINS } from "@/lib/lifi/LiFiService";
import { useAgentAPI } from "@/hooks/useAgentAPI";

interface CrossChainIntelligenceProps {
  className?: string;
}

export function CrossChainIntelligence({ className = "" }: CrossChainIntelligenceProps) {
  const { state, totalBaseBalance } = useAgentAPI();
  const [recommendation, setRecommendation] = useState<RebalanceRecommendation | null>(null);
  const [routes, setRoutes] = useState<CrossChainQuote[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastCheck, setLastCheck] = useState<number>(0);

  // Check for rebalance recommendations when volatility changes
  useEffect(() => {
    const checkRebalance = async () => {
      if (totalBaseBalance < 10) return; // Skip if no significant balance

      setIsLoading(true);
      try {
        const lifi = LiFiService.getInstance();

        // Get rebalance recommendation
        const rec = await lifi.getRebalanceRecommendation(
          CHAINS.BASE,
          totalBaseBalance.toString(),
          CHAINS.OPTIMISM,
          state.volatility,
          state.agentAddress
        );
        setRecommendation(rec);

        // Get available routes for comparison
        const availableRoutes = await lifi.compareRoutes(
          CHAINS.BASE,
          (totalBaseBalance * 1e6).toString(),
          state.agentAddress
        );
        setRoutes(availableRoutes);

        setLastCheck(Date.now());
      } catch (error) {
        console.error("LI.FI check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    // Check every 30 seconds or when volatility changes significantly
    const interval = setInterval(checkRebalance, 30000);
    checkRebalance(); // Initial check

    return () => clearInterval(interval);
  }, [state.volatility, totalBaseBalance, state.agentAddress]);

  if (totalBaseBalance < 10) {
    return null; // Don't show if no balance to manage
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30 uppercase tracking-wider">Cross-Chain Intelligence</span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400">LI.FI</span>
        </div>
        {isLoading && (
          <div className="w-3 h-3 border border-white/20 border-t-white/60 rounded-full animate-spin" />
        )}
      </div>

      {/* Recommendation Card */}
      <AnimatePresence mode="wait">
        {recommendation && (
          <motion.div
            key={recommendation.reason}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`p-4 rounded-xl border ${
              recommendation.shouldRebalance
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-white/[0.02] border-white/10"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                recommendation.shouldRebalance ? "bg-amber-500/20" : "bg-white/10"
              }`}>
                {recommendation.shouldRebalance ? (
                  <span className="text-amber-400">⚡</span>
                ) : (
                  <span className="text-white/40">✓</span>
                )}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/80 mb-1">
                  {recommendation.shouldRebalance ? "Rebalance Recommended" : "Position Optimal"}
                </div>
                <p className="text-xs text-white/50">{recommendation.reason}</p>
                {recommendation.bestRoute && (
                  <div className="mt-3 p-2 rounded-lg bg-black/20 text-[10px] font-mono text-white/40">
                    Best route: {recommendation.bestRoute.fromChain} → {recommendation.bestRoute.toChain}
                    <br />
                    Est. gas: ${recommendation.bestRoute.gasCost} | Time: ~{Math.ceil(recommendation.bestRoute.estimatedTime / 60)}min
                    <br />
                    Via: {recommendation.bestRoute.bridgeName}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Available Routes */}
      {routes.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] text-white/30 uppercase tracking-wider">Available Routes</div>
          <div className="space-y-1">
            {routes.slice(0, 3).map((route, i) => (
              <motion.div
                key={`${route.fromChain}-${route.toChain}`}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="text-white/60">{route.fromChain}</span>
                  <span className="text-white/20">→</span>
                  <span className="text-white/60">{route.toChain}</span>
                </div>
                <div className="flex items-center gap-3 text-white/40">
                  <span>Gas: ${route.gasCost}</span>
                  <span className="text-[10px]">{route.bridgeName}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-[9px] text-white/20 pt-2 border-t border-white/5">
        <span>Agent uses LI.FI SDK for cross-chain decisions</span>
        {lastCheck > 0 && (
          <span>Updated {Math.floor((Date.now() - lastCheck) / 1000)}s ago</span>
        )}
      </div>
    </div>
  );
}
