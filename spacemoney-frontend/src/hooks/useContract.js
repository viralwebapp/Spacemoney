import { useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { getProgram, getUserPDAs } from '../lib/solana-config';
import { useToast } from '../contexts/ToastContext';
import { parseTransactionError } from '../utils/error-handler';
import { BN } from '@coral-xyz/anchor';

export function useContract() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const { success, error: toastError, info } = useToast();

  const program = useMemo(() => {
    return getProgram(wallet.publicKey ? wallet : null);
  }, [wallet.publicKey, wallet.connected]);

  const depositSol = async (amount, tier) => {
    if (!wallet.publicKey) {
      toastError('Error', 'Wallet not connected');
      return;
    }

    try {
      info('Processing', 'Initiating SOL deposit...');
      const { platformState, userAccount, tierConfig, programId } = getUserPDAs(wallet.publicKey);
      
      const tx = await program.methods
        .depositSol(new BN(amount * 1e9), tier)
        .accounts({
          platformState,
          userAccount,
          tierConfig,
          user: wallet.publicKey,
          systemProgram: '11111111111111111111111111111111',
        })
        .rpc();

      success('Success', 'SOL deposited successfully!', { txHash: tx });
      return tx;
    } catch (e) {
      console.error('Deposit SOL error:', e);
      toastError('Deposit Failed', parseTransactionError(e));
      throw e;
    }
  };

  const withdrawSol = async (stakeIndex) => {
    if (!wallet.publicKey) {
      toastError('Error', 'Wallet not connected');
      return;
    }

    try {
      info('Processing', 'Initiating SOL withdrawal...');
      const { platformState, userAccount, vaultAuthority, programId } = getUserPDAs(wallet.publicKey);

      const tx = await program.methods
        .withdrawSol(stakeIndex)
        .accounts({
          platformState,
          userAccount,
          vaultAuthority,
          user: wallet.publicKey,
          systemProgram: '11111111111111111111111111111111',
        })
        .rpc();

      success('Success', 'SOL withdrawn successfully!', { txHash: tx });
      return tx;
    } catch (e) {
      console.error('Withdraw SOL error:', e);
      toastError('Withdrawal Failed', parseTransactionError(e));
      throw e;
    }
  };

  const claimRewards = async (stakeIndex) => {
    if (!wallet.publicKey) {
      toastError('Error', 'Wallet not connected');
      return;
    }

    try {
      info('Processing', 'Claiming rewards...');
      const { platformState, userAccount, vaultAuthority, programId } = getUserPDAs(wallet.publicKey);

      const tx = await program.methods
        .claimRewards(stakeIndex)
        .accounts({
          platformState,
          userAccount,
          vaultAuthority,
          user: wallet.publicKey,
          systemProgram: '11111111111111111111111111111111',
        })
        .rpc();

      success('Success', 'Rewards claimed successfully!', { txHash: tx });
      return tx;
    } catch (e) {
      console.error('Claim rewards error:', e);
      toastError('Claim Failed', parseTransactionError(e));
      throw e;
    }
  };

  return {
    program,
    depositSol,
    withdrawSol,
    claimRewards,
    wallet: wallet.publicKey,
    connected: wallet.connected
  };
}
