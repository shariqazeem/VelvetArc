"use client";

import { motion } from "framer-motion";
import { useVelvetStore } from "@/hooks/useVelvetStore";

// Agent ENS identity
const AGENT_ENS = "velvet-agent.eth";
const AGENT_ADDRESS = "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E";

// State to human-readable status
function getStatusDisplay(state: string, position: "ARC" | "BASE"): { status: string; location: string; color: string } {
  switch (state) {
    case "IDLE":
      return { status: "Monitoring", location: "Arc (Safe Harbor)", color: "text-white/70" };
    case "SCANNING":
      return { status: "Scanning Markets", location: "Arc", color: "text-blue-400" };
    case "ANALYZING":
      return { status: "Analyzing", location: "Arc", color: "text-blue-400" };
    case "BRIDGING_TO_BASE":
    case "AWAITING_BRIDGE":
      return { status: "Deploying", location: "Arc → Base", color: "text-purple-400" };
    case "DEPLOYING_LIQUIDITY":
      return { status: "Deploying LP", location: "Base", color: "text-purple-400" };
    case "FARMING":
      return { status: "Earning Yield", location: "Base (Uniswap V4)", color: "text-green-400" };
    case "WITHDRAWING":
      return { status: "Withdrawing", location: "Base", color: "text-yellow-400" };
    case "BRIDGING_TO_ARC":
      return { status: "Returning", location: "Base → Arc", color: "text-purple-400" };
    case "CIRCUIT_BREAKER":
      return { status: "Protected", location: "Arc (Emergency)", color: "text-red-400" };
    default:
      return position === "BASE"
        ? { status: "Active", location: "Base", color: "text-green-400" }
        : { status: "Ready", location: "Arc", color: "text-white/70" };
  }
}

// Format decision reason to be concise
function formatDecisionReason(reason: string): string {
  if (reason.length > 60) {
    return reason.substring(0, 57) + "...";
  }
  return reason;
}

export function AgentIdentityCard() {
  const { agentState, isAgentRunning } = useVelvetStore();

  const { status, location, color } = getStatusDisplay(
    agentState.currentState,
    agentState.position
  );

  // Calculate track record stats
  const totalDecisions = agentState.executionHistory.length;
  const successfulDecisions = agentState.executionHistory.filter(e => e.success).length;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="fixed top-28 right-6 z-40 w-72"
    >
      <div className="glass-subtle rounded-xl overflow-hidden">
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            {/* Status indicator */}
            <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
              isAgentRunning ? "bg-green-500 animate-pulse" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              {AGENT_ENS}
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">
                ENS
              </span>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              {AGENT_ADDRESS.slice(0, 6)}...{AGENT_ADDRESS.slice(-4)}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Status</span>
            <span className={`text-xs font-medium ${color}`}>
              {status}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-white/40 uppercase tracking-wider">Location</span>
            <span className="text-xs text-white/70 font-mono">
              {location}
            </span>
          </div>
        </div>

        {/* Last Decision */}
        <div className="px-4 py-3 border-b border-white/5">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
            Last Decision
          </div>
          {agentState.lastDecision ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold ${
                  agentState.lastDecision.action === "DEPLOY" ? "text-green-400" :
                  agentState.lastDecision.action === "WITHDRAW" ? "text-yellow-400" :
                  agentState.lastDecision.action === "EMERGENCY_EXIT" ? "text-red-400" :
                  agentState.lastDecision.action === "ADJUST_FEE" ? "text-blue-400" :
                  "text-white/70"
                }`}>
                  {agentState.lastDecision.action}
                </span>
                <span className="text-[10px] text-white/30">
                  {Math.round(agentState.lastDecision.confidence * 100)}% confidence
                </span>
              </div>
              <p className="text-[11px] text-white/50 leading-relaxed">
                {formatDecisionReason(agentState.lastDecision.reason)}
              </p>
            </div>
          ) : (
            <p className="text-xs text-white/30 italic">
              {isAgentRunning ? "Analyzing market conditions..." : "Start agent to begin"}
            </p>
          )}
        </div>

        {/* Track Record */}
        <div className="px-4 py-3">
          <div className="text-[10px] text-white/40 uppercase tracking-wider mb-2">
            Track Record
          </div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">
                {totalDecisions}
              </div>
              <div className="text-[10px] text-white/40">decisions</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-lg font-semibold text-green-400 tabular-nums">
                {totalDecisions > 0 ? Math.round((successfulDecisions / totalDecisions) * 100) : 100}%
              </div>
              <div className="text-[10px] text-white/40">success</div>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div>
              <div className="text-lg font-semibold text-white tabular-nums">
                ${(agentState.totalYieldEarned / 1_000_000).toFixed(2)}
              </div>
              <div className="text-[10px] text-white/40">yield</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
