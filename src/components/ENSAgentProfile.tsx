"use client";

import { motion } from "framer-motion";
import { useENSIdentity, useENSProfile, formatAddressOrENS } from "@/hooks/useENS";

interface ENSAgentProfileProps {
  address: string;
  className?: string;
}

export function ENSAgentProfile({ address, className = "" }: ENSAgentProfileProps) {
  const { name, avatar, isLoading } = useENSIdentity(address);
  const profile = useENSProfile(name ?? undefined);

  const displayName = formatAddressOrENS(address, name);

  return (
    <div className={`p-4 rounded-xl bg-white/[0.02] border border-white/10 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs text-white/30 uppercase tracking-wider">Agent Identity</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-400">ENS</span>
      </div>

      {/* Profile */}
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-purple-500/20 to-sky-500/20 border border-white/10">
          {avatar ? (
            <img src={avatar} alt={displayName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-4 h-4 border border-white/30 border-t-white/60 rounded-full animate-spin" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <motion.div
            key={displayName}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg font-mono text-white"
          >
            {displayName}
          </motion.div>
          {name && (
            <div className="text-xs text-white/40 mt-0.5">
              {address.slice(0, 10)}...{address.slice(-6)}
            </div>
          )}
        </div>
      </div>

      {/* Text Records (if available) */}
      {(profile.description || profile.url || profile.strategy) && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-2">
          {profile.description && (
            <div className="text-xs text-white/50">{profile.description}</div>
          )}
          {profile.strategy && (
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-white/30 uppercase">Strategy:</span>
              <span className="text-[10px] text-white/60">{profile.strategy}</span>
            </div>
          )}
          {(profile.twitter || profile.github || profile.url) && (
            <div className="flex gap-3 text-[10px]">
              {profile.twitter && (
                <a
                  href={`https://twitter.com/${profile.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/50"
                >
                  @{profile.twitter}
                </a>
              )}
              {profile.github && (
                <a
                  href={`https://github.com/${profile.github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/50"
                >
                  GitHub
                </a>
              )}
              {profile.url && (
                <a
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/30 hover:text-white/50"
                >
                  Website
                </a>
              )}
            </div>
          )}
        </div>
      )}

      {/* ENS Benefits Explainer */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <div className="text-[9px] text-white/20 space-y-1">
          <div>• Human-readable identity for the agent</div>
          <div>• Text records store agent metadata on-chain</div>
          <div>• Portable across all Ethereum apps</div>
        </div>
      </div>

      {/* View on ENS */}
      {name && (
        <div className="mt-3">
          <a
            href={`https://app.ens.domains/${name}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] text-white/30 hover:text-white/50 transition-colors"
          >
            View on ENS ↗
          </a>
        </div>
      )}
    </div>
  );
}
