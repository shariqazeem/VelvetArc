"use client";

import { useOnChainEvents } from "@/hooks/useOnChainData";
import { useMemo } from "react";

interface DataPoint {
  timestamp: number;
  fee: number;
  label: string;
}

/**
 * Simple SVG line chart for fee history
 */
export function FeeHistoryChart() {
  const { feeUpdates, isLoading } = useOnChainEvents();

  // Process fee updates into chart data
  const chartData = useMemo((): DataPoint[] => {
    if (feeUpdates.length === 0) return [];

    // Sort by timestamp
    const sorted = [...feeUpdates].sort((a, b) => a.timestamp - b.timestamp);

    return sorted.map(event => ({
      timestamp: event.timestamp,
      fee: event.data.newFee as number,
      label: `${event.data.newFee}%`,
    }));
  }, [feeUpdates]);

  if (isLoading) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase mb-4">Fee History</div>
        <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (chartData.length < 2) {
    return (
      <div className="glass-panel rounded-2xl p-5">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase mb-4">Fee History</div>
        <div className="h-32 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl mb-2 opacity-20">📊</div>
            <p className="text-[10px] text-white/40">Not enough data yet</p>
            <p className="text-[9px] text-white/30">Fee changes will appear here</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate chart dimensions
  const width = 300;
  const height = 120;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Calculate scales
  const minFee = Math.min(...chartData.map(d => d.fee));
  const maxFee = Math.max(...chartData.map(d => d.fee));
  const feeRange = maxFee - minFee || 1;

  const minTime = Math.min(...chartData.map(d => d.timestamp));
  const maxTime = Math.max(...chartData.map(d => d.timestamp));
  const timeRange = maxTime - minTime || 1;

  // Generate path
  const points = chartData.map((d, i) => {
    const x = padding.left + (d.timestamp - minTime) / timeRange * chartWidth;
    const y = padding.top + chartHeight - ((d.fee - minFee) / feeRange * chartHeight);
    return { x, y, ...d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  // Area fill
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="text-[10px] font-mono text-[var(--ghost)] uppercase">Fee History</div>
        <div className="text-[9px] text-purple-400">
          {chartData.length} changes
        </div>
      </div>

      <div className="relative">
        <svg width="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(pct => {
            const y = padding.top + chartHeight * (1 - pct);
            const fee = (minFee + feeRange * pct).toFixed(2);
            return (
              <g key={pct}>
                <line
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke="white"
                  strokeOpacity={0.05}
                />
                <text
                  x={padding.left - 5}
                  y={y}
                  fontSize="8"
                  fill="white"
                  fillOpacity={0.3}
                  textAnchor="end"
                  dominantBaseline="middle"
                >
                  {fee}%
                </text>
              </g>
            );
          })}

          {/* Gradient fill */}
          <defs>
            <linearGradient id="feeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Area fill */}
          <path d={areaD} fill="url(#feeGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#a855f7"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={4} fill="#a855f7" />
              <circle cx={p.x} cy={p.y} r={6} fill="#a855f7" fillOpacity={0.3} />
            </g>
          ))}
        </svg>

        {/* Current fee indicator */}
        <div className="absolute top-0 right-0 text-right">
          <div className="text-[10px] text-white/40">Current</div>
          <div className="text-xl font-bold text-purple-400">
            {chartData[chartData.length - 1]?.fee.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Time labels */}
      <div className="flex justify-between mt-2 text-[9px] text-white/30">
        <span>{new Date(minTime).toLocaleDateString()}</span>
        <span>{new Date(maxTime).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

/**
 * Simple mini sparkline for fee
 */
export function FeeSparkline() {
  const { feeUpdates } = useOnChainEvents();

  const points = useMemo(() => {
    if (feeUpdates.length < 2) return null;
    const sorted = [...feeUpdates].sort((a, b) => a.timestamp - b.timestamp);
    const fees = sorted.map(e => e.data.newFee as number);
    const min = Math.min(...fees);
    const max = Math.max(...fees);
    const range = max - min || 1;

    return fees.map((fee, i) => ({
      x: (i / (fees.length - 1)) * 60,
      y: 20 - ((fee - min) / range) * 16,
    }));
  }, [feeUpdates]);

  if (!points) return null;

  const d = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg width="60" height="20" className="inline-block">
      <path d={d} fill="none" stroke="#a855f7" strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
}
