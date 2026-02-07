"use client";

import { getRoutes, getQuote, type RoutesRequest, type Route } from "@lifi/sdk";

// Chain IDs
const CHAINS = {
  BASE: 8453,
  OPTIMISM: 10,
  ARBITRUM: 42161,
  POLYGON: 137,
  ETHEREUM: 1,
} as const;

// Token addresses
const USDC_ADDRESSES: Record<number, string> = {
  [CHAINS.BASE]: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  [CHAINS.OPTIMISM]: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  [CHAINS.ARBITRUM]: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  [CHAINS.POLYGON]: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
  [CHAINS.ETHEREUM]: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
};

export interface CrossChainQuote {
  fromChain: string;
  toChain: string;
  fromAmount: string;
  toAmount: string;
  gasCost: string;
  bridgeName: string;
  estimatedTime: number;
  route: Route | null;
}

export interface RebalanceRecommendation {
  shouldRebalance: boolean;
  reason: string;
  bestRoute: CrossChainQuote | null;
  savings: string;
}

class LiFiServiceImpl {
  private static instance: LiFiServiceImpl | null = null;

  private constructor() {}

  static getInstance(): LiFiServiceImpl {
    if (!LiFiServiceImpl.instance) {
      LiFiServiceImpl.instance = new LiFiServiceImpl();
    }
    return LiFiServiceImpl.instance;
  }

  /**
   * Get the best cross-chain route for USDC
   */
  async getUSDCRoute(
    fromChainId: number,
    toChainId: number,
    amount: string, // in USDC (6 decimals)
    fromAddress: string
  ): Promise<CrossChainQuote | null> {
    try {
      const routeRequest: RoutesRequest = {
        fromChainId,
        toChainId,
        fromTokenAddress: USDC_ADDRESSES[fromChainId],
        toTokenAddress: USDC_ADDRESSES[toChainId],
        fromAmount: amount,
        fromAddress,
        options: {
          slippage: 0.005, // 0.5% slippage
          order: "RECOMMENDED",
        },
      };

      const result = await getRoutes(routeRequest);

      if (!result.routes || result.routes.length === 0) {
        return null;
      }

      const bestRoute = result.routes[0];
      const step = bestRoute.steps[0];

      return {
        fromChain: this.getChainName(fromChainId),
        toChain: this.getChainName(toChainId),
        fromAmount: (parseFloat(amount) / 1e6).toFixed(2),
        toAmount: (parseFloat(bestRoute.toAmount) / 1e6).toFixed(2),
        gasCost: (parseFloat(bestRoute.gasCostUSD || "0")).toFixed(2),
        bridgeName: step?.toolDetails?.name || "Unknown",
        estimatedTime: bestRoute.steps.reduce((acc, s) => acc + (s.estimate?.executionDuration || 0), 0),
        route: bestRoute,
      };
    } catch (error) {
      console.error("LI.FI route fetch failed:", error);
      return null;
    }
  }

  /**
   * Get quotes for multiple routes to find the best option
   */
  async compareRoutes(
    fromChainId: number,
    amount: string,
    fromAddress: string
  ): Promise<CrossChainQuote[]> {
    const targetChains = [CHAINS.BASE, CHAINS.OPTIMISM, CHAINS.ARBITRUM].filter(
      (c) => c !== fromChainId
    );

    const quotes = await Promise.all(
      targetChains.map((toChain) =>
        this.getUSDCRoute(fromChainId, toChain, amount, fromAddress)
      )
    );

    return quotes.filter((q): q is CrossChainQuote => q !== null);
  }

  /**
   * Agent intelligence: Should we rebalance capital cross-chain?
   * This is the "AI x LI.FI" integration - agent makes decisions using LI.FI data
   */
  async getRebalanceRecommendation(
    currentChainId: number,
    currentBalance: string, // in USDC units
    targetChainId: number,
    volatility: "LOW" | "MEDIUM" | "HIGH" | "EXTREME",
    agentAddress: string
  ): Promise<RebalanceRecommendation> {
    // Agent logic: Determine if rebalancing makes sense
    const balanceNum = parseFloat(currentBalance);

    // Don't rebalance small amounts (gas would eat profits)
    if (balanceNum < 100) {
      return {
        shouldRebalance: false,
        reason: "Balance too small for cost-effective bridging",
        bestRoute: null,
        savings: "0",
      };
    }

    // In EXTREME volatility, always recommend moving to safety
    if (volatility === "EXTREME" && currentChainId !== CHAINS.BASE) {
      const route = await this.getUSDCRoute(
        currentChainId,
        CHAINS.BASE,
        (balanceNum * 1e6).toString(),
        agentAddress
      );

      return {
        shouldRebalance: true,
        reason: "EXTREME volatility detected - recommending capital recall to Base",
        bestRoute: route,
        savings: "Protection from potential losses",
      };
    }

    // In LOW volatility, consider deploying to higher yield chains
    if (volatility === "LOW" && balanceNum > 500) {
      const quotes = await this.compareRoutes(
        currentChainId,
        (balanceNum * 1e6).toString(),
        agentAddress
      );

      if (quotes.length > 0) {
        // Sort by lowest gas cost
        const bestQuote = quotes.sort(
          (a, b) => parseFloat(a.gasCost) - parseFloat(b.gasCost)
        )[0];

        // Only recommend if gas is less than 1% of transfer
        const gasPercent = (parseFloat(bestQuote.gasCost) / balanceNum) * 100;
        if (gasPercent < 1) {
          return {
            shouldRebalance: true,
            reason: `Low volatility - opportunity to deploy to ${bestQuote.toChain} for yield`,
            bestRoute: bestQuote,
            savings: `Gas cost: $${bestQuote.gasCost} (${gasPercent.toFixed(2)}%)`,
          };
        }
      }
    }

    return {
      shouldRebalance: false,
      reason: `Current position optimal for ${volatility} volatility`,
      bestRoute: null,
      savings: "0",
    };
  }

  /**
   * Format route for display
   */
  formatRouteForDisplay(quote: CrossChainQuote): string {
    return `${quote.fromChain} → ${quote.toChain}: $${quote.fromAmount} → $${quote.toAmount} (gas: $${quote.gasCost}, ~${Math.ceil(quote.estimatedTime / 60)}min via ${quote.bridgeName})`;
  }

  private getChainName(chainId: number): string {
    const names: Record<number, string> = {
      [CHAINS.BASE]: "Base",
      [CHAINS.OPTIMISM]: "Optimism",
      [CHAINS.ARBITRUM]: "Arbitrum",
      [CHAINS.POLYGON]: "Polygon",
      [CHAINS.ETHEREUM]: "Ethereum",
    };
    return names[chainId] || `Chain ${chainId}`;
  }
}

export const LiFiService = {
  getInstance: () => LiFiServiceImpl.getInstance(),
};

export { CHAINS, USDC_ADDRESSES };
