"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import Head from "next/head";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

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
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

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

  // Animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.25, 0.4, 0.25, 1] } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.1 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] } }
  };

  return (
    <main className="min-h-screen bg-[var(--void-deep)] text-[var(--light)] selection:bg-white/20 selection:text-white relative overflow-hidden">
      <Head>
        <title>Velvet Arc | Sovereign Liquidity Agent</title>
        <meta name="description" content="Autonomous AI Agent ensuring liquidity and capital preservation across Uniswap V4 and Circle Arc." />
      </Head>

      {/* Ambient Background Glows - Enhanced with animation */}
      <motion.div
        className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="fixed bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.5, 0.8, 0.5]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Navigation */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
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
            <a href="#integrations" className="hover:text-white transition-colors">Integrations</a>
          </nav>

          <Link
            href="/app"
            className="group relative px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
          >
            <span className="relative z-10">Enter App</span>
          </Link>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative pt-48 pb-32 px-6 md:px-12 max-w-[1400px] mx-auto"
      >
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Typographic Statement */}
          <motion.div
            className="relative z-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stats.isRunning ? "bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" : "bg-gray-500"}`} />
              <span className="text-xs font-mono text-white/60 tracking-wide uppercase">
                {stats.isRunning ? "System Active" : "System Standby"}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-8 text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/40"
            >
              Liquidity<br />
              <span className="font-serif italic font-normal text-white/80">Sovereignty.</span>
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-[var(--ghost)] leading-relaxed max-w-lg mb-12 font-light"
            >
              An autonomous agent that breathes with the market.
              Harvesting yield on Uniswap V4, seeking sanctuary on Circle Arc.
            </motion.p>

            <motion.div variants={fadeUp} className="flex items-center gap-6">
              <Link
                href="/app"
                className="px-8 py-4 bg-white text-black font-medium rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
              >
                Dashboard
              </Link>
              <a href="#philosophy" className="px-8 py-4 text-white/50 hover:text-white transition-colors flex items-center gap-2 group">
                <span>Explore</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  animate={{ y: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                </motion.svg>
              </a>
            </motion.div>
          </motion.div>

          {/* Abstract HUD / Status Visualization */}
          <motion.div
            className="relative mt-12 lg:mt-0"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <div className="glass-panel p-8 rounded-[32px] max-w-md ml-auto relative overflow-hidden group">
              {/* Decorative scanline */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-[float_4s_linear_infinite] opacity-20 pointer-events-none" />

              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <div className="text-xs font-mono text-[var(--ghost)] mb-1">IDENTITY</div>
                  <div className="text-lg font-mono text-white">velvet-agent.eth</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-400/20 to-purple-400/20 flex items-center justify-center border border-white/10">
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </div>
              </div>

              <div className="space-y-6">
                {/* Key Value Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="text-xs text-emerald-400/70 mb-1">Current APY</div>
                    <div className="text-2xl font-bold text-emerald-400">
                      {stats.currentAPY > 0 ? `${stats.currentAPY.toFixed(1)}%` : "—"}
                    </div>
                  </motion.div>
                  <motion.div
                    className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <div className="text-xs text-purple-400/70 mb-1">Yield Earned</div>
                    <div className="text-2xl font-bold text-purple-400">
                      ${stats.totalYield.toFixed(2)}
                    </div>
                  </motion.div>
                </div>

                <div>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm text-[var(--ghost)]">Total Value Locked</span>
                    <span className="text-2xl font-light tracking-tight">${stats.tvl.toFixed(2)}</span>
                  </div>
                  <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (stats.tvl / 1000) * 100)}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-center">
                    <div className="text-[10px] text-[var(--ghost)] mb-0.5">Fee Tier</div>
                    <div className="text-sm font-mono">{(stats.hookFee / 10000 * 100).toFixed(2)}%</div>
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
          </motion.div>
        </div>
      </motion.section>

      {/* Philosophy / Concept Section */}
      <AnimatedSection id="philosophy" className="py-32 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div
            className="max-w-xl mb-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
            >
              Profit from <br />
              <span className="font-serif font-normal italic text-white/60">Chaos.</span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              className="text-lg text-[var(--ghost)] leading-relaxed"
            >
              Markets breathe. They are calm, then violent.
              Velvet Arc is designed to adapt—capturing value when liquidity is needed most, and retreating to safety when the storm breaks.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-8"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              { icon: "✶", title: "Autopilot Liquidity", desc: "Positions are managed algorithmically. No human intervention required. Sleep soundly while the agent works." },
              { icon: "✧", title: "Dynamic Fees", desc: "Uniswap V4 hooks adjust swap fees in real-time based on volatility. High demand commands high premiums." },
              { icon: "◇", title: "Capital Sanctuary", desc: "When volatility hits extreme levels, assets are bridged to Circle Arc—a compliant, safe harbor chain." }
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="group p-8 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-500"
              >
                <div className="text-5xl mb-6 opacity-30 group-hover:opacity-100 transition-opacity duration-500">{item.icon}</div>
                <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                <p className="text-[var(--ghost)] leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* Capabilities / Bento Grid */}
      <AnimatedSection id="capabilities" className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          className="text-center mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-mono mb-4 inline-block">SYSTEM CAPABILITIES</span>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">Intelligence Layer</h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 md:grid-rows-2 gap-6 h-auto md:h-[600px]"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {/* Large Card */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 md:row-span-2 p-10 rounded-[40px] bg-gradient-to-br from-[#111] to-black border border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative z-10 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-3xl font-bold mb-4">Cross-Chain <br />Orchestration</h3>
                <p className="text-[var(--ghost)] max-w-sm">
                  Seamlessly moving capital between Base and Circle Arc using LI.FI and Circle Gateway. The boundaries between chains dissolve.
                </p>
              </div>
              <motion.div
                className="w-full h-32 bg-gradient-to-r from-purple-500/20 to-sky-500/20 rounded-2xl blur-2xl"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
            </div>
          </motion.div>

          {/* Medium Card */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.02 }}
            className="md:col-span-2 p-8 rounded-[40px] bg-[#080808] border border-white/10 relative group overflow-hidden"
          >
            <motion.div
              className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px]"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 5, repeat: Infinity }}
            />
            <h3 className="text-xl font-bold mb-2">Volatility Sensing</h3>
            <p className="text-sm text-[var(--ghost)]">Real-time ETH price action monitoring. The agent reacts before you blink.</p>
          </motion.div>

          {/* Small Cards */}
          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
            className="md:col-span-1 p-8 rounded-[40px] bg-[#080808] border border-white/10 flex flex-col justify-center text-center"
          >
            <motion.div
              className="text-3xl font-mono mb-2"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >∞</motion.div>
            <div className="text-sm text-[var(--ghost)]">Autonomous</div>
          </motion.div>

          <motion.div
            variants={scaleIn}
            whileHover={{ scale: 1.05, borderColor: "rgba(255,255,255,0.2)" }}
            className="md:col-span-1 p-8 rounded-[40px] bg-[#080808] border border-white/10 flex flex-col justify-center text-center"
          >
            <div className="text-3xl font-mono mb-2">v4</div>
            <div className="text-sm text-[var(--ghost)]">Uniswap Ready</div>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Integrations - NEW SECTION */}
      <AnimatedSection id="integrations" className="py-32 border-t border-white/5">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12">
          <motion.div
            className="text-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
          >
            <span className="px-3 py-1 rounded-full border border-white/10 text-xs font-mono mb-4 inline-block">FIVE PROTOCOLS</span>
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
              One <span className="font-serif italic font-normal text-white/60">Agent.</span>
            </h2>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-5 gap-6"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
          >
            {[
              { name: "Uniswap", detail: "V4 Dynamic Hooks", desc: "Fee adjustment 0.01% → 1.00%" },
              { name: "Circle", detail: "Arc Safe Harbor", desc: "RWA-backed USDC vault" },
              { name: "Yellow", detail: "State Channels", desc: "Instant off-chain payments" },
              { name: "LI.FI", detail: "Cross-Chain", desc: "Optimal route intelligence" },
              { name: "ENS", detail: "Identity", desc: "velvet-agent.eth" },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={scaleIn}
                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                className="group p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 text-center"
              >
                <div className="text-lg font-bold mb-1 group-hover:text-white transition-colors">{item.name}</div>
                <div className="text-xs text-white/40 mb-3">{item.detail}</div>
                <div className="text-[11px] text-[var(--ghost)]">{item.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </AnimatedSection>

      {/* How It Works - NEW SECTION */}
      <AnimatedSection className="py-32 px-6 md:px-12 max-w-[1400px] mx-auto">
        <motion.div
          className="max-w-xl mb-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.span
            variants={fadeUp}
            className="px-3 py-1 rounded-full border border-white/10 text-xs font-mono mb-4 inline-block"
          >
            EVERY 30 SECONDS
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight"
          >
            The Loop.
          </motion.h2>
        </motion.div>

        <motion.div
          className="grid md:grid-cols-4 gap-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {[
            { step: "01", title: "Fetch", desc: "ETH price and 24h change from market data" },
            { step: "02", title: "Analyze", desc: "Calculate volatility: LOW / MEDIUM / HIGH / EXTREME" },
            { step: "03", title: "Decide", desc: "Determine optimal fee tier for current conditions" },
            { step: "04", title: "Execute", desc: "Sign and submit on-chain transaction to V4 hook" },
          ].map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="relative"
            >
              <div className="text-6xl font-bold text-white/5 mb-4">{item.step}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-[var(--ghost)]">{item.desc}</p>
              {i < 3 && (
                <div className="hidden md:block absolute top-8 -right-4 w-8 h-[1px] bg-gradient-to-r from-white/20 to-transparent" />
              )}
            </motion.div>
          ))}
        </motion.div>
      </AnimatedSection>

      {/* Network / Powered By */}
      <AnimatedSection className="py-24 border-t border-white/5">
        <motion.div
          className="max-w-[1400px] mx-auto px-6 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          <p className="text-sm text-[var(--ghost)] mb-12">BUILT FOR ETHGLOBAL HACKMONEY 2026</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
            {["UNISWAP", "CIRCLE", "YELLOW", "LI.FI", "ENS"].map((name, i) => (
              <motion.span
                key={i}
                className="text-xl font-bold text-white/30 hover:text-white cursor-default transition-colors duration-300"
                whileHover={{ scale: 1.1 }}
              >
                {name}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </AnimatedSection>

      {/* Final CTA */}
      <AnimatedSection className="py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/5 pointer-events-none" />
        <motion.div
          className="max-w-4xl mx-auto px-6 text-center relative z-10"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold tracking-tighter mb-8"
          >
            Deploy the Agent.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-xl text-[var(--ghost)] mb-12 max-w-2xl mx-auto"
          >
            Your treasury, fully automated. Experience the future of sovereign liquidity management.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link
              href="/app"
              className="inline-flex items-center justify-center px-10 py-5 text-lg font-medium bg-white text-black rounded-full hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] transition-all duration-300"
            >
              Launch Interface
            </Link>
          </motion.div>
        </motion.div>
      </AnimatedSection>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-black">
        <div className="max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-[var(--ghost)]">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <span className="w-2 h-2 bg-white rounded-full opacity-20" />
            <span>Velvet Arc © 2026</span>
          </div>
          <div className="text-white/30 mb-4 md:mb-0">
            ETHGlobal HackMoney 2026
          </div>
          <div className="flex gap-8">
            <a href="https://github.com/shariqazeem/VelvetArc" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">GitHub</a>
            <a href="https://velvet-arc.vercel.app" className="hover:text-white transition-colors">Live Demo</a>
          </div>
        </div>
      </footer>
    </main>
  );
}

// Animated Section Wrapper
function AnimatedSection({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      id={id}
      className={className}
      style={{
        opacity: isInView ? 1 : 0,
        transform: isInView ? "translateY(0)" : "translateY(20px)",
        transition: "all 0.8s cubic-bezier(0.25, 0.4, 0.25, 1)"
      }}
    >
      {children}
    </section>
  );
}
