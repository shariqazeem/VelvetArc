"use client";

import { useLeaderboard, formatAddress, Depositor } from "@/hooks/useOnChainData";
import { motion } from "framer-motion";
import { useAccount } from "wagmi";

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) {
    return <span className="text-lg">🥇</span>;
  }
  if (rank === 2) {
    return <span className="text-lg">🥈</span>;
  }
  if (rank === 3) {
    return <span className="text-lg">🥉</span>;
  }
  return <span className="text-sm text-white/30 font-mono">#{rank}</span>;
}

function DepositorRow({ depositor, isCurrentUser }: { depositor: Depositor; isCurrentUser: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
        isCurrentUser
          ? "bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-emerald-500/30"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="w-10 text-center">
        <RankBadge rank={depositor.rank} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono">
            {formatAddress(depositor.address)}
          </span>
          {isCurrentUser && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/30 text-emerald-400">
              You
            </span>
          )}
        </div>
        <div className="text-[10px] text-white/40 mt-0.5">
          {depositor.depositCount} deposit{depositor.depositCount !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="text-right">
        <div className="text-sm font-bold text-emerald-400">
          ${depositor.currentValue.toFixed(2)}
        </div>
        <div className="text-[10px] text-white/40">
          {depositor.shares.toFixed(2)} shares
        </div>
      </div>
    </motion.div>
  );
}

export function Leaderboard() {
  const { leaderboard, stats, isLoading, error } = useLeaderboard();
  const { address } = useAccount();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase mb-4">Leaderboard</div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase">Top Depositors</div>
        <div className="text-[9px] text-white/40">
          {stats.totalDepositors} total
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-[10px] text-white/40">TVL</div>
          <div className="text-sm font-bold text-emerald-400">
            ${stats.totalValueLocked.toFixed(2)}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-[10px] text-white/40">Depositors</div>
          <div className="text-sm font-bold">{stats.totalDepositors}</div>
        </div>
        <div className="p-2 rounded-lg bg-white/5 text-center">
          <div className="text-[10px] text-white/40">Avg</div>
          <div className="text-sm font-bold text-blue-400">
            ${stats.averageDeposit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2 opacity-20">🏆</div>
          <p className="text-sm text-white/40">No depositors yet</p>
          <p className="text-[10px] text-white/30 mt-1">
            Be the first to deposit and claim #1!
          </p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
          {leaderboard.map(depositor => (
            <DepositorRow
              key={depositor.address}
              depositor={depositor}
              isCurrentUser={address?.toLowerCase() === depositor.address.toLowerCase()}
            />
          ))}
        </div>
      )}

      {error && (
        <div className="mt-3 text-[10px] text-red-400/60 text-center">
          Error loading leaderboard
        </div>
      )}
    </div>
  );
}

/**
 * Compact leaderboard showing top 3
 */
export function LeaderboardCompact() {
  const { leaderboard, isLoading } = useLeaderboard();

  if (isLoading || leaderboard.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {leaderboard.slice(0, 3).map((depositor, i) => (
        <div key={depositor.address} className="flex items-center gap-1.5">
          <RankBadge rank={i + 1} />
          <span className="text-[10px] text-white/60">{formatAddress(depositor.address)}</span>
          <span className="text-[10px] text-emerald-400 font-mono">
            ${depositor.currentValue.toFixed(0)}
          </span>
        </div>
      ))}
    </div>
  );
}
