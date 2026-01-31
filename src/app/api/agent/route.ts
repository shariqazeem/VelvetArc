import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface MarketData {
  ethPrice: number;
  priceChange24h: number;
  volume24h: number;
  volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME";
  volatilityIndex: number;
  timestamp: number;
}

interface AgentStatus {
  isRunning: boolean;
  position: "ARC" | "BASE";
  lastAction: string;
  lastActionTime: number;
  marketData: MarketData;
}

// Cache for rate limiting
let cachedData: AgentStatus | null = null;
let lastFetch = 0;
const CACHE_DURATION = 15000; // 15 seconds

export async function GET() {
  const now = Date.now();

  // Return cached data if recent
  if (cachedData && now - lastFetch < CACHE_DURATION) {
    return NextResponse.json(cachedData);
  }

  try {
    // Fetch real market data from CoinGecko
    const response = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true",
      {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error("CoinGecko API error");
    }

    const data = await response.json();
    const ethPrice = data.ethereum?.usd || 0;
    const priceChange24h = data.ethereum?.usd_24h_change || 0;
    const volume24h = data.ethereum?.usd_24h_vol || 0;

    // Calculate volatility based on price change
    const absChange = Math.abs(priceChange24h);
    let volatility: MarketData["volatility"];
    let volatilityIndex: number;

    if (absChange < 2) {
      volatility = "LOW";
      volatilityIndex = Math.floor(absChange * 10);
    } else if (absChange < 5) {
      volatility = "MEDIUM";
      volatilityIndex = 20 + Math.floor((absChange - 2) * 10);
    } else if (absChange < 10) {
      volatility = "HIGH";
      volatilityIndex = 50 + Math.floor((absChange - 5) * 6);
    } else {
      volatility = "EXTREME";
      volatilityIndex = Math.min(80 + Math.floor((absChange - 10) * 2), 100);
    }

    const agentStatus: AgentStatus = {
      isRunning: true,
      position: volatility === "HIGH" || volatility === "EXTREME" ? "ARC" : "BASE",
      lastAction:
        volatility === "LOW"
          ? "Deploying capital for yield"
          : volatility === "MEDIUM"
          ? "Monitoring market conditions"
          : volatility === "HIGH"
          ? "Withdrawing to safety"
          : "Emergency exit triggered",
      lastActionTime: now,
      marketData: {
        ethPrice,
        priceChange24h,
        volume24h,
        volatility,
        volatilityIndex,
        timestamp: now,
      },
    };

    cachedData = agentStatus;
    lastFetch = now;

    return NextResponse.json(agentStatus);
  } catch (error) {
    console.error("[API] Failed to fetch market data:", error);

    // Return fallback data
    const fallback: AgentStatus = {
      isRunning: true,
      position: "ARC",
      lastAction: "Scanning market conditions",
      lastActionTime: now,
      marketData: {
        ethPrice: 0,
        priceChange24h: 0,
        volume24h: 0,
        volatility: "MEDIUM",
        volatilityIndex: 35,
        timestamp: now,
      },
    };

    return NextResponse.json(fallback);
  }
}
