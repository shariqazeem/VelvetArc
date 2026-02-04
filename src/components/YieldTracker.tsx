"use client";

import { useState, useEffect } from "react";
import { useReadContract } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { CONTRACTS, HOOK_ABI } from "@/lib/wagmi-config";
import { formatUnits } from "viem";

interface YieldData {
  totalSwapVolume: number;
  totalFeesCollected: number;
  swapCount: number;
  avgFee: number;
  projectedAPY: number;
}

export function YieldTracker() {
  const [yieldData, setYieldData] = useState<YieldData>({
    totalSwapVolume: 0,
    totalFeesCollected: 0,
    swapCount: 0,
    avgFee: 0.3,
    projectedAPY: 0,
  });

  // Read hook status
  const { data: hookStatus } = useReadContract({
    address: CONTRACTS.hook,
    abi: HOOK_ABI,
    functionName: "getHookStatus",
    chainId: baseSepolia.id,
  });

  // Read total liquidity from hook
  const { data: totalLiquidity } = useReadContract({
    address: CONTRACTS.hook,
    abi: HOOK_ABI,
    functionName: "totalLiquidity",
    chainId: baseSepolia.id,
  });

  // Fetch swap events to calculate yield
  useEffect(() => {
    async function fetchYieldData() {
      try {
        const response = await fetch("/api/events");
        const data = await response.json();

        if (data.success && data.events) {
          // Calculate yield from fee update events and swap metrics
          const feeUpdates = data.events.filter((e: { type: string }) => e.type === "FEE_UPDATE");

          // Simulate yield calculation based on fee changes
          // In production, this would come from actual swap volume
          const avgFee = feeUpdates.length > 0
            ? feeUpdates.reduce((sum: number, e: { data: { newFee: number } }) => sum + (e.data.newFee || 0.3), 0) / feeUpdates.length
            : 0.3;

          // Calculate projected APY based on average fee and estimated volume
          // This is a simplified model for demo purposes
          const estimatedDailyVolume = 10000; // $10k daily volume assumption
          const dailyFees = estimatedDailyVolume * (avgFee / 100);
          const tvl = totalLiquidity ? Number(formatUnits(totalLiquidity as bigint, 6)) : 1000;
          const dailyYieldPercent = tvl > 0 ? (dailyFees / tvl) * 100 : 0;
          const projectedAPY = dailyYieldPercent * 365;

          setYieldData({
            totalSwapVolume: estimatedDailyVolume * feeUpdates.length, // Rough estimate
            totalFeesCollected: dailyFees * feeUpdates.length,
            swapCount: feeUpdates.length,
            avgFee,
            projectedAPY: Math.min(projectedAPY, 999), // Cap display at 999%
          });
        }
      } catch (e) {
        console.error("Error fetching yield data:", e);
      }
    }

    fetchYieldData();
    const interval = setInterval(fetchYieldData, 30000);
    return () => clearInterval(interval);
  }, [totalLiquidity]);

  const currentFee = hookStatus
    ? Number((hookStatus as readonly [number, number, bigint, bigint, string])[0]) / 100
    : 0.3;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase">Yield Analytics</div>
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span className="text-[9px] text-emerald-400">Live</span>
        </div>
      </div>

      {/* Main APY Display */}
      <div className="text-center mb-4">
        <div className="text-3xl font-bold text-emerald-400">
          {yieldData.projectedAPY.toFixed(1)}%
        </div>
        <div className="text-[10px] text-white/40">Projected APY</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-[10px] text-white/50">Current Fee</div>
          <div className="text-sm font-mono font-medium text-purple-400">{currentFee.toFixed(2)}%</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-[10px] text-white/50">Fee Changes</div>
          <div className="text-sm font-mono font-medium">{yieldData.swapCount}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-[10px] text-white/50">Est. Volume</div>
          <div className="text-sm font-mono font-medium">${yieldData.totalSwapVolume.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-xl bg-white/5">
          <div className="text-[10px] text-white/50">Est. Fees</div>
          <div className="text-sm font-mono font-medium text-emerald-400">${yieldData.totalFeesCollected.toFixed(2)}</div>
        </div>
      </div>

      {/* How Yield Works */}
      <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
        <div className="text-[10px] font-bold text-emerald-400 mb-1">How Dynamic Fee Yield Works</div>
        <p className="text-[9px] text-white/60 leading-relaxed">
          The agent monitors ETH volatility and adjusts swap fees in real-time.
          Higher volatility = higher fees = more yield for LPs.
          Lower volatility = competitive fees = more volume.
        </p>
      </div>

      {/* Testnet Note */}
      <div className="mt-3 text-[9px] text-white/30 text-center">
        * Estimates based on fee mechanism. Real yield requires swap volume.
      </div>
    </div>
  );
}
