#!/usr/bin/env python3
"""
Velvet Arc Agent
Cross-Chain Liquidity Agent for ETHGlobal HackMoney 2026

This agent:
1. Monitors market conditions (volatility, sentiment)
2. Decides when to deploy capital to Base for yield
3. Manages Uniswap V4 hook fees dynamically
4. Withdraws to safety when volatility spikes
5. Emergency exits during extreme conditions
"""
import asyncio
import signal
import sys
from datetime import datetime
from typing import Optional

from rich.console import Console
from rich.live import Live
from rich.panel import Panel
from rich.table import Table
from rich.text import Text
from structlog import get_logger, configure
from structlog.dev import ConsoleRenderer

from config import PRIVATE_KEY, ARC_TESTNET, BASE_SEPOLIA, CONTRACTS, SCAN_INTERVAL_SECONDS
from market_data import MarketDataFetcher, MarketConditions
from decision_engine import DecisionEngine, Decision, Action, Position, AgentState
from executor import TransactionExecutor

# Configure logging
configure(
    processors=[ConsoleRenderer()],
    wrapper_class=None,
    context_class=dict,
    logger_factory=None,
)

logger = get_logger()
console = Console()


class VelvetAgent:
    """Main Velvet Arc Agent"""

    def __init__(self, private_key: str):
        self.market_data = MarketDataFetcher()
        self.decision_engine = DecisionEngine()
        self.executor = TransactionExecutor(private_key)

        self.running = False
        self.iteration = 0
        self.last_decision: Optional[Decision] = None
        self.last_conditions: Optional[MarketConditions] = None
        self.execution_history: list[dict] = []

        # Current position tracking
        self.position = Position.ARC
        self.last_bridge_time: Optional[datetime] = None

    async def get_current_state(self) -> AgentState:
        """Build current agent state from on-chain data"""
        balances = await self.executor.get_balances()
        hook_state = await self.executor.get_hook_state()

        return AgentState(
            position=self.position,
            balance_arc=balances["arc_vault"],
            balance_base=balances["base_agent"],
            last_bridge_time=self.last_bridge_time,
            fees_earned=hook_state.get("total_liquidity", 0),  # Use liquidity as proxy
            current_fee_bps=hook_state["dynamic_fee"],
        )

    async def run_iteration(self) -> dict:
        """Run one iteration of the agent loop"""
        self.iteration += 1

        # 1. Fetch market conditions
        conditions = await self.market_data.get_market_conditions(ARC_TESTNET.rpc_url)
        self.last_conditions = conditions

        # 2. Get current state
        state = await self.get_current_state()

        # 3. Make decision
        decision = self.decision_engine.decide(state, conditions)
        self.last_decision = decision
        self.decision_engine.record_decision(decision)

        # 4. Execute decision
        tx_hash = None
        if decision.action != Action.HOLD:
            tx_hash = await self.executor.execute(decision)

            # Update position tracking
            if decision.action == Action.DEPLOY and tx_hash:
                self.position = Position.BRIDGING_TO_BASE
                self.last_bridge_time = datetime.utcnow()
            elif decision.action == Action.WITHDRAW and tx_hash:
                self.position = Position.BRIDGING_TO_ARC
                self.last_bridge_time = datetime.utcnow()

        # 5. Record execution
        execution = {
            "iteration": self.iteration,
            "timestamp": datetime.utcnow().isoformat(),
            "action": decision.action.value,
            "confidence": decision.confidence,
            "reasoning": decision.reasoning,
            "tx_hash": tx_hash,
            "volatility": conditions.volatility_index,
            "eth_price": conditions.eth_price,
        }
        self.execution_history.append(execution)
        self.execution_history = self.execution_history[-50:]  # Keep last 50

        return execution

    def create_status_display(self) -> Panel:
        """Create rich status display for terminal"""
        table = Table(show_header=False, box=None, padding=(0, 2))
        table.add_column("Key", style="dim")
        table.add_column("Value", style="bold")

        # Header
        table.add_row("", "")
        table.add_row("VELVET ARC", "AI Liquidity Agent")
        table.add_row("", "")

        # Market conditions
        if self.last_conditions:
            c = self.last_conditions
            vol_color = "green" if c.volatility_level == "LOW" else \
                       "yellow" if c.volatility_level == "MEDIUM" else \
                       "red"

            table.add_row("ETH Price", f"${c.eth_price:,.2f}")
            table.add_row("24h Change", f"{c.eth_24h_change:+.2%}")
            table.add_row("Volatility", Text(f"{c.volatility_index:.2%} [{c.volatility_level}]", style=vol_color))
            table.add_row("Sentiment", c.market_sentiment.upper())
            table.add_row("", "")

        # Position
        table.add_row("Position", self.position.value)
        table.add_row("Iteration", str(self.iteration))

        # Last decision
        if self.last_decision:
            d = self.last_decision
            action_color = "green" if d.action == Action.DEPLOY else \
                          "yellow" if d.action in [Action.WITHDRAW, Action.ADJUST_FEE] else \
                          "red" if d.action == Action.EMERGENCY_EXIT else "white"

            table.add_row("", "")
            table.add_row("Last Action", Text(d.action.value, style=action_color))
            table.add_row("Confidence", f"{d.confidence:.0%}")

        # Contracts
        table.add_row("", "")
        table.add_row("Vault (Arc)", CONTRACTS.vault_address[:20] + "...")
        table.add_row("Hook (Base)", CONTRACTS.hook_address[:20] + "...")

        return Panel(
            table,
            title="[bold cyan]VELVET ARC[/bold cyan]",
            subtitle=f"[dim]Scan every {SCAN_INTERVAL_SECONDS}s[/dim]",
            border_style="cyan",
        )

    async def run(self):
        """Main agent loop"""
        self.running = True

        console.print("\n[bold cyan]╔═══════════════════════════════════════════════════════════╗[/bold cyan]")
        console.print("[bold cyan]║              VELVET ARC AI AGENT                          ║[/bold cyan]")
        console.print("[bold cyan]║       Cross-Chain Liquidity Optimization                  ║[/bold cyan]")
        console.print("[bold cyan]╚═══════════════════════════════════════════════════════════╝[/bold cyan]\n")

        console.print(f"[green]Agent Address:[/green] {self.executor.account.address}")
        console.print(f"[green]Vault (Arc):[/green] {CONTRACTS.vault_address}")
        console.print(f"[green]Hook (Base):[/green] {CONTRACTS.hook_address}")
        console.print(f"[dim]Scanning every {SCAN_INTERVAL_SECONDS} seconds...[/dim]\n")

        try:
            with Live(self.create_status_display(), refresh_per_second=1, console=console) as live:
                while self.running:
                    try:
                        execution = await self.run_iteration()

                        # Log significant actions
                        if execution["action"] != "HOLD":
                            console.print(
                                f"[bold yellow]ACTION:[/bold yellow] {execution['action']} "
                                f"(confidence: {execution['confidence']:.0%})"
                            )
                            if execution["tx_hash"]:
                                console.print(f"[dim]TX: {execution['tx_hash']}[/dim]")

                        live.update(self.create_status_display())

                    except Exception as e:
                        logger.error("Iteration failed", error=str(e))

                    await asyncio.sleep(SCAN_INTERVAL_SECONDS)

        except asyncio.CancelledError:
            logger.info("Agent stopped")
        finally:
            await self.market_data.close()
            self.running = False

    def stop(self):
        """Stop the agent"""
        self.running = False


async def main():
    """Entry point"""
    if not PRIVATE_KEY:
        console.print("[red]ERROR: PRIVATE_KEY not set in environment[/red]")
        console.print("Create a .env file with: PRIVATE_KEY=0x...")
        sys.exit(1)

    agent = VelvetAgent(PRIVATE_KEY)

    # Handle shutdown signals
    def signal_handler(sig, frame):
        console.print("\n[yellow]Shutting down agent...[/yellow]")
        agent.stop()

    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)

    await agent.run()


if __name__ == "__main__":
    asyncio.run(main())
