import { useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { getProgram } from '../lib/solana-config';

export function useProgram() {
  const wallet = useWallet();
  
  const program = useMemo(() => {
    return getProgram(wallet.connected ? wallet : null);
  }, [wallet.connected, wallet.publicKey]);

  return program;
}
