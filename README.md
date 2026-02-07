# Velvet Arc

> **Autonomous DeFi treasury agent that protects and grows USDC across Circle Arc (safe harbor) and Base (yield zone) using dynamic Uniswap V4 hook fees, state channel micropayments, and cross-chain intelligence.**

**Live Demo**: [velvet-arc.vercel.app](https://velvet-arc.vercel.app)

`velvet-agent.eth` — The Sovereign Liquidity Agent

---

## Sponsor Integrations (5 Total)

| Sponsor | Prize Pool | Integration | Status |
|---------|-----------|-------------|--------|
| **Uniswap Foundation** | $10,000 | V4 Dynamic Fee Hook (0.01% → 1.00% based on volatility) | On-Chain |
| **Circle Arc** | $10,000 | Safe Harbor Vault for USDC protection | On-Chain |
| **Yellow Network** | $2,000+ | State channels via `@erc7824/nitrolite` SDK | Live |
| **LI.FI** | $6,000 | Cross-chain route intelligence + Widget | Integrated |
| **ENS** | $5,000 | Agent identity with text records | On-Chain |

---

## What Makes Velvet Arc Different

### Fully Autonomous Agent
The agent runs **without user control**. It auto-starts on page load, continuously monitors markets, and makes decisions autonomously. No "Start" or "Stop" buttons — this is true agentic finance.

### Real On-Chain Transactions
Every fee adjustment is a **real signed transaction** on Base Sepolia. Every deposit creates on-chain shares. Click any transaction to verify on block explorers.

### Five Sponsor Technologies Working Together
- **Uniswap V4**: Dynamic hook fees protect liquidity during volatility
- **Circle Arc**: RWA-backed USDC vault as capital safe harbor
- **Yellow Network**: Instant off-chain payments via state channels
- **LI.FI**: Cross-chain route comparison for optimal rebalancing
- **ENS**: Human-readable identity with on-chain metadata

---

## Core Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        VELVET ARC AGENT                                  │
│                                                                          │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐       │
│   │  CoinGecko  │───►│   ANALYZE    │───►│   EXECUTE ACTION    │       │
│   │  ETH Price  │    │  Volatility  │    │                     │       │
│   └─────────────┘    └──────────────┘    │  LOW  → Fee 0.05%   │       │
│                                           │  MED  → Fee 0.30%   │       │
│   ┌─────────────┐    ┌──────────────┐    │  HIGH → Fee 1.00%   │       │
│   │   LI.FI     │───►│   COMPARE    │    │  EXTREME → Protect  │       │
│   │   Routes    │    │   Routes     │    └─────────────────────┘       │
│   └─────────────┘    └──────────────┘              │                    │
│                                                     ▼                    │
│   ┌─────────────────────────────────────────────────────────────────┐  │
│   │                     DUAL-CHAIN DEPLOYMENT                        │  │
│   │                                                                  │  │
│   │   ┌─────────────────┐           ┌─────────────────────────┐    │  │
│   │   │   ARC TESTNET   │◄─ CCTP ──►│     BASE SEPOLIA        │    │  │
│   │   │   Safe Harbor   │           │      Yield Zone         │    │  │
│   │   │                 │           │                         │    │  │
│   │   │  VelvetVault    │           │  VelvetHook (V4)       │    │  │
│   │   │  Share-based    │           │  Dynamic Fees          │    │  │
│   │   │  Deposits       │           │  0.01% - 1.00%         │    │  │
│   │   └─────────────────┘           └─────────────────────────┘    │  │
│   └─────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐       │
│   │   Yellow    │───►│    State     │───►│  Instant Payments   │       │
│   │   Network   │    │   Channels   │    │  Off-Chain Speed    │       │
│   └─────────────┘    └──────────────┘    └─────────────────────┘       │
│                                                                          │
│   ┌─────────────┐    ┌──────────────┐    ┌─────────────────────┐       │
│   │    ENS      │───►│    Resolve   │───►│  velvet-agent.eth   │       │
│   │   Mainnet   │    │   Identity   │    │  + Text Records     │       │
│   └─────────────┘    └──────────────┘    └─────────────────────┘       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Agent Decision Loop

```
Every ~30 seconds (autonomous):

1. FETCH    → ETH price + 24h change from CoinGecko
2. READ     → On-chain: hook fee, USDC balances, vault state
3. ANALYZE  → Calculate volatility: LOW (<3%) / MED (3-7%) / HIGH (7-10%) / EXTREME (>10%)
4. COMPARE  → LI.FI routes for potential cross-chain rebalancing
5. DECIDE   → Target fee based on volatility + route efficiency
6. EXECUTE  → Real signed tx to updateDynamicFee() on Base Sepolia
7. PROTECT  → If EXTREME: trigger circuit breaker, move to safe harbor
```

---

## Deployed Contracts

| Contract | Network | Address | Explorer |
|----------|---------|---------|----------|
| **VelvetVault** | Arc Testnet | `0xC4a486Ef5dce0655983F7aF31682E1AE107995dB` | [Arcscan](https://testnet.arcscan.app/address/0xC4a486Ef5dce0655983F7aF31682E1AE107995dB) |
| **VelvetHook** | Base Sepolia | `0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2` | [Basescan](https://sepolia.basescan.org/address/0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2) |
| **Agent Wallet** | Multi-chain | `0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E` | [Basescan](https://sepolia.basescan.org/address/0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E) |

---

## Quick Start

### Prerequisites
- Node.js 18+
- npm or pnpm
- Wallet with testnet ETH (Base Sepolia) for gas

### Installation

```bash
# Clone repository
git clone https://github.com/shariqazeem/VelvetArc.git
cd VelvetArc

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
```

### Environment Variables

```env
# Required for agent transactions
PRIVATE_KEY=0x...  # Agent wallet private key

# Contract addresses (defaults provided)
NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2

# Optional
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Testing the Application

### 1. Agent Auto-Starts
When you open the dashboard, the agent automatically begins its monitoring loop. Watch the countdown timer showing next action.

### 2. Deposit USDC

**Option A: Cross-chain via LI.FI**
- Click "Fund Treasury" → Select "Cross-chain" tab
- Bridge USDC from any chain to the vault
- LI.FI finds optimal route automatically

**Option B: Direct Testnet Transfer**
- Get testnet USDC from [Circle Faucet](https://faucet.circle.com/)
- Transfer to the vault address on Arc Testnet

### 3. Watch Agent Decisions
- The orb visualizer changes color based on volatility state
- Transaction history shows every on-chain action
- Strategy panel displays current fee and rationale

### 4. Simulate Volatility (Demo Mode)
- **Low Volatility**: Fee drops to 0.05%, orb turns green
- **High Volatility**: Fee increases to 1.00%, orb turns purple
- **Extreme Volatility**: Circuit breaker activates, orb turns red

### 5. Withdraw Funds
- Navigate to Portfolio tab
- Enter withdrawal amount
- Click "Withdraw" (available when vault is IDLE or PROTECTED)

### 6. Yellow Network State Channels
- Open Yellow Terminal in sidebar
- Authenticate with EIP-712 signature
- View state channel balance and activity

### 7. Verify On-Chain
- Click any transaction hash to view on block explorer
- All fee updates are real transactions on Base Sepolia
- Deposits/withdrawals create actual vault shares

---

## Key Features

### Autonomous Operation
The agent runs independently without user intervention. It starts automatically, monitors markets continuously, and executes transactions based on its analysis.

### Dynamic Fee Adjustment (Uniswap V4)
```
Volatility Level → Hook Fee
─────────────────────────────
LOW    (<3%)    → 0.05% (0.01% min)
MEDIUM (3-7%)   → 0.30%
HIGH   (7-10%)  → 1.00%
EXTREME (>10%)  → Circuit Breaker
```

### Cross-Chain Intelligence (LI.FI)
The agent uses LI.FI SDK programmatically to:
- Compare routes across bridges
- Calculate gas costs
- Recommend optimal rebalancing paths
- Display route efficiency scores

### State Channel Payments (Yellow Network)
Using `@erc7824/nitrolite` SDK:
- WebSocket connection to clearnet sandbox
- EIP-712 authentication flow
- Instant off-chain payments
- Virtual application channels

### ENS Identity
- Reverse resolution for any address
- Avatar display from ENS records
- Custom text records (`velvet.strategy`, etc.)
- Links to ENS profile pages

### Real-Time UI
- Countdown timer to next agent action
- Flash effects on new transactions
- Pulse animations on live data
- Color-coded volatility states

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14, React, Tailwind CSS, Framer Motion |
| **3D Visualization** | React Three Fiber, Three.js |
| **Wallet** | wagmi, viem, RainbowKit |
| **Bridging** | LI.FI SDK + Widget |
| **State Channels** | @erc7824/nitrolite (Yellow Network) |
| **Identity** | ENS (wagmi hooks) |
| **Contracts** | Solidity 0.8.26, Foundry, Uniswap V4-core |
| **Chains** | Arc Testnet (5042002), Base Sepolia (84532) |

---

## Project Structure

```
src/
├── app/
│   ├── app/page.tsx          # Main dashboard
│   └── api/agent/route.ts    # Agent API endpoint
├── components/
│   ├── HeroDashboard.tsx     # Agent status + orb
│   ├── StrategyExplainer.tsx # Live hook parameters
│   ├── PortfolioView.tsx     # Vault deposits/withdraws
│   ├── TransactionHistory.tsx # Real-time tx feed
│   ├── YellowTerminal.tsx    # State channel UI
│   ├── LiFiBridgePanel.tsx   # Cross-chain widget
│   ├── CrossChainIntelligence.tsx # Route comparison
│   ├── ENSAgentProfile.tsx   # Agent identity card
│   └── SponsorBadges.tsx     # Integration status
├── lib/
│   ├── yellow/
│   │   └── YellowClient.ts   # Yellow Network singleton
│   └── lifi/
│       └── LiFiService.ts    # Programmatic LI.FI
└── hooks/
    └── useENS.ts             # ENS resolution hooks
```

---

## API Reference

```
GET  /api/agent              → Current agent state
POST /api/agent              → Execute action

Actions:
  { action: "start" }                      → Enable autonomous mode
  { action: "stop" }                       → Disable autonomous mode
  { action: "step" }                       → Run single iteration
  { action: "simulate_high_volatility" }   → Demo: trigger 1% fee
  { action: "simulate_low_volatility" }    → Demo: trigger 0.05% fee
  { action: "simulate_extreme_volatility"} → Demo: circuit breaker
```

---

## Smart Contract Deployment

```bash
cd contracts

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build contracts
forge build

# Deploy VelvetVault to Arc Testnet
forge script script/DeployVault.s.sol --rpc-url $ARC_RPC --broadcast

# Deploy VelvetHook to Base Sepolia
forge script script/DeployHook.s.sol --rpc-url $BASE_RPC --broadcast
```

---

## Hackathon Submission

**ETHGlobal HackMoney 2026**

### Prize Tracks
1. **Uniswap Foundation - Agentic Finance** ($10,000)
   - V4 Hook with agent-controlled dynamic fees

2. **Circle Arc - Agentic Commerce** ($10,000)
   - USDC vault on Arc as safe harbor destination

3. **Yellow Network - State Channels** ($2,000+)
   - Nitrolite SDK for instant off-chain payments

4. **LI.FI - AI x LI.FI** ($6,000)
   - Programmatic route comparison + embedded widget

5. **ENS - Identity + AI** ($5,000)
   - Agent identity with reverse resolution + text records

---

## License

MIT

---

Built with passion for ETHGlobal HackMoney 2026
