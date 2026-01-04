# SpaceMoney Deployment Guide

## Quick Start

This guide walks you through deploying the complete SpaceMoney platform from scratch.

## Prerequisites Checklist

- [ ] Linux/macOS environment (Windows WSL2 works too)
- [ ] Git installed
- [ ] Node.js 18+ installed
- [ ] Rust and Cargo installed
- [ ] Solana CLI installed
- [ ] Anchor CLI installed
- [ ] A Solana wallet with devnet SOL

## Step 1: Install Required Tools

### Install Rust
```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env
rustc --version
```

### Install Solana CLI
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
solana --version
```

### Install Anchor
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
anchor --version
```

## Step 2: Setup Solana Wallet

```bash
# Create a new wallet (or use existing)
solana-keygen new --outfile ~/.config/solana/id.json

# Set to devnet
solana config set --url devnet

# Get your wallet address
solana address

# Request airdrop (2 SOL)
solana airdrop 2

# Check balance
solana balance
```

## Step 3: Deploy Smart Contract

```bash
cd spacemoney-contract

# Install Node dependencies
npm install

# Build the contract
anchor build

# This generates:
# - target/deploy/spacemoney.so (compiled program)
# - target/idl/spacemoney.json (Interface Definition Language)

# Run tests (optional but recommended)
anchor test

# Deploy to devnet
anchor deploy

# Note the Program ID that's displayed!
# It will look like: SpaceMoneyProgram11111111111111111111111
```

## Step 4: Initialize Platform

```bash
# Edit migrations/deploy.ts and update USDT_MINT if needed
# The default is: EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj

# Run deployment script
npx ts-node migrations/deploy.ts

# This will:
# - Initialize PlatformState
# - Initialize TierConfig  
# - Set you as admin
# - Output all PDA addresses

# Copy the output values - you'll need them for frontend!
```

## Step 5: Setup Frontend

```bash
cd ../spacemoney-frontend

# Install dependencies
npm install

# Copy the IDL from contract
cp ../spacemoney-contract/target/idl/spacemoney.json public/idl.json

# Update constants
# Edit src/utils/constants.js and update:
# - PROGRAM_ID with your deployed program ID
# - USDT_MINT if you changed it

# Start development server
npm run dev

# Open http://localhost:3000
```

## Step 6: Test Integration

### Manual Testing Checklist

1. **Connect Wallet**
   - [ ] Open http://localhost:3000
   - [ ] Click "Connect Wallet"
   - [ ] Select Phantom/Solflare
   - [ ] Approve connection
   - [ ] Verify wallet address shows in header

2. **Deposit Flow**
   - [ ] Navigate to Dashboard
   - [ ] Click "Deposit" or go to Node Plans
   - [ ] Select Boot tier (1 SOL)
   - [ ] Enter amount (e.g., 1.5 SOL)
   - [ ] Review fee (2%)
   - [ ] Confirm transaction in wallet
   - [ ] Wait for confirmation
   - [ ] Verify stake appears in dashboard

3. **View Stakes**
   - [ ] See stake card with details
   - [ ] Countdown timer is working
   - [ ] Principal amount correct
   - [ ] Tier displayed correctly
   - [ ] Lock until date shown

4. **Claim Rewards** (optional, wait a bit)
   - [ ] Click "Claim Rewards"
   - [ ] Approve transaction
   - [ ] Verify rewards credited

5. **Admin Functions** (if you're admin)
   - [ ] Navigate to /admin
   - [ ] Login with credentials
   - [ ] View analytics dashboard
   - [ ] Try admin transfer
   - [ ] Verify transaction

### Verify On-Chain

```bash
# Check your user account
solana account <YOUR_USER_ACCOUNT_PDA>

# Check platform state
solana account <PLATFORM_STATE_PDA>

# View recent transactions
solana transaction-history <YOUR_WALLET_ADDRESS> --limit 10
```

## Step 7: Production Deployment

### Frontend to Vercel

```bash
cd spacemoney-frontend

# Build production bundle
npm run build

# Install Vercel CLI
npm install -g vercel

# Deploy
vercel deploy --prod

# Set environment variables in Vercel dashboard
# VITE_PROGRAM_ID=<your-program-id>
# VITE_NETWORK=devnet
# VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

### Frontend to Netlify

```bash
cd spacemoney-frontend

# Build
npm run build

# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

## Step 8: Mainnet Deployment (⚠️ Use with Caution)

**WARNING**: Mainnet deployment requires:
- Thorough testing on devnet
- Security audit
- Sufficient SOL for deployment (~5-10 SOL)
- Updated USDT mint address for mainnet

```bash
# Switch to mainnet
solana config set --url mainnet-beta

# Ensure you have SOL
solana balance

# Deploy contract
cd spacemoney-contract
anchor build
anchor deploy

# Update frontend constants
cd ../spacemoney-frontend
# Change NETWORK to "mainnet-beta"
# Change RPC_ENDPOINT to mainnet RPC
# Update PROGRAM_ID with mainnet deployment

# Deploy frontend
npm run build
vercel deploy --prod
```

## Troubleshooting

### "anchor: command not found"
```bash
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0
```

### "Insufficient funds"
```bash
solana airdrop 2
# Or use https://solfaucet.com for devnet SOL
```

### "Program failed to complete"
- Check you have enough SOL
- Verify program ID is correct
- Check network (devnet vs mainnet)
- Review transaction logs

### Frontend: "Failed to connect to wallet"
- Ensure wallet extension is installed
- Check console for errors
- Try refreshing page
- Verify RPC endpoint is correct

### Frontend: "Transaction failed"
- Check wallet has sufficient SOL
- Verify program is deployed
- Check network matches (devnet)
- Review error in toast notification

## Monitoring & Maintenance

### Check Platform Stats
```bash
# View platform state
anchor idl fetch <PROGRAM_ID> -o temp_idl.json
# Then use Anchor client to read accounts
```

### Monitor Treasury
```bash
solana balance <PLATFORM_STATE_ADDRESS>
```

### View Program Logs
```bash
solana logs <PROGRAM_ID>
```

### Update Tier Configuration
Use admin panel or CLI to call `update_tier_config` instruction.

## Support Resources

- **Solana Docs**: https://docs.solana.com
- **Anchor Docs**: https://www.anchor-lang.com
- **Solana Discord**: https://discord.gg/solana
- **Explorer (Devnet)**: https://solscan.io/?cluster=devnet

## Security Reminders

- ✅ Never commit wallet private keys
- ✅ Use hardware wallet for mainnet admin
- ✅ Get security audit before mainnet
- ✅ Test thoroughly on devnet first
- ✅ Have emergency pause plan
- ✅ Monitor treasury regularly
- ✅ Keep admin credentials secure

## Next Steps After Deployment

1. Test all user flows
2. Monitor for errors
3. Gather user feedback
4. Plan feature additions
5. Consider security audit
6. Set up monitoring/alerts
7. Create user documentation

---

**Congratulations!** 🎉 Your SpaceMoney platform is now live!

For questions or issues, refer to the main README.md or open a GitHub issue.
