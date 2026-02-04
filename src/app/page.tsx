"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Head from "next/head";

export default function LandingPage() {
  const [stats, setStats] = useState({
    tvl: 0,
    ethPrice: 0,
    priceChange: 0,
    volatility: "LOW",
    hookFee: 3000,
    isRunning: false,
    currentAPY: 0,
    totalYield: 0,
    protectionEvents: 0,
  });

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/agent");
        const data = await res.json();
        if (data.success && data.state) {
          const hookLiquidity = parseFloat(data.state.hookLiquidity || "0");
          const vaultBalance = parseFloat(data.state.vaultAvailableBalance || "0");
          const arcBalance = parseFloat(data.state.agentArcUsdcBalance || "0");
          const baseBalance = parseFloat(data.state.agentUsdcBalance || "0");

          const performance = data.state.performance || {};
          setStats({
            tvl: hookLiquidity + vaultBalance + arcBalance + baseBalance,
            ethPrice: data.state.ethPrice || 0,
            priceChange: data.state.priceChange24h || 0,
            volatility: data.state.volatility || "LOW",
            hookFee: data.state.hookFee || 3000,
            isRunning: data.state.isRunning || false,
            currentAPY: performance.currentAPY || 0,
            totalYield: performance.feesCaptured || 0,
            protectionEvents: performance.protectionEvents || 0,
          });
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-[var(--void-deep)] text-[var(--light)] selection:bg-white/20 selection:text-white relative overflow-hidden">
      <Head>
        <title>Velvet Arc | Sovereign Liquidity Agent</title>
        <meta name="description" content="Autonomous AI Agent ensuring liquidity and capital preservation across Uniswap V4 and Circle Arc." />
      </Head>

      {/* Ambient Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
            ? "bg-[var(--void-deep)]/80 backdrop-blur-xl border-white/5 py-4"
            : "bg-transparent border-transparent py-8"
          }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative w-6 h-6">
              <div className="absolute inset-0 bg-white rounded-full opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="absolute inset-[4px] bg-white rounded-full opacity-80" />
            </div>
            <span className="font-medium tracking-tight text-white/90">Velvet Arc</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[var(--ghost)]">
            <a href="#philosophy" className="hover:text-white transition-colors">Philosophy</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#network" className="hover:text-white transition-colors">Network</a>
          </nav>

          <Link
            href="/app"
            className="group relative px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full overflow-hidden transition-all hover:scale-105"
          >
            <span className="relative z-10 group-hover:text-black">Enter App</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Typographic Statement */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
              <span className={`w-1.5 h-1.5 rounded-full ${stats.isRunning ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-gray-500"}`} />
              <span className="text-xs font-mono text-white/60 tracking-wide uppercase">
                {stats.isRunning ? "System Active" : "System Standby"}
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40">
              Liquidity<br />
              <span className="font-serif italic font-normal text-white/80">Sovereignty.</span>
            </h1>

            <p className="text-xl md:text-2xl text-[var(--ghost)] leading-relaxed max-w-lg mb-12 font-light">
              An autonomous agent that breathes with the market.
              Harvesting yield on Uniswap V4, seeking sanctuary on Circle Arc.
            </p>

            <div className="flex items-center gap-6">
              <Link
                href="/app"
                className="px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 transition-transform duration-300"
              >
                Dashboard
              </Link>
              <a href="#philosophy" className="px-8 py-4 text-white/50 hover:text-white transition-colors flex items-center gap-2">
                <span>Explore</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Abstract HUD / Status Visualization */}
          <div className="relative mt-12 lg:mt-0">
            <div className="glass-panel p-8 rounded-[32px] max-w-md ml-auto relative overflow-hidden group">
              {/* Decorative scanline */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-[float_4s_linear_infinite] opacity-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <div className="text-xs font-mono text-[var(--ghost)] mb-1">IDENTITY</div>
                  <div className="text-lg font-mono text-white">velvet-agent.eth</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400/20 to-purple-400/20 flex items-center justify-center border border-white/10">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </div>
              </div>

              <div className="space-y-6">
                {/* Key Value Metrics - What users care about */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
                    <div className="text-xs text-emerald-400/70 mb-1">Current APY</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.currentAPY > 0 ? `${stats.currentAPY.toFixed(1)}%` : "—"}
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20">
                    <div className="text-xs text-purple-400/70 mb-1">Yield Earned</div>
                    <div className="text-2xl font-bold text-purple-400">
                      ${stats.totalYield.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-[var(--ghost)]">Total Value Locked</span>
                    <span className="text-2xl font-light tracking-tight">${stats.tvl.toFixed(2)}</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all" style={{ width: `${Math.min(100, (stats.tvl / 1000) * 100)}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)] mb-0.5">Fee Tier</div>
                    <div className="text-sm font-mono">{(stats.hookFee / 10000).toFixed(2)}%</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)] mb-0.5">Volatility</div>
                    <div className={`text-sm font-mono ${stats.volatility === "LOW" ? "text-emerald-400" :
                        stats.volatility === "HIGH" ? "text-amber-400" :
                        stats.volatility === "EXTREME" ? "text-red-400" : "text-white"
                      }`}>
                      {stats.volatility}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)] mb-0.5">Protected</div>
                    <div className="text-sm font-mono text-blue-400">{stats.protectionEvents}x</div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${stats.isRunning ? "bg-emerald-500 animate-pulse" : "bg-gray-500"}`} />
                    <span className="text-[var(--ghost)]">{stats.isRunning ? "Agent Active" : "Standby"}</span>
                  </div>
                  <div className="flex gap-3 text-[var(--ghost)]">
                    <span>Arc</span>
                    <span>+</span>
                    <span>Base</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy / Concept Section */}
      <section id="philosophy" className="py-32 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <div className="max-w-xl mb-24">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
              Profit from <br />
              <span className="font-serif font-normal italic text-white/60">Chaos.</span>
            </h2>
            <p className="text-lg text-[var(--ghost)] leading-relaxed">
              Markets breathe. They are calm, then violent.
              Velvet Arc is designed to adapt—capturing value when liquidity is needed most, and retreating to safety when the storm breaks.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500">
              <div className="text-6xl mb-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">✶</div>
              <h3 className="text-xl font-bold mb-4">Autopilot Liquidity</h3>
              <p className="text-[var(--ghost)] leading-relaxed">
                Positions are managed algorithmically. No human intervention required. Sleep soundly while the agent works.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500">
              <div className="text-6xl mb-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">✧</div>
              <h3 className="text-xl font-bold mb-4">Dynamic Fees</h3>
              <p className="text-[var(--ghost)] leading-relaxed">
                Uniswap V4 hooks adjust swap fees in real-time based on volatility. High demand commands high premiums.
              </p>
            </div>

            <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all duration-500">
              <div className="text-6xl mb-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">🛡</div>
              <h3 className="text-xl font-bold mb-4">Capital Sanctuary</h3>
              <p className="text-[var(--ghost)] leading-relaxed">
                When volatility hits extreme levels, assets are bridged to Circle Arc—a compliant, safe harbor chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Capabilities / Bento Grid */}
      <section id="capabilities" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-mono mb-4 inline-block">SYSTEM CAPABILITIES</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Intelligence Layer</h2>
        </div>

        <div className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]">
          {/* Large Card */}
          <div className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-4">Cross-Chain <br />Orchestration</h3>
                <p className="text-[var(--ghost)] max-w-sm">
                  Seamlessly moving capital between Base and Circle Arc using LI.FI and Circle Gateway. The boundaries between chains dissolve.
                </p>
              </div>
              <div className="w-full h-32 bg-gradient-to-r from-purple-500/20 to-sky-500/20 rounded-2xl blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />
            </div>
          </div>

          {/* Medium Card */}
          <div className="md:col-span-2 p-8 rounded-[40px] bg-[#080808] border border-white/10 relative group overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] group-hover:bg-emerald-500/20 transition-colors" />
            <h3 className="text-xl font-bold mb-2">Volatility Sensing</h3>
            <p className="text-sm text-[var(--ghost)]">Real-time ETH price action monitoring via API integration.</p>
          </div>

          {/* Small Card */}
          <div className="md:col-span-1 p-8 rounded-[40px] bg-[#080808] border border-white/10 flex flex-col justify-center text-center group hover:border-white/20 transition-colors">
            <div className="text-3xl font-mono mb-2 group-hover:scale-110 transition-transform">∞</div>
            <div className="text-sm text-[var(--ghost)]">Autonomous</div>
          </div>

          {/* Small Card */}
          <div className="md:col-span-1 p-8 rounded-[40px] bg-[#080808] border border-white/10 flex flex-col justify-center text-center group hover:border-white/20 transition-colors">
            <div className="text-3xl font-mono mb-2 group-hover:scale-110 transition-transform">v4</div>
            <div className="text-sm text-[var(--ghost)]">Uniswap Ready</div>
          </div>
        </div>
      </section>

      {/* Network / Integration */}
      <section id="network" className="py-24 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 text-center">
          <p className="text-sm text-[var(--ghost)] mb-12">POWERED BY INDUSTRY LEADERS</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
            {/* Simple text placeholders for logos, in a real app these would be SVGs */}
            <span className="text-xl font-bold hover:text-white cursor-pointer transition-colors">UNISWAP</span>
            <span className="text-xl font-bold hover:text-white cursor-pointer transition-colors">CIRCLE</span>
            <span className="text-xl font-bold hover:text-white cursor-pointer transition-colors">LI.FI</span>
            <span className="text-xl font-bold hover:text-white cursor-pointer transition-colors">BASE</span>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Deploy the Agent.
          </h2>
          <p className="text-xl text-[var(--ghost)] mb-12 max-w-2xl mx-auto">
            Your treasury, fully automated. Experience the future of sovereign liquidity management on the testnet today.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-10 py-5 text-lg font-medium bg-white text-black rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
          >
            Launch Interface
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--ghost)]">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="w-2 h-2 bg-white rounded-full opacity-20" />
            <span>Velvet Arc © 2026</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">GitHub</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
