"""
Velvet Arc Transaction Executor
Signs and broadcasts transactions to Arc and Base
"""
import asyncio
from typing import Optional
from datetime import datetime
from web3 import Web3, AsyncWeb3
from web3.middleware import ExtraDataToPOAMiddleware
from eth_account import Account
from eth_account.signers.local import LocalAccount
from structlog import get_logger

from config import (
    ARC_TESTNET, BASE_SEPOLIA, CONTRACTS,
    VAULT_ABI, HOOK_ABI, ERC20_ABI, PRIVATE_KEY
)
from decision_engine import Action, Decision, Position

logger = get_logger()


class TransactionExecutor:
    """Executes transactions on Arc and Base chains"""

    def __init__(self, private_key: str):
        self.account: LocalAccount = Account.from_key(private_key)

        # Initialize Web3 connections
        self.w3_arc = Web3(Web3.HTTPProvider(ARC_TESTNET.rpc_url))
        self.w3_base = Web3(Web3.HTTPProvider(BASE_SEPOLIA.rpc_url))

        # Add PoA middleware for testnets
        self.w3_arc.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)
        self.w3_base.middleware_onion.inject(ExtraDataToPOAMiddleware, layer=0)

        # Initialize contracts
        self.vault = self.w3_arc.eth.contract(
            address=Web3.to_checksum_address(CONTRACTS.vault_address),
            abi=VAULT_ABI
        )
        self.hook = self.w3_base.eth.contract(
            address=Web3.to_checksum_address(CONTRACTS.hook_address),
            abi=HOOK_ABI
        )
        self.usdc_arc = self.w3_arc.eth.contract(
            address=Web3.to_checksum_address(ARC_TESTNET.usdc_address),
            abi=ERC20_ABI
        )
        self.usdc_base = self.w3_base.eth.contract(
            address=Web3.to_checksum_address(BASE_SEPOLIA.usdc_address),
            abi=ERC20_ABI
        )

        logger.info(
            "Executor initialized",
            agent=self.account.address,
            vault=CONTRACTS.vault_address,
            hook=CONTRACTS.hook_address,
        )

    async def get_vault_state(self) -> dict:
        """Get current vault state from Arc"""
        try:
            state = self.vault.functions.currentState().call()
            total_deposits = self.vault.functions.totalDeposits().call()
            balance = self.vault.functions.getVaultBalance().call()

            return {
                "state": state,
                "total_deposits": total_deposits,
                "balance": balance,
                "state_name": ["IDLE", "BRIDGING_OUT", "DEPLOYED", "BRIDGING_BACK", "PROTECTED"][state]
            }
        except Exception as e:
            logger.error("Failed to get vault state", error=str(e))
            return {"state": 0, "total_deposits": 0, "balance": 0, "state_name": "UNKNOWN"}

    async def get_hook_state(self) -> dict:
        """Get current hook state from Base"""
        try:
            fee = self.hook.functions.dynamicFee().call()
            volume = self.hook.functions.totalVolume().call()
            fees_collected = self.hook.functions.feesCollected().call()

            return {
                "dynamic_fee": fee,
                "total_volume": volume,
                "fees_collected": fees_collected,
            }
        except Exception as e:
            logger.error("Failed to get hook state", error=str(e))
            return {"dynamic_fee": 3000, "total_volume": 0, "fees_collected": 0}

    async def get_balances(self) -> dict:
        """Get USDC balances on both chains"""
        try:
            arc_balance = self.usdc_arc.functions.balanceOf(
                CONTRACTS.vault_address
            ).call()

            base_balance = self.usdc_base.functions.balanceOf(
                self.account.address
            ).call()

            return {
                "arc_vault": arc_balance,
                "base_agent": base_balance,
            }
        except Exception as e:
            logger.error("Failed to get balances", error=str(e))
            return {"arc_vault": 0, "base_agent": 0}

    async def execute(self, decision: Decision) -> Optional[str]:
        """Execute a decision and return tx hash"""

        if decision.action == Action.HOLD:
            logger.info("Holding position - no action needed")
            return None

        elif decision.action == Action.DEPLOY:
            return await self._execute_deploy(decision)

        elif decision.action == Action.WITHDRAW:
            return await self._execute_withdraw(decision)

        elif decision.action == Action.EMERGENCY_EXIT:
            return await self._execute_emergency_exit(decision)

        elif decision.action == Action.ADJUST_FEE:
            return await self._execute_fee_adjustment(decision)

        return None

    async def _execute_deploy(self, decision: Decision) -> Optional[str]:
        """Bridge funds from Arc to Base"""
        amount = decision.parameters.get("amount", 0)

        logger.info("Executing DEPLOY", amount=amount / 10**6)

        try:
            # Prepare mint recipient (our agent address as bytes32)
            mint_recipient = Web3.to_bytes(hexstr=self.account.address).rjust(32, b'\x00')

            # Build transaction
            nonce = self.w3_arc.eth.get_transaction_count(self.account.address)
            gas_price = self.w3_arc.eth.gas_price

            tx = self.vault.functions.bridgeToExecution(
                amount,
                BASE_SEPOLIA.cctp_domain,  # destination domain (Base = 6)
                mint_recipient
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': gas_price,
                'chainId': ARC_TESTNET.chain_id,
            })

            # Sign and send
            signed = self.account.sign_transaction(tx)
            tx_hash = self.w3_arc.eth.send_raw_transaction(signed.raw_transaction)

            logger.info(
                "DEPLOY transaction sent",
                tx_hash=tx_hash.hex(),
                amount=amount / 10**6,
            )

            return tx_hash.hex()

        except Exception as e:
            logger.error("DEPLOY failed", error=str(e))
            return None

    async def _execute_withdraw(self, decision: Decision) -> Optional[str]:
        """Bridge funds from Base back to Arc"""
        amount = decision.parameters.get("amount", 0)

        logger.info("Executing WITHDRAW", amount=amount / 10**6)

        try:
            # On Base, we need to call the TokenMessenger directly
            # This is a simplified version - in production, use LI.FI SDK
            token_messenger = self.w3_base.eth.contract(
                address=Web3.to_checksum_address(BASE_SEPOLIA.token_messenger),
                abi=[{
                    "inputs": [
                        {"type": "uint256", "name": "amount"},
                        {"type": "uint32", "name": "destinationDomain"},
                        {"type": "bytes32", "name": "mintRecipient"},
                        {"type": "address", "name": "burnToken"}
                    ],
                    "name": "depositForBurn",
                    "outputs": [{"type": "uint64", "name": "nonce"}],
                    "stateMutability": "nonpayable",
                    "type": "function"
                }]
            )

            # Prepare mint recipient (vault address on Arc)
            mint_recipient = Web3.to_bytes(
                hexstr=CONTRACTS.vault_address
            ).rjust(32, b'\x00')

            # First approve USDC
            nonce = self.w3_base.eth.get_transaction_count(self.account.address)
            gas_price = self.w3_base.eth.gas_price

            approve_tx = self.usdc_base.functions.approve(
                BASE_SEPOLIA.token_messenger,
                amount
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 100000,
                'gasPrice': gas_price,
                'chainId': BASE_SEPOLIA.chain_id,
            })

            signed_approve = self.account.sign_transaction(approve_tx)
            approve_hash = self.w3_base.eth.send_raw_transaction(signed_approve.raw_transaction)

            logger.info("USDC approval sent", tx_hash=approve_hash.hex())

            # Wait for approval
            self.w3_base.eth.wait_for_transaction_receipt(approve_hash, timeout=60)

            # Now bridge
            nonce += 1
            bridge_tx = token_messenger.functions.depositForBurn(
                amount,
                ARC_TESTNET.cctp_domain,  # destination domain (Arc = 26)
                mint_recipient,
                BASE_SEPOLIA.usdc_address
            ).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 500000,
                'gasPrice': gas_price,
                'chainId': BASE_SEPOLIA.chain_id,
            })

            signed_bridge = self.account.sign_transaction(bridge_tx)
            bridge_hash = self.w3_base.eth.send_raw_transaction(signed_bridge.raw_transaction)

            logger.info(
                "WITHDRAW transaction sent",
                tx_hash=bridge_hash.hex(),
                amount=amount / 10**6,
            )

            return bridge_hash.hex()

        except Exception as e:
            logger.error("WITHDRAW failed", error=str(e))
            return None

    async def _execute_emergency_exit(self, decision: Decision) -> Optional[str]:
        """Trigger emergency exit on vault"""
        logger.warning("Executing EMERGENCY EXIT")

        try:
            nonce = self.w3_arc.eth.get_transaction_count(self.account.address)
            gas_price = self.w3_arc.eth.gas_price

            tx = self.vault.functions.emergencyExit().build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 300000,
                'gasPrice': gas_price,
                'chainId': ARC_TESTNET.chain_id,
            })

            signed = self.account.sign_transaction(tx)
            tx_hash = self.w3_arc.eth.send_raw_transaction(signed.raw_transaction)

            logger.warning(
                "EMERGENCY EXIT transaction sent",
                tx_hash=tx_hash.hex(),
            )

            return tx_hash.hex()

        except Exception as e:
            logger.error("EMERGENCY EXIT failed", error=str(e))
            return None

    async def _execute_fee_adjustment(self, decision: Decision) -> Optional[str]:
        """Adjust dynamic fee on Uniswap V4 hook"""
        new_fee = decision.parameters.get("new_fee_bps", 3000)

        logger.info("Executing FEE ADJUSTMENT", new_fee_bps=new_fee)

        try:
            nonce = self.w3_base.eth.get_transaction_count(self.account.address)
            gas_price = self.w3_base.eth.gas_price

            tx = self.hook.functions.setDynamicFee(new_fee).build_transaction({
                'from': self.account.address,
                'nonce': nonce,
                'gas': 100000,
                'gasPrice': gas_price,
                'chainId': BASE_SEPOLIA.chain_id,
            })

            signed = self.account.sign_transaction(tx)
            tx_hash = self.w3_base.eth.send_raw_transaction(signed.raw_transaction)

            logger.info(
                "FEE ADJUSTMENT transaction sent",
                tx_hash=tx_hash.hex(),
                new_fee_bps=new_fee,
            )

            return tx_hash.hex()

        except Exception as e:
            logger.error("FEE ADJUSTMENT failed", error=str(e))
            return None
