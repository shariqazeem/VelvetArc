"use client";

import { useState, useEffect } from "react";
import { YellowClient } from "@/lib/yellow/YellowClient";

interface SponsorShowcaseProps {
  hookFee?: number;
  isVaultActive?: boolean;
  hasENS?: boolean;
}

export function SponsorShowcase({
  hookFee = 0,
  isVaultActive = false,
  hasENS = false,
}: SponsorShowcaseProps) {
  const [yellowStatus, setYellowStatus] = useState<string>("disconnected");

  useEffect(() => {
    const client = YellowClient.getInstance();
    const unsubscribe = client.subscribe((state) => {
      setYellowStatus(state.status);
    });
    return unsubscribe;
  }, []);

  const isYellowActive = ["authenticated", "session_active", "connected"].includes(yellowStatus);

  const sponsors = [
    {
      name: "Yellow Network",
      prize: "$15,000",
      active: isYellowActive,
      detail: isYellowActive ? "connected" : null,
    },
    {
      name: "Uniswap V4",
      prize: "$10,000",
      active: hookFee > 0,
      detail: hookFee > 0 ? `${(hookFee / 10000).toFixed(2)}% fee` : null,
    },
    {
      name: "Circle Arc",
      prize: "$10,000",
      active: isVaultActive,
      detail: isVaultActive ? "vault active" : null,
    },
    {
      name: "LI.FI",
      prize: "$6,000",
      active: true,
      detail: "bridge ready",
    },
    {
      name: "ENS",
      prize: "$5,000",
      active: hasENS,
      detail: hasENS ? "resolved" : null,
    },
  ];

  const activeCount = sponsors.filter(s => s.active).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/30 uppercase tracking-wider">Integrations</span>
        <span className="text-xs text-white/50">{activeCount}/5</span>
      </div>

      <div className="space-y-2">
        {sponsors.map((sponsor) => (
          <div
            key={sponsor.name}
            className={`flex items-center justify-between py-2 ${
              sponsor.active ? "text-white/70" : "text-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className={`w-1.5 h-1.5 rounded-full ${sponsor.active ? "bg-white/50" : "bg-white/10"}`} />
              <span className="text-sm">{sponsor.name}</span>
              {sponsor.detail && (
                <span className="text-xs text-white/30">{sponsor.detail}</span>
              )}
            </div>
            <span className="text-xs text-white/30">{sponsor.prize}</span>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-xs text-white/30">Total Pool</span>
        <span className="text-sm text-white/50">$46,000</span>
      </div>
    </div>
  );
}
