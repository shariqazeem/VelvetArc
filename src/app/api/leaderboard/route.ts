/**
 * Real Depositor Leaderboard API
 * Reads actual deposit events and calculates leaderboard from on-chain data
 */

import { NextResponse } from "next/server";
import { createPublicClient, http, parseAbiItem, formatUnits } from "viem";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Chain definition
const arcTestnet = {
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: { decimals: 6, name: "USDC", symbol: "USDC" },
  rpcUrls: { default: { http: ["https://rpc.testnet.arc.network"] } },
} as const;

const VAULT_ADDRESS = (process.env.NEXT_PUBLIC_VAULT_ADDRESS_ARC || "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB") as `0x${string}`;

const arcClient = createPublicClient({
  chain: arcTestnet,
  transport: http("https://rpc.testnet.arc.network"),
});

// ABI for reading user positions
const VAULT_ABI = [
  {
    inputs: [{ type: "address", name: "user" }],
    name: "getUserPosition",
    outputs: [
      { type: "uint256", name: "depositedAmount" },
      { type: "uint256", name: "shareBalance" },
      { type: "uint256", name: "currentValue" },
      { type: "uint256", name: "lastDeposit" },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

const DEPOSIT_EVENT = parseAbiItem("event Deposited(address indexed user, uint256 amount, uint256 shares)");

interface Depositor {
  address: string;
  totalDeposited: number;
  shares: number;
  currentValue: number;
  depositCount: number;
  firstDeposit: number;
  lastDeposit: number;
  rank: number;
}

// Cache
let leaderboardCache: Depositor[] = [];
let lastFetchTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function buildLeaderboard(): Promise<Depositor[]> {
  try {
    // Get deposit events - Arc RPC limits to 10k blocks, use 5k to be safe
    const currentBlock = await arcClient.getBlockNumber();
    const fromBlock = currentBlock > BigInt(5000) ? currentBlock - BigInt(5000) : BigInt(0);

    const depositLogs = await arcClient.getLogs({
      address: VAULT_ADDRESS,
      event: DEPOSIT_EVENT,
      fromBlock,
      toBlock: "latest",
    });

    // Track unique depositors and their activity
    const depositorMap = new Map<string, {
      totalDeposited: number;
      depositCount: number;
      firstDeposit: number;
      lastDeposit: number;
    }>();

    for (const log of depositLogs) {
      const user = log.args.user?.toLowerCase();
      if (!user) continue;

      const amount = parseFloat(formatUnits(log.args.amount || BigInt(0), 6));
      const block = await arcClient.getBlock({ blockNumber: log.blockNumber });
      const timestamp = Number(block.timestamp) * 1000;

      const existing = depositorMap.get(user);
      if (existing) {
        existing.totalDeposited += amount;
        existing.depositCount++;
        existing.lastDeposit = Math.max(existing.lastDeposit, timestamp);
        existing.firstDeposit = Math.min(existing.firstDeposit, timestamp);
      } else {
        depositorMap.set(user, {
          totalDeposited: amount,
          depositCount: 1,
          firstDeposit: timestamp,
          lastDeposit: timestamp,
        });
      }
    }

    // Get current positions for each depositor
    const depositors: Depositor[] = [];

    for (const [address, data] of depositorMap) {
      try {
        const position = await arcClient.readContract({
          address: VAULT_ADDRESS,
          abi: VAULT_ABI,
          functionName: "getUserPosition",
          args: [address as `0x${string}`],
        });

        const shares = parseFloat(formatUnits(position[1], 6));
        const currentValue = parseFloat(formatUnits(position[2], 6));

        // Only include active depositors (shares > 0)
        if (shares > 0) {
          depositors.push({
            address,
            totalDeposited: data.totalDeposited,
            shares,
            currentValue,
            depositCount: data.depositCount,
            firstDeposit: data.firstDeposit,
            lastDeposit: data.lastDeposit,
            rank: 0,
          });
        }
      } catch (e) {
        // User might have fully withdrawn
        console.log(`Could not get position for ${address}:`, e);
      }
    }

    // Sort by current value (descending) and assign ranks
    depositors.sort((a, b) => b.currentValue - a.currentValue);
    depositors.forEach((d, i) => {
      d.rank = i + 1;
    });

    return depositors;
  } catch (e) {
    console.error("Error building leaderboard:", e);
    return [];
  }
}

export async function GET() {
  try {
    const now = Date.now();

    // Return cached if fresh
    if (leaderboardCache.length > 0 && now - lastFetchTime < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        leaderboard: leaderboardCache,
        cached: true,
        lastUpdate: lastFetchTime,
      });
    }

    // Build fresh leaderboard
    leaderboardCache = await buildLeaderboard();
    lastFetchTime = now;

    // Calculate stats
    const totalDepositors = leaderboardCache.length;
    const totalValueLocked = leaderboardCache.reduce((sum, d) => sum + d.currentValue, 0);
    const totalDeposits = leaderboardCache.reduce((sum, d) => sum + d.depositCount, 0);

    return NextResponse.json({
      success: true,
      leaderboard: leaderboardCache.slice(0, 50), // Top 50
      stats: {
        totalDepositors,
        totalValueLocked,
        totalDeposits,
        averageDeposit: totalDepositors > 0 ? totalValueLocked / totalDepositors : 0,
      },
      cached: false,
      lastUpdate: now,
    });
  } catch (e) {
    console.error("Leaderboard API error:", e);
    return NextResponse.json({
      success: false,
      error: (e as Error).message,
      leaderboard: leaderboardCache,
    }, { status: 500 });
  }
}
