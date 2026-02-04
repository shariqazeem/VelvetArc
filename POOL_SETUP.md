# Velvet Arc Pool Setup Guide

This guide walks you through setting up the Uniswap V4 pool with the VelvetHook for real swaps.

## Prerequisites

- Foundry installed (`curl -L https://foundry.paradigm.xyz | bash && foundryup`)
- Private key with ETH on Base Sepolia (for gas)
- Some testnet USDC and WETH on Base Sepolia

## Important: Pool Manager Address

The official Uniswap V4 PoolManager on Base Sepolia is:
```
0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408
```

**Note**: If your VelvetHook was deployed with a different PoolManager, you'll need to redeploy it.

## Step 1: Check Current Hook

```bash
cd contracts

# Check what PoolManager the hook is connected to
cast call 0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2 \
  "poolManager()(address)" \
  --rpc-url https://sepolia.base.org
```

If this returns a different address than `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408`, you need to redeploy.

## Step 2: Redeploy Hook (if needed)

```bash
cd contracts

# Make sure PRIVATE_KEY is set in .env
source ../.env.local

# Deploy new hook with correct PoolManager
forge script script/SetupPool.s.sol:SetupPool \
  --rpc-url https://sepolia.base.org \
  --broadcast \
  --verify
```

After deployment, update `.env.local`:
```
NEXT_PUBLIC_HOOK_ADDRESS_BASE=<new_hook_address>
```

## Step 3: Initialize Pool

The pool needs to be initialized with:
- **Currency0**: USDC (`0x036CbD53842c5426634e7929541eC2318f3dCF7e`)
- **Currency1**: WETH (`0x4200000000000000000000000000000000000006`)
- **Fee**: `0x800000` (dynamic fee flag)
- **TickSpacing**: 60
- **Hook**: Your VelvetHook address

The SetupPool script handles this automatically.

## Step 4: Add Liquidity

After the pool is initialized, you need to add liquidity:

```bash
# Approve tokens
cast send 0x036CbD53842c5426634e7929541eC2318f3dCF7e \
  "approve(address,uint256)" \
  0x4b2c77d209d3405f41a037ec6c77f7f5b8e2ca80 \
  1000000000 \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY

cast send 0x4200000000000000000000000000000000000006 \
  "approve(address,uint256)" \
  0x4b2c77d209d3405f41a037ec6c77f7f5b8e2ca80 \
  1000000000000000000 \
  --rpc-url https://sepolia.base.org \
  --private-key $PRIVATE_KEY
```

Adding liquidity requires interacting with the PositionManager which uses a complex batch encoding. The frontend can help with this.

## Step 5: Test a Swap

Once liquidity is added, you can test swaps via the frontend or directly:

```bash
# Get current fee
cast call 0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2 \
  "dynamicFee()(uint24)" \
  --rpc-url https://sepolia.base.org
```

## Contract Addresses (Base Sepolia)

| Contract | Address |
|----------|---------|
| PoolManager | `0x05E73354cFDd6745C338b50BcFDfA3Aa6fA03408` |
| PositionManager | `0x4b2c77d209d3405f41a037ec6c77f7f5b8e2ca80` |
| UniversalRouter | `0x492e6456d9528771018deb9e87ef7750ef184104` |
| PoolSwapTest | `0x8b5bcc363dde2614281ad875bad385e0a785d3b9` |
| Quoter | `0x4a6513c898fe1b2d0e78d3b0e0a4a151589b1cba` |
| USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| WETH | `0x4200000000000000000000000000000000000006` |

## Bounty Targeting

### Uniswap V4 Agentic Finance ($5,000)
- Agent manages dynamic fees ✓
- Real on-chain transactions ✓
- Hook deployed and functional ✓
- **Need**: TxIDs showing fee updates and swaps

### Arc/Circle Agentic Commerce ($2,500)
- USDC deposits on Arc ✓
- Agent-controlled treasury ✓
- **Need**: Stork oracle integration (optional enhancement)

### LI.FI AI Smart App ($2,000)
- LI.FI widget integrated ✓
- Cross-chain capability ✓
- **Need**: Show agent using LI.FI for rebalancing

## Troubleshooting

### "Hook address doesn't match permissions"
Uniswap V4 hooks must be deployed at specific addresses that encode their permissions. The deployment uses CREATE2 to find a valid address.

### "Pool already initialized"
Each pool key can only be initialized once. If you need a new pool, change one of the parameters (like tickSpacing).

### "Insufficient liquidity"
The pool needs liquidity before swaps can work. Add liquidity using the PositionManager.
