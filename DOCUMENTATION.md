# ArbLance - Full Documentation

> Decentralized Freelancing Platform on Arbitrum

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Smart Contracts](#smart-contracts)
  - [FreelanceMarketplace](#1-freelancemarketplacesol)
  - [SkillBadges](#2-skillbadgessol)
  - [JobBadges](#3-jobbadgessol)
  - [EscrowPayment](#4-escrowpaymentsol)
  - [EscrowPaymentToken](#5-escrowpaymenttokensol)
  - [DisputeResolution](#6-disputeresolutionsol)
- [Contract Interaction Diagram](#contract-interaction-diagram)
- [Deployed Contracts](#deployed-contracts)
- [Frontend](#frontend)
  - [Pages](#pages)
  - [Components](#components)
  - [Contexts & Hooks](#contexts--hooks)
  - [Configuration](#configuration)
- [Backend](#backend)
  - [API Routes](#api-routes)
  - [Models](#models)
  - [Services](#services)
- [Tiered Badge System](#tiered-badge-system)
- [Payment System](#payment-system)
- [Security Features](#security-features)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Deployment Guide](#deployment-guide)

---

## Overview

ArbLance is a fully decentralized freelancing platform built on **Arbitrum One** (Layer 2). It enables clients and freelancers to connect, collaborate, and transact securely using smart contracts. The platform features:

- Smart contract-based escrow for secure payments
- Soulbound NFT skill badges with tiered progression
- Job completion badges for on-chain reputation
- Badge-gated job applications
- Multi-token payment support (ETH, USDT, USDC)
- Real-time messaging via Firebase
- AI-powered job suggestions
- Anti-ghosting mechanisms with auto-release
- Referral reward system
- Admin dispute resolution

---

## Architecture

```
+---------------------+     +---------------------+     +---------------------+
|     Frontend        |     |      Backend         |     |    Blockchain       |
|   (Next.js + TS)    |<--->|   (Express + Node)   |<--->|   (Arbitrum One)    |
|                     |     |                      |     |                     |
| - Pages & Components|     | - REST API           |     | - FreelanceMarket.  |
| - Web3Context       |     | - Socket.IO          |     | - SkillBadges       |
| - ethers.js v6      |     | - MongoDB            |     | - JobBadges         |
| - TailwindCSS       |     | - AI Service         |     | - EscrowPayment     |
| - Firebase          |     | - Email Service      |     | - EscrowPaymentTkn  |
+---------------------+     +---------------------+     | - DisputeResolution |
                                                          +---------------------+
```

**On-Chain (Arbitrum One):** Job posting, escrow, badge minting, tier upgrades, dispute resolution, payments

**Off-Chain (Backend + Firebase):** User profiles, messaging, notifications, AI suggestions, activity tracking, ratings

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Smart Contracts** | Solidity ^0.8.20 | Core business logic |
| | OpenZeppelin | ERC721, AccessControl, ReentrancyGuard |
| | Hardhat 2.27.2 | Development, testing, deployment |
| **Frontend** | Next.js 14+ | React framework with SSR |
| | TypeScript | Type safety |
| | ethers.js v6 | Blockchain interaction |
| | TailwindCSS | Utility-first styling |
| | Radix UI | Accessible component primitives |
| | Framer Motion | Animations |
| | Firebase | Real-time messaging & notifications |
| | Socket.IO Client | Real-time updates |
| **Backend** | Express.js | REST API server |
| | TypeScript | Type safety |
| | MongoDB + Mongoose | Off-chain data storage |
| | Socket.IO | Real-time bidirectional communication |
| | Google Generative AI | AI-powered suggestions |
| | Nodemailer | Email notifications |
| | JWT | Authentication |

---

## Smart Contracts

### 1. FreelanceMarketplace.sol

> Main hub contract for job posting, applications, escrow, and completion flow.

**Inherits:** `ReentrancyGuard`

**Constants:**
| Constant | Value | Description |
|----------|-------|-------------|
| `platformFee` | 250 (2.5%) | Platform fee in basis points |
| `AUTO_RELEASE_PERIOD` | 7 days | Auto-release timeout for ghosting protection |
| `GHOSTING_PENALTY` | 300 (3%) | Penalty deducted if client ghosts |
| `REFERRAL_REWARD` | 100 (1%) | Referral reward percentage |
| `MAX_REFERRAL_JOBS` | 5 | Max jobs eligible for referral reward |

**Enums:**
```solidity
enum JobStatus { Open, InProgress, UnderReview, Completed, Disputed, Cancelled }
```

**Structs:**
```solidity
struct Job {
    uint256 id;
    address client;
    address freelancer;
    string title;
    string description;
    uint256 budget;
    uint256 escrowAmount;
    address paymentToken;          // address(0) for ETH
    SkillBadges.SkillCategory requiredSkill;
    SkillBadges.BadgeTier minimumTier;
    JobStatus status;
    uint256 createdAt;
    uint256 deadline;
    uint256 deliverableSubmittedAt;
    string deliverableHash;
    address referredBy;
}

struct Application {
    address freelancer;
    string proposal;
    uint256 timestamp;
    bool accepted;
}
```

**Events:**
- `JobPosted(uint256 indexed jobId, address indexed client, string title, uint256 budget, SkillCategory requiredSkill)`
- `ApplicationSubmitted(uint256 indexed jobId, address indexed freelancer, string proposal)`
- `ApplicationAccepted(uint256 indexed jobId, address indexed freelancer)`
- `JobStarted(uint256 indexed jobId, address indexed freelancer)`
- `DeliverableSubmitted(uint256 indexed jobId, string deliverableHash)`
- `JobCompleted(uint256 indexed jobId, address indexed freelancer, uint256 amount)`
- `JobDisputed(uint256 indexed jobId)`
- `DisputeResolved(uint256 indexed jobId, bool inFavorOfFreelancer)`
- `JobCancelled(uint256 indexed jobId)`
- `AutoReleaseClaimed(uint256 indexed jobId, address indexed freelancer, uint256 amount, uint256 penalty)`
- `ReferralRewardPaid(address indexed referrer, address indexed referee, uint256 indexed jobId, uint256 amount)`
- `TokenAdded(address indexed token, string symbol)`
- `TokenRemoved(address indexed token)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `postJob(title, description, budget, requiredSkill, minimumTier, deadline)` | Public (payable) | Post a job with ETH escrow |
| `postJobWithToken(title, description, budget, paymentToken, requiredSkill, minimumTier, deadline)` | Public | Post a job with ERC20 token escrow |
| `applyForJob(jobId, proposal)` | Public | Apply for a job (requires matching skill badge + tier) |
| `acceptApplication(jobId, applicationIndex)` | Client only | Accept a freelancer's application |
| `submitDeliverable(jobId, deliverableHash)` | Freelancer only | Submit work deliverable |
| `approveDeliverable(jobId, rating, review)` | Client only | Approve work and release payment |
| `claimAfterTimeout(jobId)` | Freelancer only | Claim funds after 7-day ghosting period |
| `canClaimAutoRelease(jobId)` | View | Check if auto-release is available |
| `timeUntilAutoRelease(jobId)` | View | Seconds remaining until auto-release |
| `raiseDispute(jobId)` | Client/Freelancer | Open a dispute on the job |
| `resolveDispute(jobId, inFavorOfFreelancer, freelancerPercentage)` | Owner only | Resolve a dispute |
| `cancelJob(jobId)` | Client only | Cancel an open job and refund |
| `setReferrer(referrer)` | Public | Set referral relationship |
| `addSupportedToken(token)` | Owner only | Whitelist an ERC20 token |
| `removeSupportedToken(token)` | Owner only | Remove a whitelisted token |
| `getJobApplications(jobId)` | View | Get all applications for a job |
| `getAllJobs()` | View | Get all jobs |
| `getOpenJobs()` | View | Get all open jobs |
| `getClientJobs(client)` | View | Get jobs posted by a client |
| `getFreelancerApplications(freelancer)` | View | Get jobs a freelancer applied to |
| `updatePlatformFee(newFee)` | Owner only | Update platform fee |
| `updatePlatformWallet(newWallet)` | Owner only | Update fee recipient |

---

### 2. SkillBadges.sol

> ERC-721 soulbound NFT contract for skill verification with tiered progression.

**Inherits:** `ERC721, ERC721URIStorage, Ownable`

**Enums:**
```solidity
enum SkillCategory {
    UIUXDesign, WebDevelopment, MobileDevelopment, BlockchainDevelopment,
    DataScience, DevOps, RustDevelopment, SolidityDevelopment,
    GraphicDesign, ContentWriting, VideoEditing, DigitalMarketing,
    ProjectManagement, Other
}

enum BadgeTier { BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, LEGEND }
```

**Struct:**
```solidity
struct Skill {
    string name;
    SkillCategory category;
    uint256 timestamp;
    uint256 score;                 // Quiz score (0-100)
    BadgeTier tier;                // Current tier
    uint256 jobsInSkill;           // Jobs completed in this skill
    uint256 totalEarningsInSkill;  // Total earned in this skill
    uint256 totalRatingPoints;     // Sum of all ratings
    uint256 lastUpdated;           // Last tier change timestamp
}
```

**Tier Requirements:**

| Tier | Jobs | Min Avg Rating | Min Earnings |
|------|------|---------------|--------------|
| Bronze | 0-2 | -- | -- |
| Silver | 3+ | 4.5 | -- |
| Gold | 10+ | 4.7 | $2,000+ |
| Platinum | 25+ | 4.8 | $10,000+ |
| Diamond | 50+ | 4.9 | $50,000+ |
| Legend | 100+ | 4.9 | $200,000+ |

**Events:**
- `SkillBadgeMinted(address indexed recipient, uint256 indexed tokenId, string skillName, SkillCategory category, uint256 score)`
- `SkillBadgeUpgraded(address indexed user, uint256 indexed tokenId, SkillCategory category, BadgeTier oldTier, BadgeTier newTier, uint256 jobsCompleted)`
- `SkillJobRecorded(address indexed user, SkillCategory category, uint256 jobsInSkill, uint256 earnings, uint8 rating)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `mintSkillBadge(recipient, skillName, category, score, tokenURI)` | Owner only | Mint a new skill badge (Bronze) |
| `recordJobInSkill(user, category, earnings, rating)` | Owner only | Record job completion, auto-upgrade tier |
| `getUserSkills(user)` | View | Get all token IDs for a user |
| `getSkillDetails(tokenId)` | View | Get full skill details |
| `getUserSkillTokenId(user, category)` | View | Get token ID for a user's skill |
| `getUserSkillTier(user, category)` | View | Get current tier for a skill |
| `userHasSkill(user, category)` | View | Check if user has a skill badge |

**Soulbound:** Transfers are disabled. Badges are non-transferable.

---

### 3. JobBadges.sol

> ERC-721 soulbound NFT contract for job completion records and reputation tracking.

**Inherits:** `ERC721, ERC721URIStorage`

**Enums:**
```solidity
enum UserRole { Freelancer, Client }
```

**Struct:**
```solidity
struct JobBadge {
    uint256 jobId;
    address recipient;
    UserRole role;
    uint256 amount;
    uint256 timestamp;
    uint8 rating;
    string review;
}
```

**Events:**
- `JobBadgeMinted(address indexed recipient, uint256 indexed tokenId, uint256 jobId, UserRole role, uint256 amount, uint8 rating)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `mintJobBadge(recipient, jobId, role, amount, rating, review, tokenURI)` | Public | Mint a job completion badge |
| `getUserJobBadges(user)` | View | Get all job badge token IDs |
| `getJobBadgeDetails(tokenId)` | View | Get full badge details |
| `getUserStats(user)` | View | Get (reputationScore, completedJobs, totalEarnings) |

**Tracked Stats:**
- `reputationScores[address]` - Cumulative reputation score
- `completedJobs[address]` - Total jobs completed
- `totalEarnings[address]` - Total amount earned

---

### 4. EscrowPayment.sol

> Simple milestone-based escrow for ETH payments.

**Struct:**
```solidity
struct EscrowContract {
    address payable creator;
    address payable recipient;
    uint256 totalAmount;
    uint256 releasedAmount;
    Milestone[] milestones;
    bool cancelled;
    bool completed;
    uint256 createdAt;
}

struct Milestone {
    string description;
    uint256 amount;
    bool released;
}
```

**Events:**
- `ContractCreated(uint256 indexed contractId, address indexed creator, address indexed recipient, uint256 totalAmount, uint256 milestoneCount)`
- `MilestoneReleased(uint256 indexed contractId, uint256 milestoneIndex, uint256 amount, address recipient)`
- `ContractCompleted(uint256 indexed contractId)`
- `ContractCancelled(uint256 indexed contractId)`
- `RefundIssued(uint256 indexed contractId, uint256 amount)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `createContract(recipient, descriptions[], amounts[])` | Public (payable) | Create escrow with milestones |
| `releaseMilestone(contractId, milestoneIndex)` | Creator only | Release a milestone payment |
| `cancelContract(contractId)` | Creator only | Cancel and refund remaining |
| `getContract(contractId)` | View | Get contract details |
| `getMilestone(contractId, milestoneIndex)` | View | Get milestone details |
| `getAllMilestones(contractId)` | View | Get all milestones |
| `getUserContracts(user)` | View | Get user's escrow contracts |
| `getTotalContracts()` | View | Get total contract count |

---

### 5. EscrowPaymentToken.sol

> Milestone-based escrow supporting ETH, USDT, USDC, and custom ERC20 tokens.

**Inherits:** `ReentrancyGuard`

**Enums:**
```solidity
enum PaymentToken { ETH, USDT, USDC, CUSTOM }
```

**Constructor:**
```solidity
constructor(address _usdtAddress, address _usdcAddress)
```

**Deployed with (Arbitrum One):**
- USDT: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`
- USDC: `0xaf88d065e77c8cC2239327C5EDb3A432268e5831`

**Events:**
- `ContractCreated(uint256 indexed contractId, address indexed creator, address indexed recipient, uint256 totalAmount, uint256 milestoneCount, PaymentToken tokenType, address tokenAddress)`
- `MilestoneReleased(uint256 indexed contractId, uint256 milestoneIndex, uint256 amount, address recipient)`
- `ContractCompleted(uint256 indexed contractId)`
- `ContractCancelled(uint256 indexed contractId)`
- `RefundIssued(uint256 indexed contractId, uint256 amount)`
- `TokenAddressesUpdated(address usdt, address usdc)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `createContractETH(recipient, descriptions[], amounts[])` | Public (payable) | Create ETH escrow |
| `createContractToken(recipient, descriptions[], amounts[], tokenType)` | Public | Create USDT/USDC escrow |
| `createContractCustomToken(recipient, descriptions[], amounts[], tokenAddress)` | Public | Create custom ERC20 escrow |
| `releaseMilestone(contractId, milestoneIndex)` | Creator only | Release a milestone |
| `cancelContract(contractId)` | Creator only | Cancel and refund |
| `updateTokenAddresses(usdt, usdc)` | Public | Update token addresses |
| `getContract(contractId)` | View | Get contract details |
| `getMilestone(contractId, milestoneIndex)` | View | Get milestone details |
| `getAllMilestones(contractId)` | View | Get all milestones |
| `getUserContracts(user)` | View | Get user's contracts |
| `getTotalContracts()` | View | Total contract count |

---

### 6. DisputeResolution.sol

> Admin-mediated dispute resolution with evidence submission and fund distribution.

**Inherits:** `ReentrancyGuard, AccessControl`

**Roles:**
- `DEFAULT_ADMIN_ROLE` - Can add/remove admins
- `ADMIN_ROLE` - Can update dispute status, resolve disputes, view open disputes

**Enums:**
```solidity
enum DisputeStatus { Open, UnderReview, Resolved, Cancelled }
enum DisputeWinner { None, Client, Freelancer, Split }
```

**Struct:**
```solidity
struct Dispute {
    uint256 disputeId;
    uint256 jobId;
    address client;
    address freelancer;
    uint256 amount;
    string clientEvidence;
    string freelancerEvidence;
    DisputeStatus status;
    DisputeWinner winner;
    string resolution;
    address resolvedBy;
    uint256 createdAt;
    uint256 resolvedAt;
}
```

**Events:**
- `DisputeCreated(uint256 indexed disputeId, uint256 indexed jobId, address indexed client, address freelancer, uint256 amount)`
- `EvidenceSubmitted(uint256 indexed disputeId, address indexed submitter, string evidence)`
- `DisputeStatusUpdated(uint256 indexed disputeId, DisputeStatus status)`
- `DisputeResolved(uint256 indexed disputeId, DisputeWinner winner, string resolution, address indexed resolvedBy)`

**Functions:**

| Function | Access | Description |
|----------|--------|-------------|
| `createDispute(jobId, client, freelancer, amount, evidence)` | Client/Freelancer (payable) | Create dispute and lock funds |
| `submitEvidence(disputeId, evidence)` | Client/Freelancer | Submit or update evidence |
| `updateDisputeStatus(disputeId, status)` | Admin only | Update dispute status |
| `resolveDispute(disputeId, winner, resolution)` | Admin only | Resolve and distribute funds |
| `getDispute(disputeId)` | View | Get dispute details |
| `getUserDisputes(user)` | View | Get user's dispute IDs |
| `getAllOpenDisputes()` | Admin only | Get all open/under-review disputes |
| `addAdmin(admin)` | Default Admin | Grant admin role |
| `removeAdmin(admin)` | Default Admin | Revoke admin role |
| `getTotalDisputes()` | View | Get total dispute count |

**Resolution Outcomes:**
- **Client wins:** Full amount returned to client
- **Freelancer wins:** Full amount sent to freelancer
- **Split:** 50/50 split between both parties

---

## Contract Interaction Diagram

```
                    +---------------------------+
                    |   FreelanceMarketplace     |
                    |   (Main Hub)               |
                    +---------------------------+
                   /              |               \
                  /               |                \
    +----------------+   +----------------+   +-------------------+
    |  SkillBadges   |   |   JobBadges    |   |  ERC20 Tokens     |
    |  (ERC721)      |   |   (ERC721)     |   |  (USDT/USDC)      |
    +----------------+   +----------------+   +-------------------+
    | - Skill verify |   | - Job records  |
    | - Tier system  |   | - Reputation   |
    | - Soulbound    |   | - Soulbound    |
    +----------------+   +----------------+

    +---------------------------+   +---------------------------+
    |     EscrowPayment         |   |   EscrowPaymentToken      |
    |     (ETH only)            |   |   (ETH + ERC20)           |
    +---------------------------+   +---------------------------+
    | - Milestone-based         |   | - Multi-token support     |
    | - Create/Release/Cancel   |   | - USDT, USDC, Custom      |
    +---------------------------+   +---------------------------+

    +---------------------------+
    |    DisputeResolution      |
    +---------------------------+
    | - Evidence submission     |
    | - Admin arbitration       |
    | - Fund distribution       |
    +---------------------------+
```

---

## Deployed Contracts

### Arbitrum One (Mainnet)

| Contract | Address | Arbiscan |
|----------|---------|----------|
| SkillBadges | `0xFc4EDCF2CA8068b2A750Ad4507297aba0807CdC5` | [View](https://arbiscan.io/address/0xFc4EDCF2CA8068b2A750Ad4507297aba0807CdC5) |
| JobBadges | `0x962A00d762692F8692B90914577d5191e79a514b` | [View](https://arbiscan.io/address/0x962A00d762692F8692B90914577d5191e79a514b) |
| FreelanceMarketplace | `0x7292c3Bef25159Fb4119A8CF48AAa027596C7fFD` | [View](https://arbiscan.io/address/0x7292c3Bef25159Fb4119A8CF48AAa027596C7fFD) |
| EscrowPayment | `0x9F881e3A5F4Fc1621D3CC2fDc187E8302dc50A96` | [View](https://arbiscan.io/address/0x9F881e3A5F4Fc1621D3CC2fDc187E8302dc50A96) |
| EscrowPaymentToken | `0x4F64da35DA275fC052a01a78603500e592059Cb9` | [View](https://arbiscan.io/address/0x4F64da35DA275fC052a01a78603500e592059Cb9) |
| DisputeResolution | `0xdc36c3251e56b635a9B4F188389764Cd235939d2` | [View](https://arbiscan.io/address/0xdc36c3251e56b635a9B4F188389764Cd235939d2) |

**Network:** Arbitrum One
**Chain ID:** 42161
**Block Explorer:** https://arbiscan.io
**Deployer:** `0x76f61EA62C5A8F0b38D820F66DAF546f7Fa6015c`

**Stablecoin Addresses (Arbitrum One):**
| Token | Address | Arbiscan |
|-------|---------|----------|
| USDT | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | [View](https://arbiscan.io/address/0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9) |
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | [View](https://arbiscan.io/address/0xaf88d065e77c8cC2239327C5EDb3A432268e5831) |

### Arbitrum Sepolia (Testnet)

| Contract | Address | Arbiscan |
|----------|---------|----------|
| SkillBadges | `0x4F64da35DA275fC052a01a78603500e592059Cb9` | [View](https://sepolia.arbiscan.io/address/0x4F64da35DA275fC052a01a78603500e592059Cb9) |
| JobBadges | `0xdc36c3251e56b635a9B4F188389764Cd235939d2` | [View](https://sepolia.arbiscan.io/address/0xdc36c3251e56b635a9B4F188389764Cd235939d2) |
| FreelanceMarketplace | `0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e` | [View](https://sepolia.arbiscan.io/address/0xC834E963769b838a8cc4C39Ac3E26D3E48A9CE3e) |
| EscrowPayment | `0x3CE0f5071AaEc15F519a606BEe5D08c7eFA78461` | [View](https://sepolia.arbiscan.io/address/0x3CE0f5071AaEc15F519a606BEe5D08c7eFA78461) |
| EscrowPaymentToken | `0xfFFEaA39336E9E749091f3e10Baf958a909f69Ae` | [View](https://sepolia.arbiscan.io/address/0xfFFEaA39336E9E749091f3e10Baf958a909f69Ae) |
| DisputeResolution | `0xAeE0640726c7225053F1Bd65fB72A0bD23F0a80E` | [View](https://sepolia.arbiscan.io/address/0xAeE0640726c7225053F1Bd65fB72A0bD23F0a80E) |

**Network:** Arbitrum Sepolia Testnet
**Chain ID:** 421614
**Block Explorer:** https://sepolia.arbiscan.io

---

## Frontend

### Pages

| Page | Path | Description |
|------|------|-------------|
| Home | `/` | Landing page with features, how-it-works, and live activity feed |
| Jobs | `/jobs` | Browse and search open jobs |
| Job Detail | `/jobs/[id]` | View job details, apply, submit deliverables, chat |
| Post Job | `/post-job` | 4-step wizard: Details > Requirements > Budget > Review |
| Skills | `/skills` | Take skill tests and earn NFT badges |
| Profile | `/profile` | View/search user profiles, badges, and reputation |
| Payments | `/payments` | Manage escrow contracts and milestone payments |
| Admin | `/admin` | Admin panel for disputes, users, and platform stats |

### Components

| Component | Description |
|-----------|-------------|
| `Header` | Navigation bar with wallet connection |
| `Footer` | Site footer with links and branding |
| `ChatBox` | Firebase-powered real-time messaging |
| `AISuggestions` | AI-powered job suggestions using Gemini |
| `RatingModal` | Rate and review after job completion |
| `UserRatingsDisplay` | Display user ratings and reviews |
| `LiveActivityFeed` | Real-time platform activity feed |
| `SkillLeaderboard` | Skill-based leaderboard rankings |
| `RankBadge` | Visual badge tier display component |
| `UsernameSetupModal` | First-time user profile setup |
| `UserManagementTab` | Admin user management interface |

### Contexts & Hooks

| Module | Description |
|--------|-------------|
| `Web3Context` | Wallet connection, provider, signer, contract instances |
| `useEscrowContract` | Escrow contract interaction hook |
| `useSocket` | Socket.IO connection for real-time updates |
| `useTokenBalances` | Token balance queries |

### Configuration

| File | Description |
|------|-------------|
| `frontend/src/lib/contracts.ts` | Contract addresses and chain config |
| `frontend/src/config/tokens.ts` | Supported token definitions (ETH, USDT, USDC) |
| `frontend/src/config/arbitrum-config.ts` | Auto-generated Arbitrum Sepolia config |
| `frontend/src/config/contracts.json` | Auto-generated contract addresses (JSON) |
| `frontend/src/lib/abis/` | Contract ABI files for ethers.js |

---

## Backend

### API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/users` | POST | Create/update user profile |
| `/api/users/:address` | GET | Get user by wallet address |
| `/api/users/search` | GET | Search users |
| `/api/chat/messages` | GET/POST | Get/send messages |
| `/api/notifications` | GET/POST | Get/create notifications |
| `/api/notifications/:id/read` | PUT | Mark notification as read |
| `/api/activity` | GET/POST | Get/log platform activity |
| `/api/ratings` | POST | Submit a rating |
| `/api/ratings/:address` | GET | Get ratings for a user |
| `/api/disputes` | GET/POST | Get/create disputes |
| `/api/disputes/:id` | PUT | Update dispute |
| `/api/escrow` | GET/POST | Get/create escrow records |
| `/api/ai/suggestions` | POST | Get AI job suggestions |

### Models

| Model | Description |
|-------|-------------|
| `User` | Wallet address, username, display name, email, role, rank |
| `Message` | Chat messages between users |
| `Notification` | Platform notifications |
| `Activity` | Activity log entries |
| `Rating` | Job ratings and reviews |
| `Dispute` | Off-chain dispute tracking |
| `Escrow` | Off-chain escrow record tracking |

### Services

| Service | Description |
|---------|-------------|
| `ai.service.ts` | Google Generative AI (Gemini) integration |
| `email.service.ts` | Nodemailer SMTP email notifications |
| `socket.service.ts` | Socket.IO real-time event handling |

---

## Tiered Badge System

Badges are dynamic NFTs that level up based on real-world performance.

### Tier Progression

| Tier | Jobs | Min Rating | Min Earnings | Description |
|------|------|-----------|-------------|-------------|
| Bronze | 0-2 | -- | -- | Entry level (pass quiz) |
| Silver | 3+ | 4.5 | -- | Proven freelancer |
| Gold | 10+ | 4.7 | $2,000+ | Experienced professional |
| Platinum | 25+ | 4.8 | $10,000+ | Elite specialist |
| Diamond | 50+ | 4.9 | $50,000+ | Master craftsperson |
| Legend | 100+ | 4.9 | $200,000+ | Industry leader |

### How It Works

1. **Take a quiz** - Pass with 70%+ to earn a Bronze badge (minted as soulbound NFT)
2. **Complete jobs** - Each job in that skill category counts toward progression
3. **Auto-upgrade** - Smart contract checks tier requirements after each job
4. **On-chain event** - `SkillBadgeUpgraded` event emitted on tier change

### Skill Categories (14)

UIUXDesign, WebDevelopment, MobileDevelopment, BlockchainDevelopment, DataScience, DevOps, RustDevelopment, SolidityDevelopment, GraphicDesign, ContentWriting, VideoEditing, DigitalMarketing, ProjectManagement, Other

---

## Payment System

### Supported Tokens

| Token | Address (Arbitrum One) | Decimals |
|-------|------------------------|----------|
| ETH | Native (address(0)) | 18 |
| USDT | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | 6 |
| USDC | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 |

### Fee Structure

| Fee | Percentage | Description |
|-----|-----------|-------------|
| Platform Fee | 2.5% | Deducted from job payment |
| Ghosting Penalty | 3% | Deducted if freelancer claims via auto-release |
| Referral Reward | 1% | Paid to referrer (first 5 jobs per referrer) |

### Payment Flow

```
Client posts job (funds locked in contract)
    |
Freelancer submits deliverable
    |
Client approves → Payment released:
    ├── Freelancer receives: budget - platformFee - referralReward
    ├── Platform receives: platformFee (2.5%)
    └── Referrer receives: referralReward (1%, if applicable)
```

### Anti-Ghosting Protection

If a client doesn't respond within **7 days** after deliverable submission:
- Freelancer can call `claimAfterTimeout()`
- Freelancer receives budget minus 3% ghosting penalty
- Ghosting penalty goes to platform wallet

---

## Security Features

| Feature | Description |
|---------|-------------|
| **Escrow** | Funds locked in smart contract until job completion |
| **Soulbound Badges** | Skill and job badges are non-transferable (prevents trading) |
| **ReentrancyGuard** | Protection against reentrancy attacks on all payment functions |
| **AccessControl** | Role-based admin access for dispute resolution |
| **Badge Verification** | On-chain check that applicants hold required skill badge + tier |
| **Anti-Ghosting** | 7-day auto-release protects freelancers from unresponsive clients |
| **SafeERC20** | Safe token transfer handling via OpenZeppelin |
| **Quiz Randomization** | 500+ question pool prevents cheating on skill tests |

---

## Environment Variables

### Root `.env`

```env
PRIVATE_KEY=your_wallet_private_key
ARBITRUM_SEPOLIA_RPC_URL=https://sepolia-rollup.arbitrum.io/rpc
ARBITRUM_ONE_RPC_URL=https://arb1.arbitrum.io/rpc
```

### Backend `.env`

```env
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
MAX_FILE_SIZE=5242880
GEMINI_API_KEY=your_gemini_api_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email
SMTP_PASS=your_password
SMTP_FROM=ArbLance <noreply@arblance.io>
```

### Frontend `.env`

```env
# "mainnet" for Arbitrum One, "testnet" for Arbitrum Sepolia
NEXT_PUBLIC_NETWORK_MODE=mainnet

NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_SOCKET_URL=http://localhost:5001

# Contract Addresses (Arbitrum One)
NEXT_PUBLIC_MARKETPLACE_ADDRESS=0x7292c3Bef25159Fb4119A8CF48AAa027596C7fFD
NEXT_PUBLIC_SKILL_BADGES_ADDRESS=0xFc4EDCF2CA8068b2A750Ad4507297aba0807CdC5
NEXT_PUBLIC_JOB_BADGES_ADDRESS=0x962A00d762692F8692B90914577d5191e79a514b
NEXT_PUBLIC_ESCROW_PAYMENT_ADDRESS=0x9F881e3A5F4Fc1621D3CC2fDc187E8302dc50A96
NEXT_PUBLIC_ESCROW_PAYMENT_TOKEN_ADDRESS=0x4F64da35DA275fC052a01a78603500e592059Cb9
NEXT_PUBLIC_DISPUTE_RESOLUTION_ADDRESS=0xdc36c3251e56b635a9B4F188389764Cd235939d2

# Token Addresses (Arbitrum One)
NEXT_PUBLIC_USDT_ADDRESS=0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9
NEXT_PUBLIC_USDC_ADDRESS=0xaf88d065e77c8cC2239327C5EDb3A432268e5831

# Firebase (optional)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

---

## Project Structure

```
arblance/
├── contracts/                     # Solidity smart contracts
│   ├── FreelanceMarketplace.sol   # Main marketplace logic
│   ├── SkillBadges.sol            # Skill NFT badges (ERC721)
│   ├── JobBadges.sol              # Job completion badges (ERC721)
│   ├── EscrowPayment.sol          # ETH escrow
│   ├── EscrowPaymentToken.sol     # Multi-token escrow
│   └── DisputeResolution.sol      # Dispute arbitration
│
├── scripts/                       # Deployment scripts
│   ├── deploy-all-arbitrum.js     # Full Arbitrum deployment
│   ├── deploy.js                  # Generic deployment
│   └── deploy-escrow.js           # Escrow-only deployment
│
├── deployments/                   # Deployment artifacts
│   └── arbitrum-sepolia-latest.json
│
├── frontend/                      # Next.js frontend
│   └── src/
│       ├── pages/                 # Next.js pages
│       │   ├── index.tsx          # Home
│       │   ├── jobs.tsx           # Job listing
│       │   ├── jobs/[id].tsx      # Job detail
│       │   ├── post-job.tsx       # Post job wizard
│       │   ├── skills.tsx         # Skill tests
│       │   ├── profile.tsx        # User profiles
│       │   ├── payments.tsx       # Payment management
│       │   └── admin.tsx          # Admin panel
│       ├── components/            # React components
│       ├── contexts/              # React contexts (Web3)
│       ├── hooks/                 # Custom hooks
│       ├── lib/                   # Utilities, ABIs, contracts
│       ├── config/                # Token & network config
│       ├── services/              # API service
│       ├── types/                 # TypeScript types
│       └── styles/                # Global CSS
│
├── backend/                       # Express.js backend
│   └── src/
│       ├── server.ts              # Express app entry point
│       ├── config/                # Database config
│       ├── models/                # Mongoose models
│       ├── controllers/           # Route controllers
│       ├── routes/                # API routes
│       └── services/              # AI, email, socket services
│
├── hardhat.config.js              # Hardhat configuration
├── package.json                   # Monorepo root package
├── README.md                      # Project overview
├── DOCUMENTATION.md               # This file
└── TIERED_BADGE_SYSTEM.md         # Badge system deep dive
```

---

## Deployment Guide

### Prerequisites

- Node.js 18+
- MetaMask or any EVM wallet
- For testnet: Arbitrum Sepolia ETH ([Faucet](https://faucet.quicknode.com/arbitrum/sepolia))
- For mainnet: ~$3-5 ETH on Arbitrum One ([Bridge](https://bridge.arbitrum.io))

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Configure Environment

```bash
# Root level
cp .env.example .env
# Add PRIVATE_KEY and ARBITRUM_SEPOLIA_RPC_URL

# Backend
cp backend/.env.example backend/.env
# Add MONGODB_URI and other config
```

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Deploy Contracts

```bash
# Testnet (Arbitrum Sepolia)
npm run deploy:testnet

# Mainnet (Arbitrum One) — requires ~$3-5 ETH on Arbitrum
npm run deploy:mainnet
```

This will:
- Deploy all 6 contracts
- Save addresses to `deployments/<network>-latest.json`
- Generate `frontend/src/config/<network>-config.ts`
- Generate `frontend/src/config/contracts.json`
- Print all `NEXT_PUBLIC_*` env vars to copy into your frontend `.env`

### 5. Start Development Servers

```bash
# Start both backend and frontend
npm run dev:all

# Or separately:
npm run dev:backend   # Backend on port 5001
npm run dev           # Frontend on port 3000
```

### 6. Local Development (Optional)

```bash
# Terminal 1: Start local Hardhat node
npm run node

# Terminal 2: Deploy locally
npm run deploy:local

# Terminal 3: Start servers
npm run dev:all
```

---

## License

MIT License

---

**ArbLance - The Decentralized Future of Freelancing on Arbitrum**
