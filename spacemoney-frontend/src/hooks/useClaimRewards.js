import { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';
import { useProgram } from './useProgram';
import { getUserPDAs } from '../lib/solana-config';
import { USDT_MINT } from '../utils/constants';
import { BN } from '@coral-xyz/anchor';

export function useClaimRewards() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [loading, setLoading] = useState(false);

  const claimRewards = async (stakeIndex, isUsdt) => {
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
        .claimRewards(new BN(stakeIndex))
        .accounts(accounts)
        .rpc();
        
      return tx;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { claimRewards, loading };
}
