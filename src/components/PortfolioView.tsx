"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo, useEffect } from "react";

interface YieldEvent {
  timestamp: number;
  amount: number;
  reason: string;
}

interface PortfolioViewProps {
  yieldHistory: YieldEvent[];
  totalYield: number;
  feesCaptured: number;
  currentAPY: number;
  protectionEvents: number;
  protectionSavings: number;
  iteration: number;
  isRunning: boolean;
  // New props for Safe Harbor Vault
  capitalState?: "PROTECTED" | "EARNING" | "CIRCUIT_BREAKER";
  arcBalance?: number;
  baseBalance?: number;
}

// Shield Icon component
const ShieldIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Circular Progress Ring component
const HealthRing = ({
  value,
  size = 80,
  strokeWidth = 6,
  isLocking = false
}: {
  value: number;
  size?: number;
  strokeWidth?: number;
  isLocking?: boolean;
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;

  const getColor = () => {
    if (value >= 80) return "#22c55e"; // Green
    if (value >= 50) return "#eab308"; // Yellow
    return "#ef4444"; // Red
  };

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: offset,
            stroke: isLocking ? ["#22c55e", "#3b82f6", "#22c55e"] : getColor()
          }}
          transition={{
            strokeDashoffset: { duration: 1, ease: "easeOut" },
            stroke: isLocking ? { duration: 1.5, repeat: Infinity } : { duration: 0.3 }
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          className="text-lg font-bold text-white"
          animate={isLocking ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5, repeat: isLocking ? Infinity : 0 }}
        >
          {value}%
        </motion.span>
        <span className="text-[8px] text-white/40 uppercase tracking-wider">Health</span>
      </div>
    </div>
  );
};

export function PortfolioView({
  yieldHistory,
  totalYield,
  feesCaptured,
  currentAPY,
  protectionEvents,
  protectionSavings,
  iteration,
  isRunning,
  capitalState = "EARNING",
  arcBalance = 0,
  baseBalance = 0,
}: PortfolioViewProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [isLockingDown, setIsLockingDown] = useState(false);
  const [prevCapitalState, setPrevCapitalState] = useState(capitalState);

  // Detect state change to PROTECTED and trigger animation
  useEffect(() => {
    if (capitalState === "PROTECTED" && prevCapitalState !== "PROTECTED") {
      setIsLockingDown(true);
      const timer = setTimeout(() => setIsLockingDown(false), 2000);
      return () => clearTimeout(timer);
    }
    setPrevCapitalState(capitalState);
  }, [capitalState, prevCapitalState]);

  // Calculate health factor based on secured capital ratio
  const totalCapital = arcBalance + baseBalance;
  const healthFactor = useMemo(() => {
    if (totalCapital === 0) return 100;
    // Health is higher when more capital is in Arc (safe harbor)
    const arcRatio = arcBalance / totalCapital;
    if (capitalState === "PROTECTED" || capitalState === "CIRCUIT_BREAKER") {
      return Math.min(100, Math.round(arcRatio * 100 + 20));
    }
    return Math.min(100, Math.round(50 + arcRatio * 50));
  }, [arcBalance, totalCapital, capitalState]);

  // Generate sparkline data
  const sparklineData = useMemo(() => {
    if (yieldHistory.length === 0) return [];
    let cumulative = 0;
    return yieldHistory.map(event => {
      cumulative += event.amount;
      return cumulative;
    });
  }, [yieldHistory]);

  // Generate SVG path
  const sparklinePath = useMemo(() => {
    if (sparklineData.length < 2) return "";
    const max = Math.max(...sparklineData) || 1;
    const width = 200;
    const height = 40;
    const points = sparklineData.map((y, i) => {
      const x = (i / (sparklineData.length - 1)) * width;
      const yPos = height - (y / max) * height * 0.8 - 4;
      return `${x},${yPos}`;
    });
    return `M ${points.join(" L ")}`;
  }, [sparklineData]);

  const getStateConfig = () => {
    switch (capitalState) {
      case "PROTECTED":
        return { label: "Protected", color: "text-blue-400", bgColor: "bg-blue-500/20", borderColor: "border-blue-500/30" };
      case "CIRCUIT_BREAKER":
        return { label: "Emergency", color: "text-amber-400", bgColor: "bg-amber-500/20", borderColor: "border-amber-500/30" };
      default:
        return { label: "Active", color: "text-emerald-400", bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500/30" };
    }
  };

  const stateConfig = getStateConfig();

  return (
    <motion.div
      className="relative overflow-hidden"
      animate={isLockingDown ? { scale: [1, 0.98, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      {/* Glass Card Background with Blue Tint */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-blue-950/30 to-slate-950/40 rounded-2xl" />
      <div className="absolute inset-0 backdrop-blur-sm rounded-2xl border border-indigo-500/10" />

      {/* Locking Down Overlay Animation */}
      <AnimatePresence>
        {isLockingDown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-blue-950/80 backdrop-blur-md rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 0.5, repeat: 3 }}
              >
                <ShieldIcon className="w-12 h-12 text-blue-400" />
              </motion.div>
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                className="text-sm font-bold text-blue-300 uppercase tracking-wider"
              >
                Locking Down
              </motion.span>
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-10 space-y-4 p-1">
        {/* Header with Shield Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div
              animate={capitalState === "PROTECTED" ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ShieldIcon className={`w-5 h-5 ${
                capitalState === "PROTECTED" ? "text-blue-400" :
                capitalState === "CIRCUIT_BREAKER" ? "text-amber-400" :
                "text-white/50"
              }`} />
            </motion.div>
            <h4 className="text-sm font-medium text-white">Safe Harbor</h4>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] px-2 py-0.5 rounded-full ${stateConfig.bgColor} ${stateConfig.color} ${stateConfig.borderColor} border`}>
              {stateConfig.label}
            </span>
            {isRunning && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] text-white/40 font-mono">LIVE</span>
              </div>
            )}
          </div>
        </div>

        {/* Capital Split View */}
        <div className="grid grid-cols-2 gap-3">
          {/* Active Capital (Base) */}
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20"
            animate={capitalState === "EARNING" ? { borderColor: ["rgba(34,197,94,0.2)", "rgba(34,197,94,0.4)", "rgba(34,197,94,0.2)"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] text-emerald-400/80 uppercase tracking-wider">Active</span>
            </div>
            <div className="text-lg font-bold text-white">${baseBalance.toFixed(2)}</div>
            <div className="text-[9px] text-white/40">Base · Earning</div>
          </motion.div>

          {/* Secured Capital (Arc) */}
          <motion.div
            className="p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/5 border border-blue-500/20"
            animate={capitalState === "PROTECTED" ? { borderColor: ["rgba(59,130,246,0.2)", "rgba(59,130,246,0.5)", "rgba(59,130,246,0.2)"] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldIcon className="w-3 h-3 text-blue-400" />
              <span className="text-[10px] text-blue-400/80 uppercase tracking-wider">Secured</span>
            </div>
            <div className="text-lg font-bold text-white">${arcBalance.toFixed(2)}</div>
            <div className="text-[9px] text-white/40">Arc · Protected</div>
          </motion.div>
        </div>

        {/* Health Factor Ring & RWA Status */}
        <div className="flex items-center justify-between py-2">
          <HealthRing value={healthFactor} size={70} strokeWidth={5} isLocking={isLockingDown} />

          {/* RWA Backing Status */}
          <div className="flex-1 ml-4 space-y-2">
            <div className="flex items-center gap-2">
              <motion.div
                className="w-2 h-2 rounded-full bg-emerald-500"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="text-[10px] text-white/70">RWA Backing</span>
            </div>
            <div className="p-2 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/50">USDC Treasury</span>
                <span className="text-[10px] text-emerald-400 font-medium">Verified ✓</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-white/30">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Circle-backed stablecoin reserves</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 py-2 border-y border-white/5">
          <div className="text-center">
            <div className="text-sm font-light text-white">
              {currentAPY > 0 ? `${currentAPY.toFixed(1)}%` : "—"}
            </div>
            <div className="text-[9px] text-white/30 uppercase">APY</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-light text-emerald-400">${feesCaptured.toFixed(2)}</div>
            <div className="text-[9px] text-white/30 uppercase">Yield</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-light text-blue-400">{protectionEvents}</div>
            <div className="text-[9px] text-white/30 uppercase">Saves</div>
          </div>
        </div>

        {/* Sparkline Chart */}
        {sparklineData.length >= 2 && (
          <div className="h-10 -mx-1">
            <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparklineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(59,130,246,0.5)" />
                  <stop offset="100%" stopColor="rgba(34,197,94,0.5)" />
                </linearGradient>
              </defs>
              <motion.path
                d={sparklinePath}
                fill="none"
                stroke="url(#sparklineGradient)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
          </div>
        )}

        {/* Activity Toggle */}
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="w-full flex items-center justify-between py-1 text-[10px] text-white/30 hover:text-white/50 transition-colors"
        >
          <span>Activity ({yieldHistory.length})</span>
          <motion.span animate={{ rotate: showHistory ? 180 : 0 }}>↓</motion.span>
        </button>

        {/* Expandable History */}
        <AnimatePresence>
          {showHistory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="max-h-28 overflow-y-auto space-y-1 scrollbar-thin">
                {yieldHistory.length > 0 ? (
                  yieldHistory.slice(0, 8).map((event, i) => (
                    <motion.div
                      key={`${event.timestamp}-${i}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="flex items-center justify-between py-1.5 text-[10px]"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400">+${event.amount.toFixed(4)}</span>
                        <span className="text-white/30 truncate max-w-[80px]">{event.reason}</span>
                      </div>
                      <span className="text-white/20 font-mono">
                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-3 text-[10px] text-white/20">
                    No activity yet
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
