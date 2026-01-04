import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useProgram } from './useProgram';
import { getUserPDAs } from '../lib/solana-config';

export function useUserStakes() {
  const { publicKey } = useWallet();
  const program = useProgram();
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStakes = async () => {
    if (!publicKey || !program) return;
    
    try {
      setLoading(true);
      const { userAccount } = getUserPDAs(publicKey);
      const account = await program.account.userAccount.fetch(userAccount);
      setStakes(account.stakes || []);
      setError(null);
    } catch (err) {
      if (err.message.includes('Account does not exist')) {
        setStakes([]);
      } else {
        console.error('Error fetching stakes:', err);
        setError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStakes();
  }, [publicKey, program]);

  return { stakes, loading, error, refresh: fetchStakes };
}
