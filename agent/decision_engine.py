"""
Velvet Arc Decision Engine
The decision engine that determines when to deploy, withdraw, or emergency exit
"""
from dataclasses import dataclass
from enum import Enum
from typing import Optional
from datetime import datetime, timedelta
from structlog import get_logger

from market_data import MarketConditions

logger = get_logger()


class Action(Enum):
    """Possible agent actions"""
    HOLD = "HOLD"
    DEPLOY = "DEPLOY"  # Bridge funds to Base, deploy to Uniswap
    WITHDRAW = "WITHDRAW"  # Pull from Uniswap, bridge back to Arc
    EMERGENCY_EXIT = "EMERGENCY_EXIT"  # Immediate withdrawal
    ADJUST_FEE = "ADJUST_FEE"  # Update Uniswap V4 hook fee


class Position(Enum):
    """Where the funds currently are"""
    ARC = "ARC"  # Home base (safe)
    BRIDGING_TO_BASE = "BRIDGING_TO_BASE"
    BASE = "BASE"  # Deployed on Base
    BRIDGING_TO_ARC = "BRIDGING_TO_ARC"


@dataclass
class Decision:
    """Agent decision with reasoning"""
    action: Action
    confidence: float  # 0-1
    reasoning: str
    parameters: dict  # Action-specific params
    timestamp: datetime


@dataclass
class AgentState:
    """Current state of the agent"""
    position: Position
    balance_arc: int  # USDC in vault (6 decimals)
    balance_base: int  # USDC deployed on Base
    last_bridge_time: Optional[datetime]
    fees_earned: int  # Total fees earned
    current_fee_bps: int  # Current Uniswap V4 fee


class DecisionEngine:
    """
    Decision Engine for Velvet Arc

    Strategy:
    - LOW volatility → Deploy capital to Base for yield
    - MEDIUM volatility → Hold current position
    - HIGH volatility → Start withdrawing
    - EXTREME volatility → Emergency exit immediately
    """

    def __init__(self):
        self.decision_history: list[Decision] = []
        self.min_deploy_amount = 100 * 10**6  # 100 USDC minimum
        self.bridge_cooldown = timedelta(minutes=5)

    def decide(
        self,
        state: AgentState,
        conditions: MarketConditions
    ) -> Decision:
        """
        Main decision function - analyzes conditions and returns action
        """
        now = datetime.utcnow()

        # Check cooldown for bridging operations
        if state.last_bridge_time:
            time_since_bridge = now - state.last_bridge_time
            in_cooldown = time_since_bridge < self.bridge_cooldown
        else:
            in_cooldown = False

        # EMERGENCY EXIT - Always takes priority
        if conditions.emergency_exit_needed:
            if state.position == Position.BASE:
                return Decision(
                    action=Action.EMERGENCY_EXIT,
                    confidence=1.0,
                    reasoning=f"CRITICAL: Volatility at {conditions.volatility_index:.1%}. Emergency exit triggered.",
                    parameters={"full_withdrawal": True},
                    timestamp=now,
                )
            else:
                return Decision(
                    action=Action.HOLD,
                    confidence=1.0,
                    reasoning="Emergency conditions but funds already safe on Arc.",
                    parameters={},
                    timestamp=now,
                )

        # HIGH VOLATILITY - Consider withdrawing
        if conditions.should_withdraw:
            if state.position == Position.BASE and not in_cooldown:
                return Decision(
                    action=Action.WITHDRAW,
                    confidence=0.85,
                    reasoning=f"High volatility ({conditions.volatility_index:.1%}). Withdrawing to safety.",
                    parameters={"amount": state.balance_base},
                    timestamp=now,
                )

        # LOW/MEDIUM VOLATILITY - Consider deploying
        if conditions.is_safe_to_deploy:
            if state.position == Position.ARC and not in_cooldown:
                if state.balance_arc >= self.min_deploy_amount:
                    # Calculate optimal deployment amount
                    deploy_amount = self._calculate_deploy_amount(state, conditions)

                    return Decision(
                        action=Action.DEPLOY,
                        confidence=0.9 if conditions.volatility_level == "LOW" else 0.7,
                        reasoning=f"Low volatility ({conditions.volatility_index:.1%}). Deploying for yield.",
                        parameters={
                            "amount": deploy_amount,
                            "destination": "BASE",
                        },
                        timestamp=now,
                    )

        # Check if fee adjustment needed
        optimal_fee = self._calculate_optimal_fee(conditions)
        if abs(optimal_fee - state.current_fee_bps) > 500:  # >0.5% difference
            return Decision(
                action=Action.ADJUST_FEE,
                confidence=0.75,
                reasoning=f"Adjusting fee from {state.current_fee_bps/100:.2f}% to {optimal_fee/100:.2f}%",
                parameters={"new_fee_bps": optimal_fee},
                timestamp=now,
            )

        # DEFAULT: Hold current position
        return Decision(
            action=Action.HOLD,
            confidence=0.6,
            reasoning=f"Market stable. Maintaining current position on {state.position.value}.",
            parameters={},
            timestamp=now,
        )

    def _calculate_deploy_amount(
        self,
        state: AgentState,
        conditions: MarketConditions
    ) -> int:
        """
        Calculate how much to deploy based on conditions
        More conservative in higher volatility
        """
        base_allocation = 0.8  # Deploy up to 80% of funds

        # Adjust based on volatility
        if conditions.volatility_level == "LOW":
            allocation = base_allocation
        elif conditions.volatility_level == "MEDIUM":
            allocation = base_allocation * 0.6

        # Adjust based on sentiment
        if conditions.market_sentiment == "fear":
            allocation *= 0.7  # More conservative in fearful markets
        elif conditions.market_sentiment == "greed":
            allocation *= 0.9  # Slightly more aggressive

        amount = int(state.balance_arc * allocation)

        # Ensure minimum deployment
        return max(amount, self.min_deploy_amount)

    def _calculate_optimal_fee(self, conditions: MarketConditions) -> int:
        """
        Calculate optimal Uniswap V4 fee based on market conditions
        Higher volatility = higher fees (to compensate for IL risk)
        """
        base_fee = 3000  # 0.3% base

        if conditions.volatility_level == "LOW":
            return base_fee  # 0.3%
        elif conditions.volatility_level == "MEDIUM":
            return 5000  # 0.5%
        elif conditions.volatility_level == "HIGH":
            return 8000  # 0.8%
        else:
            return 10000  # 1% max

    def record_decision(self, decision: Decision):
        """Store decision in history for analysis"""
        self.decision_history.append(decision)
        # Keep last 100 decisions
        self.decision_history = self.decision_history[-100:]

        logger.info(
            "Decision made",
            action=decision.action.value,
            confidence=f"{decision.confidence:.0%}",
            reasoning=decision.reasoning,
        )
