import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getUserPDAs } from '../lib/solana-config';
import { USDT_MINT } from '../utils/constants';
import { BN } from '@coral-xyz/anchor';

export function useAdminActions() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const adminTransfer = async (amount, tokenType, recipientAddress) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, vaultAuthority } = getUserPDAs(publicKey);
      const recipient = new PublicKey(recipientAddress);
      
      let accounts = {
        platformState,
        vaultAuthority,
        recipient,
        admin: publicKey,
        systemProgram: SystemProgram.programId,
        platformTokenAccount: null,
        recipientTokenAccount: null,
        tokenProgram: null,
      };

      if (tokenType === 1) { // USDT
        const usdtMint = new PublicKey(USDT_MINT);
        accounts.platformTokenAccount = await getAssociatedTokenAddress(usdtMint, vaultAuthority, true);
        accounts.recipientTokenAccount = await getAssociatedTokenAddress(usdtMint, recipient);
        accounts.tokenProgram = TOKEN_PROGRAM_ID;
      }

      const tx = await program.methods
        .adminTransfer(new BN(tokenType === 0 ? amount * 1e9 : amount * 1e6), tokenType)
        .accounts(accounts)
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error in admin transfer:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const setAdmin = async (newAdminAddress) => {
    if (!publicKey || !program) return;
    try {
      setLoading(true);
      const { platformState } = getUserPDAs(publicKey);
      const tx = await program.methods
        .setAdmin()
        .accounts({
          platformState,
          admin: publicKey,
          newAdmin: new PublicKey(newAdminAddress),
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error('Error setting admin:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateTierConfig = async (tier, minStake, multiplier, lockDays) => {
    if (!publicKey || !program) return;
    try {
      setLoading(true);
      const { platformState, tierConfig } = getUserPDAs(publicKey);
      const tx = await program.methods
        .updateTierConfig(tier, new BN(minStake * 1e9), new BN(multiplier), new BN(lockDays))
        .accounts({
          platformState,
          tierConfig,
          admin: publicKey,
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error('Error updating tier config:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const pauseProgram = async () => {
    if (!publicKey || !program) return;
    try {
      setLoading(true);
      const { platformState } = getUserPDAs(publicKey);
      const tx = await program.methods
        .pauseProgram()
        .accounts({
          platformState,
          admin: publicKey,
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error('Error pausing program:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resumeProgram = async () => {
    if (!publicKey || !program) return;
    try {
      setLoading(true);
      const { platformState } = getUserPDAs(publicKey);
      const tx = await program.methods
        .resumeProgram()
        .accounts({
          platformState,
          admin: publicKey,
        })
        .rpc();
      return tx;
    } catch (error) {
      console.error('Error resuming program:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { adminTransfer, setAdmin, updateTierConfig, pauseProgram, resumeProgram, loading };
}
