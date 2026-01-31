#!/bin/bash
# Velvet Arc Agent Runner

set -e

cd "$(dirname "$0")"

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║              VELVET ARC AI AGENT                          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Check for virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate venv
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Run agent
echo ""
echo "Starting agent..."
python main.py
