import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Spacemoney } from "../target/types/spacemoney";
import { 
  PublicKey, 
  SystemProgram, 
  Keypair,
  LAMPORTS_PER_SOL 
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  createMint,
  createAccount,
  mintTo,
} from "@solana/spl-token";
import { assert, expect } from "chai";

describe("spacemoney", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.Spacemoney as Program<Spacemoney>;
  
  let usdtMint: PublicKey;
  let platformState: PublicKey;
  let tierConfig: PublicKey;
  let vaultAuthority: PublicKey;
  let platformTokenAccount: PublicKey;
  
  let user1 = Keypair.generate();
  let user2 = Keypair.generate();
  let user1Account: PublicKey;
  let user2Account: PublicKey;
  let user1TokenAccount: PublicKey;
  let user2TokenAccount: PublicKey;
  
  const admin = provider.wallet;

  before(async () => {
    // Derive PDAs
    [platformState] = PublicKey.findProgramAddressSync(
      [Buffer.from("platform")],
      program.programId
    );

    [tierConfig] = PublicKey.findProgramAddressSync(
      [Buffer.from("tiers")],
      program.programId
    );

    [vaultAuthority] = PublicKey.findProgramAddressSync(
      [Buffer.from("vault")],
      program.programId
    );

    [user1Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user1.publicKey.toBuffer()],
      program.programId
    );

    [user2Account] = PublicKey.findProgramAddressSync(
      [Buffer.from("user"), user2.publicKey.toBuffer()],
      program.programId
    );

    // Airdrop SOL to test users
    await provider.connection.requestAirdrop(
      user1.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    await provider.connection.requestAirdrop(
      user2.publicKey,
      100 * LAMPORTS_PER_SOL
    );
    
    // Wait for confirmations
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Create USDT mock mint
    usdtMint = await createMint(
      provider.connection,
      admin.payer,
      admin.publicKey,
      null,
      6
    );

    // Create platform token account
    platformTokenAccount = await createAccount(
      provider.connection,
      admin.payer,
      usdtMint,
      vaultAuthority,
      undefined
    );

    // Create user token accounts
    user1TokenAccount = await createAccount(
      provider.connection,
      admin.payer,
      usdtMint,
      user1.publicKey
    );

    user2TokenAccount = await createAccount(
      provider.connection,
      admin.payer,
      usdtMint,
      user2.publicKey
    );

    // Mint USDT to users
    await mintTo(
      provider.connection,
      admin.payer,
      usdtMint,
      user1TokenAccount,
      admin.publicKey,
      1000_000_000 // 1000 USDT
    );

    await mintTo(
      provider.connection,
      admin.payer,
      usdtMint,
      user2TokenAccount,
      admin.publicKey,
      1000_000_000 // 1000 USDT
    );
  });

  it("Initializes the platform", async () => {
    const tx = await program.methods
      .initialize(usdtMint)
      .accounts({
        platformState,
        tierConfig,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const platformAccount = await program.account.platformState.fetch(platformState);
    
    assert.equal(platformAccount.admin.toString(), admin.publicKey.toString());
    assert.equal(platformAccount.treasurySol.toNumber(), 0);
    assert.equal(platformAccount.treasuryUsdt.toNumber(), 0);
    assert.equal(platformAccount.totalStakedSol.toNumber(), 0);
    assert.equal(platformAccount.totalStakedUsdt.toNumber(), 0);
    assert.equal(platformAccount.usdtMint.toString(), usdtMint.toString());
    assert.equal(platformAccount.isPaused, false);
  });

  it("Deposits 1 SOL to Boot tier", async () => {
    const depositAmount = 1 * LAMPORTS_PER_SOL;
    const tier = 0; // Boot
    
    const tx = await program.methods
      .depositSol(new anchor.BN(depositAmount), tier)
      .accounts({
        platformState,
        userAccount: user1Account,
        tierConfig,
        user: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const userAccount = await program.account.userAccount.fetch(user1Account);
    const platformAccount = await program.account.platformState.fetch(platformState);
    
    // Check fee calculation (2%)
    const expectedFee = depositAmount * 2 / 100;
    const expectedNetAmount = depositAmount - expectedFee;
    
    assert.equal(userAccount.stakes.length, 1);
    assert.equal(userAccount.stakes[0].amount.toNumber(), expectedNetAmount);
    assert.equal(platformAccount.treasurySol.toNumber(), expectedFee);
    assert.equal(platformAccount.totalStakedSol.toNumber(), expectedNetAmount);
  });

  it("Deposits 5 SOL to Symbiotic tier", async () => {
    const depositAmount = 5 * LAMPORTS_PER_SOL;
    const tier = 1; // Symbiotic
    
    await program.methods
      .depositSol(new anchor.BN(depositAmount), tier)
      .accounts({
        platformState,
        userAccount: user1Account,
        tierConfig,
        user: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const userAccount = await program.account.userAccount.fetch(user1Account);
    assert.equal(userAccount.stakes.length, 2);
  });

  it("Deposits 25 SOL to Space tier", async () => {
    const depositAmount = 25 * LAMPORTS_PER_SOL;
    const tier = 2; // Space
    
    await program.methods
      .depositSol(new anchor.BN(depositAmount), tier)
      .accounts({
        platformState,
        userAccount: user2Account,
        tierConfig,
        user: user2.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user2])
      .rpc();

    const userAccount = await program.account.userAccount.fetch(user2Account);
    assert.equal(userAccount.stakes.length, 1);
  });

  it("Fails to deposit below minimum stake", async () => {
    const depositAmount = 0.5 * LAMPORTS_PER_SOL; // Below 1 SOL minimum
    const tier = 0;
    
    try {
      await program.methods
        .depositSol(new anchor.BN(depositAmount), tier)
        .accounts({
          platformState,
          userAccount: user1Account,
          tierConfig,
          user: user1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();
      
      assert.fail("Should have failed with insufficient stake amount");
    } catch (err) {
      assert.include(err.message, "InsufficientStakeAmount");
    }
  });

  it("Deposits USDT to Boot tier", async () => {
    const depositAmount = 100_000_000; // 100 USDT (6 decimals)
    const tier = 0;
    
    await program.methods
      .depositUsdt(new anchor.BN(depositAmount), tier)
      .accounts({
        platformState,
        userAccount: user1Account,
        tierConfig,
        userTokenAccount: user1TokenAccount,
        platformTokenAccount,
        user: user1.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const userAccount = await program.account.userAccount.fetch(user1Account);
    assert.equal(userAccount.stakes.length, 3); // 2 SOL + 1 USDT
  });

  it("Claims interim rewards", async () => {
    // Wait a bit to accrue rewards (in real test, might need to fast-forward time)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const stakeIndex = 0;
    const userAccountBefore = await program.account.userAccount.fetch(user1Account);
    const stakeBeforeClaimed = userAccountBefore.stakes[stakeIndex].claimedRewards.toNumber();
    
    await program.methods
      .claimRewards(new anchor.BN(stakeIndex))
      .accounts({
        platformState,
        userAccount: user1Account,
        tierConfig,
        vaultAuthority,
        user: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const userAccountAfter = await program.account.userAccount.fetch(user1Account);
    const stakeAfterClaimed = userAccountAfter.stakes[stakeIndex].claimedRewards.toNumber();
    
    assert.isTrue(stakeAfterClaimed > stakeBeforeClaimed);
  });

  it("Fails to withdraw before lock period", async () => {
    const stakeIndex = 0;
    
    try {
      await program.methods
        .withdrawSol(new anchor.BN(stakeIndex))
        .accounts({
          platformState,
          userAccount: user1Account,
          tierConfig,
          user: user1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();
      
      assert.fail("Should have failed with stake locked");
    } catch (err) {
      assert.include(err.message, "StakeLocked");
    }
  });

  it("Force withdraws with 20% penalty", async () => {
    const stakeIndex = 1; // Symbiotic stake
    
    const userAccountBefore = await program.account.userAccount.fetch(user1Account);
    const stake = userAccountBefore.stakes[stakeIndex];
    
    await program.methods
      .forceWithdraw(new anchor.BN(stakeIndex))
      .accounts({
        platformState,
        userAccount: user1Account,
        tierConfig,
        vaultAuthority,
        user: user1.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([user1])
      .rpc();

    const userAccountAfter = await program.account.userAccount.fetch(user1Account);
    const stakeAfter = userAccountAfter.stakes[stakeIndex];
    
    assert.equal(stakeAfter.isActive, false);
  });

  it("Admin transfers treasury funds", async () => {
    const recipient = Keypair.generate();
    const transferAmount = 0.1 * LAMPORTS_PER_SOL;
    
    // First airdrop to recipient so account exists
    await provider.connection.requestAirdrop(recipient.publicKey, LAMPORTS_PER_SOL);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const platformBefore = await program.account.platformState.fetch(platformState);
    const treasuryBefore = platformBefore.treasurySol.toNumber();
    
    await program.methods
      .adminTransfer(new anchor.BN(transferAmount), 0) // 0 = SOL
      .accounts({
        platformState,
        vaultAuthority,
        recipient: recipient.publicKey,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const platformAfter = await program.account.platformState.fetch(platformState);
    const treasuryAfter = platformAfter.treasurySol.toNumber();
    
    assert.equal(treasuryAfter, treasuryBefore - transferAmount);
  });

  it("Changes admin", async () => {
    const newAdmin = Keypair.generate();
    
    await program.methods
      .setAdmin()
      .accounts({
        platformState,
        admin: admin.publicKey,
        newAdmin: newAdmin.publicKey,
      })
      .rpc();

    const platformAccount = await program.account.platformState.fetch(platformState);
    assert.equal(platformAccount.admin.toString(), newAdmin.publicKey.toString());
    
    // Change back for other tests
    await program.methods
      .setAdmin()
      .accounts({
        platformState,
        admin: newAdmin.publicKey,
        newAdmin: admin.publicKey,
      })
      .signers([newAdmin])
      .rpc();
  });

  it("Updates tier configuration", async () => {
    const tier = 0; // Boot
    const newMinStake = 2 * LAMPORTS_PER_SOL;
    const newMultiplier = 2;
    const newLockDays = 45;
    
    await program.methods
      .updateTierConfig(
        tier,
        new anchor.BN(newMinStake),
        new anchor.BN(newMultiplier),
        new anchor.BN(newLockDays)
      )
      .accounts({
        platformState,
        tierConfig,
        admin: admin.publicKey,
      })
      .rpc();

    const tierConfigAccount = await program.account.tierConfig.fetch(tierConfig);
    assert.equal(tierConfigAccount.bootMinStake.toNumber(), newMinStake);
    assert.equal(tierConfigAccount.bootMultiplier.toNumber(), newMultiplier);
    assert.equal(tierConfigAccount.bootLockDays.toNumber(), newLockDays);
  });

  it("Pauses and resumes program", async () => {
    await program.methods
      .pauseProgram()
      .accounts({
        platformState,
        admin: admin.publicKey,
      })
      .rpc();

    let platformAccount = await program.account.platformState.fetch(platformState);
    assert.equal(platformAccount.isPaused, true);
    
    // Try to deposit while paused (should fail)
    try {
      await program.methods
        .depositSol(new anchor.BN(LAMPORTS_PER_SOL), 0)
        .accounts({
          platformState,
          userAccount: user1Account,
          tierConfig,
          user: user1.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([user1])
        .rpc();
      
      assert.fail("Should have failed with program paused");
    } catch (err) {
      assert.include(err.message, "ProgramPaused");
    }
    
    // Resume
    await program.methods
      .resumeProgram()
      .accounts({
        platformState,
        admin: admin.publicKey,
      })
      .rpc();

    platformAccount = await program.account.platformState.fetch(platformState);
    assert.equal(platformAccount.isPaused, false);
  });

  it("Non-admin cannot perform admin functions", async () => {
    try {
      await program.methods
        .pauseProgram()
        .accounts({
          platformState,
          admin: user1.publicKey,
        })
        .signers([user1])
        .rpc();
      
      assert.fail("Should have failed with unauthorized");
    } catch (err) {
      assert.include(err.message, "Unauthorized");
    }
  });
});
