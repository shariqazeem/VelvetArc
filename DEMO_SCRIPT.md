# Velvet Arc - Demo Video Script

**Duration**: 2:30 - 2:50 minutes
**Format**: Facecam + Screen recording
**Goal**: Make judges understand WHY this wins, not just WHAT it does

---

## PRE-RECORDING CHECKLIST

Before you hit record:

1. Open `velvet-arc.vercel.app/app` — let agent run for 30 seconds first
2. Have Basescan tab ready with a recent transaction
3. Clear browser console (looks cleaner)
4. Good lighting on your face
5. Speak with ENERGY — you built this during Basant while others flew kites!

---

## [0:00 - 0:15] THE HOOK — Start Strong

**[Facecam - Look directly at camera, confident]**

> "LPs lose money in volatile markets. Static fees can't adapt. By the time you react manually, the opportunity is gone.
>
> I built Velvet Arc — a fully autonomous agent that protects your capital by adjusting Uniswap V4 fees in real-time. No buttons. No intervention. Just deploy and let it work.
>
> Let me show you."

**[Quick transition to screen — don't linger on facecam]**

---

## [0:15 - 0:45] THE DASHBOARD — Prove It's Real

**[Screen: velvet-arc.vercel.app/app — Overview tab]**

> "This is the dashboard. First thing you'll notice — there's no 'Start Agent' button.
>
> **[Point to sidebar: "Agent" section with green dot]**
> The agent runs autonomously. It started the moment you opened this page. See iteration count increasing? That's real.
>
> **[Point to HeroDashboard section]**
> Right now it's monitoring ETH at $[X]. Volatility is [LOW/MEDIUM/HIGH]. Based on that, it set the hook fee to [X]%.
>
> **[Point to Transaction History]**
> Every decision is an on-chain transaction. Let me prove it—
>
> **[Click a transaction hash → Basescan opens]**
> Real transaction. Real block. This isn't a simulation."

**[Pause 1 second on Basescan to let it sink in]**

---

## [0:45 - 1:10] UNISWAP V4 — The Core Innovation

**[Screen: Back to dashboard, point to Strategy Explainer panel]**

> "Here's the magic — Uniswap V4 hooks.
>
> **[Point to fee tier display]**
> Traditional LPs use static 0.3% fees. Velvet Arc controls a V4 hook that adjusts fees dynamically — from 0.01% in calm markets to 1% during chaos.
>
> **[Point to volatility level]**
> Low volatility? Low fees attract more volume. High volatility? High fees capture premium from traders who NEED liquidity right now.
>
> **[Point to 'On-Chain' badge]**
> This reads directly from the deployed hook contract on Base Sepolia. Every 30 seconds, the agent evaluates and updates if needed.
>
> The result? LPs earn more because fees match market conditions automatically."

---

## [1:10 - 1:35] CIRCLE ARC — The Safety Net

**[Screen: Click "Deposit" tab in sidebar]**

> "But what about extreme volatility? That's where Circle Arc comes in.
>
> **[Point to vault section]**
> Users deposit USDC into this vault on Arc — Circle's RWA-backed chain. It's the safe harbor.
>
> **[Point to vault status]**
> When volatility is normal, the agent deploys capital to Base for yield. But if volatility goes EXTREME — over 10% — the agent triggers a circuit breaker and retreats everything back to Arc.
>
> **[Point to deposit/withdraw UI]**
> Full functionality. Connect wallet, deposit USDC, get shares. Withdraw anytime the vault is idle.
>
> Arc is the bunker. Base is the battlefield. The agent decides when to fight and when to retreat."

---

## [1:35 - 1:55] YELLOW + LI.FI — Instant & Cross-Chain

**[Screen: Click "Terminal" tab → Yellow Network]**

> "For payments between chains, we integrated Yellow Network state channels.
>
> **[Point to Yellow Terminal]**
> This uses the nitrolite SDK with EIP-712 authentication. The agent can make instant off-chain payments — no gas, no block confirmations.
>
> **[Click "Bridge" tab → LI.FI widget]**
> And for moving capital, LI.FI. Users can deposit from ANY chain. The widget finds optimal routes across bridges automatically.
>
> But we also use LI.FI programmatically—
>
> **[Scroll to Cross-Chain Intelligence section if visible]**
> The agent compares routes and recommends the best path before rebalancing. It's not just a widget — it's intelligence."

---

## [1:55 - 2:15] ENS — The Identity Layer

**[Screen: Point to agent name in sidebar]**

> "One more thing — the agent isn't just an address.
>
> **[Point to 'velvet-agent.eth' or ENS display]**
> It's velvet-agent.eth. We use ENS for human-readable identity.
>
> **[Point to any ENS resolution in UI]**
> The dashboard resolves ENS names for both the agent and connected users. Even though we're on Arc and Base testnets, ENS queries go to Ethereum mainnet.
>
> This matters because agents need identity. Not just 0x addresses — real, verifiable, on-chain identity with metadata."

---

## [2:15 - 2:35] THE CLOSE — Why This Wins

**[Facecam - Look at camera, genuine]**

> "Let me be transparent: this runs on testnets. Arc Testnet, Base Sepolia. There's no real liquidity capturing real yield yet.
>
> But the architecture is complete. Five sponsor integrations working together:
> - Uniswap V4 for dynamic fees
> - Circle Arc for capital protection
> - Yellow Network for instant payments
> - LI.FI for cross-chain intelligence
> - ENS for agent identity
>
> Every fee update is a real transaction. Every decision is on-chain. The agent runs without me touching anything.
>
> **[Slight smile]**
>
> Post-hackathon, this deploys to mainnet with real USDC. The agent starts earning. That's Velvet Arc.
>
> Thanks for watching. Code's on GitHub."

**[End - Don't drag it out]**

---

## POWER PHRASES TO USE

Use these exact phrases — they stick in judges' minds:

- "No buttons. No intervention."
- "Let me prove it—" [then click to Basescan]
- "This isn't a simulation."
- "Arc is the bunker. Base is the battlefield."
- "The architecture is complete."
- "Five sponsors. Real transactions. Fully autonomous."

---

## WHAT NOT TO SAY

- Don't say "I think" or "I hope" — speak with certainty
- Don't apologize for testnet — frame it as "architecture complete, mainnet next"
- Don't explain technical details judges won't care about
- Don't read from script — internalize and speak naturally

---

## IF SOMETHING BREAKS

**Agent not updating:**
> "The agent polls every 30 seconds. Let me show you a recent transaction instead." [Click tx hash]

**Yellow Terminal not connecting:**
> "Yellow Network uses WebSocket to their clearnet. The integration is complete — here's a successful auth in the logs."

**Page loads slow:**
> "Loading live on-chain data from two networks..." [Use the pause to build anticipation]

**Wallet won't connect:**
> "For the demo, the agent runs independently of user wallets. Let me show you the autonomous side."

---

## FINAL TIPS

1. **First 15 seconds decide everything** — Hook them immediately with the problem
2. **Click that Basescan link** — It's your proof moment. Don't skip it.
3. **Energy > Perfection** — Judges watch 50 videos. Be memorable.
4. **End clean** — "Thanks for watching. Code's on GitHub." Done. Don't ramble.

---

**You stayed home during Basant to build this. Now show them why it was worth it. You've got this.**
