# Velvet Arc

> **Autonomous treasury agent that protects and grows USDC across Circle Arc (safe harbor) and Base (yield zone) by dynamically adjusting Uniswap V4 hook fees based on real ETH volatility.**

`velvet-agent.eth` - The Sovereign Liquidity Agent

## Prize Targets

| Sponsor | Prize Pool | Integration | Track |
|---------|-----------|-------------|-------|
| **Circle Arc** | $10,000 | USDC-native chain as safe harbor, Gateway/CCTP bridging | Best Agentic Commerce / Chain Abstracted USDC |
| **Uniswap Foundation** | $10,000 | V4 Hook with dynamic fees controlled by agent | Agentic Finance |
| **LI.FI** | $6,000 | Cross-chain deposits via widget | Best Use of LI.FI Composer / AI x LI.FI |
| **ENS** | $5,000 | Agent has real ENS identity `velvet-agent.eth` | Identity + AI |

## Core Loop

```
Every ~30 seconds:

1. FETCH    → ETH price + 24h change from CoinGecko
2. READ     → On-chain: hook fee, USDC balances, vault state
3. ANALYZE  → Calculate volatility: LOW (<3%) / MED (3-7%) / HIGH (>7%)
4. DECIDE   → Target fee: LOW→0.05% / MED→0.30% / HIGH→1.00%
5. EXECUTE  → Real signed tx to updateDynamicFee() on Base
6. PROTECT  → If EXTREME (>10%), trigger circuit breaker
```

## Demo Flow

### 1. Fund the Agent

**Option A: Cross-chain (LI.FI)**
- Open dashboard → Click "Fund Treasury"
- Select "Cross-chain (LI.FI)" tab
- Bridge USDC from any chain to agent on Base

**Option B: Testnet Direct**
- Get testnet USDC from [Circle Faucet](https://faucet.circle.com/)
- Select Arc Testnet or Base Sepolia
- Transfer directly to agent address

### 2. Start the Agent
- Click "Start Agent" button
- Watch real-time logs as agent scans market
- See orb change color based on volatility

### 3. Simulate Volatility (Demo)
- Click "Low" → Agent sets fee to 0.05%, orb turns green
- Click "High" → Agent sets fee to 1.00%, orb turns purple
- Click "Extreme" → Circuit breaker, orb turns red

### 4. Verify On-Chain
- All fee updates are real transactions on Base Sepolia
- Click tx links in logs to view on Basescan
- View agent address activity

## Deployed Contracts

| Contract | Network | Address | Explorer |
|----------|---------|---------|----------|
| VelvetVault | Arc Testnet | `0xC4a486Ef5dce0655983F7aF31682E1AE107995dB` | [Arcscan](https://testnet.arcscan.app/address/0xC4a486Ef5dce0655983F7aF31682E1AE107995dB) |
| VelvetHook | Base Sepolia | `0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2` | [Basescan](https://sepolia.basescan.org/address/0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2) |
| Agent Wallet | Multi-chain | `0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E` | [Basescan](https://sepolia.basescan.org/address/0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E) |

## Quick Start

### Prerequisites
- Node.js 18+
- pnpm or npm
- Wallet with testnet ETH (Base Sepolia) for gas

### Installation

```bash
# Clone repository
git clone https://github.com/your-repo/velvet-arc.git
cd velvet-arc

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
```

### Environment Variables

```env
# Required for agent transactions
PRIVATE_KEY=0x...  # Agent wallet private key (Base Sepolia ETH for gas)

# Optional
NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# PRIVATE_KEY (encrypted)
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed diagrams.

```
┌──────────────────────────────────────────────────────────────┐
│                         USER                                  │
│                          │                                    │
│         ┌────────────────┼────────────────┐                  │
│         ▼                ▼                ▼                  │
│    ┌─────────┐    ┌───────────┐    ┌───────────┐            │
│    │ LI.FI   │    │Arc Faucet │    │Base Direct│            │
│    │ Widget  │    │  Deposit  │    │ Transfer  │            │
│    └────┬────┘    └─────┬─────┘    └─────┬─────┘            │
│         │               │                │                   │
│         └───────────────┼────────────────┘                   │
│                         ▼                                    │
│              ┌──────────────────┐                            │
│              │ velvet-agent.eth │                            │
│              │   (API Route)    │                            │
│              │                  │                            │
│              │ CoinGecko ──────►│ Volatility                │
│              │ On-chain  ──────►│ Analysis                  │
│              │ Decision  ──────►│ Fee Update                │
│              └────────┬─────────┘                            │
│                       │                                      │
│         ┌─────────────┴─────────────┐                       │
│         ▼                           ▼                        │
│  ┌─────────────┐           ┌──────────────┐                 │
│  │ Arc Testnet │◄─ CCTP ──►│ Base Sepolia │                 │
│  │ Safe Harbor │           │  Yield Zone  │                 │
│  │ VelvetVault │           │  VelvetHook  │                 │
│  └─────────────┘           └──────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React Three Fiber, Tailwind CSS, Framer Motion |
| Wallet | wagmi, viem, RainbowKit |
| Bridging | LI.FI Widget, Circle Gateway/CCTP |
| Contracts | Solidity 0.8.26, Foundry, Uniswap V4 |
| Agent | Next.js API Routes, CoinGecko API |
| Chains | Arc Testnet (5042002), Base Sepolia (84532) |

## Key Features

- **Real On-Chain Transactions**: Agent signs and submits real txs to update hook fees
- **Live Market Data**: ETH price and volatility from CoinGecko API
- **Dynamic Fee Hook**: Uniswap V4 hook adjusts fees 0.05% - 1.00%
- **Cross-Chain Deposits**: LI.FI widget accepts USDC from any chain
- **ENS Identity**: Agent operates as `velvet-agent.eth`
- **Visual Feedback**: 3D orb changes color based on volatility state
- **Circuit Breaker**: Automatic protection mode during extreme volatility

## API Endpoints

```
GET  /api/agent              → Current agent state
POST /api/agent              → Execute action

Actions:
  { action: "start" }                    → Enable autonomous mode
  { action: "stop" }                     → Disable autonomous mode
  { action: "step" }                     → Run single iteration
  { action: "reset" }                    → Clear state
  { action: "simulate_high_volatility" } → Demo: trigger 1% fee
  { action: "simulate_low_volatility" }  → Demo: trigger 0.05% fee
  { action: "simulate_extreme_volatility"} → Demo: circuit breaker
```

## Smart Contract Deployment

```bash
cd contracts

# Install Foundry
curl -L https://foundry.paradigm.xyz | bash
foundryup

# Build contracts
forge build

# Deploy (requires env setup)
./deploy.sh all
```

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

## License

MIT

---

Built for ETHGlobal Hackathon 2026
