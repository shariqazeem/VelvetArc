"use client";

/**
 * Sponsor Integration Badges
 * Shows which hackathon sponsors are being used in real-time
 * Great for demo videos to show judges all integrations at once
 */

import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useAccount } from "wagmi";
import { useENSIdentity } from "@/hooks/useENS";

interface BadgeProps {
  name: string;
  active: boolean;
  detail?: string;
}

function Badge({ name, active, detail }: BadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        active
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
          : "bg-white/5 border-white/10 text-white/40"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-emerald-500 animate-pulse" : "bg-white/30"}`} />
      <span className="text-[10px] font-bold uppercase tracking-wider">{name}</span>
      {detail && active && (
        <span className="text-[9px] opacity-70">({detail})</span>
      )}
    </div>
  );
}

export function SponsorBadges() {
  const { state } = useAgentAPI();
  const { chain } = useAccount();
  const { name: ensName } = useENSIdentity(state.agentAddress);

  const isOnArc = chain?.id === 5042002;
  const isOnBase = chain?.id === 84532;
  const hasHookActivity = state.hookFee > 0;
  const hasENS = !!ensName;

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Badge
        name="Circle Arc"
        active={isOnArc || parseFloat(state.vaultTotalDeposits) > 0}
        detail={isOnArc ? "connected" : parseFloat(state.vaultTotalDeposits) > 0 ? "vault active" : undefined}
      />
      <Badge
        name="Uniswap V4"
        active={hasHookActivity}
        detail={hasHookActivity ? `${(state.hookFee / 100).toFixed(1)}% fee` : undefined}
      />
      <Badge
        name="LI.FI"
        active={true}
        detail="bridge ready"
      />
      <Badge
        name="ENS"
        active={hasENS}
        detail={hasENS ? ensName?.split('.')[0] : undefined}
      />
    </div>
  );
}

/**
 * Compact version for header
 */
export function SponsorBadgesCompact() {
  const { state } = useAgentAPI();
  const { name: ensName } = useENSIdentity(state.agentAddress);

  const activeCount = [
    parseFloat(state.vaultTotalDeposits) > 0, // Arc
    state.hookFee > 0, // Uniswap
    true, // LI.FI always ready
    !!ensName, // ENS
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
      <span className="text-[9px] text-white/50 font-mono uppercase">Sponsors:</span>
      <span className="text-[10px] font-bold text-emerald-400">{activeCount}/4</span>
      <div className="flex gap-0.5">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full ${i < activeCount ? "bg-emerald-500" : "bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
