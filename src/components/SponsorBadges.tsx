"use client";

/**
 * Sponsor Integration Badges
 * Shows which hackathon sponsors are being used in real-time
 * Great for demo videos to show judges all integrations at once
 *
 * Sponsors:
 * 1. Yellow Network - State channel payments with instant finality
 * 2. Uniswap Foundation - V4 dynamic fee hook
 * 3. Circle Arc - Safe harbor vault on Arc L1
 * 4. LI.FI - Cross-chain bridging
 * 5. ENS - Human-readable names
 */

import { useAgentAPI } from "@/hooks/useAgentAPI";
import { useAccount } from "wagmi";
import { useENSIdentity } from "@/hooks/useENS";
import { useState, useEffect } from "react";
import { YellowClient } from "@/lib/yellow/YellowClient";

interface BadgeProps {
  name: string;
  active: boolean;
  detail?: string;
  color?: "emerald" | "yellow" | "pink" | "purple" | "blue" | "sky";
}

function Badge({ name, active, detail, color = "emerald" }: BadgeProps) {
  const colorClasses = {
    emerald: active ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "",
    yellow: active ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-400" : "",
    pink: active ? "bg-pink-500/10 border-pink-500/30 text-pink-400" : "",
    purple: active ? "bg-purple-500/10 border-purple-500/30 text-purple-400" : "",
    blue: active ? "bg-blue-500/10 border-blue-500/30 text-blue-400" : "",
    sky: active ? "bg-sky-500/10 border-sky-500/30 text-sky-400" : "",
  };

  const dotColor = {
    emerald: "bg-emerald-500",
    yellow: "bg-yellow-500",
    pink: "bg-pink-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    sky: "bg-sky-500",
  };

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
        active
          ? colorClasses[color]
          : "bg-white/5 border-white/10 text-white/40"
      }`}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${active ? `${dotColor[color]} animate-pulse` : "bg-white/30"}`} />
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
  const [yellowStatus, setYellowStatus] = useState<string>("disconnected");

  // Subscribe to Yellow Network client state
  useEffect(() => {
    const client = YellowClient.getInstance();
    const unsubscribe = client.subscribe((state) => {
      setYellowStatus(state.status);
    });
    return unsubscribe;
  }, []);

  const isOnArc = chain?.id === 5042002;
  const hasHookActivity = state.hookFee > 0;
  const hasENS = !!ensName;
  const isYellowActive = yellowStatus === "authenticated" || yellowStatus === "session_active" || yellowStatus === "connected";

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      <Badge
        name="Yellow"
        active={isYellowActive}
        detail={yellowStatus === "session_active" ? "session" : yellowStatus === "authenticated" ? "auth" : isYellowActive ? "ws" : undefined}
        color="yellow"
      />
      <Badge
        name="Uniswap V4"
        active={hasHookActivity}
        detail={hasHookActivity ? `${(state.hookFee / 10000).toFixed(2)}% fee` : undefined}
        color="pink"
      />
      <Badge
        name="Circle Arc"
        active={isOnArc || parseFloat(state.vaultTotalDeposits) > 0}
        detail={isOnArc ? "connected" : parseFloat(state.vaultTotalDeposits) > 0 ? "vault" : undefined}
        color="blue"
      />
      <Badge
        name="LI.FI"
        active={true}
        detail="bridge"
        color="purple"
      />
      <Badge
        name="ENS"
        active={hasENS}
        detail={hasENS ? ensName?.split('.')[0] : undefined}
        color="sky"
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
  const [yellowStatus, setYellowStatus] = useState<string>("disconnected");

  useEffect(() => {
    const client = YellowClient.getInstance();
    const unsubscribe = client.subscribe((state) => {
      setYellowStatus(state.status);
    });
    return unsubscribe;
  }, []);

  const isYellowActive = yellowStatus === "authenticated" || yellowStatus === "session_active" || yellowStatus === "connected";

  const activeCount = [
    isYellowActive, // Yellow Network
    state.hookFee > 0, // Uniswap V4
    parseFloat(state.vaultTotalDeposits) > 0, // Arc
    true, // LI.FI always ready
    !!ensName, // ENS
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/10">
      <span className="text-[9px] text-white/50 font-mono uppercase">Sponsors:</span>
      <span className="text-[10px] font-bold text-emerald-400">{activeCount}/5</span>
      <div className="flex gap-0.5">
        {[0, 1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`w-1 h-1 rounded-full ${i < activeCount ? "bg-emerald-500" : "bg-white/20"}`}
          />
        ))}
      </div>
    </div>
  );
}
