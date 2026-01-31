#!/bin/bash
# Velvet Arc Deployment Script
# Usage: ./deploy.sh [vault|hook|all]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              VELVET ARC DEPLOYMENT                        ║"
echo "║       Cross-Chain AI Liquidity Agent                      ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check for .env
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    echo -e "Copy .env.example to .env and add your PRIVATE_KEY"
    echo -e "  cp .env.example .env"
    exit 1
fi

source .env

if [ -z "$PRIVATE_KEY" ] || [ "$PRIVATE_KEY" == "your_private_key_here" ]; then
    echo -e "${RED}Error: PRIVATE_KEY not set in .env${NC}"
    exit 1
fi

DEPLOYER=$(cast wallet address --private-key $PRIVATE_KEY 2>/dev/null)
echo -e "${GREEN}Deployer:${NC} $DEPLOYER"
echo ""

deploy_vault() {
    echo -e "${YELLOW}═══ Deploying VelvetVault to Arc Testnet ═══${NC}"
    echo -e "Chain ID: 5042002"
    echo -e "RPC: https://rpc.testnet.arc.network"
    echo ""

    # Check balance
    BALANCE=$(cast balance $DEPLOYER --rpc-url https://rpc.testnet.arc.network 2>/dev/null || echo "0")
    echo -e "Balance: $BALANCE wei"

    if [ "$BALANCE" == "0" ]; then
        echo -e "${RED}Warning: No balance on Arc Testnet${NC}"
        echo -e "Get testnet USDC from: ${CYAN}https://faucet.circle.com${NC}"
        echo ""
    fi

    forge script script/DeployVault.s.sol \
        --rpc-url https://rpc.testnet.arc.network \
        --broadcast \
        --private-key $PRIVATE_KEY \
        -vvv

    echo -e "${GREEN}VelvetVault deployed successfully!${NC}"
}

deploy_hook() {
    echo -e "${YELLOW}═══ Deploying VelvetHook to Base Sepolia ═══${NC}"
    echo -e "Chain ID: 84532"
    echo -e "RPC: https://sepolia.base.org"
    echo ""

    # Check balance
    BALANCE=$(cast balance $DEPLOYER --rpc-url https://sepolia.base.org 2>/dev/null || echo "0")
    echo -e "Balance: $BALANCE wei"

    if [ "$BALANCE" == "0" ]; then
        echo -e "${RED}Warning: No balance on Base Sepolia${NC}"
        echo -e "Get testnet ETH from: ${CYAN}https://www.alchemy.com/faucets/base-sepolia${NC}"
        echo ""
    fi

    forge script script/DeployHook.s.sol \
        --rpc-url https://sepolia.base.org \
        --broadcast \
        --private-key $PRIVATE_KEY \
        -vvv

    echo -e "${GREEN}VelvetHook deployed successfully!${NC}"
}

case "${1:-all}" in
    vault)
        deploy_vault
        ;;
    hook)
        deploy_hook
        ;;
    all)
        deploy_vault
        echo ""
        deploy_hook
        ;;
    *)
        echo "Usage: $0 [vault|hook|all]"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}═══ Deployment Complete ═══${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Copy the deployed addresses to your frontend .env"
echo -e "2. Verify contracts on block explorers"
echo -e "3. Fund the vault with USDC for agent operations"
