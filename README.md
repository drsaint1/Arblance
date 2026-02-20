# ArbLance - Decentralized Freelancing Platform

A fully decentralized freelancing platform built on **Arbitrum** with smart contract-based escrow, NFT skill badges, and Web3 authentication.

> **[Full Documentation](./DOCUMENTATION.md)**

## Features

- **Smart Contract Escrow** - Funds locked in contracts until job completion
- **NFT Skill Badges** - Soulbound ERC-721 badges with 6-tier progression (Bronze to Legend)
- **Badge-Gated Jobs** - Only qualified badge-holders can apply
- **Multi-Token Payments** - ETH, USDT, USDC support
- **Anti-Ghosting** - 7-day auto-release protects freelancers
- **Referral Rewards** - 1% reward for first 5 referred jobs
- **Dispute Resolution** - Admin-mediated arbitration system
- **Real-time Chat** - Firebase-powered messaging
- **AI Suggestions** - Gemini-powered job recommendations

## Deployed Contracts (Arbitrum Sepolia)

| Contract | Address |
|----------|---------|
| FreelanceMarketplace | [`0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e`](https://sepolia.arbiscan.io/address/0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e) |
| SkillBadges | [`0x4F64da35DA275fC052a01a78603500e592059Cb9`](https://sepolia.arbiscan.io/address/0x4F64da35DA275fC052a01a78603500e592059Cb9) |
| JobBadges | [`0xdc36c3251e56b635a9B4F188389764Cd235939d2`](https://sepolia.arbiscan.io/address/0xdc36c3251e56b635a9B4F188389764Cd235939d2) |
| EscrowPayment | [`0x3CE0f5071AaEc15F519a606BEe5D08c7eFA78461`](https://sepolia.arbiscan.io/address/0x3CE0f5071AaEc15F519a606BEe5D08c7eFA78461) |
| EscrowPaymentToken | [`0xfFFEaA39336E9E749091f3e10Baf958a909f69Ae`](https://sepolia.arbiscan.io/address/0xfFFEaA39336E9E749091f3e10Baf958a909f69Ae) |
| DisputeResolution | [`0xAeE0640726c7225053F1Bd65fB72A0bD23F0a80E`](https://sepolia.arbiscan.io/address/0xAeE0640726c7225053F1Bd65fB72A0bD23F0a80E) |

**Network:** Arbitrum Sepolia (Chain ID: 421614)

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Smart Contracts | Solidity, OpenZeppelin, Hardhat |
| Frontend | Next.js, TypeScript, ethers.js v6, TailwindCSS, Firebase |
| Backend | Express.js, MongoDB, Socket.IO, Google Gemini AI |

## Quick Start

### 1. Install

```bash
git clone <repository-url>
cd arblance
npm run install:all
```

### 2. Configure

```bash
cp .env.example .env
cp backend/.env.example backend/.env
```

Add your `PRIVATE_KEY`, `MONGODB_URI`, and other config values.

### 3. Deploy Contracts

```bash
npm run compile
npm run deploy:arbitrum
```

### 4. Run

```bash
npm run dev:all
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
arblance/
├── contracts/          # 6 Solidity smart contracts
├── scripts/            # Deployment scripts
├── frontend/           # Next.js frontend app
├── backend/            # Express.js API server
├── deployments/        # Deployment artifacts
└── DOCUMENTATION.md    # Full technical documentation
```

## How It Works

### For Freelancers
1. Connect wallet
2. Take skill tests to earn NFT badges
3. Browse and apply for badge-gated jobs
4. Submit deliverables and get paid via escrow
5. Level up badges as you complete more jobs

### For Clients
1. Connect wallet
2. Post a job with escrow (set budget, skill requirement, and minimum badge tier)
3. Review applications from verified badge-holders
4. Approve deliverables to release payment

## Documentation

- **[Full Documentation](./DOCUMENTATION.md)** - Architecture, API reference, all contract functions, deployment guide

## License

MIT
