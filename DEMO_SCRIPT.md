# Velvet Arc - Demo Video Script

**Duration**: 2:45 - 3:00 minutes
**Format**: Facecam + Screen recording
**Tip**: Speak naturally, not rushed. The timestamps are guides, not strict limits.

---

## [0:00 - 0:20] HOOK - The Problem

**[Facecam - Look at camera]**

> "What if your DeFi treasury could protect itself?
>
> I'm Shariq, and I built Velvet Arc — an autonomous agent that manages USDC across chains, dynamically adjusts Uniswap V4 fees based on market volatility, and does it all without any human intervention.
>
> Let me show you how it works."

**[Transition to screen share]**

---

## [0:20 - 0:50] THE DASHBOARD - Autonomous Agent

**[Screen: Dashboard at velvet-arc.vercel.app]**

> "This is Velvet Arc. Notice there's no 'Start' or 'Stop' button — the agent runs autonomously.
>
> **[Point to countdown timer]**
> See this countdown? Every 30 seconds, the agent fetches ETH price data, analyzes volatility, and makes a decision.
>
> **[Point to orb]**
> The orb visualizes the current market state. Green for calm, purple for volatile, red for extreme.
>
> **[Point to transaction history]**
> Every action is a real on-chain transaction. Click any hash to verify on the block explorer."

---

## [0:50 - 1:20] UNISWAP V4 - Dynamic Fee Hook

**[Screen: Strategy Explainer panel]**

> "Here's where Uniswap V4 comes in.
>
> **[Point to fee display]**
> The agent controls a V4 hook that adjusts LP fees dynamically. Low volatility? Fees drop to 0.05% to attract volume. High volatility? Fees increase to 1% to protect liquidity providers.
>
> **[Simulate high volatility - click button if available, or explain]**
> Watch — when volatility spikes, the agent instantly updates the hook fee on Base Sepolia. That's a real transaction, signed and submitted by the agent.
>
> **[Point to On-Chain badge]**
> See 'On-Chain' status? This isn't a mock — it's reading directly from the deployed V4 hook contract."

---

## [1:20 - 1:45] CIRCLE ARC - Safe Harbor Vault

**[Screen: Portfolio tab]**

> "Circle's Arc chain serves as the safe harbor.
>
> **[Point to vault balance]**
> Users deposit USDC into the VelvetVault on Arc. The vault issues shares, so your position grows as the agent captures yield.
>
> **[Point to deposit/withdraw]**
> Full deposit and withdraw functionality — when the vault is idle or in protection mode, you can exit anytime.
>
> The idea: Arc is the stable base, Base is the yield zone. The agent moves capital between them based on market conditions."

---

## [1:45 - 2:05] LI.FI + YELLOW NETWORK

**[Screen: LI.FI panel / Yellow Terminal]**

> "For cross-chain movement, we use LI.FI.
>
> **[Show LI.FI widget or route comparison]**
> The agent doesn't just bridge randomly — it compares routes across bridges, calculates gas costs, and picks the optimal path. This is programmatic LI.FI, not just a widget.
>
> **[Switch to Yellow Terminal]**
> And for instant payments, Yellow Network state channels. The agent authenticates via EIP-712 signatures and can make off-chain payments instantly — no gas, no waiting for blocks."

---

## [2:05 - 2:20] ENS - Agent Identity

**[Screen: Agent profile / ENS badge]**

> "The agent isn't just an address — it's velvet-agent.eth.
>
> **[Point to ENS profile]**
> We use ENS for human-readable identity, pulling avatars and text records. The agent's strategy, description, even social links — all stored on-chain in ENS."

---

## [2:20 - 2:45] TESTNET & FUTURE - Closing

**[Facecam - Look at camera]**

> "Now, full transparency: this is running on testnets — Arc Testnet and Base Sepolia. There's no real liquidity in the V4 pool yet, so we're not actually capturing yield.
>
> But the architecture is complete. Post-hackathon, deploying to mainnet with real USDC liquidity means this agent can genuinely earn yield through dynamic fee optimization.
>
> **[Smile]**
>
> Five sponsors. Real on-chain transactions. Fully autonomous. That's Velvet Arc.
>
> Thanks for watching — check the GitHub for the full code."

---

## Technical Highlights to Mention (if time permits)

- **5 sponsor integrations**: Uniswap, Circle, Yellow, LI.FI, ENS
- **Real contracts deployed**: Show addresses in README or explorer
- **Autonomous**: No user intervention needed
- **Share-based vault**: Proper DeFi primitive, not mock
- **EIP-712 auth**: For Yellow Network state channels

---

## Screen Recording Checklist

Before recording, have these tabs ready:

1. **Dashboard** (velvet-arc.vercel.app/app) — agent running
2. **Basescan** — agent address with transactions
3. **Strategy panel** — visible fee display
4. **Portfolio tab** — deposit/withdraw UI
5. **Yellow Terminal** — expanded in sidebar
6. **LI.FI panel** — route comparison visible

---

## Tips for Recording

1. **Pace**: Speak clearly, not too fast. Judges watch many videos.
2. **Energy**: Show passion — you stayed home during Basant to build this!
3. **Point**: Use mouse to highlight what you're talking about
4. **Verify**: Actually click a transaction link to show it's real
5. **Honest**: Acknowledge testnet limitations — judges appreciate transparency
6. **End strong**: Summarize the 5 sponsors and the vision

---

## Backup Lines (if something isn't working)

If agent isn't responding:
> "The agent polls every 30 seconds — let me show you a recent transaction instead."

If Yellow Network connection fails:
> "Yellow Network uses WebSocket connections to their clearnet sandbox. The SDK integration is complete — here's the code."

If LI.FI widget slow:
> "LI.FI is querying routes across multiple bridges in real-time. The programmatic SDK also powers our route comparison logic."

---

**Good luck! You've got this.**
