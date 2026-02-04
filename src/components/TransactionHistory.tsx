"use client";

import { useAgentAPI } from "@/hooks/useAgentAPI";

const TX_TYPE_LABELS: Record<string, { label: string; color: string; explorer: string }> = {
  FEE_UPDATE: { label: "Fee Update", color: "text-purple-400", explorer: "basescan" },
  LIQUIDITY_DEPLOY: { label: "Deploy Liquidity", color: "text-emerald-400", explorer: "basescan" },
  BRIDGE: { label: "Bridge", color: "text-blue-400", explorer: "basescan" },
  VOLATILITY_UPDATE: { label: "Vol Update", color: "text-amber-400", explorer: "basescan" },
};

function getExplorerUrl(hash: string, type: string): string {
  const config = TX_TYPE_LABELS[type];
  if (config?.explorer === "arcscan") {
    return `https://testnet.arcscan.app/tx/${hash}`;
  }
  return `https://sepolia.basescan.org/tx/${hash}`;
}

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export function TransactionHistory() {
  const { state } = useAgentAPI();

  if (!state.transactions || state.transactions.length === 0) {
    return null;
  }

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[10px] font-mono text-[var(--ghost)] uppercase tracking-wider">
          Recent Transactions
        </h3>
        <span className="text-[10px] text-emerald-400 font-mono">
          {state.transactions.length} tx
        </span>
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {state.transactions.slice(0, 5).map((tx, i) => {
          const config = TX_TYPE_LABELS[tx.type] || { label: tx.type, color: "text-white/60", explorer: "basescan" };
          return (
            <a
              key={tx.hash}
              href={getExplorerUrl(tx.hash, tx.type)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors group"
            >
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${config.color.replace('text-', 'bg-')}`} />
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 font-mono">
                  {formatTimeAgo(tx.timestamp)}
                </span>
                <span className="text-[10px] text-blue-400 font-mono group-hover:underline">
                  {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                </span>
                <svg className="w-3 h-3 text-white/30 group-hover:text-white/60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </a>
          );
        })}
      </div>

      {/* View All Link */}
      <div className="mt-3 pt-3 border-t border-white/5 text-center">
        <a
          href={`https://sepolia.basescan.org/address/${state.agentAddress}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-blue-400/80 hover:text-blue-400 font-mono transition-colors"
        >
          View all on Basescan →
        </a>
      </div>
    </div>
  );
}
