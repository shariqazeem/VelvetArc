"use client";

import { useOnChainEvents, getExplorerUrl, formatAddress, OnChainEvent } from "@/hooks/useOnChainData";
import { motion, AnimatePresence } from "framer-motion";

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function EventTypeIcon({ type }: { type: OnChainEvent["type"] }) {
  switch (type) {
    case "DEPOSIT":
      return <span className="text-emerald-400">↓</span>;
    case "WITHDRAW":
      return <span className="text-red-400">↑</span>;
    case "FEE_UPDATE":
      return <span className="text-purple-400">⚡</span>;
    case "CIRCUIT_BREAKER":
      return <span className="text-amber-400">🛡</span>;
    case "LIQUIDITY":
      return <span className="text-blue-400">💧</span>;
    default:
      return <span className="text-white/40">•</span>;
  }
}

function EventRow({ event }: { event: OnChainEvent }) {
  const explorerUrl = getExplorerUrl(event.txHash, event.chain);

  const getEventDescription = () => {
    switch (event.type) {
      case "DEPOSIT":
        return (
          <span>
            <span className="text-white/60">{formatAddress(String(event.data.user))}</span>
            <span className="text-emerald-400"> deposited ${parseFloat(String(event.data.amount)).toFixed(2)}</span>
          </span>
        );
      case "WITHDRAW":
        return (
          <span>
            <span className="text-white/60">{formatAddress(String(event.data.user))}</span>
            <span className="text-red-400"> withdrew ${parseFloat(String(event.data.amount)).toFixed(2)}</span>
          </span>
        );
      case "FEE_UPDATE":
        return (
          <span>
            Fee changed from <span className="text-white/60">{String(event.data.oldFee)}%</span> to{" "}
            <span className="text-purple-400">{String(event.data.newFee)}%</span>
          </span>
        );
      case "CIRCUIT_BREAKER":
        return (
          <span className="text-amber-400">
            Circuit breaker triggered: {String(event.data.reason)}
          </span>
        );
      case "LIQUIDITY":
        return (
          <span>
            <span className="text-blue-400">${parseFloat(String(event.data.amount)).toFixed(2)}</span> liquidity added
          </span>
        );
      default:
        return <span>Unknown event</span>;
    }
  };

  return (
    <motion.a
      href={explorerUrl}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
    >
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
        <EventTypeIcon type={event.type} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs truncate">{getEventDescription()}</div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-white/30">{formatTimeAgo(event.timestamp)}</span>
          <span className="text-[10px] text-white/20">•</span>
          <span className="text-[10px] text-white/30 uppercase">{event.chain}</span>
        </div>
      </div>
      <div className="text-[10px] text-blue-400/60 group-hover:text-blue-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
        View →
      </div>
    </motion.a>
  );
}

export function EventFeed() {
  const { events, isLoading, error } = useOnChainEvents();

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase mb-3">Live Events</div>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase mb-3">Live Events</div>
        <div className="text-center py-8">
          <div className="text-3xl mb-2 opacity-20">📡</div>
          <p className="text-sm text-white/40">No events yet</p>
          <p className="text-[10px] text-white/30 mt-1">
            Events will appear here as they happen on-chain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase">Live Events</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[9px] text-emerald-400">{events.length} events</span>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
        <AnimatePresence mode="popLayout">
          {events.slice(0, 10).map(event => (
            <EventRow key={event.id} event={event} />
          ))}
        </AnimatePresence>
      </div>

      {error && (
        <div className="mt-3 text-[10px] text-red-400/60 text-center">
          Error loading events
        </div>
      )}
    </div>
  );
}

/**
 * Compact stats bar showing event counts
 */
export function EventStats() {
  const { deposits, withdrawals, feeUpdates } = useOnChainEvents();

  return (
    <div className="flex items-center gap-4 text-[10px]">
      <div className="flex items-center gap-1">
        <span className="text-emerald-400">↓</span>
        <span className="text-white/60">{deposits.length} deposits</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-red-400">↑</span>
        <span className="text-white/60">{withdrawals.length} withdrawals</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="text-purple-400">⚡</span>
        <span className="text-white/60">{feeUpdates.length} fee updates</span>
      </div>
    </div>
  );
}
