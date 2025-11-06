# Attestify Smart Contracts

Two-layer vault system combining ERC-4626 standard with identity verification and Aave V3 yield generation on Celo.

## Architecture

Attestify uses a **wrapper pattern** to separate concerns:

- **Layer 1 (Base Vault):** ERC-4626 compliant vault with Aave V3 integration
- **Layer 2 (Wrapper):** Identity verification, user profiles, and investment strategies

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

## Project Structure

```
contracts/
├── AttestifyVault.sol          # Base ERC-4626 vault with Aave V3
├── AttestifyVaultWrapper.sol   # Wrapper with verification & strategies
└── interfaces/                 # Aave V3 interfaces
    ├── IAaveV3.sol
    └── IAaveV3Enhanced.sol

script/
├── DeployAaveVault.s.sol       # Deploy base vault only
└── DeployAttestifyWrapper.s.sol # Deploy complete system
```

## Setup

1. Install dependencies:
```bash
npm install
forge install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

Required environment variables:
- `PRIVATE_KEY` - Deployer wallet private key
- `TREASURY_ADDRESS` - Treasury address for fees (optional, defaults to deployer)

## Build

```bash
forge build
```

## Deploy

### Option 1: Complete System (Recommended)
Deploys both base vault and wrapper:

```bash
forge script script/DeployAttestifyWrapper.s.sol:DeployAttestifyWrapper \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify
```

### Option 2: Base Vault Only
For advanced users or testing:

```bash
forge script script/DeployAaveVault.s.sol:DeployAaveVault \
  --rpc-url https://alfajores-forno.celo-testnet.org \
  --broadcast \
  --verify
```

## Features

### Base Vault (Layer 1)
- **ERC-4626 Standard**: Full compliance for standardized vault interactions
- **Aave V3 Integration**: Automatic yield generation through Aave supply
- **Reserve Buffer**: Configurable buffer for instant withdrawals (default 10%)
- **Slippage Protection**: Safeguards on deposits and withdrawals
- **Yield Harvesting**: Automated yield collection with performance fees
- **Emergency Controls**: Pause and recovery mechanisms

### Wrapper (Layer 2)
- **Identity Verification**: Self Protocol integration for KYC
- **User Profiles**: Track verification status and deposit history
- **Investment Strategies**: 3 strategies (Conservative, Balanced, Growth)
- **Access Control**: Only verified users can deposit
- **User Analytics**: Earnings tracking and portfolio insights

## Security

- ReentrancyGuard on all state-changing functions
- Pausable for emergency situations
- Comprehensive event logging
- Slippage protection mechanisms

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - Detailed architecture and design decisions
- [FORGE_DEPLOYMENT.md](./FORGE_DEPLOYMENT.md) - Deployment instructions

## Quick Start

1. **Verify your identity:**
```solidity
wrapper.verifySelfProof(proofPayload, userContextData);
```

2. **Choose a strategy:**
```solidity
wrapper.changeStrategy(StrategyType.CONSERVATIVE);
```

3. **Deposit funds:**
```solidity
wrapper.deposit(1000 * 10**18); // 1000 cUSD
```

4. **Track your earnings:**
```solidity
uint256 earnings = wrapper.getEarnings(userAddress);
```
