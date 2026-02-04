# Velvet Arc - Complete Testing Guide

## Prerequisites

1. **MetaMask or similar wallet** installed
2. **Base Sepolia ETH** for gas (get from [Alchemy Faucet](https://www.alchemy.com/faucets/base-sepolia))
3. **Base Sepolia USDC** for testing (get from [Circle Faucet](https://faucet.circle.com/))
4. **Arc Testnet USDC** for vault deposits (native to Arc)

## Network Details

| Network | Chain ID | RPC |
|---------|----------|-----|
| Arc Testnet | 5042002 | https://rpc.testnet.arc.network |
| Base Sepolia | 84532 | https://sepolia.base.org |

## Contract Addresses

- **Vault (Arc)**: `0xC4a486Ef5dce0655983F7aF31682E1AE107995dB`
- **Hook (Base)**: `0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2`
- **Agent Wallet**: `0x7468e32704F0daa837B7906b8ED040c2be2595Cf`
- **USDC (Arc)**: `0x3600000000000000000000000000000000000000`
- **USDC (Base Sepolia)**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`

---

## Test 1: Basic Agent Operation

### Steps:
1. Open http://localhost:3000
2. Click **"Start Agent"** button
3. Watch the activity log on the right panel

### Expected Results:
- [ ] Agent shows "velvet-agent.eth activated" in logs
- [ ] ETH price appears in center (from CoinGecko)
- [ ] Mode indicator changes based on volatility (Yield/Balance/Protect)
- [ ] Left panel shows Arc Vault balance and Base Hook fee
- [ ] Activity log shows: "Scanning market conditions...", "Reading on-chain state..."

### Verify API:
```bash
curl http://localhost:3000/api/agent | jq '.state.isRunning'
# Should return: true
```

---

## Test 2: Demo Mode

### Steps:
1. Make sure agent is stopped
2. Click **"Demo"** button
3. Watch simulated market conditions

### Expected Results:
- [ ] Purple "Demo Mode" banner appears at top
- [ ] Orb color changes based on simulated volatility
- [ ] Mode cycles through Yield → Balance → Protect
- [ ] "Exit" button stops demo

---

## Test 3: LI.FI Widget (Fund Agent)

### Steps:
1. Click **"Fund"** button
2. Toggle between "Testnet (Demo)" and "Mainnet (LI.FI)"

### Expected Results (Testnet Mode):
- [ ] Shows faucet links for Base Sepolia ETH and USDC
- [ ] Displays agent wallet address with copy button
- [ ] Instructions are clear

### Expected Results (Mainnet Mode):
- [ ] LI.FI widget loads (may take a few seconds)
- [ ] Dark theme matches app
- [ ] Shows Base as destination chain
- [ ] Shows USDC as destination token

---

## Test 4: Wallet Connection

### Steps:
1. Click **"Connect"** in top right
2. Connect with MetaMask
3. Click **"Vault"** button (appears after connecting)

### Expected Results:
- [ ] RainbowKit modal appears
- [ ] Wallet connects successfully
- [ ] Address shows in top right
- [ ] "Vault" button appears in bottom dock

---

## Test 5: Multi-User Vault Deposit

### Prerequisites:
- Connected wallet on Arc Testnet
- USDC balance on Arc Testnet

### Steps:
1. Click **"Vault"** button
2. Enter deposit amount
3. Click **"Deposit"**
4. Approve USDC (if first time)
5. Confirm deposit transaction

### Expected Results:
- [ ] Modal shows your USDC balance
- [ ] Chain switch prompt if not on Arc Testnet
- [ ] Approval transaction succeeds
- [ ] Deposit transaction succeeds
- [ ] Success screen shows shares received

---

## Test 6: Multi-User Vault Withdraw

### Prerequisites:
- Connected wallet with vault shares

### Steps:
1. Click **"Vault"** button
2. Mode should be "withdraw" if you have shares
3. Enter shares to redeem
4. Click **"Withdraw"**

### Expected Results:
- [ ] Shows your share balance
- [ ] Transaction succeeds
- [ ] USDC returned to wallet

---

## Test 7: Dynamic Fee Updates (Requires PRIVATE_KEY)

### Prerequisites:
- `PRIVATE_KEY` env var set in `.env.local`
- Agent wallet has Base Sepolia ETH for gas

### Steps:
1. Start agent
2. Wait for volatility to change OR
3. Manually trigger high volatility period

### Expected Results:
- [ ] Agent logs "Adjusting fee: X% → Y%"
- [ ] Transaction hash appears in logs
- [ ] "Last TX" link shows in left panel
- [ ] Hook fee updates on-chain

### Verify:
```bash
# Check hook fee on Base Sepolia
cast call 0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2 "dynamicFee()(uint24)" --rpc-url https://sepolia.base.org
```

---

## Test 8: Liquidity Deployment (Requires PRIVATE_KEY + USDC)

### Prerequisites:
- `PRIVATE_KEY` env var set
- Agent wallet has USDC on Base Sepolia

### Steps:
1. Send USDC to agent wallet: `0x7468e32704F0daa837B7906b8ED040c2be2595Cf`
2. Start agent
3. Agent should detect USDC and deploy

### Expected Results:
- [ ] Agent logs "USDC available. Deploying to Uniswap V4."
- [ ] Approval transaction
- [ ] Deposit transaction
- [ ] Hook liquidity increases

### Verify:
```bash
# Check hook liquidity
cast call 0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2 "totalLiquidity()(uint256)" --rpc-url https://sepolia.base.org
```

---

## Test 9: Circle CCTP Bridging (Requires PRIVATE_KEY + Vault USDC)

### Prerequisites:
- `PRIVATE_KEY` env var set
- Agent registered on vault contract
- Vault has USDC on Arc Testnet

### Steps:
1. Deposit USDC to vault on Arc
2. Start agent
3. Agent should detect vault funds and bridge

### Expected Results:
- [ ] Agent logs "Bridging via Circle Gateway..."
- [ ] Vault state changes to BRIDGING_OUT
- [ ] USDC appears on Base (after attestation ~minutes)
- [ ] Agent confirms deployment
- [ ] Vault state changes to DEPLOYED

---

## Test 10: ENS Text Record Updates (Requires PRIVATE_KEY + Sepolia ETH)

### Prerequisites:
- `PRIVATE_KEY` env var set
- Agent wallet has Sepolia ETH
- Agent owns velvet-agent.eth on Sepolia

### Steps:
1. Start agent
2. Run for 5+ iterations (25+ seconds)
3. Check ENS records

### Expected Results:
- [ ] Agent logs "Updating ENS record..."
- [ ] ENS text records updated

### Verify:
```bash
# Check ENS text record (requires ENS resolution)
# Or use: https://app.ens.domains/velvet-agent.eth
```

---

## API Testing

### Get Agent State:
```bash
curl http://localhost:3000/api/agent | jq '.'
```

### Start Agent:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "start"}'
```

### Stop Agent:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "stop"}'
```

### Run Single Step:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "step"}'
```

### Reset Agent:
```bash
curl -X POST http://localhost:3000/api/agent \
  -H "Content-Type: application/json" \
  -d '{"action": "reset"}'
```

---

## Troubleshooting

### "No private key - cannot execute"
- Add `PRIVATE_KEY=0x...` to `.env.local`
- Restart dev server

### Chain switch fails
- Manually add Arc Testnet to MetaMask:
  - Network Name: Arc Testnet
  - RPC: https://rpc.testnet.arc.network
  - Chain ID: 5042002
  - Currency: USDC

### LI.FI widget stuck loading
- Check browser console for errors
- May be rate limited - wait and retry

### Wallet shows wrong balance
- Make sure you're on the correct network
- Refresh the page to refetch data

---

## Judge Demo Script (5 minutes)

1. **Open app** - Show minimalist UI, explain "Steve Jobs aesthetic"
2. **Start Demo mode** - Show how orb/mode changes with volatility
3. **Show Fund flow** - Click Fund, show LI.FI widget, explain any-chain deposits
4. **Connect wallet** - Show vault deposit flow (if time)
5. **Start real agent** - Show live ETH price, fee calculations
6. **Show transaction** - Point to Last TX link, open in explorer
7. **Explain architecture** - "Safe home on Arc, execution on Base, identity on ENS"

**Key talking points:**
- "Agent has an ENS identity - velvet-agent.eth"
- "Uses Circle CCTP for trustless bridging"
- "Dynamic fees via Uniswap V4 hooks"
- "Any-chain deposits via LI.FI"
- "All autonomous - no human intervention needed"
