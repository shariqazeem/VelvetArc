"""
Market Data Fetcher for Velvet Arc Agent
Fetches volatility, prices, and market conditions
"""
import asyncio
import httpx
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Optional
import numpy as np
from structlog import get_logger

logger = get_logger()

@dataclass
class MarketConditions:
    """Current market state"""
    timestamp: datetime
    eth_price: float
    eth_24h_change: float
    volatility_index: float  # 0-1 scale
    gas_price_gwei: float
    market_sentiment: str  # "fear", "neutral", "greed"

    @property
    def volatility_level(self) -> str:
        if self.volatility_index < 0.02:
            return "LOW"
        elif self.volatility_index < 0.08:
            return "MEDIUM"
        elif self.volatility_index < 0.15:
            return "HIGH"
        else:
            return "EXTREME"

    @property
    def is_safe_to_deploy(self) -> bool:
        return self.volatility_level in ["LOW", "MEDIUM"]

    @property
    def should_withdraw(self) -> bool:
        return self.volatility_level == "HIGH"

    @property
    def emergency_exit_needed(self) -> bool:
        return self.volatility_level == "EXTREME"


class MarketDataFetcher:
    """Fetches real-time market data from multiple sources"""

    def __init__(self):
        self.client = httpx.AsyncClient(timeout=10.0)
        self.price_history: list[float] = []
        self.last_conditions: Optional[MarketConditions] = None

    async def close(self):
        await self.client.aclose()

    async def fetch_eth_price(self) -> tuple[float, float]:
        """Fetch ETH price and 24h change from CoinGecko"""
        try:
            response = await self.client.get(
                "https://api.coingecko.com/api/v3/simple/price",
                params={
                    "ids": "ethereum",
                    "vs_currencies": "usd",
                    "include_24hr_change": "true"
                }
            )
            data = response.json()
            price = data["ethereum"]["usd"]
            change = data["ethereum"].get("usd_24h_change", 0) / 100
            return price, change
        except Exception as e:
            logger.warning("Failed to fetch ETH price", error=str(e))
            return 0.0, 0.0

    async def fetch_gas_price(self, rpc_url: str) -> float:
        """Fetch current gas price from RPC"""
        try:
            response = await self.client.post(
                rpc_url,
                json={
                    "jsonrpc": "2.0",
                    "method": "eth_gasPrice",
                    "params": [],
                    "id": 1
                }
            )
            data = response.json()
            gas_wei = int(data["result"], 16)
            return gas_wei / 1e9  # Convert to Gwei
        except Exception as e:
            logger.warning("Failed to fetch gas price", error=str(e))
            return 50.0  # Default fallback

    async def fetch_fear_greed_index(self) -> tuple[int, str]:
        """Fetch crypto fear & greed index"""
        try:
            response = await self.client.get(
                "https://api.alternative.me/fng/"
            )
            data = response.json()
            value = int(data["data"][0]["value"])
            classification = data["data"][0]["value_classification"]
            return value, classification
        except Exception as e:
            logger.warning("Failed to fetch fear/greed", error=str(e))
            return 50, "neutral"

    def calculate_volatility(self, prices: list[float]) -> float:
        """Calculate volatility from price history using standard deviation of returns"""
        if len(prices) < 2:
            return 0.05  # Default medium volatility

        # Calculate returns
        returns = np.diff(np.log(prices))

        # Annualized volatility (assuming hourly data, ~8760 hours/year)
        volatility = np.std(returns) * np.sqrt(8760)

        # Normalize to 0-1 scale (cap at 1.0)
        return min(volatility / 2.0, 1.0)

    async def get_market_conditions(self, rpc_url: str) -> MarketConditions:
        """Fetch all market data and return conditions"""

        # Fetch data in parallel
        eth_task = self.fetch_eth_price()
        gas_task = self.fetch_gas_price(rpc_url)
        fng_task = self.fetch_fear_greed_index()

        (eth_price, eth_change), gas_price, (fng_value, fng_class) = await asyncio.gather(
            eth_task, gas_task, fng_task
        )

        # Update price history for volatility calculation
        if eth_price > 0:
            self.price_history.append(eth_price)
            # Keep last 24 hours of hourly data
            self.price_history = self.price_history[-24:]

        # Calculate volatility
        volatility = self.calculate_volatility(self.price_history)

        # Adjust volatility based on 24h change magnitude
        if abs(eth_change) > 0.1:  # >10% daily move
            volatility = max(volatility, 0.15)
        elif abs(eth_change) > 0.05:  # >5% daily move
            volatility = max(volatility, 0.08)

        # Determine sentiment
        if fng_value < 25:
            sentiment = "fear"
        elif fng_value > 75:
            sentiment = "greed"
        else:
            sentiment = "neutral"

        conditions = MarketConditions(
            timestamp=datetime.utcnow(),
            eth_price=eth_price,
            eth_24h_change=eth_change,
            volatility_index=volatility,
            gas_price_gwei=gas_price,
            market_sentiment=sentiment,
        )

        self.last_conditions = conditions

        logger.info(
            "Market conditions fetched",
            eth_price=f"${eth_price:,.2f}",
            volatility=f"{volatility:.2%}",
            level=conditions.volatility_level,
            sentiment=sentiment,
        )

        return conditions


# Singleton instance
_fetcher: Optional[MarketDataFetcher] = None

async def get_fetcher() -> MarketDataFetcher:
    global _fetcher
    if _fetcher is None:
        _fetcher = MarketDataFetcher()
    return _fetcher
