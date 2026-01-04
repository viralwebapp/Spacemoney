import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getUserPDAs, getPlatformStatePDA, getTierConfigPDA, getVaultAuthorityPDA } from '../lib/solana-config';
import { PROGRAM_ID, USDT_MINT } from '../utils/constants';
import { BN } from '@coral-xyz/anchor';

export function useWithdraw() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const withdrawSol = async (stakeIndex) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, userAccount, tierConfig } = getUserPDAs(publicKey);
      
      const tx = await program.methods
        .withdrawSol(new BN(stakeIndex))
        .accounts({
          platformState,
          userAccount,
          tierConfig,
          user: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error withdrawing SOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const withdrawUsdt = async (stakeIndex) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, userAccount, tierConfig, vaultAuthority } = getUserPDAs(publicKey);
      const usdtMint = new PublicKey(USDT_MINT);
      
      const userTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey);
      const platformTokenAccount = await getAssociatedTokenAddress(usdtMint, vaultAuthority, true);
      
      const tx = await program.methods
        .withdrawUsdt(new BN(stakeIndex))
        .accounts({
          platformState,
          userAccount,
          tierConfig,
          userTokenAccount,
          platformTokenAccount,
          vaultAuthority,
          user: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error withdrawing USDT:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const forceWithdraw = async (stakeIndex, isUsdt) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, userAccount, tierConfig, vaultAuthority } = getUserPDAs(publicKey);
      
      let accounts = {
        platformState,
        userAccount,
        tierConfig,
        vaultAuthority,
        user: publicKey,
        systemProgram: SystemProgram.programId,
        userTokenAccount: null,
        platformTokenAccount: null,
        tokenProgram: null,
      };

      if (isUsdt) {
        const usdtMint = new PublicKey(USDT_MINT);
        accounts.userTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey);
        accounts.platformTokenAccount = await getAssociatedTokenAddress(usdtMint, vaultAuthority, true);
        accounts.tokenProgram = TOKEN_PROGRAM_ID;
      }

      const tx = await program.methods
        .forceWithdraw(new BN(stakeIndex))
        .accounts(accounts)
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error force withdrawing:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { withdrawSol, withdrawUsdt, forceWithdraw, loading };
}
