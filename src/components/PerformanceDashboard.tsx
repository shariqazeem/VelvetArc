"use client";

import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useUserPosition } from "@/hooks/useContracts";
import { motion, AnimatePresence } from "framer-motion";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function PerformanceDashboard() {
  const { state, totalManagedAssets } = useAgentAPI();
  const { shares, shareValue } = useUserPosition();

  // Safety check for performance data
  const performance = state.performance || {
    totalYieldGenerated: 0,
    currentAPY: 0,
    protectionEvents: 0,
    protectionSavings: 0,
    feesCaptured: 0,
    lastYieldTimestamp: Date.now(),
    yieldHistory: [],
  };

  const userShares = parseFloat(shares || "0");
  const userValue = parseFloat(shareValue || "0");
  const hasPosition = userShares > 0;

  // Calculate user's share of the yield
  const totalShares = parseFloat(state.vaultTotalShares || "1");
  const userShareRatio = totalShares > 0 ? userShares / totalShares : 0;
  const userYield = performance.totalYieldGenerated * userShareRatio;
  const userProtectionSavings = performance.protectionSavings * userShareRatio;

  return (
    <div className="glass-panel rounded-2xl p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[10px] font-mono text-[var(--ghost)] uppercase tracking-wider">
          Performance
        </h3>
        {state.isRunning && (
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[9px] text-emerald-400 font-mono">LIVE</span>
          </div>
        )}
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Current APY */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
          <div className="text-[10px] text-emerald-400/70 uppercase mb-1">Current APY</div>
          <div className="text-2xl font-bold text-emerald-400">
            {performance.currentAPY > 0 ? `${performance.currentAPY.toFixed(1)}%` : "—"}
          </div>
          <div className="text-[9px] text-white/40 mt-1">
            Based on {(state.hookFee / 10000).toFixed(2)}% fee tier
          </div>
        </div>

        {/* Total Yield */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
          <div className="text-[10px] text-purple-400/70 uppercase mb-1">Fees Captured</div>
          <div className="text-2xl font-bold text-purple-400">
            ${performance.feesCaptured.toFixed(2)}
          </div>
          <div className="text-[9px] text-white/40 mt-1">
            From swap activity
          </div>
        </div>

        {/* Protection Events */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20">
          <div className="text-[10px] text-blue-400/70 uppercase mb-1">Protection Events</div>
          <div className="text-2xl font-bold text-blue-400">
            {performance.protectionEvents}
          </div>
          <div className="text-[9px] text-white/40 mt-1">
            Times capital protected
          </div>
        </div>

        {/* Protection Savings */}
        <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/20">
          <div className="text-[10px] text-amber-400/70 uppercase mb-1">Est. Saved</div>
          <div className="text-2xl font-bold text-amber-400">
            ${performance.protectionSavings.toFixed(2)}
          </div>
          <div className="text-[9px] text-white/40 mt-1">
            From volatility protection
          </div>
        </div>
      </div>

      {/* User's Personal Performance (if they have a position) */}
      {hasPosition && (
        <div className="pt-3 border-t border-white/5">
          <div className="text-[10px] text-[var(--ghost)] uppercase mb-2">Your Returns</div>
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
            <div>
              <div className="text-xs text-white/60">Your Earnings</div>
              <div className="text-lg font-bold text-emerald-400">
                +${userYield.toFixed(4)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/60">Protected</div>
              <div className="text-lg font-bold text-blue-400">
                ${userProtectionSavings.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Yield History */}
      {performance.yieldHistory.length > 0 && (
        <div className="pt-3 border-t border-white/5">
          <div className="text-[10px] text-[var(--ghost)] uppercase mb-2">Recent Activity</div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {performance.yieldHistory.slice(0, 5).map((event, i) => (
                <motion.div
                  key={`${event.timestamp}-${i}`}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-between text-[10px] p-2 rounded-lg bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400">+${event.amount.toFixed(4)}</span>
                    <span className="text-white/40">{event.reason}</span>
                  </div>
                  <span className="text-white/30">{formatTimeAgo(event.timestamp)}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* No Activity State */}
      {!state.isRunning && performance.totalYieldGenerated === 0 && (
        <div className="text-center py-4 text-white/30 text-xs">
          <p>Start the agent to begin earning yield</p>
          <p className="text-[10px] mt-1">The agent captures fees from swap volume</p>
        </div>
      )}
    </div>
  );
}

/**
 * Compact version for mobile or sidebar
 */
export function PerformanceCompact() {
  const { state } = useAgentAPI();
  const { performance } = state;

  return (
    <div className="flex items-center gap-4 text-xs">
      <div className="flex items-center gap-1.5">
        <span className="text-white/40">APY:</span>
        <span className="text-emerald-400 font-bold">
          {performance.currentAPY > 0 ? `${performance.currentAPY.toFixed(1)}%` : "—"}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-white/40">Earned:</span>
        <span className="text-purple-400 font-bold">${performance.feesCaptured.toFixed(2)}</span>
      </div>
      {performance.protectionEvents > 0 && (
        <div className="flex items-center gap-1.5">
          <span className="text-white/40">Protected:</span>
          <span className="text-blue-400 font-bold">{performance.protectionEvents}x</span>
        </div>
      )}
    </div>
  );
}
