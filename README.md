# ⚡ ChainTrace

<div align="center">

**Cross-Border Supply Chain Milestone Escrow & Financing**

*Trustless trade coordination and payments secured by Stellar Soroban smart contracts*

[![Live Demo](https://img.shields.io/badge/Live_Demo-chain--trace.netlify.app-6366f1?style=for-the-badge&logo=netlify)](https://chain-trace.netlify.app/)
[![GitHub](https://img.shields.io/badge/Source_Code-BhagatWeb%2FChainTrace-181717?style=for-the-badge&logo=github)](https://github.com/BhagatWeb/ChainTrace)
[![Network](https://img.shields.io/badge/Network-Stellar_Testnet-00B4D8?style=for-the-badge&logo=stellar)](https://stellar.expert/explorer/testnet)
[![Built for RiseIn](https://img.shields.io/badge/Built_for-RiseIn_Level_4-f59e0b?style=for-the-badge)](https://www.risein.com/)

</div>

---

## 📋 Table of Contents

1. [Problem Statement](#-problem-statement)
2. [Submission Updates](#-submission-updates)
3. [Why Stellar?](#-why-stellar)
4. [Live Deployment](#-live-deployment)
5. [Contract Addresses & Transactions](#-contract-addresses--transactions)
6. [User Onboarding & Feedback](#-user-onboarding--feedback)
7. [Architecture](#-architecture)
8. [Smart Contracts](#-smart-contracts)
9. [Production Hardening (Level 4)](#-production-hardening-level-4)
10. [Tech Stack](#-tech-stack)
11. [Project Structure](#-project-structure)
12. [Testing](#-testing)
13. [CI/CD Pipeline](#-cicd-pipeline)
14. [Local Development](#-local-development)
15. [Roadmap](#-roadmap)
16. [Author](#-author)

---

## 🔴 Problem Statement

Cross-border supply chains suffer from severe counterparty risks, operational opacity, and working capital deficits that disproportionately harm SMEs.

| Issue | Impact |
|-------|--------|
| **Lack of Payment Security** | Suppliers fear shipping goods without advance payments, while Buyers fear losing funds to untrusted shipments. |
| **Coarse-Grained Payouts** | Rigid payment terms (Letters of Credit) prevent incremental payouts that match real-world logistics progress. |
| **Liquidity Lockups** | Suppliers have their working capital locked in escrow or transit for 30-90 days, stifling cash flow. |
| **Opaque Disputes** | If goods are damaged or misrouted, funds get locked up indefinitely due to a lack of transparent state resolution. |

**ChainTrace** eliminates these inefficiencies by replacing legacy trade finance rails with programmable Soroban smart contracts. Buyers lock funds in an on-chain escrow vault; funds are automatically released to suppliers incrementally based on verifiable logistics milestones—no costly banking intermediaries required.

---

## 🚀 Submission Updates

Sprint Summary: 31 commits (12 fixes · 11 features · 8 tests) delivering end-to-end security hardening, on-chain dispute resolution, factoring calculator utilities, and expanded test coverage.

### 🛡️ Bug Fixes

| File | Issue / Bug Description | Resolution / Fix Applied |
|---|---|---|
| `contracts/order-contract/src/lib.rs` | Missing input validation permitted zero or negative order amounts. | Added strict `amount > 0` validation panic check in `create_order`. |
| `contracts/escrow-contract/src/lib.rs` | Escrow deposits lacked lower-bound validation. | Enforced `amount > 0` positive check on buyer deposit invocations. |
| `contracts/escrow-contract/src/lib.rs` | Repeated deposits on the same order could overwrite existing escrow records. | Added active escrow existence guard preventing double deposits on active orders. |
| `contracts/escrow-contract/src/lib.rs` | Single release cleared entire escrow flag even on partial amount releases. | Added progressive milestone subtraction accounting and partial release support. |
| `contracts/finance-contract/src/lib.rs` | Factoring pool allowed zero/negative loan requests. | Enforced positive principal loan amount check in `request_loan`. |
| `contracts/finance-contract/src/lib.rs` | Borrowers could take duplicate active loans against the same order ID. | Added iteration check preventing multiple unpaid loans per order. |
| `contracts/order-contract/src/test.rs` | Unused variable warning `escrow_contract` during test compilation. | Prefixed with underscore `_escrow_contract` to clear Rust compiler lints. |
| `lib/stellar.ts` | High-precision decimal string conversions could fail on edge cases. | Hardened `stroopsToXlm` and `xlmToStroops` with defensive BigInt sanitization. |
| `lib/stellar.ts` | Address formatting could throw on empty or non-string values. | Added null/empty checks and length guard to `formatAddress`. |
| `vitest.config.ts` | Vitest runner matched extraneous template tests in `_web` subfolder. | Configured explicit `include: ['__tests__/**/*.test.{ts,tsx}']` and `exclude`. |
| `package.json` | Missing `@testing-library/dom` peer dependency for component tests. | Installed `@testing-library/dom` as direct devDependency. |

### ✨ New Features

- **On-Chain Dispute Mechanism**:
  - Added `OrderStatus::Disputed` status variant and `dispute_order(env, caller, order_id)` circuit in the Order Contract.
  - Added `disputeOrder` method to `OrderContractClient`.
  - Added interactive dispute trigger and refund handling for buyers and suppliers in Order Details view.
- **Milestone Progress Tracker (`components/orders/OrderProgress.tsx`)**:
  - Built a dynamic multi-stage visual pipeline showing real-time lifecycle status (Created ➔ Funded ➔ Shipped ➔ Delivered ➔ Completed).
  - Integrated dispute/refund warning badges and progress percentage calculations.
- **Trade Factoring & Advance Calculator (`components/finance/FactoringCalculator.tsx`)**:
  - Interactive liquidity calculator allowing suppliers to simulate advance rates (50%–90%), fixed 5% APR financing fees, and net instant payouts.
- **Dashboard Search, Filter & CSV Export**:
  - Real-time search by Order ID or Stellar public address.
  - Multi-status filter dropdown (All, Created, Funded, Shipped, Delivered, Passed, Failed, Disputed, Refunded).
  - One-click CSV export utility generating audit-ready order logs.
- **Live Network Health & Soroban RPC Latency Monitor (`components/ui/network-status.tsx`)**:
  - Live indicator in navigation bar tracking Stellar Testnet RPC health and ping response latency in milliseconds.

### 🧪 Test Additions

| Test File | Test Case | Target Covered |
|---|---|---|
| `contracts/order-contract/src/test.rs` | `test_create_order_zero_amount` | Rejection of non-positive order amounts |
| `contracts/order-contract/src/test.rs` | `test_order_dispute_and_refund` | Full dispute initiation and subsequent refund flow |
| `contracts/escrow-contract/src/test.rs` | `test_deposit_zero_amount` | Rejection of zero-value escrow deposits |
| `contracts/escrow-contract/src/test.rs` | `test_deposit_duplicate_active` | Guard against duplicate deposits on active escrows |
| `contracts/escrow-contract/src/test.rs` | `test_partial_release_and_full_completion` | Partial release milestone accounting |
| `contracts/escrow-contract/src/test.rs` | `test_refund_payment` | Direct refund execution to buyer |
| `contracts/finance-contract/src/test.rs` | `test_loan_zero_amount` | Validation on non-positive loan requests |
| `contracts/finance-contract/src/test.rs` | `test_duplicate_active_loan` | Prevention of multiple active loans per order |
| `contracts/finance-contract/src/test.rs` | `test_get_loan_by_order` | Order-to-loan lookup query validation |
| `__tests__/components/OrderProgress.test.tsx` | Stage & Status Render Tests (5 tests) | Progression rendering across created, funded, completed, disputed, refunded |
| `__tests__/components/FactoringCalculator.test.tsx` | Calculator & Slider Tests (2 tests) | Dynamic computation of advance amounts and 5% interest fees |
| `__tests__/lib/contracts.test.ts` | Constants & Client Methods (2 tests) | Status color/label completeness and client instantiation |

### 📜 Commit Timeline

| # | Type | Commit Message |
|---|---|---|
| 1 | Fix | Add positive amount validation to order contract creation |
| 2 | Fix | Add non-zero validation checks in escrow contract deposit handler |
| 3 | Test | Add unit test verifying order creation rejects zero or negative amounts |
| 4 | Fix | Harden Stroop to XLM conversion logic for high precision decimals |
| 5 | Fix | Add duplicate active deposit guard in escrow contract storage |
| 6 | Feature | Support partial release milestone accounting in escrow vault |
| 7 | Feature | Add disputed status variant and dispute order handler to order contract |
| 8 | Feature | Expose dispute order method in order contract client |
| 9 | Feature | Add dispute status badge styling and labels in constants |
| 10 | Test | Update order contract unit tests with full dispute resolution flow |
| 11 | Fix | Fix unused variable warning in order contract test suite |
| 12 | Fix | Prevent multiple active loans against same order in finance contract |
| 13 | Test | Add zero amount and duplicate loan validation tests in finance contract |
| 14 | Feature | Add order loan lookup query helper in finance contract |
| 15 | Fix | Harden wallet address truncation for edge case strings |
| 16 | Fix | Configure vitest test runner to isolate root test suites |
| 17 | Feature | Create interactive supply chain milestone progress bar component |
| 18 | Test | Add unit test suite for milestone progress component |
| 19 | Feature | Build trade factoring and loan interest calculator component |
| 20 | Test | Add unit tests for factoring calculator formula and bounds |
| 21 | Feature | Add on-chain dispute action trigger modal in order view |
| 22 | Feature | Integrate factoring calculator for suppliers in order details |
| 23 | Feature | Add live search and order filtering by address in dashboard |
| 24 | Feature | Add CSV export functionality for order history logs |
| 25 | Feature | Create live Soroban RPC network latency and ledger monitor component |
| 26 | Feature | Integrate network health monitor into navigation bar |
| 27 | Test | Add contract client integration and status mapping unit tests |
| 28 | Feature | Add hasActiveEscrow query method to escrow contract client |
| 29 | Fix | Install testing library DOM dev dependency for robust component testing |
| 30 | Feature | Update order details layout to incorporate milestone progress tracking |
| 31 | Documentation | Update README with sprint submission report, security audit, and test matrix |

---

## 🌟 Why Stellar?

ChainTrace relies on Stellar's unique network architecture to facilitate real-world global trade:

| Stellar Property | ChainTrace Benefit |
|-----------------|-------------------|
| **~5 second finality** | Suppliers receive instant payouts upon milestone completion instead of waiting days. |
| **Sub-cent fees ($0.00001)** | Enables micro-milestones and multi-party sign-offs without prohibitive gas costs. |
| **Soroban Inter-Contract Calls** | Our Order Contract securely commands the Escrow Vault Contract atomically on-chain. |
| **SEP Anchor Integrations** | SEP-24 and SEP-31 standards act as native fiat ramps, allowing buyers to fund in USD and suppliers to off-ramp directly to local currencies (MXN, BRL, EUR). |
| **Asset Issuance** | Seamless integration with digital USD (USDC) and Euro (EURC) for stable trade settlement. |

---

## 🌐 Live Deployment

| Resource | Link |
|----------|------|
| **Live dApp** | [chain-trace.netlify.app](https://chain-trace.netlify.app/) |
| **Demo Video** | [Google Drive — Walkthrough Recording](https://drive.google.com/file/d/1ZwH7PVVpRn0xglDTZJ7jcAVxRAkEZkoe/view?usp=sharing) |
| **Pitch Deck** | [Google Drive — Pitch Deck](https://drive.google.com/file/d/1ehN8ONZ233lX6yWpzm-RA3tozFmWYs5f/view?usp=sharing) |
| **GitHub Repo** | [BhagatWeb/-ChainTrace-](https://github.com/BhagatWeb/-ChainTrace-) |
| **User Feedback Form** | [ChainTrace Feedback — Google Forms](https://forms.gle/Ju4AKdxHGCp97H7b8) |
| **Onboarded Users & Wallet Interactions** | [Responses Spreadsheet — Google Sheets](https://docs.google.com/spreadsheets/d/1BIKNZ9Ui4aoT-zYhiy-bEGbCeGpJIyTETmLbed5Te2o/edit?usp=sharing) |

---

## 🔗 Contract Addresses & Transactions

All contracts are deployed and cross-initialized on the **Stellar Testnet**.

### Deployed Contract IDs

| Contract | Address |
|----------|---------|
| **Order Manager Contract** | `CB56DGFX43XUXN2OASKM3SF6I3WWNYUM6KE7HKUKX3JSLZPYQSRQXOHH` |
| **Escrow Vault Contract** | `CBAFHUW7TL73RG4KYSL53ZF4N4NCJK76KXL3NHKEDDWE2GPVHA52LJ47` |

### On-Chain Deployment Transactions

| Action | Transaction Hash |
|--------|-----------------|
| **Cross-linked Initialization** | [`7fb488cc...16ccb21`](https://stellar.expert/explorer/testnet/tx/7fb488cc3a32f6b3e7ff7de9ef652a921d743a129de9d28bc9ef2816ccb21f3a) |

---

## 👥 User Onboarding & Feedback

As part of the Level 4 production MVP requirements, we onboarded real users to validate the complete escrow lifecycle on the Stellar Testnet.

**Onboarding Journey:**

```
1. User installs Freighter/Albedo Wallet → Funds testnet account
2. Buyer creates an order with logistics milestones on ChainTrace
3. Buyer funds the on-chain escrow (Wallet signs; atomic ICC updates order status)
4. Logistics Provider marks cargo as shipped
5. Inspector clears customs and approves the milestone
6. Order ICCs Escrow → Payment is automatically released to Supplier
7. User submits feedback via the Google Form
```

| Resource | Link |
|----------|------|
| **Feedback Form** | [Submit Feedback](https://forms.gle/Ju4AKdxHGCp97H7b8) |
| **User Responses & Wallet Proof** | [View Spreadsheet](https://docs.google.com/spreadsheets/d/1BIKNZ9Ui4aoT-zYhiy-bEGbCeGpJIyTETmLbed5Te2o/edit?usp=sharing) |

---

## 🏗️ Architecture

ChainTrace is composed of dual Soroban smart contracts that communicate via Inter-Contract Calls (ICC), and a Next.js frontend that builds and submits signed Stellar transactions.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Next.js Frontend                             │
│                                                                     │
│  Landing │ Dashboard │ Analytics │ Order Details │ Direct Transfer  │
│                      StellarWalletsKit                              │
│                  (Freighter / xBull / Albedo)                       │
└──────────────────┬─────────────────────────────┬───────────────────┘
                   │ TypeScript Contract Clients  │
          ┌────────▼─────────┐         ┌─────────▼────────┐
          │  Order Contract  │──ICC──→ │ Escrow Contract  │
          │                  │         │                  │
          │  create_order()  │         │  deposit()       │
          │  update_         │         │  release_        │
          │    milestone()   │         │    funds()       │
          │  dispute()       │         │  refund()        │
          │  complete_       │         │                  │
          │    order()       │         │                  │
          └──────────────────┘         └──────────────────┘
                            Stellar Testnet
```

### Inter-Contract Communication (ICC) Flow

The ICC design securely isolates trade logic from capital custody. The Escrow Vault only moves funds when instructed by the state-machine inside the Order Contract.

```
Step 1:  Buyer calls create_order()        → Order created with status: Created
Step 2:  Buyer calls deposit()             → Escrow locks XLM
                                             Escrow ICCs → Order (marks Funded)
Step 3:  Logistics calls update_milestone()→ Order status transitions (Shipped, etc)
Step 4:  Inspector approves milestone      → Order ICCs → Escrow release_funds()
                                             Supplier receives XLM instantly
Step 5:  Buyer calls dispute()             → Order status: Disputed
                                             Funds locked until manual resolution
```

---

## 📜 Smart Contracts

### Order Manager Contract (`CB56DGFX43XUXN2OASKM3SF6I3WWNYUM6KE7HKUKX3JSLZPYQSRQXOHH`)

Manages the lifecycle, logistics tracking, and role-based access control for the supply chain.

| Function | Access | Description |
|----------|--------|-------------|
| `create_order()` | Buyer | Initialize a new trade order with milestones and roles |
| `update_milestone()`| Logistics/Inspector| Progress the state machine (Shipped -> Clear -> Delivered) |
| `dispute()` | Buyer/Supplier | Flag the shipment for manual resolution |
| `complete_order()` | Inspector | Finalize the trade and trigger remaining ICC payouts |

### Escrow Vault Contract (`CBAFHUW7TL73RG4KYSL53ZF4N4NCJK76KXL3NHKEDDWE2GPVHA52LJ47`)

Holds XLM/USDC in a secure vault and releases it only on instruction from the Order Contract.

| Function | Access | Description |
|----------|--------|-------------|
| `deposit()` | Buyer | Lock capital for a specific trade order |
| `release_funds()`| Order Contract only| Transfer partial/full amount to supplier |
| `refund()` | Order Contract only| Return remaining locked funds to the buyer |

---

## 🛡️ Production Hardening (Level 4)

The following production improvements were implemented and tested in Level 4:

### Frontend Production Quality & Monitoring

| Feature | Description |
|---------|-------------|
| **Vercel Analytics & Speed Insights** | Integrated `@vercel/analytics` directly into `app/layout.tsx` for live user metrics and web vitals tracking. |
| **System Telemetry Dashboard** | Built `/dashboard/analytics` to monitor simulated wallet events, transaction success rates, and contract invocations. |
| **Mobile-First UX** | Completely overhauled the landing page to feature a highly responsive, asymmetric Bento Grid layout for mobile parity. |
| **Global Error Handling** | Integrated `react-hot-toast` for unified, graceful error and loading states across all wallet and transaction flows. |
| **DeFi Factoring Integration** | Initial architecture added for collateralized loans (`finance-contract`), tracked in the telemetry dashboard. |

---

## 📸 Submission Screenshots

### 🖥️ Desktop Web UI (Clean Monochromatic Redesign)

<p align="center">
  <img src="./sub%20assets/ui1.png" width="45%" alt="Desktop UI 1" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./sub%20assets/ui2.png" width="45%" alt="Desktop UI 2" />
</p>
<p align="center">
  <img src="./sub%20assets/ui3.png" width="45%" alt="Desktop UI 3" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./sub%20assets/ui4.png" width="45%" alt="Desktop UI 4" />
</p>

### 📱 Mobile Responsive UI

<p align="center">
  <img src="./sub%20assets/mobui1.png" width="375" alt="Mobile UI Screenshot 1" />
  &nbsp;&nbsp;&nbsp;&nbsp;
  <img src="./sub%20assets/mobui2.png" width="375" alt="Mobile UI Screenshot 2" />
</p>

### 📊 System Telemetry & Live Analytics Dashboard

<p align="center">
  <img src="./sub%20assets/analytics.png" alt="Analytics Dashboard" />
</p>

### 🔄 CI/CD Pipeline

<p align="center">
  <img src="./sub%20assets/cicdss.png" alt="CI/CD Pipeline Run" />
</p>

---

## 🧪 Testing

### Test Summary

| Suite | Tests | Status |
|-------|-------|--------|
| Frontend (Vitest) | 21 tests | ✅ All Passing |
| Contracts (Rust) | 15 tests | ✅ All Passing |
| **Total** | **36 tests** | ✅ **36/36 Passing** |

### Frontend Tests (Vitest)

```bash
npm run test

 ✓ __tests__/lib/stellar.test.ts (6 tests)
 ✓ __tests__/lib/contracts.test.ts (2 tests)
 ✓ __tests__/components/Badge.test.tsx (3 tests)
 ✓ __tests__/components/Button.test.tsx (3 tests)
 ✓ __tests__/components/FactoringCalculator.test.tsx (2 tests)
 ✓ __tests__/components/OrderProgress.test.tsx (5 tests)
 
 Test Files  6 passed (6)
      Tests  21 passed (21)
```

### Contract Tests (Rust)

```bash
# Order Contract
test test::test_create_order ... ok
test test::test_create_order_zero_amount - should panic ... ok
test test::test_order_lifecycle ... ok
test test::test_order_dispute_and_refund ... ok

# Escrow Contract
test test::test_deposit ... ok
test test::test_deposit_zero_amount - should panic ... ok
test test::test_deposit_duplicate_active - should panic ... ok
test test::test_partial_release_and_full_completion ... ok
test test::test_refund_payment ... ok

# Finance Contract (Factoring Module)
test test::test_insufficient_liquidity - should panic ... ok
test test::test_loan_zero_amount - should panic ... ok
test test::test_loan_request ... ok
test test::test_get_loan_by_order ... ok
test test::test_loan_repayment ... ok
test test::test_duplicate_active_loan - should panic ... ok
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend Framework** | Next.js 14 (App Router) | SSR, file-based routing, production builds |
| **Styling** | Tailwind CSS | Utility-first CSS with custom monochromatic theme |
| **Smart Contracts** | Soroban (Rust SDK) | On-chain logistics tracking and escrow logic |
| **Blockchain SDK** | `@stellar/stellar-sdk` | Transaction building, XDR encoding, RPC calls |
| **Wallet Integration** | `stellar-wallets-kit` | Freighter, xBull, and Albedo multi-wallet support |
| **Testing** | Vitest + Cargo test | Unit and component testing across stack |
| **Monitoring** | Vercel Analytics | Production telemetry and web vitals |

---

## 📁 Project Structure

```
ChainTrace/
├── .github/
│   └── workflows/
│       └── ci.yml                    # Automated tests and builds on push
├── app/                              # Next.js App Router pages
│   ├── page.tsx                      # Landing page — bento grid, stats
│   ├── orders/
│   │   └── [id]/page.tsx             # Details & milestones for specific trades
│   ├── dashboard/
│   │   ├── page.tsx                  # Connect wallet & overview
│   │   └── analytics/page.tsx        # System telemetry dashboard
│   ├── transfer/page.tsx             # Direct P2P transfer module
│   └── layout.tsx                    # Root layout with Vercel Analytics injects
├── components/
│   ├── layout/                       # Navbar, Footer
│   └── ui/                           # Reusable UI components (Aurora, HelixButton)
├── contracts/                        # Rust Smart Contracts
│   ├── order-contract/
│   ├── escrow-contract/
│   └── finance-contract/
├── lib/
│   └── stellar.ts                    # Wallet connection, transaction formatting
└── package.json
```

---

## 🔄 CI/CD Pipeline

### Continuous Integration (`ci.yml`)

Triggered automatically on every push to `main`.

```
Push to main
     │
     ├── Frontend Job
     │     ├── npm install
     │     ├── npm run lint
     │     ├── npm run test      ← Vitest suite
     │     └── npm run build     ← Next.js production build validation
     │
     └── Contract Job
           ├── cargo build --target wasm32-unknown-unknown
           └── cargo test        ← Rust smart contract tests
```

---

## 🚀 Local Development

### Prerequisites

- **Node.js** 18+ or 20+
- **Rust** (with `wasm32-unknown-unknown` target)
- **Freighter Wallet** browser extension

### Installation

```bash
# Clone the repository
git clone https://github.com/BhagatWeb/-ChainTrace-.git
cd -ChainTrace-

# Install frontend dependencies
npm install

# Configure environment variables
cp .env.example .env.local
```

Edit `.env.local` with your contract IDs:

```env
NEXT_PUBLIC_ESCROW_CONTRACT_ID=CBAFHUW7TL73RG4KYSL53ZF4N4NCJK76KXL3NHKEDDWE2GPVHA52LJ47
NEXT_PUBLIC_ORDER_CONTRACT_ID=CB56DGFX43XUXN2OASKM3SF6I3WWNYUM6KE7HKUKX3JSLZPYQSRQXOHH
NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
```

```bash
# Start development server
npm run dev
# → http://localhost:3000
```

---

## 🗺️ Roadmap

### ✅ Level 3 (Complete)
- Dual Soroban smart contracts with Inter-Contract Communication
- Next.js 14 frontend with multi-wallet support
- Milestone-based escrow lifecycle
- CI/CD pipelines and comprehensive test suites

### ✅ Level 4 (Complete)
- Production-grade frontend with premium UI (Helix design system)
- Mobile Responsive layouts using customized Tailwind breakpoints
- Proper loading states and unified error handling (`react-hot-toast`)
- Vercel Analytics integration for production monitoring
- System Telemetry dashboard for tracking wallet connections
- 10+ real users onboarded with wallet proofs

### 🔜 Future Enhancements
- Deploy the `finance-contract` factoring module to Mainnet.
- Integrated dispute resolution voting system.
- SEP-31 native integrations for off-ramping to fiat directly in the dashboard.

---

## 👨‍💻 Author

**BhagatWeb** — [@BhagatWeb](https://github.com/BhagatWeb)

*Built for the [RiseIn Stellar dApp Development Program](https://www.risein.com/) — Level 4*
