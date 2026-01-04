# SpaceMoney Solana Smart Contract

A comprehensive staking platform on Solana with tier-based rewards, built with Anchor framework.

## Features

- **Three Tier System**: Boot (1 SOL, 1x, 30d), Symbiotic (5 SOL, 2x, 90d), Space (25 SOL, 3x, 180d)
- **Dual Token Support**: SOL and USDT staking
- **Reward Mechanisms**: Interim claims, full withdrawals, force withdrawals with penalties
- **Admin Controls**: Treasury management, tier configuration, pause/resume functionality
- **Security**: PDA-based vaults, overflow protection, comprehensive error handling

## Architecture

### State Accounts

1. **PlatformState** (PDA: `["platform"]`)
   - Global platform configuration
   - Treasury balances (SOL & USDT)
   - Total staked amounts
   - Admin control
   - Pause state

2. **UserAccount** (PDA: `["user", user_pubkey]`)
   - Per-user stakes array
   - Claimed rewards tracking
   - Lock period management

3. **TierConfig** (PDA: `["tiers"]`)
   - Configurable tier parameters
   - Minimum stakes, multipliers, lock periods

### Instructions

| Instruction | Description | Access |
|------------|-------------|--------|
| `initialize` | Setup platform | Admin |
| `deposit_sol` | Stake SOL | Anyone |
| `deposit_usdt` | Stake USDT | Anyone |
| `withdraw_sol` | Withdraw after lock | User |
| `withdraw_usdt` | Withdraw USDT after lock | User |
| `force_withdraw` | Early exit (20% penalty) | User |
| `claim_rewards` | Claim accrued rewards | User |
| `admin_transfer` | Transfer treasury to any address | Admin |
| `set_admin` | Change admin | Admin |
| `update_tier_config` | Modify tier settings | Admin |
| `set_usdt_mint` | Update USDT address | Admin |
| `pause_program` | Emergency stop | Admin |
| `resume_program` | Resume operations | Admin |

## Reward Calculations

```
Daily Reward = principal × multiplier × 1% daily yield
Total Reward (full lock) = Daily Reward × lock_days

Examples:
- Boot: 1 SOL × 1x × 1% × 30d = 0.3 SOL
- Symbiotic: 5 SOL × 2x × 1% × 90d = 9 SOL
- Space: 25 SOL × 3x × 1% × 180d = 135 SOL
```

## Fee Structure

- **Deposit Fee**: 2% (to treasury)
- **Force Withdraw Penalty**: 20% of rewards (to treasury)
- **Standard Withdrawal**: 0% fee

## Setup

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/v1.17.0/install)"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.29.0
avm use 0.29.0

# Install Node dependencies
npm install
```

### Build

```bash
# Build the program
anchor build

# Generate IDL
anchor idl init -f target/idl/spacemoney.json <PROGRAM_ID>
```

### Test

```bash
# Run tests on localnet
anchor test

# Run specific test
anchor test --skip-local-validator
```

### Deploy

```bash
# Configure Solana to devnet
solana config set --url devnet

# Create/fund wallet
solana-keygen new --outfile ~/.config/solana/id.json
solana airdrop 2

# Deploy
anchor deploy --provider.cluster devnet

# Initialize platform
ts-node migrations/deploy.ts
```

## Program ID

**Devnet**: `SpaceMoneyProgram11111111111111111111111`

## USDT Mint (Devnet)

`EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj`

## PDAs

```typescript
// Platform State
const [platformState] = PublicKey.findProgramAddressSync(
  [Buffer.from("platform")],
  programId
);

// User Account
const [userAccount] = PublicKey.findProgramAddressSync(
  [Buffer.from("user"), userPubkey.toBuffer()],
  programId
);

// Tier Config
const [tierConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("tiers")],
  programId
);

// Vault Authority
const [vaultAuthority] = PublicKey.findProgramAddressSync(
  [Buffer.from("vault")],
  programId
);
```

## Integration Example

```typescript
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";

// Initialize program
const provider = anchor.AnchorProvider.env();
const program = anchor.workspace.Spacemoney;

// Deposit 1 SOL to Boot tier
const depositAmount = 1 * LAMPORTS_PER_SOL;
const tier = 0; // Boot

await program.methods
  .depositSol(new anchor.BN(depositAmount), tier)
  .accounts({
    platformState,
    userAccount,
    tierConfig,
    user: wallet.publicKey,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Security Considerations

- ✅ PDA-based authority for all operations
- ✅ Overflow/underflow checks on all math
- ✅ Admin signature verification
- ✅ Lock period enforcement
- ✅ Token account ownership validation
- ✅ Emergency pause capability
- ✅ Comprehensive error codes

## Testing Coverage

- [x] Program initialization
- [x] SOL deposits (all tiers)
- [x] USDT deposits
- [x] Minimum stake validation
- [x] Fee calculations
- [x] Reward calculations
- [x] Lock period enforcement
- [x] Standard withdrawals
- [x] Force withdrawals with penalty
- [x] Interim reward claims
- [x] Admin transfers
- [x] Admin changes
- [x] Tier configuration updates
- [x] Pause/resume functionality
- [x] Permission checks
- [x] Insufficient balance handling
- [x] Multi-user scenarios

## License

Apache 2.0
