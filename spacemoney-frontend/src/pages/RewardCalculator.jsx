import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TIERS } from '../utils/constants';
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

export default function RewardCalculator() {
  const [amount, setAmount] = useState(1);
  const [selectedTier, setSelectedTier] = useState(TIERS.BOOT.id);

  const tierInfo = useMemo(() => 
    Object.values(TIERS).find(t => t.id === selectedTier),
    [selectedTier]
  );

  const stats = useMemo(() => {
    const daily = calculateDailyRewards(amount, selectedTier);
    const total = calculateTotalRewards(amount, selectedTier);
    const apy = calculateAPY(selectedTier);
    return { daily, total, apy };
  }, [amount, selectedTier]);

  const chartData = useMemo(() => {
    const data = [];
    const dailyReward = stats.daily;
    const lockDays = tierInfo.lockDays;
    const step = Math.max(1, Math.floor(lockDays / 10));

    for (let i = 0; i <= lockDays; i += step) {
      data.push({
        day: `Day ${i}`,
        rewards: parseFloat((dailyReward * i).toFixed(4)),
        total: parseFloat((amount + dailyReward * i).toFixed(4)),
      });
    }
    return data;
  }, [amount, stats.daily, tierInfo.lockDays]);

  return (
    <div className="min-h-screen py-24 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">Reward Calculator</h1>
          <p className="text-xl text-text-secondary">Estimate your potential earnings based on your staking amount and tier.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-8 rounded-2xl bg-gray-900/50 border border-border">
              <label className="block text-sm font-medium text-text-secondary mb-4">
                STAKING AMOUNT (SOL)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-800 border border-border rounded-xl px-4 py-4 text-2xl font-bold focus:outline-none focus:border-primary-cyan transition-colors"
              />
              
              <div className="mt-8">
                <label className="block text-sm font-medium text-text-secondary mb-4">
                  SELECT TIER
                </label>
                <div className="grid grid-cols-1 gap-3">
                  {Object.values(TIERS).map((tier) => (
                    <button
                      key={tier.id}
                      onClick={() => setSelectedTier(tier.id)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        selectedTier === tier.id
                          ? 'border-primary-cyan bg-primary-cyan/10 text-primary-cyan'
                          : 'border-border bg-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="font-bold">{tier.name}</div>
                      <div className="text-sm opacity-70">{tier.multiplier}x Multiplier • {tier.lockDays} Days</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 rounded-2xl bg-primary-cyan/5 border border-primary-cyan/20">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-primary-cyan">Summary</span>
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Daily Rewards</span>
                  <span className="font-bold">{stats.daily.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Total Rewards</span>
                  <span className="font-bold">{stats.total.toFixed(4)} SOL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">APY</span>
                  <span className="font-bold text-primary-cyan">{stats.apy}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-2 p-8 rounded-2xl bg-gray-900/50 border border-border h-[500px] lg:h-auto">
            <h3 className="text-xl font-bold mb-8">Growth Projection</h3>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5CE1E6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#5CE1E6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                  <XAxis dataKey="day" stroke="#9AA4B2" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9AA4B2" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val} SOL`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#5CE1E6' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#5CE1E6" 
                    fillOpacity={1} 
                    fill="url(#colorTotal)" 
                    strokeWidth={3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Staked</div>
                <div className="font-bold">{amount} SOL</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Earnings</div>
                <div className="font-bold text-primary-cyan">+{stats.total.toFixed(2)} SOL</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Total</div>
                <div className="font-bold">{(amount + stats.total).toFixed(2)} SOL</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-text-secondary mb-1">Return</div>
                <div className="font-bold text-green-400">+{((stats.total / amount) * 100).toFixed(0)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
