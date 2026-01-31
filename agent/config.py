"""
Velvet Arc Agent Configuration
"""
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class ChainConfig:
    chain_id: int
    rpc_url: str
    name: str
    cctp_domain: int
    usdc_address: str
    token_messenger: str | None = None

@dataclass
class ContractConfig:
    vault_address: str
    hook_address: str
    agent_address: str

# Chain Configurations
ARC_TESTNET = ChainConfig(
    chain_id=5042002,
    rpc_url=os.getenv("ARC_RPC", "https://rpc.testnet.arc.network"),
    name="Arc Testnet",
    cctp_domain=26,
    usdc_address="0x3600000000000000000000000000000000000000",
    token_messenger="0x8FE6B999Dc680CcFDD5Bf7EB0974218be2542DAA",
)

BASE_SEPOLIA = ChainConfig(
    chain_id=84532,
    rpc_url=os.getenv("BASE_RPC", "https://sepolia.base.org"),
    name="Base Sepolia",
    cctp_domain=6,
    usdc_address="0x036CbD53842c5426634e7929541eC2318f3dCF7e",
    token_messenger="0x9f3B8679c73C2Fef8b59B4f3444d4e156fb70AA5",
)

# Deployed Contracts
CONTRACTS = ContractConfig(
    vault_address=os.getenv("VAULT_ADDRESS", "0xC4a486Ef5dce0655983F7aF31682E1AE107995dB"),
    hook_address=os.getenv("HOOK_ADDRESS", "0x9D5Ed0F872f95808EaFf9F709cA61db06Dc520d2"),
    agent_address=os.getenv("AGENT_ADDRESS", "0x55c3aBb091D1a43C3872718b3b8B3AE8c20B592E"),
)

# Agent Parameters
PRIVATE_KEY = os.getenv("PRIVATE_KEY", "")

# Decision Thresholds
VOLATILITY_LOW_THRESHOLD = 0.02  # 2% - safe to deploy
VOLATILITY_HIGH_THRESHOLD = 0.08  # 8% - consider withdrawing
VOLATILITY_CRITICAL_THRESHOLD = 0.15  # 15% - emergency exit

# Timing
SCAN_INTERVAL_SECONDS = 30
BRIDGE_TIMEOUT_SECONDS = 300

# Contract ABIs (minimal for our functions)
VAULT_ABI = [
    {
        "inputs": [],
        "name": "state",
        "outputs": [{"type": "uint8", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalDeposits",
        "outputs": [{"type": "uint256", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getVaultBalance",
        "outputs": [{"type": "uint256", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"type": "uint256", "name": "amount"},
            {"type": "uint32", "name": "destinationDomain"},
            {"type": "bytes32", "name": "mintRecipient"}
        ],
        "name": "bridgeToExecution",
        "outputs": [{"type": "uint64", "name": "nonce"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint256", "name": "amount"}],
        "name": "receiveBridgedFunds",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "emergencyExit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "agent",
        "outputs": [{"type": "address", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    }
]

HOOK_ABI = [
    {
        "inputs": [],
        "name": "dynamicFee",
        "outputs": [{"type": "uint24", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalLiquidity",
        "outputs": [{"type": "uint256", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "volatilityLevel",
        "outputs": [{"type": "uint8", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [{"type": "uint8", "name": "newLevel"}],
        "name": "setVolatilityLevel",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"type": "uint24", "name": "newFee"},
            {"type": "string", "name": "reason"}
        ],
        "name": "updateDynamicFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "AGENT",
        "outputs": [{"type": "address", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    }
]

# ERC20 ABI for USDC
ERC20_ABI = [
    {
        "inputs": [{"type": "address", "name": "account"}],
        "name": "balanceOf",
        "outputs": [{"type": "uint256", "name": ""}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {"type": "address", "name": "spender"},
            {"type": "uint256", "name": "amount"}
        ],
        "name": "approve",
        "outputs": [{"type": "bool", "name": ""}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"type": "address", "name": "to"},
            {"type": "uint256", "name": "amount"}
        ],
        "name": "transfer",
        "outputs": [{"type": "bool", "name": ""}],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
