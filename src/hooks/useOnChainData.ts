"use client";

import { useState, useEffect, useCallback } from "react";

// Event types
export interface OnChainEvent {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "FEE_UPDATE" | "VOLATILITY_CHANGE" | "CIRCUIT_BREAKER" | "LIQUIDITY";
  chain: "arc" | "base";
  timestamp: number;
  blockNumber: bigint;
  txHash: string;
  data: Record<string, unknown>;
}

export interface Depositor {
  address: string;
  totalDeposited: number;
  shares: number;
  currentValue: number;
  depositCount: number;
  firstDeposit: number;
  lastDeposit: number;
  rank: number;
}

export interface LeaderboardStats {
  totalDepositors: number;
  totalValueLocked: number;
  totalDeposits: number;
  averageDeposit: number;
}

/**
 * Hook for real on-chain events
 */
export function useOnChainEvents() {
  const [events, setEvents] = useState<OnChainEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<number>(0);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setEvents(data.events || []);
        setLastUpdate(data.lastUpdate);
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch events");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [fetchEvents]);

  // Filter helpers
  const deposits = events.filter(e => e.type === "DEPOSIT");
  const withdrawals = events.filter(e => e.type === "WITHDRAW");
  const feeUpdates = events.filter(e => e.type === "FEE_UPDATE");
  const circuitBreakers = events.filter(e => e.type === "CIRCUIT_BREAKER");

  return {
    events,
    deposits,
    withdrawals,
    feeUpdates,
    circuitBreakers,
    isLoading,
    error,
    lastUpdate,
    refetch: fetchEvents,
  };
}

/**
 * Hook for real leaderboard data
 */
export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<Depositor[]>([]);
  const [stats, setStats] = useState<LeaderboardStats>({
    totalDepositors: 0,
    totalValueLocked: 0,
    totalDeposits: 0,
    averageDeposit: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });
      const data = await res.json();

      if (data.success) {
        setLeaderboard(data.leaderboard || []);
        setStats(data.stats || {
          totalDepositors: 0,
          totalValueLocked: 0,
          totalDeposits: 0,
          averageDeposit: 0,
        });
        setError(null);
      } else {
        throw new Error(data.error || "Failed to fetch leaderboard");
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  return {
    leaderboard,
    stats,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  };
}

/**
 * Format address for display
 */
export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txHash: string, chain: "arc" | "base"): string {
  if (chain === "arc") {
    return `https://testnet.arcscan.app/tx/${txHash}`;
  }
  return `https://sepolia.basescan.org/tx/${txHash}`;
}
