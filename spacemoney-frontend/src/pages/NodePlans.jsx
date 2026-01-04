import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TIERS } from '../utils/constants';
import { Zap, Rocket, Star, Check, ArrowRight, Info } from 'lucide-react';

export default function NodePlans() {
  const getIcon = (icon) => {
    switch (icon) {
      case '🚀': return <Rocket className="w-8 h-8" />;
      case '⚡': return <Zap className="w-8 h-8" />;
      case '🌟': return <Star className="w-8 h-8" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-cyan/10 border border-primary-cyan/20 mb-8"
          >
            <Zap className="w-4 h-4 text-primary-cyan" />
            <span className="text-sm font-bold text-primary-cyan uppercase tracking-widest">Maximum Yield Efficiency</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black mb-8 gradient-text"
          >
            Select Your Node Tier
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto leading-relaxed"
          >
            Our tier-based staking system allows you to choose the level of commitment and reward that matches your goals.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {Object.values(TIERS).map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-10 rounded-[40px] border-2 ${
                tier.popular 
                  ? 'border-primary-cyan bg-primary-cyan/5 shadow-[0_0_50px_rgba(92,225,230,0.1)]' 
                  : 'border-white/5 bg-gray-900/50'
              } hover:border-white/20 transition-all duration-500 group overflow-hidden`}
            >
              {tier.popular && (
                <div className="absolute top-0 right-0 px-6 py-2 bg-primary-cyan text-primary-bg text-xs font-black rounded-bl-2xl uppercase tracking-widest">
                  Most Popular
                </div>
              )}

              <div className="mb-10">
                <div className={`w-20 h-20 rounded-3xl bg-gray-800 flex items-center justify-center text-primary-cyan mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  {getIcon(tier.icon)}
                </div>
                <h3 className="text-3xl font-black mb-3 text-white">{tier.name}</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white">{tier.multiplier}x</span>
                  <span className="text-text-secondary font-bold uppercase tracking-widest text-sm">Reward Multiplier</span>
                </div>
              </div>

              <div className="space-y-6 mb-12 flex-grow">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-medium text-text-secondary">Min Stake: <span className="text-white font-bold">{tier.minStake} SOL</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-medium text-text-secondary">Duration: <span className="text-white font-bold">{tier.lockDays} Days</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-medium text-text-secondary">Yield: <span className="text-white font-bold">{(tier.multiplier * 1).toFixed(1)}% Daily</span></span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-green-400/10 flex items-center justify-center text-green-400">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-medium text-text-secondary">Status: <span className="text-green-400 font-bold uppercase text-sm">High Priority</span></span>
                </div>
              </div>

              <Link
                to={`/dashboard?tier=${tier.id}`}
                className={`w-full py-5 rounded-2xl font-black text-xl text-center transition-all duration-300 flex items-center justify-center gap-3 ${
                  tier.popular
                    ? 'bg-primary-cyan text-black hover:bg-white shadow-lg shadow-primary-cyan/20'
                    : 'bg-white/5 text-white hover:bg-white/10 border border-white/10'
                }`}
              >
                Stake Now <ArrowRight className="w-6 h-6" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Tier Comparison</h2>
            <p className="text-text-secondary font-medium">Compare the features and benefits across all node tiers.</p>
          </div>
          
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-6 text-sm font-black uppercase tracking-widest text-text-secondary">Feature</th>
                    {Object.values(TIERS).map(tier => (
                      <th key={tier.id} className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{tier.icon}</span>
                          <span className="font-black text-white">{tier.name.split(' ')[0]}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Min Stake (SOL)</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6 font-black text-white">{tier.minStake} SOL</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Lock-up Period</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6 font-black text-white">{tier.lockDays} Days</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Multiplier</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6 font-black text-primary-cyan">{tier.multiplier}x</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Daily Base Rate</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6 font-black text-white">1%</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Auto-Compounding</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6"><Check className="text-green-400 w-6 h-6" /></td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-8 py-6 font-bold text-text-secondary">Early Withdrawal</td>
                    {Object.values(TIERS).map(tier => (
                      <td key={tier.id} className="px-8 py-6 font-medium text-text-secondary">20% Penalty</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="p-10 rounded-[40px] bg-gradient-to-br from-primary-cyan/20 to-primary-violet/20 border border-white/10">
            <h3 className="text-3xl font-black mb-6 flex items-center gap-3">
              <Info className="text-primary-cyan w-8 h-8" /> Smart Staking
            </h3>
            <p className="text-lg text-text-secondary leading-relaxed mb-8">
              SpaceMoney's tiered system is designed to reward long-term commitment. By choosing higher tiers, you not only earn more through multipliers but also help stabilize the platform's liquidity, contributing to a healthier ecosystem for all participants.
            </p>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-black text-white">2.0%</div>
                <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Deposit Fee</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white">0%</div>
                <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Claim Fee</div>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <div className="text-2xl font-black text-white">Fast</div>
                <div className="text-xs font-bold text-text-secondary uppercase tracking-widest">Settlement</div>
              </div>
            </div>
          </div>
          <div className="space-y-8">
            <h3 className="text-3xl font-black">Frequently Asked</h3>
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="font-bold mb-2">Can I upgrade my tier later?</div>
                <div className="text-text-secondary">Each stake is tied to the tier selected at the time of deposit. To move to a higher tier, you can start a new stake with the required minimum amount.</div>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/5">
                <div className="font-bold mb-2">Are my rewards locked?</div>
                <div className="text-text-secondary">Your rewards accumulate daily and can be claimed at any time, although the principal remains locked until the end of the duration.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
