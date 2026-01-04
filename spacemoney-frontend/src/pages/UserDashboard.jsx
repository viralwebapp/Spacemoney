import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, Clock, ArrowUpCircle, Plus } from 'lucide-react';
import { getSOLBalance } from '../lib/solana-config';
import { formatAddress, formatSOL } from '../utils/formatters';
import { useUserStakes } from '../hooks/useUserStakes';
import { TIERS } from '../utils/constants';

export default function UserDashboard() {
  const { publicKey, connected } = useWallet();
  const [balance, setBalance] = useState(0);
  const { stakes, loading: stakesLoading, refresh: refreshStakes } = useUserStakes();
  const [searchParams] = useSearchParams();
  const selectedTierId = searchParams.get('tier');

  useEffect(() => {
    if (connected && publicKey) {
      updateBalance();
    }
  }, [connected, publicKey]);

  const updateBalance = async () => {
    try {
      const bal = await getSOLBalance(publicKey);
      setBalance(bal);
      refreshStakes();
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const totalStaked = stakes.reduce((acc, stake) => 
    stake.isActive ? acc + (stake.amount.toNumber() / 1e9) : acc, 0
  );

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-cyan">
            <Wallet className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-text-secondary mb-8">
            Please connect your Solana wallet to access your dashboard, view your stakes, and claim rewards.
          </p>
          <WalletMultiButton className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-2 gradient-text">Dashboard</h1>
            <p className="text-text-secondary flex items-center gap-2">
              Welcome back, <span className="text-white font-mono">{formatAddress(publicKey.toBase58())}</span>
            </p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={updateBalance}
              className="px-6 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
            >
              Refresh
            </button>
            <Link to="/node-plans" className="btn btn-primary flex items-center gap-2">
              <Plus className="w-5 h-5" /> New Stake
            </Link>
          </div>
        </div>

        {/* Selected Tier Action Card */}
        {selectedTierId !== null && (
          <div className="mb-12 p-8 rounded-2xl bg-primary-cyan/10 border border-primary-cyan/20 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">
                Staking for {Object.values(TIERS).find(t => t.id === parseInt(selectedTierId))?.name || 'Node'}
              </h3>
              <p className="text-text-secondary">Complete your deposit to start earning rewards.</p>
            </div>
            <button className="btn btn-primary px-8">Confirm Deposit</button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Wallet Balance', value: `${balance.toFixed(4)} SOL`, icon: Wallet, color: 'text-primary-cyan' },
            { label: 'Total Staked', value: `${totalStaked.toFixed(2)} SOL`, icon: ArrowUpCircle, color: 'text-primary-violet' },
            { label: 'Total Earned', value: '0.00 SOL', icon: TrendingUp, color: 'text-green-400' },
            { label: 'Active Stakes', value: stakes.filter(s => s.isActive).length, icon: Clock, color: 'text-yellow-400' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl bg-gray-900/50 border border-border"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gray-800 ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <span className="text-text-secondary font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Stakes Section */}
        <div className="rounded-2xl bg-gray-900/50 border border-border overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-xl font-bold">Your Active Stakes</h2>
            <button onClick={refreshStakes} className="text-primary-cyan hover:underline text-sm font-medium">
              {stakesLoading ? 'Refreshing...' : 'Refresh Stakes'}
            </button>
          </div>
          
          {stakes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-800/50 text-text-secondary text-sm uppercase">
                  <tr>
                    <th className="px-6 py-4">Tier</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Lock Until</th>
                    <th className="px-6 py-4">Rewards</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {stakes.map((stake, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4 font-bold">{stake.tier.name || 'SOL'}</td>
                      <td className="px-6 py-4">{formatSOL(stake.amount)} SOL</td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(stake.lockUntil.toNumber() * 1000).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-green-400 font-bold">
                        {formatSOL(stake.claimedRewards)} SOL
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-primary-cyan hover:underline font-medium">Claim</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-text-secondary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Active Stakes</h3>
              <p className="text-text-secondary mb-6 max-w-xs mx-auto">
                You haven't staked any SOL yet. Start earning up to 540% APY by choosing a node plan.
              </p>
              <Link to="/node-plans" className="btn btn-primary inline-block">
                Explore Plans
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
