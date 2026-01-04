import React, { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  Clock, 
  ArrowUpCircle, 
  Plus, 
  ExternalLink, 
  ChevronRight, 
  RefreshCcw,
  Gift,
  ShieldAlert,
  Info,
  ArrowDownCircle,
  BarChart3
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { getSOLBalance } from '../lib/solana-config';
import { formatAddress, formatSOL } from '../utils/formatters';
import { useUserStakes } from '../hooks/useUserStakes';
import { useDeposit } from '../hooks/useDeposit';
import { useWithdraw } from '../hooks/useWithdraw';
import { useClaimRewards } from '../hooks/useClaimRewards';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { TIERS, DEPOSIT_FEE, FORCE_WITHDRAW_PENALTY } from '../utils/constants';
import { useToast } from '../contexts/ToastContext';

export default function UserDashboard() {
  const { publicKey, connected } = useWallet();
  const [solBalance, setSolBalance] = useState(0);
  const { balance: usdtBalance, refresh: refreshUsdt } = useTokenBalance();
  const { stakes, loading: stakesLoading, refresh: refreshStakes } = useUserStakes();
  const { depositSol, depositUsdt, loading: depositLoading } = useDeposit();
  const { withdrawSol, withdrawUsdt, forceWithdraw, loading: withdrawLoading } = useWithdraw();
  const { claimRewards, loading: claimLoading } = useClaimRewards();
  const { showToast } = useToast();
  
  const [searchParams] = useSearchParams();
  const selectedTierId = searchParams.get('tier');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositType, setDepositType] = useState('SOL');
  const [activeTier, setActiveTier] = useState(parseInt(selectedTierId) || 0);

  useEffect(() => {
    if (connected && publicKey) {
      updateBalances();
    }
  }, [connected, publicKey]);

  useEffect(() => {
    if (selectedTierId !== null) {
      setIsDepositModalOpen(true);
      setActiveTier(parseInt(selectedTierId));
    }
  }, [selectedTierId]);

  const updateBalances = async () => {
    try {
      const bal = await getSOLBalance(publicKey);
      setSolBalance(bal);
      refreshUsdt();
      refreshStakes();
    } catch (error) {
      console.error('Error fetching balances:', error);
    }
  };

  const stats = useMemo(() => {
    const active = stakes.filter(s => s.isActive);
    const totalStakedSOL = active
      .filter(s => Object.keys(s.tokenType)[0] === 'SOL')
      .reduce((acc, s) => acc + (s.amount.toNumber() / 1e9), 0);
    const totalStakedUSDT = active
      .filter(s => Object.keys(s.tokenType)[0] === 'USDT')
      .reduce((acc, s) => acc + (s.amount.toNumber() / 1e6), 0);
    const totalEarnedSOL = active
      .filter(s => Object.keys(s.tokenType)[0] === 'SOL')
      .reduce((acc, s) => acc + (s.claimedRewards.toNumber() / 1e9), 0);
    
    return {
      totalStakedSOL,
      totalStakedUSDT,
      totalEarnedSOL,
      activeCount: active.length
    };
  }, [stakes]);

  const handleDeposit = async (e) => {
    e.preventDefault();
    if (!depositAmount || isNaN(depositAmount)) return;

    try {
      if (depositType === 'SOL') {
        await depositSol(parseFloat(depositAmount), activeTier);
      } else {
        await depositUsdt(parseFloat(depositAmount), activeTier);
      }
      showToast('Deposit successful!', 'success');
      setIsDepositModalOpen(false);
      updateBalances();
    } catch (err) {
      showToast(err.message || 'Deposit failed', 'error');
    }
  };

  const handleClaim = async (index, isUsdt) => {
    try {
      await claimRewards(index, isUsdt);
      showToast('Rewards claimed!', 'success');
      updateBalances();
    } catch (err) {
      showToast(err.message || 'Claim failed', 'error');
    }
  };

  const handleWithdraw = async (index, isUsdt, isForce = false) => {
    try {
      if (isForce) {
        if (!confirm(`Force withdrawal will incur a ${FORCE_WITHDRAW_PENALTY * 100}% penalty on accrued rewards. Continue?`)) return;
        await forceWithdraw(index, isUsdt);
      } else {
        if (isUsdt) {
          await withdrawUsdt(index);
        } else {
          await withdrawSol(index);
        }
      }
      showToast('Withdrawal successful!', 'success');
      updateBalances();
    } catch (err) {
      showToast(err.message || 'Withdrawal failed', 'error');
    }
  };

  const chartData = [
    { name: 'Day 1', rewards: 0 },
    { name: 'Day 5', rewards: 0.5 },
    { name: 'Day 10', rewards: 1.2 },
    { name: 'Day 15', rewards: 2.5 },
    { name: 'Day 20', rewards: 3.8 },
    { name: 'Day 25', rewards: 5.2 },
    { name: 'Day 30', rewards: 7.5 },
  ];

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg pt-20">
        <div className="text-center max-w-md">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-24 h-24 bg-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-8 text-primary-cyan shadow-xl"
          >
            <Wallet className="w-12 h-12" />
          </motion.div>
          <h2 className="text-4xl font-bold mb-4 text-white">Connect Wallet</h2>
          <p className="text-text-secondary mb-10 text-lg">
            Access your staking dashboard, monitor earnings, and manage your node plans.
          </p>
          <WalletMultiButton className="!bg-primary-cyan !h-14 !px-10 !rounded-xl !text-black !font-bold hover:!opacity-90 transition-all mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-24 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
          <div>
            <motion.h1 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-5xl font-extrabold mb-3 gradient-text"
            >
              Dashboard
            </motion.h1>
            <p className="text-text-secondary flex items-center gap-2 text-lg">
              Welcome, <span className="text-white font-mono bg-white/5 px-3 py-1 rounded-lg border border-white/10">{formatAddress(publicKey.toBase58())}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={updateBalances}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-800 hover:bg-gray-700 transition-all border border-border group"
            >
              <RefreshCcw className={`w-5 h-5 group-hover:rotate-180 transition-transform duration-500 ${stakesLoading ? 'animate-spin' : ''}`} />
              <span>Refresh Data</span>
            </button>
            <button 
              onClick={() => setIsDepositModalOpen(true)}
              className="btn btn-primary flex items-center gap-2 px-8 py-3 rounded-xl shadow-lg shadow-primary-cyan/20"
            >
              <Plus className="w-6 h-6" /> 
              <span className="font-bold">New Deposit</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Wallet Balance', value: `${solBalance.toFixed(3)} SOL`, subValue: `${usdtBalance.toFixed(2)} USDT`, icon: Wallet, color: 'text-primary-cyan', bg: 'bg-primary-cyan/10' },
            { label: 'Total Staked', value: `${stats.totalStakedSOL.toFixed(2)} SOL`, subValue: `${stats.totalStakedUSDT.toFixed(2)} USDT`, icon: ArrowUpCircle, color: 'text-primary-violet', bg: 'bg-primary-violet/10' },
            { label: 'Total Earned', value: `${stats.totalEarnedSOL.toFixed(4)} SOL`, subValue: 'Auto-compounding', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Active Stakes', value: stats.activeCount, subValue: 'Running nodes', icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-8 group hover:border-white/20 transition-all"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <stat.icon className="w-7 h-7" />
                </div>
                <span className="text-text-secondary font-semibold text-lg">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-text-secondary font-medium">{stat.subValue}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Chart Section */}
          <div className="lg:col-span-2 glass-card p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold flex items-center gap-3">
                <BarChart3 className="text-primary-cyan" /> Earnings Performance
              </h3>
              <div className="flex gap-2 text-xs">
                <span className="px-3 py-1 bg-primary-cyan/20 text-primary-cyan rounded-full font-bold">SOL Rewards</span>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5CE1E6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5CE1E6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis dataKey="name" stroke="#ffffff40" axisLine={false} tickLine={false} />
                  <YAxis stroke="#ffffff40" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#5CE1E6' }}
                  />
                  <Area type="monotone" dataKey="rewards" stroke="#5CE1E6" fillOpacity={1} fill="url(#colorRewards)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Tier Overview */}
          <div className="glass-card p-8">
            <h3 className="text-2xl font-bold mb-8">Node Distribution</h3>
            <div className="space-y-6">
              {Object.values(TIERS).map((tier) => {
                const count = stakes.filter(s => s.isActive && s.tier[Object.keys(s.tier)[0]] === tier.id).length;
                return (
                  <div key={tier.id} className="group cursor-help">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-bold flex items-center gap-2">
                        <span className="text-xl">{tier.icon}</span> {tier.name}
                      </span>
                      <span className="text-text-secondary text-sm font-bold">{count} Active</span>
                    </div>
                    <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(count / (stats.activeCount || 1)) * 100}%` }}
                        className="h-full bg-primary-cyan shadow-[0_0_10px_rgba(92,225,230,0.5)]"
                        style={{ backgroundColor: tier.color }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-6 mt-6 border-t border-border">
                <Link to="/node-plans" className="text-primary-cyan hover:underline flex items-center justify-between font-bold group">
                  Upgrade your node plan <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Stakes Table */}
        <div className="glass-card overflow-hidden">
          <div className="p-8 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-1">Your Active Nodes</h2>
              <p className="text-text-secondary font-medium">Manage your stakes and claim rewards</p>
            </div>
            <div className="flex gap-4">
               {/* Filters could go here */}
            </div>
          </div>
          
          {stakes.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5 text-text-secondary text-sm uppercase tracking-wider">
                    <th className="px-8 py-5 font-bold">Node Plan</th>
                    <th className="px-8 py-5 font-bold">Amount</th>
                    <th className="px-8 py-5 font-bold">Status</th>
                    <th className="px-8 py-5 font-bold">Unclaimed Rewards</th>
                    <th className="px-8 py-5 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {stakes.map((stake, i) => {
                    const isUsdt = Object.keys(stake.tokenType)[0] === 'USDT';
                    const tierKey = Object.keys(stake.tier)[0];
                    const tierInfo = TIERS[tierKey.toUpperCase()] || TIERS.BOOT;
                    const isLocked = stake.lockUntil.toNumber() > Date.now() / 1000;
                    
                    return (
                      <motion.tr 
                        key={i} 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-white/5 transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-800 group-hover:scale-110 transition-transform">
                              {tierInfo.icon}
                            </div>
                            <div>
                              <div className="font-bold text-white text-lg">{tierInfo.name}</div>
                              <div className="text-xs text-text-secondary font-medium">Locked until {new Date(stake.lockUntil.toNumber() * 1000).toLocaleDateString()}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-bold text-white">
                            {isUsdt ? (stake.amount.toNumber() / 1e6).toFixed(2) : (stake.amount.toNumber() / 1e9).toFixed(3)}
                            <span className="text-text-secondary ml-1.5 text-xs">{isUsdt ? 'USDT' : 'SOL'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            stake.isActive ? 'bg-green-500/10 text-green-400' : 'bg-gray-500/10 text-gray-400'
                          }`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${stake.isActive ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                            {stake.isActive ? 'Active' : 'Completed'}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="font-black text-green-400 text-lg flex items-center gap-2">
                            <Gift className="w-4 h-4" />
                            {isUsdt ? (stake.claimedRewards.toNumber() / 1e6).toFixed(4) : (stake.claimedRewards.toNumber() / 1e9).toFixed(6)}
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-3">
                            <button 
                              onClick={() => handleClaim(i, isUsdt)}
                              disabled={claimLoading || !stake.isActive}
                              className="px-4 py-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-400 text-sm font-bold transition-all border border-green-500/20 disabled:opacity-50"
                            >
                              Claim
                            </button>
                            {isLocked ? (
                              <button 
                                onClick={() => handleWithdraw(i, isUsdt, true)}
                                disabled={withdrawLoading || !stake.isActive}
                                className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-bold transition-all border border-red-500/20 disabled:opacity-50 flex items-center gap-1.5"
                                title="Force withdraw before lock period"
                              >
                                <ShieldAlert className="w-4 h-4" /> Force
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleWithdraw(i, isUsdt)}
                                disabled={withdrawLoading || !stake.isActive}
                                className="px-4 py-2 rounded-lg bg-primary-cyan/10 hover:bg-primary-cyan/20 text-primary-cyan text-sm font-bold transition-all border border-primary-cyan/20 disabled:opacity-50"
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-text-secondary group hover:scale-110 transition-transform">
                <Plus className="w-10 h-10 group-hover:text-primary-cyan transition-colors" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">No Active Nodes Found</h3>
              <p className="text-text-secondary mb-10 max-w-sm mx-auto text-lg font-medium">
                You haven't staked any assets yet. Start earning up to 540% APY with our node plans.
              </p>
              <Link to="/node-plans" className="btn btn-primary px-10 py-4 rounded-xl text-lg font-bold">
                Explore Node Plans
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg glass-card p-10 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-cyan to-primary-violet" />
              
              <h2 className="text-3xl font-black mb-2">New Stake</h2>
              <p className="text-text-secondary mb-8 font-medium">Select a tier and amount to start earning rewards.</p>
              
              <form onSubmit={handleDeposit} className="space-y-8">
                {/* Tier Selection */}
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(TIERS).map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setActiveTier(tier.id)}
                      className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                        activeTier === tier.id 
                          ? 'border-primary-cyan bg-primary-cyan/10' 
                          : 'border-white/5 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-2xl">{tier.icon}</span>
                      <span className={`text-xs font-black uppercase tracking-wider ${activeTier === tier.id ? 'text-primary-cyan' : 'text-text-secondary'}`}>
                        {tier.name.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-end px-1">
                    <label className="text-sm font-bold text-text-secondary uppercase tracking-widest">Amount</label>
                    <div className="flex gap-2">
                      {['SOL', 'USDT'].map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDepositType(type)}
                          className={`text-xs font-black px-3 py-1 rounded-full transition-all ${
                            depositType === type ? 'bg-primary-cyan text-black' : 'bg-gray-800 text-text-secondary'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative group">
                    <input
                      type="number"
                      step="0.01"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="w-full h-16 px-6 rounded-2xl bg-gray-800/50 border-2 border-white/5 text-2xl font-black text-white focus:outline-none focus:border-primary-cyan transition-all group-hover:border-white/10"
                      placeholder="0.00"
                      required
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-secondary font-black opacity-50">
                      {depositType}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-bold px-1">
                    <span className="text-text-secondary uppercase">Fee: <span className="text-white">{(DEPOSIT_FEE * 100)}%</span></span>
                    <span className="text-text-secondary uppercase">Minimum: <span className="text-white">
                      {depositType === 'SOL' ? Object.values(TIERS)[activeTier].minStake : (Object.values(TIERS)[activeTier].minStake * 20)} {depositType}
                    </span></span>
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Expected Daily Yield</span>
                    <span className="text-green-400">~{Object.values(TIERS)[activeTier].multiplier * 1}%</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-text-secondary">Lock Duration</span>
                    <span className="text-primary-violet">{Object.values(TIERS)[activeTier].lockDays} Days</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setIsDepositModalOpen(false)}
                    className="flex-1 py-4 rounded-xl font-bold bg-white/5 hover:bg-white/10 text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={depositLoading}
                    className="flex-[2] btn btn-primary py-4 rounded-xl font-black text-lg shadow-xl shadow-primary-cyan/20 disabled:opacity-50"
                  >
                    {depositLoading ? 'Confirming...' : 'Initialize Stake'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
