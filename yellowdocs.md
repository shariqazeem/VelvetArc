Learn

Welcome to the Yellow Network learning path. This section builds your understanding from fundamentals to advanced concepts.

Introduction

Start here to understand what Yellow Network solves and how it works.

What Yellow Solves — Understand the core problems: scaling, cost, and speed. Learn why state channels are the answer for high-frequency applications.

Architecture at a Glance — See how the three protocol layers (on-chain, off-chain, application) work together to enable fast, secure transactions.

Getting Started

Get hands-on with Yellow Network in minutes.

Quickstart: Your First Channel — Create a state channel, perform an off-chain transfer, and verify the transaction in under 10 minutes.

Prerequisites & Environment — Set up a complete development environment with Node.js, TypeScript, and the Nitrolite SDK.

Key Terms & Mental Models — Build your vocabulary and conceptual framework for understanding state channels.

Core Concepts

Deep dive into the technology powering Yellow Network.

State Channels vs L1/L2 — Compare state channels with Layer 1 and Layer 2 solutions. Understand when each approach is the right choice.

App Sessions — Multi-party application channels with custom governance and state management.

Session Keys — Delegated keys for secure, gasless interactions without repeated wallet prompts.

Challenge-Response & Disputes — How Yellow Network handles disputes and ensures your funds are always recoverable.

Message Envelope — Overview of the Nitro RPC message format and communication protocol.

Next Steps

After completing the Learn section, continue to:

Build — Implement complete Yellow Applications
Protocol Reference — Authoritative protocol specification
Quick Reference

Topic	Time	Difficulty
What Yellow Solves	5 min	Beginner
Architecture at a Glance	8 min	Beginner
Quickstart	10 min	Beginner
Key Terms	10 min	Beginner
State Channels vs L1/L2	12 min	Intermediate
App Sessions	8 min	Intermediate
Session Keys	8 min	Intermediate
Challenge-Response	6 min	Intermediate
Message Envelope

What Yellow Solves

In this guide, you will learn why Yellow Network exists, what problems it addresses, and how it provides a faster, cheaper way to build Web3 applications.

The Blockchain Scalability Problem

Every blockchain transaction requires global consensus. While this guarantees security and decentralization, it creates three fundamental limitations:

Challenge	Impact on Users
High Latency	Transactions take 15 seconds to several minutes for confirmation
High Costs	Gas fees spike during network congestion, making microtransactions impractical
Limited Throughput	Networks like Ethereum process ~15-30 transactions per second
For applications requiring real-time interactions—gaming, trading, micropayments—these constraints make traditional blockchain unusable as a backend.

How Yellow Network Solves This

Yellow Network uses state channels to move high-frequency operations off-chain while preserving blockchain-level security guarantees.

The Core Insight

Most interactions between parties don't need immediate on-chain settlement. Consider a chess game with a 10 USDC wager:

On-chain approach: Every move requires a transaction → 40+ transactions → $100s in fees
State channel approach: Lock funds once, play off-chain, settle once → 2 transactions → minimal fees
State channels let you execute unlimited off-chain operations between on-chain checkpoints.

What You Get

Feature	Benefit
Instant Transactions	Sub-second finality (< 1 second typical)
Zero Gas Costs	Off-chain operations incur no blockchain fees
Unlimited Throughput*	No consensus bottleneck limiting operations
Blockchain Security	Funds are always recoverable via on-chain contracts
*Theoretically unlimited—state channels have no blockchain consensus overhead. Real-world performance depends on signature generation speed, network latency between participants, and application complexity. We'll be publishing detailed benchmarks soon.

The Nitrolite Protocol

Yellow Network is built on Nitrolite, a state channel protocol designed for EVM-compatible chains. Nitrolite provides:

Fund Custody: Smart contracts that securely lock and release assets
Dispute Resolution: Challenge-response mechanism ensuring fair outcomes
Final Settlement: Cryptographic guarantees that final allocations are honored
WHEN TO USE YELLOW NETWORK
Choose Yellow Network when your application needs:

Real-time interactions between users
Microtransactions or streaming payments
High transaction volumes without gas costs
Multi-party coordination with instant settlement
Chain Abstraction with Clearnode

A Clearnode serves as your entry point to Yellow Network. When you connect to a Clearnode:

Deposit tokens into the Custody Contract on any supported chain
Resize your channel to move funds to your unified balance
Transact instantly with any other user on the network
Withdraw back through the Custody Contract to any supported chain
FUND FLOW
Funds flow through the Custody Contract (on-chain) before reaching your unified balance (off-chain). The resize operation moves funds between your on-chain available balance and your off-chain unified balance. See Architecture for the complete flow.
For example, deposit 50 USDC on Polygon and 50 USDC on Base—after resizing, your unified balance shows 100 USDC. You can then withdraw all 100 USDC to Arbitrum if you choose.

Deposit on Polygon
50 USDC
Unified Balance
100 USDC
Deposit on Base
50 USDC
Withdraw to Arbitrum
100 USDC
Real-World Applications

Payment Applications

Micropayments: Pay-per-article, API usage billing, content monetization
Streaming payments: Subscription services, hourly billing, real-time payroll
P2P transfers: Instant remittances without intermediaries
Gaming Applications

Turn-based games: Chess, poker, strategy games with wagers
Real-time multiplayer: In-game economies with instant transactions
Tournaments: Prize pools and automated payouts
DeFi Applications

High-frequency trading: Execute trades without MEV concerns
Prediction markets: Real-time betting with instant settlement
Escrow services: Multi-party coordination with dispute resolution
Security Model

Yellow Network maintains blockchain-level security despite operating off-chain:

Guarantee	How It's Achieved
Fund Safety	All funds locked in audited smart contracts
Dispute Resolution	Challenge period allows contesting incorrect states
Cryptographic Proof	Every state transition is signed by participants
Recovery Guarantee	Users can always recover funds via on-chain contracts
If a Clearnode becomes unresponsive or malicious, you can submit your latest signed state to the blockchain and recover your funds after a challenge period.

Next Steps

Now that you understand what Yellow solves, continue to:

Architecture at a Glance — See how the protocol layers work together
Quickstart — Create your first state channel in minutes

Architecture at a Glance

In this guide, you will learn how Yellow Network's three protocol layers work together to enable fast, secure, off-chain transactions.

The Three Layers

Yellow Network consists of three interconnected layers, each with a specific responsibility:

Blockchain Layer
On-Chain Layer
Off-Chain Layer
Application Layer
Nitro RPC Protocol
On-chain operations
Monitors events
Your Application
Games, Payments, DeFi
Client SDK
Clearnode
Custody & Adjudicator Contracts
Ethereum, Polygon, Base, etc.
Layer	Purpose	Speed	Cost
Application	Your business logic and user interface	—	—
Off-Chain	Instant state updates via Nitro RPC	< 1 second	Zero gas
On-Chain	Fund custody, disputes, final settlement	Block time	Gas fees
On-Chain Layer: Security Foundation

The on-chain layer provides cryptographic guarantees through smart contracts:

Custody Contract

The Custody Contract is the core of Nitrolite's on-chain implementation. It handles:

Channel Creation: Lock funds and establish participant relationships
Dispute Resolution: Process challenges and validate states
Final Settlement: Distribute funds according to signed final state
Fund Management: Deposit and withdrawal operations
Adjudicator Contracts

Adjudicators validate state transitions according to application-specific rules:

SimpleConsensus: Both participants must sign (default for payment channels)
Custom Adjudicators: Application-specific validation logic
ON-CHAIN OPERATIONS
You only touch the blockchain for:

Opening a channel (lock funds)
Resizing a channel (add or remove funds)
Closing a channel (unlock and distribute funds)
Disputing a state (if counterparty is uncooperative)
Off-Chain Layer: Speed and Efficiency

The off-chain layer handles high-frequency operations without blockchain transactions.

Clearnode

A Clearnode is the off-chain service that:

Manages the Nitro RPC protocol for state channel operations
Provides a unified balance across multiple chains
Coordinates payment channels between users
Hosts app sessions for multi-party applications
Nitro RPC Protocol

Nitro RPC is a lightweight protocol optimized for state channel communication:

Compact format: JSON array structure reduces message size by ~30%
Signed messages: Every request and response is cryptographically signed
Real-time updates: Bidirectional communication via WebSocket
// Compact Nitro RPC format
[requestId, method, params, timestamp]

// Example: Transfer 50 USDC
[42, "transfer", {"destination": "0x...", "amount": "50.0", "asset": "usdc"}, 1699123456789]


How Funds Flow

This diagram shows how your tokens move through the system:

1. deposit
2. resize
3. resize
4. open session
5. close session
6. resize/close
7. withdraw
User Wallet
(ERC-20)
Available Balance
(Custody Contract)
Channel-Locked
(Custody Contract)
Unified Balance
(Clearnode)
App Sessions
(Applications)
Fund States

State	Location	What It Means
User Wallet	Your EOA	Full control, on-chain
Available Balance	Custody Contract	Deposited, ready for channels
Channel-Locked	Custody Contract	Committed to a specific channel
Unified Balance	Clearnode	Available for off-chain operations
App Session	Application	Locked in a specific app session
Channel Lifecycle

A payment channel progresses through distinct states:

create() with both signatures
resize() (add/remove funds)
close() (cooperative)
challenge() (if disagreement)
checkpoint() (newer state)
Timeout expires
VOID
ACTIVE
FINAL
DISPUTE
This is where
99% of activity happens
LEGACY FLOW
The diagram above shows the recommended flow where both participants sign the initial state, creating the channel directly in ACTIVE status. A legacy flow also exists where only the creator signs initially (status becomes INITIAL), and other participants call join() separately. See Channel Lifecycle for details.
Typical Flow

Create: Both parties sign initial state → channel becomes ACTIVE
Operate: Exchange signed states off-chain (unlimited, zero gas)
Close: Both sign final state → funds distributed
Dispute Path (Rare)

If your counterparty becomes unresponsive:

Challenge: Submit your latest signed state on-chain
Wait: Challenge period (typically 24 hours) allows counterparty to respond
Finalize: If no newer state is submitted, your state becomes final
Communication Patterns

Opening a Channel

Blockchain
Clearnode
Client
Blockchain
Clearnode
Client
create_channel request
channel config + Clearnode signature
Sign state
create() with BOTH signatures
Verify, lock funds, emit event
Event detected
Channel now ACTIVE
Off-Chain Transfer

Receiver
Clearnode
Sender
Receiver
Clearnode
Sender
Complete in < 1 second, zero gas
transfer(destination, amount)
Validate, update ledger
Confirmed ✓
balance_update notification
Key Takeaways

Concept	What to Remember
On-Chain	Only for opening, closing, disputes—security layer
Off-Chain	Where all the action happens—speed layer
Clearnode	Your gateway to the network—coordination layer
State Channels	Lock once, transact unlimited times, settle once
SECURITY GUARANTEE
At every stage, funds remain cryptographically secured. You can always recover your funds according to the latest valid signed state, even if a Clearnode becomes unresponsive.
Next Steps

Ready to start building? Continue to:

Quickstart — Create your first channel in minutes
Prerequisites — Set up your development environment
Core Concepts — Deep dive into state channels
Edit this page


Quickstart Guide

This guide provides a step-by-step walkthrough of integrating with the Yellow Network using the Nitrolite SDK. We will build a script to connect to the network, authenticate, manage state channels, and transfer funds.

Prerequisites

Node.js (v18 or higher)
npm
Setup

Install Dependencies

npm install

Environment Variables

Create a .env file in your project root:

# .env
PRIVATE_KEY=your_sepolia_private_key_here
ALCHEMY_RPC_URL=your_alchemy_rpc_url_here

1. Getting Funds

Before we write code, you need test tokens (ytest.usd). In the Sandbox, these tokens land in your Unified Balance (Off-Chain), which sits in the Yellow Network's clearing layer.

Request tokens via the Faucet:

curl -XPOST https://clearnet-sandbox.yellow.com/faucet/requestTokens \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"<your_wallet_address>"}'

2. Initialization

First, we setup the NitroliteClient with Viem. This client handles all communication with the Yellow Network nodes and smart contracts.

import { NitroliteClient, WalletStateSigner, createECDSAMessageSigner } from '@erc7824/nitrolite';
import { createPublicClient, createWalletClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import WebSocket from 'ws';
import 'dotenv/config';

// Setup Viem Clients
const account = privateKeyToAccount(process.env.PRIVATE_KEY as `0x${string}`);
const publicClient = createPublicClient({ chain: sepolia, transport: http(process.env.ALCHEMY_RPC_URL) });
const walletClient = createWalletClient({ chain: sepolia, transport: http(), account });

// Initialize Nitrolite Client
const client = new NitroliteClient({
    publicClient,
    walletClient,
    stateSigner: new WalletStateSigner(walletClient),
    addresses: {
        custody: '0x019B65A265EB3363822f2752141b3dF16131b262',
        adjudicator: '0x7c7ccbc98469190849BCC6c926307794fDfB11F2',
    },
    chainId: sepolia.id,
    challengeDuration: 3600n,
});

// Connect to Sandbox Node
const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');


3. Authentication

Authentication involves generating a temporary Session Key and verifying your identity using your main wallet (EIP-712).

// Generate temporary session key
const sessionPrivateKey = generatePrivateKey();
const sessionSigner = createECDSAMessageSigner(sessionPrivateKey);
const sessionAccount = privateKeyToAccount(sessionPrivateKey);

// Send auth request
const authRequestMsg = await createAuthRequestMessage({
    address: account.address,
    application: 'Test app',
    session_key: sessionAccount.address,
    allowances: [{ asset: 'ytest.usd', amount: '1000000000' }],
    expires_at: BigInt(Math.floor(Date.now() / 1000) + 3600), // 1 hour
    scope: 'test.app',
});
ws.send(authRequestMsg);

// Handle Challenge (in ws.onmessage)
if (type === 'auth_challenge') {
    const challenge = response.res[2].challenge_message;
    // Sign with MAIN wallet
    const signer = createEIP712AuthMessageSigner(walletClient, authParams, { name: 'Test app' });
    const verifyMsg = await createAuthVerifyMessageFromChallenge(signer, challenge);
    ws.send(verifyMsg);
}


4. Channel Lifecycle

Creating a Channel

If no channel exists, we request the Node to open one.

const createChannelMsg = await createCreateChannelMessage(
    sessionSigner, // Sign with session key
    {
        chain_id: 11155111, // Sepolia
        token: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // ytest.usd
    }
);
ws.send(createChannelMsg);

// Listen for 'create_channel' response, then submit to chain
const createResult = await client.createChannel({
    channel,
    unsignedInitialState,
    serverSignature,
});

Funding (Resizing)

To fund the channel, we perform a "Resize". Since your funds are in your Unified Balance (from the Faucet), we use allocate_amount to move them into the Channel.

Important: Do NOT use resize_amount unless you have deposited funds directly into the L1 Custody Contract.
const resizeMsg = await createResizeChannelMessage(
    sessionSigner,
    {
        channel_id: channelId,
        allocate_amount: 20n, // Moves 20 units from Unified Balance -> Channel
        funds_destination: account.address,
    }
);
ws.send(resizeMsg);

// Submit resize proof to chain
await client.resizeChannel({ resizeState, proofStates });

Closing & Withdrawing

Finally, we cooperatively close the channel. This settles the balance on the L1 Custody Contract, allowing you to withdraw.

// Close Channel
const closeMsg = await createCloseChannelMessage(sessionSigner, channelId, account.address);
ws.send(closeMsg);

// Submit close to chain
await client.closeChannel({ finalState, stateData });

// Withdraw from Custody Contract to Wallet
const withdrawalTx = await client.withdrawal(tokenAddress, withdrawableBalance);
console.log('Funds withdrawn:', withdrawalTx);


Troubleshooting

Here are common issues and solutions:

InsufficientBalance:

Cause: Trying to use resize_amount (L1 funds) without depositing first.
Fix: Use allocate_amount to fund from your Off-chain Unified Balance (Faucet).
DepositAlreadyFulfilled:

Cause: Double-submitting a funding request or channel creation.
Fix: Check if the channel is already open or funded before sending requests.
InvalidState:

Cause: Resizing a closed channel or version mismatch.
Fix: Ensure you are using the latest channel state from the Node.
operation denied: non-zero allocation:

Cause: Too many "stale" channels open.
Fix: Run the cleanup script npx tsx close_all.ts.
Timeout waiting for User to fund Custody:

Cause: Re-running scripts without closing channels accumulates balance requirements.
Fix: Run close_all.ts to reset.
Cleanup Script

If you get stuck, use this script to close all open channels:

npx tsx close_all.ts

Complete Code

index.ts

Click to view full index.ts
close_all.ts

Click to view full close_all.ts

Prerequisites & Environment

In this guide, you will set up a complete development environment for building applications on Yellow Network.

Goal: Have a working local environment ready for Yellow App development.

System Requirements

Requirement	Minimum	Recommended
Node.js	18.x	20.x or later
npm/yarn/pnpm	Latest stable	Latest stable
Operating System	macOS, Linux, Windows	macOS, Linux
Required Knowledge

Before building on Yellow Network, you should be comfortable with:

Topic	Why It Matters
JavaScript/TypeScript	SDK and examples are in TypeScript
Async/await patterns	All network operations are asynchronous
Basic Web3 concepts	Wallets, transactions, signatures
ERC-20 tokens	Fund management involves token operations
NEW TO WEB3?
If you're new to blockchain development, start with the Ethereum Developer Documentation to understand wallets, transactions, and smart contract basics.
Step 1: Install Node.js

macOS (using Homebrew)

# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Node.js
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x


Linux (Ubuntu/Debian)

# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version

Windows

Download and run the installer from nodejs.org.

Step 2: Install Core Dependencies

Create a new project and install the required packages:

# Create project directory
mkdir yellow-app && cd yellow-app

# Initialize project
npm init -y

# Install core dependencies
npm install @erc7824/nitrolite viem

# Install development dependencies
npm install -D typescript @types/node tsx

Package Overview

Package	Purpose
@erc7824/nitrolite	Yellow Network SDK for state channel operations
viem	Modern Ethereum library for wallet and contract interactions
typescript	Type safety and better developer experience
tsx	Run TypeScript files directly
Step 3: Configure TypeScript

Create tsconfig.json:

{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}

Update package.json:

{
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  }
}

Step 4: Set Up Environment Variables

Create .env for sensitive configuration:

# .env - Never commit this file!

# Your wallet private key (for development only)
PRIVATE_KEY=0x...

# RPC endpoints
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
BASE_RPC_URL=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY

# Clearnode WebSocket endpoint
# Production: wss://clearnet.yellow.com/ws
# Sandbox: wss://clearnet-sandbox.yellow.com/ws
CLEARNODE_WS_URL=wss://clearnet-sandbox.yellow.com/ws

Add to .gitignore:

# .gitignore
.env
.env.local
node_modules/
dist/

Install dotenv for loading environment variables:

npm install dotenv

Step 5: Wallet Setup

Development Wallet

For development, create a dedicated wallet:

// scripts/create-wallet.ts
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const privateKey = generatePrivateKey();
const account = privateKeyToAccount(privateKey);

console.log('New Development Wallet');
console.log('----------------------');
console.log('Address:', account.address);
console.log('Private Key:', privateKey);
console.log('\n⚠️  Save this private key securely and add to .env');

Run it:

npx tsx scripts/create-wallet.ts

Get Test Tokens

Yellow Network Sandbox Faucet (Recommended)

For testing on the Yellow Network Sandbox, you can request test tokens directly to your unified balance:

curl -XPOST https://clearnet-sandbox.yellow.com/faucet/requestTokens \
  -H "Content-Type: application/json" \
  -d '{"userAddress":"<your_wallet_address>"}'

Replace <your_wallet_address> with your actual wallet address.

NO ON-CHAIN OPERATIONS NEEDED
Test tokens (ytest.USD) are credited directly to your unified balance on the Sandbox Clearnode. No deposit or channel operations are required—you can start transacting immediately!
Testnet Faucets (For On-Chain Testing)

If you need on-chain test tokens for Sepolia or Base Sepolia:

Network	Faucet
Sepolia	sepoliafaucet.com
Base Sepolia	base.org/faucet
DEVELOPMENT ONLY
Never use your main wallet or real funds for development. Always create a separate development wallet with test tokens.
Step 6: Verify Setup

Create src/index.ts to verify everything works:

import 'dotenv/config';
import { createPublicClient, http } from 'viem';
import { sepolia } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';

async function main() {
  // Verify environment variables
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error('PRIVATE_KEY not set in .env');
  }

  // Create account from private key
  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log('✓ Wallet loaded:', account.address);

  // Create public client
  const client = createPublicClient({
    chain: sepolia,
    transport: http(process.env.SEPOLIA_RPC_URL),
  });

  // Check connection
  const blockNumber = await client.getBlockNumber();
  console.log('✓ Connected to Sepolia, block:', blockNumber);

  // Check balance
  const balance = await client.getBalance({ address: account.address });
  console.log('✓ ETH balance:', balance.toString(), 'wei');

  console.log('\n🎉 Environment setup complete!');
}

main().catch(console.error);

Run the verification:

npm run dev

Expected output:

✓ Wallet loaded: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
✓ Connected to Sepolia, block: 12345678
✓ ETH balance: 100000000000000000 wei

🎉 Environment setup complete!

Project Structure

Recommended folder structure for Yellow Apps:

yellow-app/
├── src/
│   ├── index.ts          # Entry point
│   ├── config.ts         # Configuration
│   ├── client.ts         # Nitrolite client setup
│   ├── auth.ts           # Authentication logic
│   └── channels/
│       ├── create.ts     # Channel creation
│       ├── transfer.ts   # Transfer operations
│       └── close.ts      # Channel closure
├── scripts/
│   └── create-wallet.ts  # Utility scripts
├── .env                  # Environment variables (git-ignored)
├── .gitignore
├── package.json
└── tsconfig.json

Supported Networks

To get the current list of supported chains and contract addresses, query the Clearnode's get_config endpoint:

// Example: Fetch supported chains and contract addresses
const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');

ws.onopen = () => {
  const request = {
    req: [1, 'get_config', {}, Date.now()],
    sig: [] // get_config is a public endpoint, no signature required
  };
  ws.send(JSON.stringify(request));
};

ws.onmessage = (event) => {
  const response = JSON.parse(event.data);
  console.log('Supported chains:', response.res[2].chains);
  console.log('Contract addresses:', response.res[2].contracts);
};

DYNAMIC CONFIGURATION
The get_config method returns real-time information about supported chains, contract addresses, and Clearnode capabilities. This ensures you always have the most up-to-date network information.
Next Steps

Your environment is ready! Continue to:

Key Terms & Mental Models — Understand the core concepts
Quickstart — Build your first Yellow App
State Channels vs L1/L2 — Deep dive into state channels
Common Issues

"Module not found" errors

Ensure you have "type": "module" in package.json and are using ESM imports.

"Cannot find module 'viem'"

Run npm install to ensure all dependencies are installed.

RPC rate limiting

Use a dedicated RPC provider (Infura, Alchemy) instead of public endpoints for production.

TypeScript errors with viem

Ensure your tsconfig.json has "moduleResolution": "bundler" or "node16".

Key Terms & Mental Models

In this guide, you will learn the essential vocabulary and mental models for understanding Yellow Network and state channel technology.

Goal: Build a solid conceptual foundation before diving into implementation.

Core Mental Model: Off-Chain Execution

The fundamental insight behind Yellow Network is simple:

Most interactions don't need immediate on-chain settlement.
Think of it like a bar tab:

Traditional (L1)	State Channels
Pay for each drink separately	Open a tab, pay once at the end
Wait for bartender each time	Instant service, settle later
Transaction per item	One transaction for the whole session
State channels apply this pattern to blockchain: lock funds once, transact off-chain, settle once.

Essential Vocabulary

State Channel

A state channel is a secure pathway for exchanging cryptographically signed states between participants without touching the blockchain.

Key properties:

Funds are locked in a smart contract
Participants exchange signed state updates off-chain
Only opening and closing require on-chain transactions
Either party can force on-chain settlement if needed
Analogy: Like a private Venmo between two parties, backed by a bank escrow.

Channel

A Channel is the on-chain representation of a state channel. It defines:

{
  participants: ['0xAlice', '0xBob'],   // Who can participate
  adjudicator: '0xContract',            // Rules for state validation
  challenge: 86400,                     // Dispute window (seconds)
  nonce: 1699123456789                  // Unique identifier
}

The channelId is computed deterministically from these parameters:

channelId = keccak256(participants, adjudicator, challenge, nonce, chainId)

State

A State is a snapshot of the channel at a specific moment:

{
  intent: 'OPERATE',           // Purpose: INITIALIZE, OPERATE, RESIZE, FINALIZE
  version: 5,                  // Incremental counter (higher = newer)
  data: '0x...',               // Application-specific data
  allocations: [...],          // How funds are distributed
  sigs: ['0xSig1', '0xSig2']   // Participant signatures
}

Key rule: A higher version number always supersedes a lower one, regardless of allocations.

Allocation

An Allocation specifies how funds should be distributed:

{
  destination: '0xAlice',              // Recipient address
  token: '0xUSDC_CONTRACT',            // Token contract
  amount: 50000000n                    // Amount in smallest unit (6 decimals for USDC)
}


The sum of allocations represents the total funds in the channel.

Clearnode

A Clearnode is the off-chain service that:

Manages the Nitro RPC protocol for state channel operations
Provides unified balance aggregated across multiple chains
Coordinates channels between users
Hosts app sessions for multi-party applications
Think of it as: A game server that acts as your entry point to Yellow Network—centralized for speed, but trustless because of on-chain guarantees.

Unified Balance

Your unified balance is the aggregation of funds across all chains where you have deposits:

Polygon: 50 USDC  ┐
Base:    30 USDC  ├─→ Unified Balance: 100 USDC
Arbitrum: 20 USDC ┘

You can:

Transfer from unified balance instantly (off-chain)
Withdraw to any supported chain
Lock funds into app sessions
App Session

An App Session is an off-chain channel built on top of the unified balance for multi-party applications:

{
  protocol: 'NitroRPC/0.4',
  participants: ['0xAlice', '0xBob', '0xJudge'],
  weights: [40, 40, 50],         // Voting power
  quorum: 80,                    // Required weight for state updates
  challenge: 3600,               // Dispute window
  nonce: 1699123456789
}

Use cases: Games, prediction markets, escrow, any multi-party coordination.

Session Key

A session key is a temporary cryptographic key that:

Is generated locally on your device
Has limited permissions and spending caps
Expires after a specified time
Allows gasless signing without wallet prompts
Flow:

Generate session keypair locally
Main wallet authorizes the session key (one-time EIP-712 signature)
All subsequent operations use the session key
Session expires or can be revoked
Protocol Components

Nitrolite

Nitrolite is the on-chain smart contract protocol:

Defines channel data structures
Implements create, close, challenge, resize operations
Provides cryptographic verification
Currently version 0.5.0
Nitro RPC

Nitro RPC is the off-chain communication protocol:

Compact JSON array format for efficiency
Every message is cryptographically signed
Bidirectional real-time communication
Currently version 0.4
Message format:

[requestId, method, params, timestamp]

// Example
[42, "transfer", {"destination": "0x...", "amount": "50.0"}, 1699123456789]

Custody Contract

The Custody Contract is the main on-chain entry point:

Locks and unlocks participant funds
Tracks channel status (VOID → ACTIVE → FINAL)
Validates signatures and state transitions
Handles dispute resolution
Adjudicator

An Adjudicator defines rules for valid state transitions:

Type	Rule
SimpleConsensus	Both participants must sign (default)
Remittance	Only sender must sign
Custom	Application-specific logic
State Lifecycle

Channel States

Channel doesn't exist
create()
Off-chain updates
challenge()
close()
checkpoint()
Timeout
Deleted
VOID
ACTIVE
DISPUTE
FINAL
Status	Meaning
VOID	Channel doesn't exist on-chain
INITIAL	Created, waiting for all participants (legacy)
ACTIVE	Fully operational, off-chain updates happening
DISPUTE	Challenge period active, parties can submit newer states
FINAL	Closed, funds distributed, metadata deleted
State Intents

Intent	When Used	Purpose
INITIALIZE	create()	First state when opening channel
OPERATE	Off-chain updates	Normal operation, redistribution
RESIZE	resize()	Add or remove funds
FINALIZE	close()	Final state for cooperative closure
Security Concepts

Challenge Period

When a dispute arises:

Party A submits their latest state via challenge()
Challenge period starts (typically 24 hours)
Party B can submit a newer valid state via checkpoint()
If no newer state, Party A's state becomes final after timeout
Purpose: Gives honest parties time to respond to incorrect claims.

Signatures

Two contexts for signatures:

Context	Hash Method	Signed By
On-chain	Raw packedState (no prefix)	Main wallet
Off-chain RPC	JSON payload hash	Session key
On-chain packedState:

keccak256(abi.encode(channelId, intent, version, data, allocations))

Quorum

For app sessions, quorum defines the minimum voting weight required for state updates:

Participants: [Alice, Bob, Judge]
Weights:      [40,    40,   50]
Quorum: 80

Valid combinations:
- Alice + Bob = 80 ✓
- Alice + Judge = 90 ✓
- Bob + Judge = 90 ✓
- Alice alone = 40 ✗

Quick Reference Table

Term	One-Line Definition
State Channel	Off-chain execution backed by on-chain funds
Clearnode	Off-chain service coordinating state channels
Unified Balance	Aggregated funds across all chains
App Session	Multi-party application channel
Session Key	Temporary key with limited permissions
Challenge Period	Dispute resolution window
Quorum	Minimum signature weight for approval
Allocation	Fund distribution specification
packedState	Canonical payload for signing
Next Steps

Now that you understand the vocabulary, continue to:

State Channels vs L1/L2 — Deep comparison with other scaling solutions
App Sessions — Multi-party application patterns
Session Keys — Authentication and security
For complete definitions, see the Glossary.

State Channels vs L1/L2

In this guide, you will learn how state channels compare to Layer 1 and Layer 2 solutions, and when each approach is the right choice.

Goal: Understand where state channels fit in the blockchain scaling landscape.

Solution Comparison

Solution	Throughput	Latency	Cost per Op	Best For
Layer 1	15-65K TPS	1-15 sec	$0.001-$50	Settlement, contracts
Layer 2	2,000-4,000 TPS	1-10 sec	$0.01-$0.50	General dApps
State Channels	Unlimited*	< 1 sec	$0	High-frequency, known parties
*Theoretically unlimited—no consensus bottleneck. Real-world throughput depends on signature generation, network latency, and application logic. Benchmarking documentation coming soon.

How State Channels Work

State channels operate on a simple principle:

Lock funds in a smart contract (on-chain)
Exchange signed states directly between participants (off-chain)
Settle when done or if there's a dispute (on-chain)
The key insight: most interactions between parties don't need immediate on-chain settlement.

State Channel Advantages

Instant Finality

Unlike L2 solutions that still have block times, state channels provide sub-second finality:

Solution	Transaction Flow
L1	Transaction → Mempool → Block → Confirmation
L2	Transaction → Sequencer → L2 Block → L1 Data
Channels	Signature → Validation → Done
Zero Operational Cost

Operation	L1 Cost	L2 Cost	State Channel
100 transfers	$500-5000	$10-50	$0
1000 transfers	$5000-50000	$100-500	$0
Privacy

Off-chain transactions are only visible to participants. Only opening and final states appear on-chain.

State Channel Limitations

Known Participants

Channels work between specific participants. Yellow Network addresses this through Clearnodes—off-chain service providers that coordinate channels and provide a unified balance across multiple users and chains.

Liquidity Requirements

Funds must be locked upfront. You can't spend more than what's locked in the channel.

Liveness Requirements

Participants must respond to challenges within the challenge period. Users should ensure they can monitor for challenges or use services that provide this functionality.

When to Use Each

Choose	When
L1	Deploying contracts, one-time large transfers, final settlement
L2	General dApps, many unknown users, complex smart contracts
State Channels	Known parties, real-time speed, high frequency, zero gas needed
Decision Framework

No
Yes
Yes
No
Yes
No
Transaction
Known counterparty?
Use L1/L2
High frequency?
Use State Channel
Large value?
How Yellow Network Addresses Limitations

Limitation	Solution
Known participants	Clearnode coordination layer
Liquidity	Unified balance across chains
Liveness	Always-on Clearnode monitoring
Key Takeaways

State channels shine when you have identified participants who will interact frequently—like players in a game, counterparties in a trade, or parties in a payment relationship.

STATE CHANNEL SWEET SPOT
Real-time interactions between known parties
High transaction volumes
Zero gas costs required
Instant finality needed
Deep Dive

For technical details on channel implementation:

Architecture — System design and fund flows
Channel Lifecycle — State machine and operations
Data Structures — Channel and state formats

App Sessions

App sessions are off-chain channels built on top of the unified balance that enable multi-party applications with custom governance rules.

Goal: Understand how app sessions work for building multi-party applications.

What is an App Session?

An app session is a temporary shared account where multiple participants can:

Lock funds from their unified balance
Execute application-specific logic (games, escrow, predictions)
Redistribute funds based on outcomes
Close and release funds back to unified balances
Think of it as a programmable escrow with custom voting rules.

App Session vs Payment Channel

Feature	Payment Channel	App Session
Participants	Always 2	2 or more
Governance	Both must sign	Quorum-based
Fund source	On-chain deposit	Unified balance
Mid-session changes	Via resize (on-chain)	Via intent (off-chain)
Use case	Transfers	Applications
App Session Definition

Every app session starts with a definition that specifies the rules:

Field	Description
protocol	Version (NitroRPC/0.4 recommended)
participants	Wallet addresses (order matters for signatures)
weights	Voting power per participant
quorum	Minimum weight required for state updates
challenge	Dispute window in seconds
nonce	Unique identifier (typically timestamp)
The app_session_id is computed deterministically from the definition using keccak256(JSON.stringify(definition)).

Governance with Quorum

The quorum system enables flexible governance patterns.

How It Works

Each participant has a weight (voting power)
State updates require signatures with total weight ≥ quorum
Not everyone needs to sign—just enough to meet quorum
Common Patterns

Pattern	Setup	Use Case
Unanimous	weights: [50, 50], quorum: 100	Both must agree
Trusted Judge	weights: [0, 0, 100], quorum: 100	App determines outcome
2-of-3 Escrow	weights: [40, 40, 50], quorum: 80	Any two can proceed
Weighted DAO	weights: [20, 25, 30, 25], quorum: 51	Majority by stake
Session Lifecycle

create_app_session
submit_app_state
close_app_session
Open
Closed
1. Creation

Funds locked from participants' unified balances
All participants with non-zero allocations must sign
Status becomes open, version starts at 1
2. State Updates

Redistribute funds with submit_app_state
Version must increment by exactly 1
Quorum of signatures required
3. Closure

Final allocations distributed to unified balances
Session becomes closed (cannot reopen)
Quorum of signatures required
Intent System (NitroRPC/0.4)

The intent system enables dynamic fund management during active sessions:

Intent	Purpose	Rule
OPERATE	Redistribute existing funds	Sum unchanged
DEPOSIT	Add funds from unified balance	Sum increases
WITHDRAW	Remove funds to unified balance	Sum decreases
ALLOCATIONS ARE FINAL STATE
Allocations always represent the final state, not the delta. The Clearnode computes deltas internally.
Fund Flow

App Session
Unified Balances
create (lock)
create (lock)
close (release)
close (release)
Alice: 200 USDC
Bob: 200 USDC
Alice: 100 USDC
Bob: 100 USDC
Protocol Versions

Version	Status	Key Features
NitroRPC/0.2	Legacy	Basic state updates only
NitroRPC/0.4	Current	Intent system (OPERATE, DEPOSIT, WITHDRAW)
Always use NitroRPC/0.4 for new applications. Protocol version is set at creation and cannot be changed.

Best Practices

Set appropriate challenge periods: 1 hour minimum, 24 hours recommended
Include commission participants: Apps often have a judge that takes a small fee
Plan for disputes: Design allocations that can be verified by third parties
Version carefully: Each state update must be exactly current + 1
Deep Dive

For complete method specifications and implementation details:

App Session Methods — Complete method specifications
Communication Flows — Sequence diagrams
Implementation Checklist — Building app session support

Session Keys

Session keys are delegated keys that enable applications to perform operations on behalf of a user's wallet with specified spending limits, permissions, and expiration times. They provide a secure way to grant limited access to applications without exposing the main wallet's private key.

IMPORTANT
Session keys are no longer used as on-chain channel participant addresses for new channels created after the v0.5.0 release. For all new channels, the wallet address is used directly as the participant address. However, session keys still function correctly for channels that were created before v0.5.0, ensuring backward compatibility.
Goal: Understand how session keys enable seamless UX while maintaining security.

Why Session Keys Matter

Every blockchain operation traditionally requires a wallet signature popup. For high-frequency applications like games or trading, this creates terrible UX—imagine 40+ wallet prompts during a chess game.

Session keys solve this by allowing you to sign once, then operate seamlessly for the duration of the session.

Core Concepts

General Rules

IMPORTANT
When authenticating with an already registered session key, you must still provide all parameters in the auth_request. However, the configuration values (application, allowances, scope, and expires_at) from the request will be ignored, as the system uses the settings from the initial registration. You may provide arbitrary values for these fields, as they are required by the request format but will not be used.
Applications

Each session key is associated with a specific application name, which identifies the application or service that will use the session key. The application name is also used to identify app sessions that are created using that session key.

This association serves several purposes:

Application Isolation: Different applications get separate session keys, preventing one application from using another's delegated access
Access Control: Operations performed with a session key are validated against the application specified during registration
Single Active Key: Only one session key can be active per wallet+application combination. Registering a new session key for the same application automatically invalidates any existing session key for that application
IMPORTANT
Only one session key is allowed per wallet+application combination. If you register a new session key for the same application, the old one is automatically invalidated and removed from the database.
Special Application: "clearnode"

Session keys registered with the application name "clearnode" receive special treatment:

Root Access: These session keys bypass spending allowance validation and application restrictions
Full Permissions: They can perform any operation the wallet itself could perform
Backward Compatibility: This special behavior facilitates migration from older versions
Expiration Still Applies: Even with root access, the session key expires according to its expires_at timestamp
NOTE
The "clearnode" application name is primarily for backward compatibility and will be deprecated after a migration period for developers.
Expiration

All session keys must have an expiration timestamp (expires_at) that defines when the session key becomes invalid:

Future Timestamp Required: The expiration time must be set to a future date when registering a session key
Automatic Invalidation: Once the expiration time passes, the session key can no longer be used for any operations
No Re-registration: It is not possible to re-register an expired session key. You must create a new session key instead
Applies to All Keys: Even "clearnode" application session keys must respect the expiration timestamp
Allowances

Allowances define spending limits for session keys, specifying which assets the session key can spend and how much:

{
  "allowances": [
    {
      "asset": "usdc",
      "amount": "100.0"
    },
    {
      "asset": "eth",
      "amount": "0.5"
    }
  ]
}

Allowance Validation

Supported Assets Only: All assets specified in allowances must be supported by the system. Unsupported assets cause authentication to fail
Usage Tracking: The system tracks spending per session key by recording which session key was used for each ledger debit operation
Spending Limits: Once a session key reaches its spending cap for an asset, further operations requiring that asset are rejected with: "operation denied: insufficient session key allowance: X required, Y available"
Empty Allowances: Providing an empty allowances array ([]) means zero spending allowed for all assets—any operation attempting to spend funds will be rejected
Allowances for "clearnode" Application

Session keys with application: "clearnode" are exempt from allowance enforcement:

No Spending Limits: Allowance checks are bypassed entirely
Full Financial Access: These keys can spend any amount of any supported asset
Expiration Still Matters: Even without allowance restrictions, the session key still expires according to its expires_at timestamp
Session Key Lifecycle

auth_verify success
Using session key
expires_at reached
Allowance depleted
Manual revocation
Re-authenticate
Re-authenticate
Re-authenticate
Unauthenticated
Authenticated
Expired
Exhausted
Revoked
Security Model

Approach	Risk if Compromised	UX Impact
Main wallet always	Full wallet access	Constant prompts
Session key (limited)	Only allowance at risk	Seamless
Session key (unlimited)	Unified balance at risk	Seamless but risky
SESSION KEY COMPROMISE
If a session key is compromised, attackers can only spend up to the configured allowance before expiration. This is why setting appropriate limits is critical.
Best Practices

For Users

Set reasonable allowances: Don't authorize more than you'll use
Use short expirations: 24 hours is usually sufficient
Different keys for different apps: Isolate risk per application
Monitor spending: Use get_session_keys to check usage
Revoke when done: Clean up unused sessions
For Developers

Secure storage: Encrypt session keys at rest
Never transmit private keys: Session key stays on device
Handle expiration gracefully: Prompt re-authentication before expiry
Verify Clearnode signatures: Always validate response signatures
Clear on logout: Delete session keys when user logs out
Alternative: Main Wallet as Root Signer

You can skip session keys entirely and sign every request with your main wallet. Use this approach for:

Single operations
High-value transactions
Maximum security required
Non-interactive applications
Next Steps

Managing Session Keys — Create, list, and revoke session keys with full API examples
Authentication Flow — Full 3-step authentication protocol
Communication Flows — Sequence diagrams for auth

Challenge-Response & Disputes

In this guide, you will learn how Yellow Network resolves disputes and ensures your funds are always recoverable.

Goal: Understand the security guarantees that make off-chain transactions safe.

Why Challenge-Response Matters

In any off-chain system, a critical question arises: What if someone tries to cheat?

State channels solve this with a challenge-response mechanism:

Anyone can submit a state to the blockchain
Counterparties have time to respond with a newer state
The newest valid state always wins
Funds are distributed according to that state
The Trust Model

State channels are trustless because:

Guarantee	How It's Achieved
Fund custody	Smart contract holds funds, not Clearnode
State validity	Only signed states are accepted
Dispute resolution	On-chain fallback if disagreement
Recovery	You can always get your funds back
Channel Dispute Flow

Scenario: Clearnode Becomes Unresponsive

You have a channel with 100 USDC. The Clearnode stops responding.

Your options:

Wait for Clearnode to recover
Force settlement on-chain via challenge
The Process

Initiate Challenge: Submit your latest signed state to the blockchain
Challenge Period: Contract sets a timer (e.g., 24 hours)
Response Window: Counterparty can submit a newer state
Resolution: After timeout, challenged state becomes final
challenge()
checkpoint() with newer state
Timeout expires
ACTIVE
DISPUTE
FINAL
Anyone can submit
newer valid state
Why This Works

States Are Ordered

Every state has a version number. A newer (higher version) state always supersedes older states.

States Are Signed

With the default SimpleConsensus adjudicator, both parties must sign every state. If someone signed a state, they can't later claim they didn't agree.

OTHER ADJUDICATORS
Different adjudicators may have different signing requirements. For example, a Remittance adjudicator may only require the sender's signature. The signing rules are defined by the channel's adjudicator contract.
Challenge Period Provides Fairness

The waiting window ensures honest parties have time to respond. Network delays don't cause losses.

On-Chain Contract is Neutral

The smart contract accepts any valid signed state, picks the highest version, and distributes funds exactly as specified.

Challenge Period Selection

Duration	Trade-offs
1 hour	Fast resolution, tight response window
24 hours	Balanced (recommended)
7 days	Maximum safety, slow settlement
The Custody Contract enforces a minimum of 1 hour.

Checkpoint vs Challenge

Operation	Purpose	Channel Status
checkpoint()	Record state without dispute	Stays ACTIVE
challenge()	Force dispute resolution	Changes to DISPUTE
Use checkpoint for safety snapshots. Use challenge when you need to force settlement.

What Happens If...

Scenario	Outcome
Clearnode goes offline	Challenge with latest state, withdraw after timeout
You lose state history	Challenge with old state; counterparty submits newer if they have it
Counterparty submits wrong state	Submit your newer state via checkpoint
Block reorg occurs	Replay events from last confirmed block
Key Takeaways

Concept	Remember
Challenge	Force on-chain dispute resolution
Response	Submit newer state to defeat challenge
Timeout	After period, challenged state becomes final
Checkpoint	Record state without dispute
SECURITY GUARANTEE
You can always recover your funds according to the latest mutually signed state, regardless of counterparty behavior.
Deep Dive

For technical implementation details:

Channel Lifecycle — Full state machine
Security Considerations — Threat model and best practices
Communication Flows — Sequence diagrams

Message Envelope (RPC Protocol)

In this guide, you will learn the essentials of how messages are structured and transmitted in Yellow Network.

Goal: Understand the Nitro RPC protocol at a conceptual level.

Protocol Overview

Nitro RPC is a lightweight RPC protocol optimized for state channel communication:

Feature	Benefit
Compact format	~30% smaller than traditional JSON-RPC
Signature-based auth	Every message is cryptographically verified
Bidirectional	Real-time updates via WebSocket
Ordered timestamps	Replay attack prevention
Message Structure

Every Nitro RPC message uses a compact JSON array format:

Component	Type	Description
requestId	uint64	Unique identifier for correlation
method	string	RPC method name (snake_case)
params/result	object	Method-specific data
timestamp	uint64	Unix milliseconds
Request Wrapper

{ "req": [requestId, method, params, timestamp], "sig": [...] }

Response Wrapper

{ "res": [requestId, method, result, timestamp], "sig": [...] }

Error Response

{ "res": [requestId, "error", { "error": "description" }, timestamp], "sig": [...] }

Signature Format

Each signature is a 65-byte ECDSA signature (r + s + v) represented as a 0x-prefixed hex string.

Context	What's Signed	Who Signs
Requests	JSON payload hash	Session key (or main wallet)
Responses	JSON payload hash	Clearnode
Method Categories

Category	Methods
Auth	auth_request, auth_verify
Channels	create_channel, close_channel, resize_channel
Transfers	transfer
App Sessions	create_app_session, submit_app_state, close_app_session
Queries	get_ledger_balances, get_channels, get_app_sessions, etc.
Notifications

The Clearnode pushes real-time updates:

Notification	When Sent
bu (balance update)	Balance changed
cu (channel update)	Channel status changed
tr (transfer)	Incoming/outgoing transfer
asu (app session update)	App session state changed
Communication Flow

Clearnode
Client
Clearnode
Client
Request (signed)
Verify signature
Process
Response (signed)
Verify signature
Notification (async)
Protocol Versions

Version	Status	Key Features
NitroRPC/0.2	Legacy	Basic state updates
NitroRPC/0.4	Current	Intent system, enhanced validation
Always use NitroRPC/0.4 for new implementations.

Key Points

Compact arrays instead of verbose JSON objects
Every message signed for authenticity
Timestamps prevent replay attacks
Bidirectional WebSocket for real-time updates
Deep Dive

For complete technical specifications:

Message Format — Full format specification
Off-Chain Overview — Protocol architecture
Implementation Checklist — Building RPC support
Edit this page


Managing Session Keys

This guide covers the operational details of creating, listing, and revoking session keys via the Clearnode API.

PREREQUISITES
Before diving into session key management, make sure you understand the core concepts: what session keys are, how applications and allowances work, and the expiration rules. See Session Keys for the conceptual foundation.
How to Manage Session Keys

Clearnode

Create and Configure

To create a session key, use the auth_request method during authentication. This registers the session key with its configuration:

Request:

{
  "req": [
    1,
    "auth_request",
    {
      "address": "0x1234567890abcdef...",
      "session_key": "0x9876543210fedcba...",
      "application": "Chess Game",
      "allowances": [
        {
          "asset": "usdc",
          "amount": "100.0"
        },
        {
          "asset": "eth",
          "amount": "0.5"
        }
      ],
      "scope": "app.create",
      "expires_at": 1762417328
    },
    1619123456789
  ],
  "sig": ["0x5432abcdef..."]
}

Parameters:

address (required): The wallet address that owns this session key
session_key (required): The address of the session key to register
application (optional): Name of the application using this session key (defaults to "clearnode" if not provided)
allowances (optional): Array of asset allowances specifying spending limits
scope (optional): Permission scope (e.g., "app.create", "ledger.readonly"). Note: This feature is not yet implemented
expires_at (required): Unix timestamp (in seconds) when this session key expires
NOTE
When authenticating with an already registered session key, you must still fill in all fields in the request, at least with arbitrary values. This is required by the request itself, however, the values will be ignored as the system uses the session key configuration stored during initial registration. This behavior will be improved in future versions.
List Active Session Keys

Use the get_session_keys method to retrieve all active (non-expired) session keys for the authenticated user:

Request:

{
  "req": [1, "get_session_keys", {}, 1619123456789],
  "sig": ["0x9876fedcba..."]
}

Response:

{
  "res": [
    1,
    "get_session_keys",
    {
      "session_keys": [
        {
          "id": 1,
          "session_key": "0xabcdef1234567890...",
          "application": "Chess Game",
          "allowances": [
            {
              "asset": "usdc",
              "allowance": "100.0",
              "used": "45.0"
            },
            {
              "asset": "eth",
              "allowance": "0.5",
              "used": "0.0"
            }
          ],
          "scope": "app.create",
          "expires_at": "2024-12-31T23:59:59Z",
          "created_at": "2024-01-01T00:00:00Z"
        }
      ]
    },
    1619123456789
  ],
  "sig": ["0xabcd1234..."]
}

Response Fields:

id: Unique identifier for the session key record
session_key: The address of the session key
application: Application name this session key is authorized for
allowances: Array of allowances with usage tracking:
asset: Symbol of the asset (e.g., "usdc", "eth")
allowance: Maximum amount the session key can spend
used: Amount already spent by this session key
scope: Permission scope (omitted if empty)
expires_at: When this session key expires (ISO 8601 format)
created_at: When the session key was created (ISO 8601 format)
Revoke a Session Key

To immediately invalidate a session key, use the revoke_session_key method:

Request:

{
  "req": [
    1,
    "revoke_session_key",
    {
      "session_key": "0xabcdef1234567890..."
    },
    1619123456789
  ],
  "sig": ["0x9876fedcba..."]
}

Response:

{
  "res": [
    1,
    "revoke_session_key",
    {
      "session_key": "0xabcdef1234567890..."
    },
    1619123456789
  ],
  "sig": ["0xabcd1234..."]
}

Permission Rules:

A wallet can revoke any of its session keys
A session key can revoke itself
A session key with application: "clearnode" can revoke other session keys belonging to the same wallet
A non-"clearnode" session key cannot revoke other session keys (only itself)
Important Notes:

Revocation is immediate and cannot be undone
After revocation, any operations attempted with the revoked session key will fail with a validation error
The revoked session key will no longer appear in the get_session_keys response
Revocation is useful for security purposes when a session key may have been compromised
Error Cases:

Session key does not exist, belongs to another wallet, or is expired: "operation denied: provided address is not an active session key of this user"
Non-"clearnode" session key attempting to revoke another session key: "operation denied: insufficient permissions for the active session key"
Nitrolite SDK

The Nitrolite SDK provides a higher-level abstraction for managing session keys. For detailed information on using session keys with the Nitrolite SDK, please refer to the SDK documentation.
Edit this page


BUILD:
Quick Start Guide

Build your first Yellow App in 5 minutes! This guide walks you through creating a simple payment application using state channels.

What You'll Build

A basic payment app where users can:

Deposit funds into a state channel
Send instant payments to another user
Withdraw remaining funds
No blockchain knowledge required - we'll handle the complexity for you!

Prerequisites

Node.js 16+ installed on your computer
A wallet (MetaMask recommended)
Basic JavaScript/TypeScript knowledge
Step 1: Installation

Create a new project and install the Yellow SDK:

npm
yarn
pnpm
mkdir my-yellow-app
cd my-yellow-app
npm init -y
npm install @erc7824/nitrolite


Step 2: Connect to ClearNode

Create a file app.js and connect to the Yellow Network.

CLEARNODE ENDPOINTS
Production: wss://clearnet.yellow.com/ws
Sandbox: wss://clearnet-sandbox.yellow.com/ws (recommended for testing)
app.js
import { createAppSessionMessage, parseRPCResponse } from '@erc7824/nitrolite';

// Connect to Yellow Network (using sandbox for testing)
const ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');

ws.onopen = () => {
  console.log('✅ Connected to Yellow Network!');
};

ws.onmessage = (event) => {
  const message = parseRPCResponse(event.data);
  console.log('📨 Received:', message);
};

ws.onerror = (error) => {
  console.error('Connection error:', error);
};

console.log('Connecting to Yellow Network...');


Step 3: Create Application Session

Set up your wallet for signing messages:

// Set up message signer for your wallet
async function setupMessageSigner() {
  if (!window.ethereum) {
    throw new Error('Please install MetaMask');
  }

  // Request wallet connection
  const accounts = await window.ethereum.request({
    method: 'eth_requestAccounts'
  });
  
  const userAddress = accounts[0];
  
  // Create message signer function
  const messageSigner = async (message) => {
    return await window.ethereum.request({
      method: 'personal_sign',
      params: [message, userAddress]
    });
  };

  console.log('✅ Wallet connected:', userAddress);
  return { userAddress, messageSigner };
}


Step 4: Create Application Session

Create a session for your payment app:

async function createPaymentSession(messageSigner, userAddress, partnerAddress) {
  // Define your payment application
  const appDefinition = {
    protocol: 'payment-app-v1',
    participants: [userAddress, partnerAddress],
    weights: [50, 50], // Equal participation
    quorum: 100, // Both participants must agree
    challenge: 0,
    nonce: Date.now()
  };

  // Initial balances (1 USDC = 1,000,000 units with 6 decimals)
  const allocations = [
    { participant: userAddress, asset: 'usdc', amount: '800000' }, // 0.8 USDC
    { participant: partnerAddress, asset: 'usdc', amount: '200000' } // 0.2 USDC
  ];

  // Create signed session message
  const sessionMessage = await createAppSessionMessage(
    messageSigner,
    [{ definition: appDefinition, allocations }]
  );

  // Send to ClearNode
  ws.send(sessionMessage);
  console.log('✅ Payment session created!');
  
  return { appDefinition, allocations };
}


Step 5: Send Instant Payments

async function sendPayment(ws, messageSigner, amount, recipient) {
  // Create payment message
  const paymentData = {
    type: 'payment',
    amount: amount.toString(),
    recipient,
    timestamp: Date.now()
  };

  // Sign the payment
  const signature = await messageSigner(JSON.stringify(paymentData));
  
  const signedPayment = {
    ...paymentData,
    signature,
    sender: await getCurrentUserAddress()
  };

  // Send instantly through ClearNode
  ws.send(JSON.stringify(signedPayment));
  console.log('💸 Payment sent instantly!');
}

// Usage
await sendPayment(ws, messageSigner, 100000n, partnerAddress); // Send 0.1 USDC


Step 6: Handle Incoming Messages

// Enhanced message handling
ws.onmessage = (event) => {
  const message = parseRPCResponse(event.data);
  
  switch (message.type) {
    case 'session_created':
      console.log('✅ Session confirmed:', message.sessionId);
      break;
      
    case 'payment':
      console.log('💰 Payment received:', message.amount);
      // Update your app's UI
      updateBalance(message.amount, message.sender);
      break;
      
    case 'session_message':
      console.log('📨 App message:', message.data);
      handleAppMessage(message);
      break;
      
    case 'error':
      console.error('❌ Error:', message.error);
      break;
  }
};

function updateBalance(amount, sender) {
  console.log(`Received ${amount} from ${sender}`);
  // Update your application state
}


Complete Example

Here's a complete working example you can copy and run:

SimplePaymentApp.js
import { createAppSessionMessage, parseRPCResponse } from '@erc7824/nitrolite';

class SimplePaymentApp {
  constructor() {
    this.ws = null;
    this.messageSigner = null;
    this.userAddress = null;
    this.sessionId = null;
  }

  async init() {
    // Step 1: Set up wallet
    const { userAddress, messageSigner } = await this.setupWallet();
    this.userAddress = userAddress;
    this.messageSigner = messageSigner;
    
    // Step 2: Connect to ClearNode (sandbox for testing)
    this.ws = new WebSocket('wss://clearnet-sandbox.yellow.com/ws');
    
    this.ws.onopen = () => {
      console.log('🟢 Connected to Yellow Network!');
    };
    
    this.ws.onmessage = (event) => {
      this.handleMessage(parseRPCResponse(event.data));
    };
    
    return userAddress;
  }

  async setupWallet() {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts'
    });
    
    const userAddress = accounts[0];
    const messageSigner = async (message) => {
      return await window.ethereum.request({
        method: 'personal_sign',
        params: [message, userAddress]
      });
    };

    return { userAddress, messageSigner };
  }

  async createSession(partnerAddress) {
    const appDefinition = {
      protocol: 'payment-app-v1',
      participants: [this.userAddress, partnerAddress],
      weights: [50, 50],
      quorum: 100,
      challenge: 0,
      nonce: Date.now()
    };

    const allocations = [
      { participant: this.userAddress, asset: 'usdc', amount: '800000' },
      { participant: partnerAddress, asset: 'usdc', amount: '200000' }
    ];

    const sessionMessage = await createAppSessionMessage(
      this.messageSigner,
      [{ definition: appDefinition, allocations }]
    );

    this.ws.send(sessionMessage);
    console.log('✅ Payment session created!');
  }

  async sendPayment(amount, recipient) {
    const paymentData = {
      type: 'payment',
      amount: amount.toString(),
      recipient,
      timestamp: Date.now()
    };

    const signature = await this.messageSigner(JSON.stringify(paymentData));
    
    this.ws.send(JSON.stringify({
      ...paymentData,
      signature,
      sender: this.userAddress
    }));
    
    console.log(`💸 Sent ${amount} instantly!`);
  }

  handleMessage(message) {
    switch (message.type) {
      case 'session_created':
        this.sessionId = message.sessionId;
        console.log('✅ Session ready:', this.sessionId);
        break;
      case 'payment':
        console.log('💰 Payment received:', message.amount);
        break;
    }
  }
}

// Usage
const app = new SimplePaymentApp();
await app.init();
await app.createSession('0xPartnerAddress');
await app.sendPayment('100000', '0xPartnerAddress'); // Send 0.1 USDC


What's Next?

Congratulations! You've built your first Yellow App. Here's what to explore next:

Advanced Topics: Learn about architecture, multi-party applications, and production deployment
API Reference: Explore all available SDK methods and options
Need Help?

Documentation: Continue reading the guides for in-depth explanations
Community: Join our developer community for support
Examples: Check out our GitHub repository for sample applications
You're now ready to build fast, scalable apps with Yellow SDK!
