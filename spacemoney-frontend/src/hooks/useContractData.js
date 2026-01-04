import { useState, useEffect, useCallback } from 'react';
import { useProgram } from './useProgram';
import { getPlatformStatePDA, getTierConfigPDA, createConnection } from '../lib/solana-config';
import { PROGRAM_ID } from '../utils/constants';
import { PublicKey } from '@solana/web3.js';

export function useContractData() {
  const program = useProgram();
  const [platformState, setPlatformState] = useState(null);
  const [tierConfig, setTierConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!program) return;

    try {
      setLoading(true);
      const programId = new PublicKey(PROGRAM_ID);
      const [platformStatePDA] = getPlatformStatePDA(programId);
      const [tierConfigPDA] = getTierConfigPDA(programId);

      const [state, tiers] = await Promise.all([
        program.account.platformState.fetch(platformStatePDA).catch(() => null),
        program.account.tierConfig.fetch(tierConfigPDA).catch(() => null),
      ]);

      setPlatformState(state);
      setTierConfig(tiers);
      setError(null);
    } catch (err) {
      console.error('Error fetching contract data:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [program]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return { platformState, tierConfig, loading, error, refresh: fetchData };
}
