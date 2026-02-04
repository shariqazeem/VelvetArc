/**
 * Real On-Chain Events API
 * Fetches actual blockchain events from Arc vault and Base hook
 */

import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";
import { baseSepolia } from "viem/chains";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Chain definitions
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 6, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
} as const;

// Contract addresses
const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB") as `0x${string}`;
const HOOK_ADDRESS = (process.env.NEXT_PUBLIC_HOOK_ADDRESS_BASE || "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2") as `0x${string}`;

// Create public clients
const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

const baseClient = createPublicClient({
  chain: baseSepolia,
  transport: http(),
});

// Event ABIs
const VAULT_EVENTS = {
  Deposited: parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 shares)"),
  Withdrawn: parseAbiItem("event Withdrawn(address indexed user, uint256 amount, uint256 shares)"),
  StateChanged: parseAbiItem("event StateChanged(uint8 oldState, uint8 newState)"),
  CircuitBreakerTriggered: parseAbiItem("event CircuitBreakerTriggered(address indexed triggeredBy, string reason)"),
};

const HOOK_EVENTS = {
  FeeUpdated: parseAbiItem("event FeeUpdated(uint24 indexed oldFee, uint24 indexed newFee, string reason)"),
  VolatilityUpdated: parseAbiItem("event VolatilityUpdated(uint8 oldLevel, uint8 newLevel)"),
  LiquidityDeposited: parseAbiItem("event LiquidityDeposited(address indexed from, uint256 amount)"),
};

// Event types
interface OnChainEvent {
  id: string;
  type: "DEPOSIT" | "WITHDRAW" | "FEE_UPDATE" | "VOLATILITY_CHANGE" | "CIRCUIT_BREAKER" | "LIQUIDITY";
  chain: "arc" | "base";
  timestamp: number;
  blockNumber: bigint;
  txHash: string;
  data: Record<string, unknown>;
}

// Cache for events (persists across requests in serverless)
let eventCache: OnChainEvent[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 30000; // 30 seconds

async function fetchVaultEvents(): Promise<OnChainEvent[]> {
  const events: OnChainEvent[] = [];

  try {
    // Fetch last 1000 blocks of events
    const currentBlock = await arcClient.getBlockNumber();
    const fromBlock = currentBlock > BigInt(1000) ? currentBlock - BigInt(1000) : BigInt(0);

    // Deposit events
    const deposits = await arcClient.getLogs({
      address: VAULT_ADDRESS,
      event: VAULT_EVENTS.Deposited,
      fromBlock,
      toBlock: "latest",
    });

    for (const log of deposits) {
      const block = await arcClient.getBlock({ blockNumber: log.blockNumber });
      events.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: "DEPOSIT",
        chain: "arc",
        timestamp: Number(block.timestamp) * 1000,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        data: {
          user: log.args.user,
          amount: formatUnits(log.args.amount || BigInt(0), 6),
          shares: formatUnits(log.args.shares || BigInt(0), 6),
        },
      });
    }

    // Withdraw events
    const withdrawals = await arcClient.getLogs({
      address: VAULT_ADDRESS,
      event: VAULT_EVENTS.Withdrawn,
      fromBlock,
      toBlock: "latest",
    });

    for (const log of withdrawals) {
      const block = await arcClient.getBlock({ blockNumber: log.blockNumber });
      events.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: "WITHDRAW",
        chain: "arc",
        timestamp: Number(block.timestamp) * 1000,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        data: {
          user: log.args.user,
          amount: formatUnits(log.args.amount || BigInt(0), 6),
          shares: formatUnits(log.args.shares || BigInt(0), 6),
        },
      });
    }

    // Circuit breaker events
    const circuitBreakers = await arcClient.getLogs({
      address: VAULT_ADDRESS,
      event: VAULT_EVENTS.CircuitBreakerTriggered,
      fromBlock,
      toBlock: "latest",
    });

    for (const log of circuitBreakers) {
      const block = await arcClient.getBlock({ blockNumber: log.blockNumber });
      events.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: "CIRCUIT_BREAKER",
        chain: "arc",
        timestamp: Number(block.timestamp) * 1000,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        data: {
          triggeredBy: log.args.triggeredBy,
          reason: log.args.reason,
        },
      });
    }
  } catch (e) {
    console.error("Error fetching vault events:", e);
  }

  return events;
}

async function fetchHookEvents(): Promise<OnChainEvent[]> {
  const events: OnChainEvent[] = [];

  try {
    const currentBlock = await baseClient.getBlockNumber();
    const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0);

    // Fee update events
    const feeUpdates = await baseClient.getLogs({
      address: HOOK_ADDRESS,
      event: HOOK_EVENTS.FeeUpdated,
      fromBlock,
      toBlock: "latest",
    });

    for (const log of feeUpdates) {
      const block = await baseClient.getBlock({ blockNumber: log.blockNumber });
      events.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: "FEE_UPDATE",
        chain: "base",
        timestamp: Number(block.timestamp) * 1000,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        data: {
          oldFee: Number(log.args.oldFee) / 100,
          newFee: Number(log.args.newFee) / 100,
          reason: log.args.reason,
        },
      });
    }

    // Liquidity events
    const liquidityDeposits = await baseClient.getLogs({
      address: HOOK_ADDRESS,
      event: HOOK_EVENTS.LiquidityDeposited,
      fromBlock,
      toBlock: "latest",
    });

    for (const log of liquidityDeposits) {
      const block = await baseClient.getBlock({ blockNumber: log.blockNumber });
      events.push({
        id: `${log.transactionHash}-${log.logIndex}`,
        type: "LIQUIDITY",
        chain: "base",
        timestamp: Number(block.timestamp) * 1000,
        blockNumber: log.blockNumber,
        txHash: log.transactionHash,
        data: {
          from: log.args.from,
          amount: formatUnits(log.args.amount || BigInt(0), 6),
        },
      });
    }
  } catch (e) {
    console.error("Error fetching hook events:", e);
  }

  return events;
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached if fresh
    if (eventCache.length > 0 && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        events: eventCache,
        cached: true,
        lastUpdate: lastFetchTime,
      });
    }

    // Fetch fresh events from both chains
    const [vaultEvents, hookEvents] = await Promise.all([
      fetchVaultEvents(),
      fetchHookEvents(),
    ]);

    // Combine and sort by timestamp (newest first)
    eventCache = [...vaultEvents, ...hookEvents].sort((a, b) => b.timestamp - a.timestamp);
    lastFetchTime = now;

    return NextResponse.json({
      success: true,
      events: eventCache,
      cached: false,
      lastUpdate: now,
      counts: {
        deposits: vaultEvents.filter(e => e.type === "DEPOSIT").length,
        withdrawals: vaultEvents.filter(e => e.type === "WITHDRAW").length,
        feeUpdates: hookEvents.filter(e => e.type === "FEE_UPDATE").length,
        total: eventCache.length,
      },
    });
  } catch (e) {
    console.error("Events API error:", e);
    return NextResponse.json({
      success: false,
      error: (e as Error).message,
      events: eventCache, // Return cached on error
    }, { status: 500 });
  }
}
