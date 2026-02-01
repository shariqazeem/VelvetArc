# Velvet Arc - Production Deployment Guide

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS                                    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              FRONTEND (Vercel/Netlify)                   │    │
│  │                    Next.js App                           │    │
│  │         Users deposit/withdraw via wallet                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                           ▼                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              VELVET VAULT (Arc Testnet)                  │    │
│  │            Holds user deposits in USDC                   │    │
│  │          0xC4a486Ef5dce0655983F7aF31682E1AE107995dB      │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│                    Agent Controls                                │
│                           │                                      │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │           AGENT RUNNER (Railway/Render/fly.io)           │    │
│  │              24/7 TypeScript Process                     │    │
│  │     Monitors market → Makes decisions → Executes         │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│              ┌────────────┴────────────┐                        │
│              │                         │                        │
│              ▼                         ▼                        │
│  ┌───────────────────┐    ┌───────────────────────┐            │
│  │  CIRCLE GATEWAY   │    │   VELVET HOOK (Base)   │            │
│  │   Cross-chain     │    │    Uniswap V4 fees     │            │
│  │   USDC bridge     │    │  Dynamic fee capture   │            │
│  └───────────────────┘    └───────────────────────┘            │
│              │                         │                        │
│              ▼                         ▼                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    LI.FI SDK                             │    │
│  │          Cross-chain routing & execution                 │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Start (Local)

```bash
# 1. Run the agent locally
npm run agent

# 2. Demo mode (force specific actions)
npm run agent:demo:deploy   # Force deploy to Base
npm run agent:demo:withdraw # Force withdraw to Arc
```

---

## Option 1: Deploy to Railway (Recommended)

Railway offers free tier with $5/month credits - perfect for hackathons.

### Steps:

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your Velvet Arc repository

3. **Configure Environment Variables**
   In Railway dashboard, add these variables:
   ```
   PRIVATE_KEY=0x...your-agent-private-key
   NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
   NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2
   ```

4. **Set Start Command**
   In Settings → Deploy, set:
   ```
   npm run agent
   ```

5. **Deploy**
   Railway auto-deploys on push to main.

---

## Option 2: Deploy to Render

1. **Create Render Account**
   - Go to [render.com](https://render.com)

2. **Create Background Worker**
   - New → Background Worker
   - Connect GitHub repo
   - Build Command: `npm install`
   - Start Command: `npm run agent`

3. **Add Environment Variables**
   Same as Railway above.

---

## Option 3: Deploy to fly.io

```bash
# Install flyctl
brew install flyctl

# Login
fly auth login

# Create app
fly launch --name velvet-arc-agent

# Set secrets
fly secrets set PRIVATE_KEY=0x...
fly secrets set NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
fly secrets set NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2

# Deploy
fly deploy
```

Create `fly.toml`:
```toml
app = "velvet-arc-agent"

[build]
  builder = "heroku/buildpacks:20"

[env]
  NODE_ENV = "production"

[[services]]
  internal_port = 8080
  protocol = "tcp"

[processes]
  agent = "npm run agent"
```

---

## Option 4: VPS (DigitalOcean/Linode)

For more control, use a VPS with PM2:

```bash
# On your VPS
git clone https://github.com/YOUR_USERNAME/velvet-arc.git
cd velvet-arc
npm install

# Create .env.local
cat > .env.local << EOF
PRIVATE_KEY=0x...
NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2
EOF

# Install PM2
npm install -g pm2

# Start agent
pm2 start "npm run agent" --name velvet-agent

# Auto-restart on reboot
pm2 startup
pm2 save

# View logs
pm2 logs velvet-agent
```

---

## Frontend Deployment (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repo

2. **Environment Variables**
   Add these in Vercel dashboard:
   ```
   NEXT_PUBLIC_VAULT_ADDRESS_ARC=0xC4a486Ef5dce0655983F7aF31682E1AE107995dB
   NEXT_PUBLIC_HOOK_ADDRESS_BASE=0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2
   NEXT_PUBLIC_ARC_CHAIN_ID=5042002
   NEXT_PUBLIC_ARC_RPC=https://rpc.testnet.arc.network
   NEXT_PUBLIC_BASE_CHAIN_ID=84532
   NEXT_PUBLIC_BASE_RPC=https://sepolia.base.org
   ```

3. **Deploy**
   Vercel auto-deploys on push.

---

## Agent Wallet Setup

The agent needs USDC on both chains to pay for gas:

### Arc Testnet
1. Get testnet USDC from Arc faucet
2. Send to agent address: `0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E`

### Base Sepolia
1. Get ETH from [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
2. Get USDC from [Circle USDC Faucet](https://faucet.circle.com/)
3. Send to agent address

---

## Monitoring

### View Agent Logs

**Railway:**
```bash
railway logs
```

**Render:**
View in dashboard → Logs

**fly.io:**
```bash
fly logs
```

**PM2:**
```bash
pm2 logs velvet-agent
```

### Health Checks

The agent logs every 15 seconds. You should see:
```
[12:00:00] === Iteration #1 ===
   Vault: IDLE | Balance: $100.00
   Market: ETH $3200 | LOW volatility | +1.23%
   Decision: DEPLOY - Low volatility - deploying to Base
   Deploying 100.00 USDC to Base...
   Bridge initiated: 0x...
```

---

## Security Checklist

- [ ] Private key is ONLY in environment variables (never in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] Agent wallet has minimal funds (only what's needed)
- [ ] Circuit breaker is tested and working
- [ ] Vault contract has agent address set correctly

---

## Troubleshooting

### "NotAgent" error
The vault doesn't recognize the agent. Fix:
```bash
# Call setAgent on vault contract to update agent address
cast send $VAULT_ADDRESS "setAgent(address)" $AGENT_ADDRESS --rpc-url https://rpc.testnet.arc.network --private-key $OWNER_PRIVATE_KEY
```

### "InsufficientBalance" error
Vault doesn't have enough USDC. Users need to deposit first.

### Bridge stuck
Circle Gateway bridges take 2-5 minutes. Check:
- [Arc Explorer](https://testnet.arcscan.app)
- [Base Sepolia Explorer](https://sepolia.basescan.org)

### LI.FI no routes
LI.FI may not have routes for testnet. The agent will fallback to vault bridge.

---

## Demo Day Commands

```bash
# Start agent in demo mode
npm run agent:demo:deploy

# Watch it deploy to Base, then switch to:
npm run agent:demo:withdraw

# Or let it auto-cycle:
DEMO_MODE=true DEMO_CYCLE=true npm run agent
```

Good luck with the hackathon!
