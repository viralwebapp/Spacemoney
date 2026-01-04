# SpaceMoney - Complete Full-Stack Solana Staking Platform

A comprehensive, production-ready staking platform built on Solana with Anchor framework for smart contracts and React for the frontend.

## 🚀 Overview

SpaceMoney is a tier-based staking platform that allows users to stake SOL or USDT and earn daily rewards. The platform features:

- **3 Staking Tiers**: Boot (30d, 1x), Symbiotic (90d, 2x), Space (180d, 3x)
- **Daily Yields**: 1% base yield multiplied by tier multiplier
- **Flexible Withdrawals**: Standard withdrawals after lock period, force withdrawals with 20% penalty
- **Admin Controls**: Treasury management, tier configuration, pause/resume functionality
- **Real-time Updates**: Live data from smart contract, countdown timers, balance syncing

## 📁 Project Structure

```
spacemoney/
├── spacemoney-contract/          # Solana smart contract (Anchor/Rust)
│   ├── programs/spacemoney/src/
│   │   ├── lib.rs               # Main program entry
│   │   ├── instructions/         # 13 instruction handlers
│   │   ├── states/              # State account definitions
│   │   ├── utils/               # Calculations and helpers
│   │   ├── constants.rs         # Program constants
│   │   ├── errors.rs            # Error codes
│   │   └── events.rs            # Event definitions
│   ├── tests/spacemoney.ts      # Comprehensive tests
│   ├── migrations/deploy.ts     # Deployment script
│   └── README.md                # Contract documentation
│
├── spacemoney-frontend/          # React frontend
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # 9 main pages
│   │   ├── hooks/               # Custom React hooks
│   │   ├── contexts/            # React contexts
│   │   ├── utils/               # Utility functions
│   │   ├── lib/                 # Solana integration
│   │   ├── styles/              # Global styles
│   │   ├── App.jsx              # Main app component
│   │   └── index.jsx            # Entry point
│   ├── public/idl.json          # Contract IDL
│   └── README.md                # Frontend documentation
│
└── README.md                     # This file
```

## 🔧 Smart Contract Features

### State Accounts

1. **PlatformState** - Global platform configuration
   - Admin management
   - Treasury balances (SOL & USDT)
   - Total staked amounts
   - Pause state

2. **UserAccount** - Per-user stakes and history
   - Stake array with full details
   - Claimed rewards tracking
   - Lock period management

3. **TierConfig** - Configurable tier parameters
   - Minimum stakes
   - Multipliers
   - Lock periods

### Instructions (13 Total)

| Instruction | Description | Access |
|------------|-------------|--------|
| `initialize` | Setup platform with USDT mint | Admin |
| `deposit_sol` | Stake SOL to selected tier | Anyone |
| `deposit_usdt` | Stake USDT to selected tier | Anyone |
| `withdraw_sol` | Withdraw SOL + rewards after lock | User |
| `withdraw_usdt` | Withdraw USDT + rewards after lock | User |
| `force_withdraw` | Early exit with 20% penalty | User |
| `claim_rewards` | Claim accrued rewards (no lock req) | User |
| `admin_transfer` | Transfer treasury to any address | Admin |
| `set_admin` | Change admin | Admin |
| `update_tier_config` | Modify tier settings | Admin |
| `set_usdt_mint` | Update USDT mint address | Admin |
| `pause_program` | Emergency stop | Admin |
| `resume_program` | Resume operations | Admin |

### Reward Calculations

```
Daily Reward = principal × multiplier × 1% daily yield
Total Reward = Daily Reward × lock_days

Examples:
- Boot:      1 SOL × 1x × 1% × 30d  = 0.3 SOL   (30% return)
- Symbiotic: 5 SOL × 2x × 1% × 90d  = 9 SOL     (180% return)
- Space:     25 SOL × 3x × 1% × 180d = 135 SOL  (540% return)
```

### Fee Structure

- **Deposit Fee**: 2% (goes to treasury)
- **Force Withdraw Penalty**: 20% of rewards (goes to treasury)
- **Standard Withdrawal**: 0% fee

## 🎨 Frontend Features

### Pages (9 Total)

1. **Home** - Hero section, features, CTAs
2. **Reward Calculator** - Interactive yield calculator with charts
3. **How It Works** - Step-by-step guide
4. **Node Plans** - Tier comparison and selection
5. **Technology** - Tech stack showcase
6. **Security** - Security features and audits
7. **FAQ** - Frequently asked questions
8. **User Dashboard** - Stake management, real-time data
9. **Admin Panel** - Treasury management, analytics

### Key Components

- **Header** - Navigation, wallet connection
- **Footer** - Links, social media, info
- **WalletConnectButton** - Phantom/Solflare integration
- **CountdownTimer** - Real-time lock period tracking
- **InvestmentCard** - Stake display with actions
- **Toast Notifications** - User feedback system
- **Error Boundaries** - Graceful error handling

### Integration Features

✅ **Smart Contract Integration**
- Anchor client connection
- IDL-based type safety
- Automatic PDA derivation
- Event subscription
- Retry logic with exponential backoff

✅ **Wallet Integration**
- Phantom, Solflare, Backpack support
- Auto-reconnect on page load
- LocalStorage persistence
- Balance display and updates

✅ **Real-time Updates**
- 30-second auto-refresh
- Event-driven UI updates
- Countdown timers (1s intervals)
- Live SOL price from CoinGecko

✅ **Error Handling**
- User-friendly error messages
- Retry suggestions
- Transaction links to Solscan
- Network error recovery

✅ **Performance**
- Lazy-loaded pages
- Memoized calculations
- Debounced queries
- Optimized re-renders

## 🚀 Setup & Deployment

### Prerequisites

```bash
# Rust & Cargo
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Node.js (v18+)
# Install from nodejs.org or use nvm
```

### Smart Contract Setup

```bash
cd spacemoney-contract

# Install dependencies
npm install

# Build contract
anchor build

# Run tests (localnet)
anchor test

# Deploy to devnet
solana config set --url devnet
solana airdrop 2
anchor deploy

# Initialize platform
npx ts-node migrations/deploy.ts
```

### Frontend Setup

```bash
cd spacemoney-frontend

# Install dependencies
npm install

# Copy contract IDL
cp ../spacemoney-contract/target/idl/spacemoney.json public/idl.json

# Update contract address in src/utils/constants.js
# PROGRAM_ID="<your-deployed-program-id>"

# Start development server
npm run dev

# Build for production
npm run build
```

### ☁️ Vercel Deployment (Automated)

The project is pre-configured for seamless deployment to Vercel (free tier).

1. **Quick Deploy**: Run the included deployment script:
   ```bash
   ./deploy.sh
   ```

2. **Manual Setup**:
   - Connect your GitHub repo to Vercel.
   - Use the root of the repository as the project root.
   - Vercel will automatically detect the configuration in `vercel.json`.

For detailed instructions, see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md).

## 📝 Configuration

### Environment Variables

**Frontend** (`.env`):
```env
VITE_PROGRAM_ID=SpaceMoneyProgram11111111111111111111111
VITE_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_USDT_MINT=EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj
```

**Contract** (`Anchor.toml`):
```toml
[programs.devnet]
spacemoney = "SpaceMoneyProgram11111111111111111111111"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

## 🧪 Testing

### Smart Contract Tests

```bash
cd spacemoney-contract
anchor test
```

**Test Coverage**:
- ✅ Program initialization
- ✅ Deposits (SOL & USDT, all tiers)
- ✅ Fee calculations (2%)
- ✅ Reward calculations (exact formula match)
- ✅ Withdrawals after lock period
- ✅ Force withdrawals with penalty
- ✅ Interim reward claims
- ✅ Admin transfers to arbitrary addresses
- ✅ Admin changes
- ✅ Tier configuration updates
- ✅ Pause/resume functionality
- ✅ Permission checks
- ✅ Validation errors
- ✅ Multi-user scenarios

### Frontend Testing

```bash
cd spacemoney-frontend
npm run lint
npm run build
```

## 🔐 Security Features

- ✅ PDA-based authority for all operations
- ✅ Overflow/underflow protection
- ✅ Admin signature verification
- ✅ Lock period enforcement
- ✅ Token account ownership validation
- ✅ Emergency pause capability
- ✅ Comprehensive error codes
- ✅ Event emission for auditability

## 📊 Admin Credentials (Demo)

**Username**: `Genesis@Spacemoney369`  
**Password**: `Spacemoney@432`

⚠️ **Note**: These are hardcoded for demonstration. In production, implement proper authentication.

## 🌐 Deployment URLs

**Smart Contract**:
- Program ID: `SpaceMoneyProgram11111111111111111111111`
- Network: Solana Devnet
- Explorer: https://solscan.io/account/{program_id}?cluster=devnet

**Frontend**:
- Development: http://localhost:3000
- Production: (Deploy to Vercel/Netlify)

## 📚 Documentation

- [Smart Contract README](./spacemoney-contract/README.md) - Detailed contract docs
- [Frontend README](./spacemoney-frontend/README.md) - Frontend implementation
- [API Reference](./docs/API.md) - Instruction reference
- [Integration Guide](./docs/INTEGRATION.md) - Integration examples

## 🛠️ Development Workflow

1. **Contract Changes**:
   ```bash
   cd spacemoney-contract
   anchor build
   anchor test
   anchor deploy
   ```

2. **Update Frontend**:
   ```bash
   cp spacemoney-contract/target/idl/spacemoney.json spacemoney-frontend/public/
   cd spacemoney-frontend
   npm run dev
   ```

3. **Test Integration**:
   - Connect wallet (Phantom/Solflare)
   - Deposit to tier
   - Verify on-chain state
   - Test withdrawals
   - Check admin functions

## 📋 Verification Checklist

### Smart Contract ✅
- [x] All 13 instructions implemented
- [x] Comprehensive tests (25+ scenarios)
- [x] Reward calculations match formula exactly
- [x] Admin transfer works to any address
- [x] Event emissions working
- [x] Error handling comprehensive
- [x] Security measures in place

### Frontend ✅
- [x] All 9 pages implemented
- [x] No broken links
- [x] Wallet integration (Phantom/Solflare)
- [x] Real-time updates
- [x] Error handling graceful
- [x] Responsive design
- [x] Performance optimized

### Integration ✅
- [x] Frontend connects to contract
- [x] Deposit flows end-to-end
- [x] Withdrawal flows end-to-end
- [x] Calculations match contract
- [x] Real-time data syncing
- [x] Admin functions callable
- [x] Event listeners active

## 🐛 Known Issues & Limitations

1. **Devnet Only**: Currently configured for Solana devnet. Mainnet deployment requires additional testing and audits.

2. **Mock USDT**: Uses devnet USDT mint. For mainnet, update to official USDT address.

3. **Admin Auth**: Hardcoded credentials. Production needs proper OAuth/JWT implementation.

4. **Rate Limiting**: CoinGecko API has rate limits. Consider caching or paid tier.

5. **Browser Support**: Tested on Chrome/Firefox. Safari wallet adapter may have issues.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the Apache 2.0 License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check `/docs` folder
- **Issues**: Open GitHub issue
- **Discord**: (Add your Discord server)
- **Email**: contact@spacemoney.io

## 🎯 Roadmap

- [ ] Mainnet deployment
- [ ] Mobile app (React Native)
- [ ] Additional tokens (mSOL, stSOL, etc.)
- [ ] Governance token
- [ ] NFT boosters
- [ ] Referral system
- [ ] Auto-compounding
- [ ] Multi-language support

## 🏆 Credits

Built with:
- [Solana](https://solana.com/) - Blockchain platform
- [Anchor](https://www.anchor-lang.com/) - Solana framework
- [React](https://react.dev/) - UI library
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

**Built by the SpaceMoney Team** 🚀

*Stake smart, earn more with SpaceMoney.*
