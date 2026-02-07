# GhostWrite — Confidential Content Platform on Aleo

> Publish anonymously. Pay privately. Prove authorship on your terms.

GhostWrite is a privacy-preserving content publishing and monetization platform built on the Aleo blockchain. Writers publish under cryptographic anonymity, readers pay via Aleo credit transfers, and authors can selectively prove authorship later using zero-knowledge proofs — without ever revealing their identity to readers.

**Deployed on Aleo Testnet** · `ghostwrite_v1.aleo`

---

## The Problem

Content creators face a fundamental tension: they want to share ideas but risk retaliation, censorship, or identity exposure. Existing platforms like Medium, Substack, and Ghost tie content to real identities. Even "anonymous" platforms leak metadata — IP addresses, payment trails, timing analysis.

There is no platform where a writer can:
- Publish content with **zero identity linkage**
- Receive payment **without revealing who paid or who received**
- Later **prove they wrote something** without exposing themselves upfront

GhostWrite solves this using Aleo's native zero-knowledge proof system.

## Why Privacy Matters Here

| Scenario | Why Privacy is Critical |
|----------|----------------------|
| **Whistleblowers** | Expose corporate fraud without career destruction |
| **Journalists** | Publish in authoritarian regions without arrest risk |
| **Researchers** | Share controversial findings before peer review |
| **Political writers** | Express views without social or legal retaliation |
| **Anonymous creators** | Monetize work without doxxing |

Traditional anonymous publishing (Tor blogs, throwaway accounts) has no **monetization** and no **provable authorship**. GhostWrite combines both with on-chain privacy guarantees.

---

## Privacy Architecture

### On-Chain (Private via Aleo Records)

| Component | Privacy Level | Purpose |
|-----------|--------------|---------|
| `ContentRecord` | **Encrypted** — only author can decrypt | Proves content ownership, stores hashes and price |
| `AuthorshipProof` | **Encrypted** — selective disclosure | ZK-provable authorship, revealed only when author chooses |
| `AccessToken` | **Encrypted** — only buyer can decrypt | Proves purchase/access rights without revealing buyer identity |
| `published_content` mapping | **Public** — content hash, price, purchase count | On-chain metadata (no identities, no actual content) |
| `content_exists` mapping | **Public** — boolean existence check | Prevents duplicate content hashes |

### Off-Chain (Never Stored On-Chain)

- Actual text content (title, body) — never touches the blockchain
- Author's real identity — shielded behind Aleo address + encrypted records
- Buyer identities — only encrypted AccessToken records in their wallets
- Reading history, browsing patterns — no tracking

### How Each Flow Uses Privacy

**Publishing:**
```
Author writes content
  → Frontend hashes title + body into field elements
  → Calls ghostwrite_v1.aleo/publish_content
  → ZK proof generated (author identity hidden in circuit)
  → On-chain: only content_hash + price visible in mapping
  → Author receives encrypted ContentRecord + AuthorshipProof
  → Nobody can link the on-chain hash to the author's address
```

**Purchasing:**
```
Reader finds content (sees only hash + price)
  → Step 1: credits.aleo/transfer_public sends payment to author
  → Step 2: ghostwrite_v1.aleo/purchase_content
  → ZK proof generated (buyer identity hidden)
  → Buyer receives encrypted AccessToken
  → On-chain: purchase counter increments (no buyer identity stored)
  → Frontend decrypts content locally using AccessToken as proof
```

**Authorship Revelation:**
```
Author decides to claim credit
  → Calls reveal_authorship with their AuthorshipProof record
  → ZK proof verifies they own the original proof
  → Public output: content_hash + title_hash linked to author
  → Selective disclosure — author controls when/if this happens
```

---

## Leo Smart Contract

### Records (Private State)

```leo
record ContentRecord {
    owner: address,          // Author (encrypted, only they can see)
    content_hash: field,     // Hash of the actual content
    title_hash: field,       // Hash of the title
    timestamp: u64,          // Publication time
    price_microcredits: u64, // Price in microcredits
}

record AuthorshipProof {
    owner: address,          // Author (encrypted)
    content_hash: field,     // Links to content
    title_hash: field,       // Links to title
    created_at: u64,         // Timestamp of creation
}

record AccessToken {
    owner: address,          // Buyer (encrypted, only they can see)
    content_hash: field,     // Which content they purchased
    author: address,         // Author address (for payment verification)
    granted_at: u64,         // Purchase timestamp
}
```

### Mappings (Public State)

```leo
mapping published_content: field => ContentMeta;  // Hash → metadata
mapping content_exists: field => bool;             // Duplicate prevention
```

### Transitions

| Transition | Inputs | Outputs | Privacy |
|-----------|--------|---------|---------|
| `publish_content` | title_hash, content_hash, price, timestamp | ContentRecord + AuthorshipProof (encrypted) | Author identity hidden |
| `purchase_content` | content_hash, author, price, timestamp | AccessToken (encrypted) | Buyer identity hidden |
| `reveal_authorship` | AuthorshipProof record, reveal_to address | AuthorshipProof (re-assigned) | Selective disclosure |

---

## Product Market Fit (PMF)

**Target Users:**
1. Whistleblowers and anonymous sources needing monetized, verifiable publishing
2. Writers in censorship-heavy regions who can't use identity-linked platforms
3. Crypto-native content creators who value on-chain privacy
4. Researchers sharing pre-publication findings anonymously

**Competitive Landscape:**

| Platform | Anonymous | Monetized | Provable Authorship | On-Chain Privacy |
|----------|-----------|-----------|-------------------|-----------------|
| Medium | No | Yes | No | No |
| Substack | No | Yes | No | No |
| Mirror.xyz | Pseudonymous | Yes | No | No (transparent chain) |
| Tor blogs | Yes | No | No | N/A |
| **GhostWrite** | **Yes** | **Yes** | **Yes (ZK)** | **Yes (Aleo)** |

**Why Aleo Specifically:**
- Native record encryption (not bolted-on privacy like mixers)
- ZK proofs at the execution layer (not just validation)
- Selective disclosure is a first-class feature via record ownership
- No other chain offers this combination for content privacy

## Go-To-Market (GTM) Plan

**Phase 1 — Testnet Launch (Current)**
- Deploy core contract on Aleo Testnet
- Build functional demo with publish → purchase → reveal flow
- Submit to Aleo Buildathon for feedback and visibility

**Phase 2 — Community Building**
- Target crypto-native writers and privacy advocates
- Partner with press freedom organizations (EFF, Freedom of the Press Foundation)
- Integrate with IPFS/Arweave for decentralized content storage (currently off-chain)

**Phase 3 — Mainnet Launch**
- Deploy on Aleo Mainnet with atomic payments (credits.aleo integration)
- Add subscription model (recurring AccessTokens)
- Implement content categories and discovery
- Mobile wallet support

**Phase 4 — Scale**
- Multi-author publications (anonymous editorial teams)
- Cross-chain bridges for payment flexibility
- SDK for third-party integrations (anonymous reviews, reports)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Leo Language on Aleo |
| Frontend | React 18 + Vite |
| Wallet Integration | Leo Wallet Adapter (@demox-labs) |
| ZK Proof Generation | Aleo WASM SDK via Web Workers |
| Styling | Custom CSS (dark editorial theme) |
| Icons | Custom SVG icon system |
| Network | Aleo Testnet Beta |

---

## Project Structure

```
ghostwrite/
├── ghostwrite_program/
│   ├── src/main.leo              # Leo smart contract (3 transitions)
│   ├── program.json              # Program configuration
│   ├── inputs/ghostwrite_v1.in   # Test inputs
│   └── .env                      # Private key for deployment
├── src/
│   ├── main.jsx                  # Entry point + wallet providers
│   ├── App.jsx                   # Routing and navigation
│   ├── AleoContext.jsx           # Wallet interaction + 2-step purchase flow
│   ├── index.css                 # Dark editorial design system
│   ├── components/
│   │   ├── Icons.jsx             # SVG icon library
│   │   ├── HomePage.jsx          # Landing page + privacy explainer
│   │   ├── BrowsePage.jsx        # Content discovery (encrypted by default)
│   │   ├── PublishPage.jsx       # Anonymous publishing form
│   │   ├── DashboardPage.jsx     # Author/buyer dashboard
│   │   ├── ContentDetail.jsx     # Content view + purchase flow
│   │   └── Toast.jsx             # Notification system
│   └── workers/
│       ├── aleoWorker.js         # Web Worker for ZK proofs
│       └── workerHelper.js       # Worker communication utility
├── package.json
├── vite.config.js
├── index.html
└── README.md
```

---

## Setup Instructions

### Prerequisites

- **Node.js 18+** — [nodejs.org](https://nodejs.org/)
- **Leo Wallet** browser extension — [leo.app](https://leo.app/)
- **Testnet Credits** — [faucet.aleo.org](https://faucet.aleo.org/)

### Installation

```bash
git clone https://github.com/Ganesh0690/ghost-write.git
cd ghost-write
npm install
npm run dev
```

App runs at `http://localhost:5173`

### Connect Wallet

1. Install Leo Wallet extension
2. Create or import an account
3. Get testnet credits from the faucet
4. Click "Select Wallet" in the app → connect Leo Wallet

---

## Deployed Contract

| Field | Value |
|-------|-------|
| Program | `ghostwrite_v1.aleo` |
| Network | Aleo Testnet Beta |
| Deploy TX | `at1edj52zm5ndhrfjs82ppp8tksumpn3qp9e3euw667zv4wuespnczqaldd5z` |
| Publish TX | `at1ka9pqudjaqcj5ccdp0c0vqxvjcrg8y3mnew9s472ctt9smxjsups7yj85m` |
| Explorer | [View on Provable Explorer](https://explorer.provable.com/transaction/at1edj52zm5ndhrfjs82ppp8tksumpn3qp9e3euw667zv4wuespnczqaldd5z) |

---

## Privacy Model — Detailed Breakdown

### What is visible on-chain (public)

- Content hash (field element) — a number derived from the content, not reversible
- Price in microcredits
- Total purchase count
- Whether content exists (boolean)

### What is NOT visible on-chain (private)

- The actual content text (title, body)
- Who published it (author address encrypted in ContentRecord)
- Who purchased it (buyer address encrypted in AccessToken)
- The relationship between author and content (only provable via record ownership)

### Frontend Privacy

- Browse page shows **only content hashes** to non-owners — no titles, no previews
- Content detail shows "Encrypted Content" for non-purchasers
- Only the author or a purchaser can see the decrypted title and body
- Author vs public view is demonstrated in the publish preview

---

## Team

| Name | Role | Discord | Aleo Address |
|------|------|---------|-------------|
| Tilak | Solo Developer | [cryptofav](https://discord.gg/users/cryptofav) | `aleo13ssze66adjjkt795z9u5wpq8h6kn0y2657726h4h3e3wfnez4vqsm3008q` |

---

## License

MIT