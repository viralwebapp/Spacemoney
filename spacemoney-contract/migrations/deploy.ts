import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";

const USDT_MINT_DEVNET = new PublicKey("EPjFWaJsq4DcaRKmqsPb94k8ao64C1MwMUeFqwxDRvPj");

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Spacemoney;
  
  console.log("Program ID:", program.programId.toString());
  console.log("Admin:", provider.wallet.publicKey.toString());

  // Derive PDAs
  const [platformState] = PublicKey.findProgramAddressSync(
    [Buffer.from("platform")],
    program.programId
  );

  const [tierConfig] = PublicKey.findProgramAddressSync(
    [Buffer.from("tiers")],
    program.programId
  );

  console.log("\n=== Deploying SpaceMoney Platform ===");
  console.log("Platform State PDA:", platformState.toString());
  console.log("Tier Config PDA:", tierConfig.toString());
  console.log("USDT Mint:", USDT_MINT_DEVNET.toString());

  try {
    // Initialize platform
    const tx = await program.methods
      .initialize(USDT_MINT_DEVNET)
      .accounts({
        platformState,
        tierConfig,
        admin: provider.wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("\n✅ Platform initialized successfully!");
    console.log("Transaction signature:", tx);

    // Fetch and display initial state
    const platformAccount = await program.account.platformState.fetch(platformState);
    const tierConfigAccount = await program.account.tierConfig.fetch(tierConfig);

    console.log("\n=== Platform State ===");
    console.log("Admin:", platformAccount.admin.toString());
    console.log("Treasury SOL:", platformAccount.treasurySol.toString());
    console.log("Treasury USDT:", platformAccount.treasuryUsdt.toString());
    console.log("Is Paused:", platformAccount.isPaused);

    console.log("\n=== Tier Configuration ===");
    console.log("Boot Tier:");
    console.log("  Min Stake:", tierConfigAccount.bootMinStake.toString(), "lamports");
    console.log("  Multiplier:", tierConfigAccount.bootMultiplier.toString(), "x");
    console.log("  Lock Days:", tierConfigAccount.bootLockDays.toString(), "days");

    console.log("\nSymbiotic Tier:");
    console.log("  Min Stake:", tierConfigAccount.symbioticMinStake.toString(), "lamports");
    console.log("  Multiplier:", tierConfigAccount.symbioticMultiplier.toString(), "x");
    console.log("  Lock Days:", tierConfigAccount.symbioticLockDays.toString(), "days");

    console.log("\nSpace Tier:");
    console.log("  Min Stake:", tierConfigAccount.spaceMinStake.toString(), "lamports");
    console.log("  Multiplier:", tierConfigAccount.spaceMultiplier.toString(), "x");
    console.log("  Lock Days:", tierConfigAccount.spaceLockDays.toString(), "days");

    console.log("\n=== Deployment Complete ===");
    console.log("Copy these values for your frontend:");
    console.log(`PROGRAM_ID="${program.programId.toString()}"`);
    console.log(`PLATFORM_STATE="${platformState.toString()}"`);
    console.log(`TIER_CONFIG="${tierConfig.toString()}"`);
    console.log(`USDT_MINT="${USDT_MINT_DEVNET.toString()}"`);

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => {
    console.log("\nSuccess!");
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
