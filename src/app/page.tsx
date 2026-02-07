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
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
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

  const sponsors = [
    { name: "Uniswap", role: "Dynamic V4 Hooks", color: "from-pink-500 to-purple-500" },
    { name: "Circle", role: "Arc Safe Harbor", color: "from-green-400 to-emerald-500" },
    { name: "Yellow", role: "State Channels", color: "from-yellow-400 to-orange-500" },
    { name: "LI.FI", role: "Cross-Chain Routes", color: "from-purple-400 to-pink-500" },
    { name: "ENS", role: "Agent Identity", color: "from-sky-400 to-blue-500" },
  ];

  const steps = [
    { icon: "📡", title: "Monitor", desc: "Agent fetches ETH price and calculates real-time volatility" },
    { icon: "🧠", title: "Analyze", desc: "Compares routes, evaluates risk, determines optimal fee tier" },
    { icon: "⚡", title: "Execute", desc: "Signs and submits on-chain transaction to update V4 hook" },
    { icon: "🛡️", title: "Protect", desc: "If extreme volatility, triggers circuit breaker to safe harbor" },
  ];

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-white/20 selection:text-white relative overflow-hidden">
      <Head>
        <title>Velvet Arc | Autonomous DeFi Treasury Agent</title>
        <meta name="description" content="Autonomous AI agent that protects and grows USDC using dynamic Uniswap V4 fees, cross-chain intelligence, and state channel payments." />
      </Head>

      {/* Ambient Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[70vw] h-[70vw] bg-purple-500/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[80vw] h-[80vw] bg-sky-500/10 rounded-full blur-[150px]" />
        <div className="absolute top-[40%] left-[50%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 border-b ${scrolled
          ? "bg-[#050505]/90 backdrop-blur-xl border-white/5 py-4"
          : "bg-transparent border-transparent py-6"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <div className="relative w-8 h-8">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-sky-500 rounded-full opacity-60 group-hover:opacity-100 transition-opacity blur-sm" />
              <div className="absolute inset-[2px] bg-[#050505] rounded-full" />
              <div className="absolute inset-[6px] bg-gradient-to-br from-purple-400 to-sky-400 rounded-full" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Velvet Arc</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/50">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
          </nav>

          <Link
            href="/app"
            className="group relative px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 md:px-12 max-w-[1400px] mx-auto">
        {/* Hackathon Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-sky-500/20 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-mono text-white/60">ETHGlobal HackMoney 2026</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400">LIVE</span>
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[1.05] mb-8">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/50">
              Your Treasury,
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-sky-400 to-emerald-400">
              Fully Autonomous
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-white/50 leading-relaxed max-w-2xl mx-auto mb-12">
            An AI agent that protects and grows your USDC by dynamically adjusting
            Uniswap V4 fees based on real-time market volatility. No intervention required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="group px-8 py-4 bg-white text-black font-semibold rounded-full hover:scale-105 transition-all duration-300 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] flex items-center gap-2"
            >
              <span>Launch Dashboard</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <a
              href="https://github.com/shariqazeem/VelvetArc"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-white/60 hover:text-white font-medium rounded-full border border-white/10 hover:border-white/30 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>View Source</span>
            </a>
          </div>
        </div>

        {/* Live Stats Bar */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xs text-white/40 mb-1">Agent Status</div>
              <div className="flex items-center justify-center gap-2">
                <span className={`w-2 h-2 rounded-full ${stats.isRunning ? "bg-emerald-400 animate-pulse" : "bg-white/30"}`} />
                <span className={`font-mono text-sm ${stats.isRunning ? "text-emerald-400" : "text-white/50"}`}>
                  {stats.isRunning ? "ACTIVE" : "STANDBY"}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xs text-white/40 mb-1">Hook Fee</div>
              <div className="font-mono text-lg">{(stats.hookFee / 10000 * 100).toFixed(2)}%</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xs text-white/40 mb-1">Volatility</div>
              <div className={`font-mono text-lg ${
                stats.volatility === "LOW" ? "text-emerald-400" :
                stats.volatility === "MEDIUM" ? "text-yellow-400" :
                stats.volatility === "HIGH" ? "text-orange-400" :
                "text-red-400"
              }`}>{stats.volatility}</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-sm text-center">
              <div className="text-xs text-white/40 mb-1">ETH Price</div>
              <div className="font-mono text-lg">${stats.ethPrice.toLocaleString()}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsor Integrations Marquee */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-[1400px] mx-auto px-6">
          <p className="text-center text-xs font-mono text-white/30 mb-8 tracking-widest">5 SPONSOR INTEGRATIONS</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
            {sponsors.map((sponsor, i) => (
              <div key={i} className="group flex flex-col items-center gap-2 cursor-default">
                <div className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${sponsor.color} opacity-60 group-hover:opacity-100 transition-opacity`}>
                  {sponsor.name}
                </div>
                <div className="text-[10px] text-white/30 group-hover:text-white/50 transition-colors">
                  {sponsor.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/50 mb-6">
            AUTONOMOUS LOOP
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            How the Agent <span className="text-white/40">Works</span>
          </h2>
          <p className="text-lg text-white/40 max-w-xl mx-auto">
            Every 30 seconds, the agent executes a complete decision cycle without any human intervention.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          {steps.map((step, i) => (
            <div
              key={i}
              className={`relative p-8 rounded-3xl border transition-all duration-500 ${
                activeStep === i
                  ? "bg-white/[0.08] border-white/20 scale-105"
                  : "bg-white/[0.02] border-white/5 hover:bg-white/[0.04]"
              }`}
            >
              {activeStep === i && (
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
              )}
              <div className="relative z-10">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="text-xs font-mono text-white/30 mb-2">STEP {i + 1}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.desc}</p>
              </div>
              {i < 3 && (
                <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-[2px] bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Key Value Proposition */}
      <section className="py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/50 mb-6">
                THE PROBLEM
              </span>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
                LPs Lose Money in <span className="text-red-400">Volatile Markets</span>
              </h2>
              <p className="text-lg text-white/40 leading-relaxed mb-8">
                Traditional liquidity positions use static fees. When volatility spikes,
                you're underpricing your liquidity. When it's calm, you're overpricing and losing volume.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Static fees can't adapt</div>
                    <div className="text-sm text-white/40">Fixed 0.3% regardless of market conditions</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Manual rebalancing is slow</div>
                    <div className="text-sm text-white/40">By the time you react, the opportunity is gone</div>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-red-400 text-xs">✕</span>
                  </div>
                  <div>
                    <div className="font-medium mb-1">No protection mechanism</div>
                    <div className="text-sm text-white/40">Extreme volatility means extreme losses</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-sky-500/20 rounded-[40px] blur-3xl opacity-30" />
              <div className="relative p-10 rounded-[40px] bg-white/[0.03] border border-white/10">
                <span className="inline-block px-4 py-1.5 rounded-full border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-6">
                  THE SOLUTION
                </span>
                <h3 className="text-3xl font-bold mb-6">
                  <span className="text-emerald-400">Velvet Arc</span> Adapts in Real-Time
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-emerald-400 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Dynamic V4 hook fees</div>
                      <div className="text-sm text-white/40">0.01% → 1.00% based on volatility</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-emerald-400 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium mb-1">30-second decision cycles</div>
                      <div className="text-sm text-white/40">Autonomous, no human intervention</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-emerald-400 text-xs">✓</span>
                    </div>
                    <div>
                      <div className="font-medium mb-1">Circuit breaker protection</div>
                      <div className="text-sm text-white/40">Moves to Arc safe harbor in extreme conditions</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Deep Dive */}
      <section id="integrations" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <div className="text-center mb-20">
          <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/50 mb-6">
            TECHNOLOGY STACK
          </span>
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            5 Protocols, <span className="text-white/40">One Agent</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Uniswap V4 */}
          <div className="group p-8 rounded-3xl bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 hover:border-pink-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 flex items-center justify-center">
                <span className="text-lg">🦄</span>
              </div>
              <div>
                <div className="font-bold">Uniswap V4</div>
                <div className="text-xs text-white/40">Dynamic Fee Hook</div>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Custom hook contract that adjusts LP fees from 0.01% to 1.00% based on volatility. Higher fees during chaos, lower fees during calm.
            </p>
            <div className="text-xs font-mono text-pink-400/60">
              Base Sepolia • On-Chain
            </div>
          </div>

          {/* Circle Arc */}
          <div className="group p-8 rounded-3xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                <span className="text-lg">🏦</span>
              </div>
              <div>
                <div className="font-bold">Circle Arc</div>
                <div className="text-xs text-white/40">Safe Harbor Vault</div>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4">
              RWA-backed USDC chain serving as the capital safe harbor. When volatility spikes to extreme levels, assets retreat here for protection.
            </p>
            <div className="text-xs font-mono text-green-400/60">
              Arc Testnet • On-Chain
            </div>
          </div>

          {/* Yellow Network */}
          <div className="group p-8 rounded-3xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 hover:border-yellow-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <span className="text-lg">⚡</span>
              </div>
              <div>
                <div className="font-bold">Yellow Network</div>
                <div className="text-xs text-white/40">State Channels</div>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Instant off-chain payments via @erc7824/nitrolite SDK. EIP-712 authentication enables gas-free, instant micropayments.
            </p>
            <div className="text-xs font-mono text-yellow-400/60">
              Clearnet Sandbox • Live
            </div>
          </div>

          {/* LI.FI */}
          <div className="group p-8 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center">
                <span className="text-lg">🌉</span>
              </div>
              <div>
                <div className="font-bold">LI.FI</div>
                <div className="text-xs text-white/40">Cross-Chain Intelligence</div>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Programmatic route comparison across bridges. The agent calculates gas costs, timing, and recommends optimal rebalancing paths.
            </p>
            <div className="text-xs font-mono text-purple-400/60">
              SDK + Widget • Integrated
            </div>
          </div>

          {/* ENS */}
          <div className="group p-8 rounded-3xl bg-gradient-to-br from-sky-500/10 to-blue-500/10 border border-sky-500/20 hover:border-sky-500/40 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
                <span className="text-lg">🆔</span>
              </div>
              <div>
                <div className="font-bold">ENS</div>
                <div className="text-xs text-white/40">Agent Identity</div>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-4">
              Human-readable identity with on-chain text records. The agent operates as velvet-agent.eth with avatar and strategy metadata.
            </p>
            <div className="text-xs font-mono text-sky-400/60">
              Mainnet Resolution • On-Chain
            </div>
          </div>

          {/* Architecture Card */}
          <div className="group p-8 rounded-3xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-center">
            <div className="text-center">
              <div className="text-4xl mb-4">🏗️</div>
              <div className="font-bold mb-2">Full Architecture</div>
              <p className="text-sm text-white/40 mb-4">
                Dual-chain deployment with real on-chain transactions on every action.
              </p>
              <a
                href="https://github.com/shariqazeem/VelvetArc"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
              >
                <span>View on GitHub</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 md:px-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full border border-white/10 text-xs font-mono text-white/50 mb-6">
              KEY FEATURES
            </span>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
              Built for <span className="text-white/40">Real DeFi</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">🤖</div>
              <div className="font-bold mb-2">Fully Autonomous</div>
              <div className="text-sm text-white/40">No start/stop buttons. Agent runs independently on page load.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">⛓️</div>
              <div className="font-bold mb-2">Real Transactions</div>
              <div className="text-sm text-white/40">Every action is a signed, on-chain transaction. Verify on explorer.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">💰</div>
              <div className="font-bold mb-2">Share-Based Vault</div>
              <div className="text-sm text-white/40">Proper DeFi primitive. Deposit USDC, receive shares, withdraw anytime.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">🔴</div>
              <div className="font-bold mb-2">Circuit Breaker</div>
              <div className="text-sm text-white/40">Automatic protection mode during extreme market conditions.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">📊</div>
              <div className="font-bold mb-2">Live Visualization</div>
              <div className="text-sm text-white/40">3D orb changes color based on volatility. Real-time countdown to next action.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">🔗</div>
              <div className="font-bold mb-2">Dual Chain</div>
              <div className="text-sm text-white/40">Arc Testnet for safety, Base Sepolia for yield. Best of both worlds.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">📝</div>
              <div className="font-bold mb-2">Transaction History</div>
              <div className="text-sm text-white/40">Complete log of every agent action with explorer links.</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
              <div className="text-2xl mb-3">🌐</div>
              <div className="font-bold mb-2">Cross-Chain Ready</div>
              <div className="text-sm text-white/40">LI.FI integration for deposits from any chain.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testnet Notice + Vision */}
      <section className="py-24 px-6 md:px-12 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <span className="text-amber-400">⚠️</span>
            <span className="text-sm text-amber-400/80">Testnet Deployment</span>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Currently on Arc Testnet & Base Sepolia
          </h3>
          <p className="text-white/40 mb-8">
            The architecture is complete and all contracts are deployed. There's no real liquidity
            in the V4 pool yet, so yield capture is simulated. Post-hackathon, mainnet deployment
            with real USDC liquidity will enable actual yield generation through dynamic fee optimization.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <a
              href="https://testnet.arcscan.app/address/0xC4a486Ef5dce0655983F7aF31682E1AE107995dB"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
            >
              VelvetVault on Arc ↗
            </a>
            <a
              href="https://sepolia.basescan.org/address/0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:border-white/30 transition-all"
            >
              VelvetHook on Base ↗
            </a>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-8">
            Experience <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-sky-400">Autonomous</span> DeFi
          </h2>
          <p className="text-xl text-white/40 mb-12 max-w-2xl mx-auto">
            Watch the agent make real on-chain decisions. No setup required — just open the dashboard.
          </p>
          <Link
            href="/app"
            className="inline-flex items-center justify-center px-12 py-5 text-lg font-semibold bg-white text-black rounded-full hover:scale-105 hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] transition-all duration-300"
          >
            Launch Dashboard
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-white/30">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-sky-500 opacity-50" />
            <span>Velvet Arc © 2026</span>
          </div>
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span>Built for</span>
            <span className="text-white/50 font-medium">ETHGlobal HackMoney 2026</span>
          </div>
          <div className="flex gap-6">
            <a href="https://github.com/shariqazeem/VelvetArc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://velvet-arc.vercel.app" className="hover:text-white transition-colors">Live Demo</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
