# Velvet Arc

> The First Sovereign Liquidity Agent

Velvet Arc is domiciled on Circle Arc (The Economic OS) for safety, but teleports capital to Uniswap V4 on Base to capture yield — managed entirely by an autonomous agent with an ENS Identity.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        VELVET ARC                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐         LI.FI          ┌──────────────┐     │
│   │  Circle Arc  │ ◄─────────────────────► │    Base      │     │
│   │  (Home Base) │      Bridge Layer       │ (Execution)  │     │
│   │              │                         │              │     │
│   │ VelvetVault  │                         │ VelvetHook   │     │
│   │    USDC      │                         │ Uniswap V4   │     │
│   └──────────────┘                         └──────────────┘     │
│          ▲                                        ▲              │
│          │                                        │              │
│          └────────────────┬───────────────────────┘              │
│                           │                                      │
│                    ┌──────┴──────┐                              │
│                    │    Agent    │                              │
│                    │   Brain.ts  │                              │
│                    │             │                              │
│                    │ ENS: velvet │                              │
│                    │ -agent.eth  │                              │
│                    └─────────────┘                              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Sponsors Integration

| Sponsor | Integration | Prize Track |
|---------|-------------|-------------|
| Circle Arc | Home Base Vault | Agentic Commerce |
| Uniswap | V4 Dynamic Fee Hook | Agentic Finance |
| LI.FI | Cross-chain Bridge | Agentic DeFi |
| ENS | Agent Identity | Identity + Dollars |

## Tech Stack

- **Contracts**: Solidity 0.8.26 + Foundry
- **Frontend**: Next.js 14 + React Three Fiber + Framer Motion
- **Agent**: Python + TypeScript
- **Chains**: Arc Testnet (5042002) + Base Sepolia (84532)

## Deployed Contracts

| Contract | Network | Address |
|----------|---------|---------|
| VelvetVault | Arc Testnet | `0xC4a486Ef5dce0655983F7aF31682E1AE107995dB` |
| VelvetHook | Base Sepolia | `0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2` |

## Quick Start

### Frontend
```bash
npm install
npm run dev
```

### Smart Contracts
```bash
cd contracts
forge build
./deploy.sh all
```

### Agent
```bash
cd agent
./run.sh
```

## How It Works

1. **Deposit** - Users deposit USDC into VelvetVault on Arc
2. **Monitor** - Agent continuously monitors market volatility
3. **Deploy** - When volatility is low, agent bridges funds to Base via CCTP
4. **Yield** - Capital earns yield via Uniswap V4 LP positions
5. **Protect** - When volatility spikes, agent withdraws to safety
6. **Adjust** - Dynamic hook fees adapt to market conditions

## License

MIT
