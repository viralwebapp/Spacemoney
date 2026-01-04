import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TIERS, DEPOSIT_FEE } from '../utils/constants';
import { calculateTotalRewards, calculateDailyRewards, calculateAPY } from '../utils/calculations';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Info, Calculator, TrendingUp, ShieldCheck } from 'lucide-react';

export default function RewardCalculator() {
  const [amount, setAmount] = useState(10);
  const [selectedTier, setSelectedTier] = useState(TIERS.BOOT.id);

  const tierInfo = useMemo(() => 
    Object.values(TIERS).find(t => t.id === selectedTier),
    [selectedTier]
  );

  const stats = useMemo(() => {
    const netAmount = amount * (1 - DEPOSIT_FEE);
    const daily = calculateDailyRewards(netAmount, selectedTier);
    const total = calculateTotalRewards(netAmount, selectedTier);
    const apy = calculateAPY(selectedTier);
    return { daily, total, apy, netAmount, fee: amount * DEPOSIT_FEE };
  }, [amount, selectedTier]);

  const chartData = useMemo(() => {
    const data = [];
    const dailyReward = stats.daily;
    const lockDays = tierInfo.lockDays;
    const step = Math.max(1, Math.floor(lockDays / 15));

    for (let i = 0; i <= lockDays; i += step) {
      data.push({
        day: `Day ${i}`,
        rewards: parseFloat((dailyReward * i).toFixed(4)),
        total: parseFloat((stats.netAmount + dailyReward * i).toFixed(4)),
      });
    }
    return data;
  }, [stats.netAmount, stats.daily, tierInfo.lockDays]);

  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-3 rounded-2xl bg-primary-cyan/10 text-primary-cyan mb-6"
          >
            <Calculator className="w-10 h-10" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Profit Calculator</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Estimate your potential earnings. Our advanced algorithm calculates returns based on real-time tier configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="glass-card p-10">
              <label className="block text-sm font-black text-text-secondary mb-6 uppercase tracking-widest">
                Staking Amount (SOL)
              </label>
              <div className="relative mb-10">
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full bg-gray-800/50 border-2 border-white/5 rounded-2xl px-6 py-6 text-4xl font-black text-white focus:outline-none focus:border-primary-cyan transition-all"
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-text-secondary font-black opacity-30">SOL</div>
              </div>
              
              <label className="block text-sm font-black text-text-secondary mb-6 uppercase tracking-widest">
                Select Node Tier
              </label>
              <div className="grid grid-cols-1 gap-4">
                {Object.values(TIERS).map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => setSelectedTier(tier.id)}
                    className={`p-6 rounded-2xl border-2 text-left transition-all flex items-center justify-between group ${
                      selectedTier === tier.id
                        ? 'border-primary-cyan bg-primary-cyan/10'
                        : 'border-white/5 bg-gray-800/30 hover:bg-gray-800/50'
                    }`}
                  >
                    <div>
                      <div className={`text-xl font-bold mb-1 ${selectedTier === tier.id ? 'text-primary-cyan' : 'text-white'}`}>
                        {tier.name}
                      </div>
                      <div className="text-sm text-text-secondary font-medium">
                        {tier.multiplier}x Multiplier • {tier.lockDays} Days
                      </div>
                    </div>
                    <div className="text-2xl group-hover:scale-125 transition-transform">{tier.icon}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-gradient-to-br from-primary-cyan/10 to-primary-violet/10 border border-primary-cyan/20">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <TrendingUp className="text-primary-cyan w-5 h-5" /> Investment Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between font-medium">
                  <span className="text-text-secondary">Platform Fee (2%)</span>
                  <span className="text-red-400">-{stats.fee.toFixed(2)} SOL</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span className="text-text-secondary">Net Principal</span>
                  <span className="text-white">{stats.netAmount.toFixed(2)} SOL</span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-end">
                  <span className="text-text-secondary">Expected APY</span>
                  <span className="text-3xl font-black text-primary-cyan">{stats.apy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Visualization */}
          <div className="lg:col-span-2 glass-card p-10 flex flex-col">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <h3 className="text-3xl font-black mb-2">Earnings Projection</h3>
                <p className="text-text-secondary font-medium">Visualization of your balance growth over the lock period.</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-green-400/10 text-green-400 rounded-xl border border-green-400/20">
                <ShieldCheck className="w-5 h-5" />
                <span className="font-bold text-sm">Verified Calculation</span>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5CE1E6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5CE1E6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ dy: 10 }}
                  />
                  <YAxis 
                    stroke="#ffffff40" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => `${val} SOL`}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #ffffff10', borderRadius: '16px', padding: '12px' }}
                    itemStyle={{ color: '#5CE1E6' }}
                    labelStyle={{ marginBottom: '8px', fontWeight: 'bold' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#5CE1E6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Earnings', value: `+${stats.total.toFixed(2)} SOL`, color: 'text-primary-cyan' },
                { label: 'Daily Yield', value: `${stats.daily.toFixed(4)} SOL`, color: 'text-white' },
                { label: 'End Balance', value: `${(stats.netAmount + stats.total).toFixed(2)} SOL`, color: 'text-white' },
                { label: 'Net Return', value: `${((stats.total / amount) * 100).toFixed(1)}%`, color: 'text-green-400' },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/5 text-center">
                  <div className="text-xs text-text-secondary font-black uppercase tracking-widest mb-2">{item.label}</div>
                  <div className={`text-2xl font-black ${item.color}`}>{item.value}</div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 flex items-start gap-3 p-4 rounded-xl bg-primary-cyan/5 border border-primary-cyan/10">
              <Info className="w-5 h-5 text-primary-cyan shrink-0 mt-0.5" />
              <p className="text-sm text-text-secondary leading-relaxed">
                Note: These figures are estimates based on the current platform parameters. Actual returns may vary slightly due to blockchain timing and network conditions. All rewards are calculated after the 2% platform fee is deducted from your initial principal.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
