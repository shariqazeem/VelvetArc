#!/bin/bash
# Velvet Arc Agent Runner

set -e

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              VELVET ARC AGENT                             ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Install dependencies if needed
echo "Checking dependencies..."
pip3 install -q -r requirements.txt 2>/dev/null || pip install -q -r requirements.txt

# Run agent
echo ""
echo "Starting agent..."
python3 main.py
