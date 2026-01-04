import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getUserPDAs, getPlatformStatePDA, getTierConfigPDA } from '../lib/solana-config';
import { PROGRAM_ID, USDT_MINT } from '../utils/constants';
import { BN } from '@coral-xyz/anchor';

export function useDeposit() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const depositSol = async (amount, tier) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, userAccount, tierConfig } = getUserPDAs(publicKey);
      
      const tx = await program.methods
        .depositSol(new BN(amount * 1e9), tier)
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
      console.error('Error depositing SOL:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const depositUsdt = async (amount, tier) => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { platformState, userAccount, tierConfig } = getUserPDAs(publicKey);
      const usdtMint = new PublicKey(USDT_MINT);
      
      const userTokenAccount = await getAssociatedTokenAddress(usdtMint, publicKey);
      const platformTokenAccount = await getAssociatedTokenAddress(usdtMint, platformState, true);
      
      const tx = await program.methods
        .depositUsdt(new BN(amount * 1e6), tier)
        .accounts({
          platformState,
          userAccount,
          tierConfig,
          userTokenAccount,
          platformTokenAccount,
          user: publicKey,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error depositing USDT:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { depositSol, depositUsdt, loading };
}
