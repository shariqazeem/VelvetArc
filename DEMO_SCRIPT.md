# Velvet Arc - Demo Video Script

**Duration**: 2:30 - 2:50 minutes
**Format**: Facecam + Screen share side by side OR picture-in-picture
**Style**: Show and explain simultaneously — not separate sections

---

## BEFORE RECORDING

1. Open `velvet-arc.vercel.app/app` in browser
2. Open Basescan in another tab: `https://sepolia.basescan.org/address/0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2`
3. Let dashboard load for 10 seconds so agent starts
4. Have wallet ready but DON'T connect yet (you'll do it live)

---

## [0:00 - 0:12] INTRO — Problem + Solution

**[Facecam, look at camera]**

> "LPs use static fees that can't adapt to market conditions. When volatility spikes, they're underpriced. When it's calm, they're overpriced.
>
> I built Velvet Arc — an autonomous agent that adjusts Uniswap V4 hook fees in real-time based on volatility. Let me show you."

**[Transition to screen share — dashboard already open]**

---

## [0:12 - 0:45] DASHBOARD TOUR — Show While Explaining

**[Screen: Dashboard is open, point as you talk]**

> "This is the dashboard. The agent is already running — see this green dot? It started automatically when the page loaded. No start button. Fully autonomous.
>
> **[Point to ETH price area]**
> It's fetching live ETH price — right now $[read the price].
>
> **[Point to volatility indicator]**
> Based on 24-hour movement, volatility is [LOW/MEDIUM/HIGH].
>
> **[Point to Hook Fee display]**
> And here's the key — the current hook fee is [X]%. This is reading directly from the Uniswap V4 hook contract on Base Sepolia.
>
> **[Point to iteration count in sidebar]**
> Every 30 seconds, the agent runs another cycle. You can see we're on iteration [X]."

---

## [0:45 - 1:05] PROVE IT'S REAL — Basescan

**[Switch to Basescan tab you prepared]**

> "But is this actually on-chain? Let me prove it.
>
> **[You're now on Basescan showing the hook contract]**
> This is the VelvetHook contract on Base Sepolia. Look at these transactions —
>
> **[Point to recent transactions list]**
> Each one is an `updateDynamicFee` call from the agent. Real transactions, real blocks, real gas paid.
>
> **[Click on one transaction to open details]**
> See? Method: updateDynamicFee. The agent signed and submitted this. Not simulated."

**[Go back to dashboard]**

---

## [1:05 - 1:30] CONNECT WALLET — Live Demo

**[Screen: Back on dashboard]**

> "Now let me show the user side. I'll connect my wallet.
>
> **[Click Connect button → RainbowKit modal opens]**
>
> **[Connect your wallet — do this live]**
>
> **[Once connected, switch to Arc Testnet if prompted]**
>
> Connected. Now I'm on Arc Testnet — that's Circle's chain.
>
> **[Click 'Deposit' tab in sidebar]**
>
> This is where users deposit USDC into the vault.
>
> **[Point to the deposit form]**
> Enter amount, approve, deposit. You get shares representing your position.
>
> **[Point to vault status in sidebar]**
> The vault shows current state — IDLE means withdrawals are open. When the agent deploys capital, it locks temporarily."

---

## [1:30 - 1:50] THE STRATEGY — Why This Works

**[Screen: Click back to 'Overview' tab]**

> **[Point to Strategy Explainer panel]**
> Here's the logic. When volatility is LOW, the agent sets low fees — around 0.05% — to attract trading volume.
>
> When volatility spikes HIGH, fees go up to 1%. Traders pay a premium because they NEED liquidity during chaos.
>
> And if volatility goes EXTREME — over 10% — the agent triggers a circuit breaker. It stops everything and retreats capital to Arc, the safe harbor.
>
> **[Point to the On-Chain badge if visible]**
> All of this is controlled by the V4 hook. Not a backend. Not a database. On-chain logic."

---

## [1:50 - 2:10] OTHER INTEGRATIONS — Quick Hits

**[Screen: Click through tabs quickly]**

> "We also integrated three more sponsors.
>
> **[Click 'Bridge' tab — show LI.FI widget]**
> LI.FI for cross-chain deposits. Users can bridge USDC from any chain. The agent also uses LI.FI programmatically to compare routes.
>
> **[Click 'Terminal' tab — show Yellow Terminal]**
> Yellow Network for state channel payments. This uses the nitrolite SDK — instant off-chain transfers, no gas.
>
> **[Point to agent name in sidebar]**
> And ENS. The agent isn't just an address — it resolves to velvet-agent.eth. Human-readable identity."

---

## [2:10 - 2:35] CLOSING — The Vision

**[Facecam — look at camera, genuine]**

> "Quick transparency: this is on testnets — Arc Testnet and Base Sepolia. No real liquidity yet.
>
> But the architecture is complete. Real contracts. Real transactions. Five sponsor integrations:
> - Uniswap V4 dynamic hooks
> - Circle Arc safe harbor
> - Yellow Network state channels
> - LI.FI cross-chain routing
> - ENS agent identity
>
> Post-hackathon, this goes to mainnet with real USDC. The agent starts earning real yield.
>
> That's Velvet Arc. Code's on GitHub. Thanks for watching."

---

## KEY MOMENTS TO NAIL

| Timestamp | What to do | Why it matters |
|-----------|------------|----------------|
| 0:12 | Point to green dot | Proves agent is autonomous |
| 0:50 | Switch to Basescan | **This is your proof moment** |
| 1:10 | Connect wallet LIVE | Shows it's real, not screenshot |
| 1:35 | Explain fee logic | Judges understand the value |
| 2:25 | List all 5 sponsors | Reminds judges of all integrations |

---

## IF TRANSACTION HISTORY IS EMPTY

Don't mention it. Use Basescan instead:

> "Let me show you the on-chain proof directly on Basescan..."

The hook contract at `0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2` should have transactions from the agent.

---

## IF AGENT ISN'T UPDATING

Say:
> "The agent polls every 30 seconds. While we wait, let me show you the contract transactions on Basescan."

---

## IF WALLET WON'T CONNECT

Skip wallet connect and say:
> "The key thing is the agent runs independently of user wallets. It's already making decisions autonomously."

---

## POWER PHRASES

- "No start button. Fully autonomous."
- "Let me prove it." [switch to Basescan]
- "Real transactions, real blocks, real gas paid."
- "Arc is the bunker. Base is the battlefield."
- "The architecture is complete."

---

## FLOW SUMMARY

```
INTRO (facecam) → DASHBOARD TOUR (explain while showing) → BASESCAN PROOF
→ CONNECT WALLET LIVE → STRATEGY EXPLANATION → QUICK SPONSOR HITS → CLOSE (facecam)
```

Everything flows. You're never just talking without showing something.

---

**Go get it.**
