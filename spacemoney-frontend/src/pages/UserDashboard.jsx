import React, { useEffect, useState } from 'react';
import { useContract } from '../hooks/useContract';
import { formatSOL } from '../utils/formatters';
import { getSOLBalance } from '../lib/solana-config';

export default function UserDashboard() {
  const { connected, wallet, depositSol, withdrawSol, claimRewards } = useContract();
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (connected && wallet) {
      getSOLBalance(wallet).then(setBalance);
    }
  }, [connected, wallet]);

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 gradient-text">User Dashboard</h1>
        
        {!connected ? (
          <div className="card p-8 text-center">
            <p className="text-text-secondary mb-4">Please connect your wallet to view your stakes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-text-secondary mb-2">Wallet Balance</h3>
              <p className="text-3xl font-bold">{formatSOL(balance)} SOL</p>
            </div>
            
            <div className="col-span-1 md:col-span-3">
              <div className="card p-6">
                <h2 className="text-2xl font-bold mb-4">Your Stakes</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-4 font-semibold">Tier</th>
                        <th className="py-4 font-semibold">Amount</th>
                        <th className="py-4 font-semibold">Rewards</th>
                        <th className="py-4 font-semibold">Status</th>
                        <th className="py-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Stake rows would be mapped here */}
                      <tr className="text-text-secondary">
                        <td colSpan="5" className="py-8 text-center">
                          No active stakes found. Start by choosing a node plan!
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
