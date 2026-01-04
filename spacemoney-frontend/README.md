# SpaceMoney Frontend

React-based frontend for the SpaceMoney staking platform on Solana.

## Features

- ✅ **Wallet Integration**: Phantom, Solflare, Backpack support
- ✅ **Real-time Data**: Live contract state, countdown timers, balance updates
- ✅ **Deposit/Withdraw Flows**: Complete SOL and USDT staking
- ✅ **Reward Calculator**: Interactive calculator with charts
- ✅ **Admin Panel**: Treasury management and analytics
- ✅ **Error Handling**: User-friendly messages with retry logic
- ✅ **Responsive Design**: Mobile, tablet, and desktop support

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Solana Web3.js** - Blockchain interaction
- **Anchor** - Smart contract framework client
- **Framer Motion** - Animations
- **React Query** - Data fetching
- **Recharts** - Data visualization

## Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Configuration

Update `src/utils/constants.js` with your contract details:

```javascript
export const PROGRAM_ID = "Your_Program_ID_Here";
export const USDT_MINT = "Your_USDT_Mint_Here";
export const NETWORK = "devnet"; // or "mainnet-beta"
export const RPC_ENDPOINT = "https://api.devnet.solana.com";
```

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Header.jsx
│   ├── Footer.jsx
│   └── Layout.jsx
├── pages/            # Page components
│   ├── Home.jsx
│   ├── RewardCalculator.jsx
│   ├── UserDashboard.jsx
│   └── ...
├── hooks/            # Custom React hooks
├── contexts/         # React contexts (Wallet, Toast)
├── utils/            # Utility functions
│   ├── constants.js
│   ├── calculations.js
│   ├── formatters.js
│   └── error-handler.js
├── lib/              # Solana configuration
│   └── solana-config.js
├── styles/           # Global styles
│   └── globals.css
├── App.jsx           # Main app component
└── index.jsx         # Entry point
```

## Available Pages

1. **Home** (`/`) - Landing page
2. **Calculator** (`/calculator`) - Reward calculator
3. **How It Works** (`/how-it-works`) - User guide
4. **Node Plans** (`/node-plans`) - Tier comparison
5. **Technology** (`/technology`) - Tech showcase
6. **Security** (`/security`) - Security info
7. **FAQ** (`/faq`) - Help center
8. **Dashboard** (`/dashboard`) - User investments
9. **Admin** (`/admin`) - Admin panel

## Integration with Smart Contract

The frontend connects to the Solana smart contract via the Anchor framework:

```javascript
import { getProgram, getUserPDAs } from './lib/solana-config';
import { useWallet } from '@solana/wallet-adapter-react';

// Get program instance
const program = getProgram(wallet);

// Derive PDAs
const { platformState, userAccount, tierConfig } = getUserPDAs(wallet.publicKey);

// Call deposit instruction
await program.methods
  .depositSol(amount, tier)
  .accounts({ platformState, userAccount, tierConfig, /* ... */ })
  .rpc();
```

## Environment Variables

Create `.env` file:

```env
VITE_PROGRAM_ID=SpaceMoneyProgram11111111111111111111111
VITE_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
VITE_USDT_MINT=EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj
```

## Deployment

### Vercel

```bash
npm run build
vercel deploy
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

## Troubleshooting

**Wallet not connecting?**
- Ensure wallet extension is installed
- Check browser console for errors
- Try refreshing the page

**Contract call failing?**
- Verify program is deployed
- Check wallet has sufficient SOL
- Ensure correct network (devnet/mainnet)

**Build errors?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf .vite`
- Check Node.js version (18+)

## License

Apache 2.0
