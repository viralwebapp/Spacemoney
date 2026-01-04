import { useState, useEffect, useCallback } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { USDT_MINT } from '../utils/constants';

export function useTokenBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!publicKey) {
      setBalance(0);
      return;
    }

    try {
      setLoading(true);
      const mintPubkey = new PublicKey(USDT_MINT);
      const ata = await getAssociatedTokenAddress(mintPubkey, publicKey);
      
      try {
        const account = await getAccount(connection, ata);
        // Assuming USDT has 6 decimals
        setBalance(Number(account.amount) / 1e6);
      } catch (e) {
        // ATA might not exist
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching token balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return { balance, loading, refresh: fetchBalance };
}
