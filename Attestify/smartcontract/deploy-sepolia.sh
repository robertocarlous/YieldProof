#!/bin/bash

# Ethereum Sepolia Deployment Script
# This script deploys Attestify with Aave V3 integration on Ethereum Sepolia

set -e

echo "============================================"
echo "Attestify - Ethereum Sepolia Deployment"
echo "============================================"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo ""
    echo "Please create .env file with:"
    echo "  SEPOLIA_RPC_URL=your_rpc_url"
    echo "  PRIVATE_KEY=your_private_key"
    echo "  ETHERSCAN_API_KEY=your_api_key"
    echo ""
    echo "You can copy from .env.sepolia.example:"
    echo "  cp .env.sepolia.example .env"
    exit 1
fi

# Load environment variables
source .env

# Check required variables
if [ -z "$SEPOLIA_RPC_URL" ]; then
    echo "❌ Error: SEPOLIA_RPC_URL not set in .env"
    exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env"
    exit 1
fi

# Set default asset if not specified
ASSET=${ASSET:-USDC}

echo "Configuration:"
echo "  RPC: $SEPOLIA_RPC_URL"
echo "  Asset: $ASSET"
echo "  Treasury: ${TREASURY_ADDRESS:-[Deployer]}"
echo ""

# Confirm deployment
read -p "Deploy to Ethereum Sepolia? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 0
fi

echo ""
echo "🚀 Starting deployment..."
echo ""

# Run deployment
forge script script/DeployEthereumSepolia.s.sol:DeployEthereumSepolia \
    --rpc-url $SEPOLIA_RPC_URL \
    --broadcast \
    --verify \
    -vvvv

echo ""
echo "============================================"
echo "✅ Deployment Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Check deployment-ethereum-sepolia.txt for addresses"
echo "2. Get test tokens: https://staging.aave.com/faucet/"
echo "3. Update frontend with new addresses"
echo "4. Test deposit/withdraw flow"
echo ""
