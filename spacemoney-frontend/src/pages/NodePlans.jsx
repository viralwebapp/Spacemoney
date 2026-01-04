import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TIERS } from '../utils/constants';
import { Zap, Rocket, Star } from 'lucide-react';

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
    <div className="min-h-screen py-24 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-6 gradient-text"
          >
            Choose Your Node Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-text-secondary max-w-2xl mx-auto"
          >
            Select a staking tier that fits your investment goals. Each tier offers unique multipliers and lock-up periods.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(TIERS).map((tier, index) => (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-2xl border ${
                tier.popular 
                  ? 'border-primary-cyan ring-1 ring-primary-cyan bg-primary-cyan/5' 
                  : 'border-border bg-gray-900/50'
              } hover:shadow-2xl hover:shadow-primary-cyan/10 transition-all duration-300 group`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary-cyan text-primary-bg text-sm font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}

              <div className="mb-8">
                <div className="w-16 h-16 rounded-xl bg-gray-800 flex items-center justify-center text-primary-cyan mb-6 group-hover:scale-110 transition-transform duration-300">
                  {getIcon(tier.icon)}
                </div>
                <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-white">{tier.multiplier}x</span>
                  <span className="text-text-secondary">multiplier</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 flex-grow">
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Min Stake</span>
                  <span className="font-semibold">{tier.minStake} SOL</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Lock Period</span>
                  <span className="font-semibold">{tier.lockDays} Days</span>
                </div>
                <div className="flex justify-between py-3 border-b border-border">
                  <span className="text-text-secondary">Daily Yield</span>
                  <span className="font-semibold">{(tier.dailyYield * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="text-text-secondary">Total Return</span>
                  <span className="font-bold text-primary-cyan">
                    {((tier.multiplier * tier.dailyYield * tier.lockDays) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <Link
                to={`/dashboard?tier=${tier.id}`}
                className={`w-full py-4 rounded-xl font-bold text-center transition-all duration-300 ${
                  tier.popular
                    ? 'bg-primary-cyan text-primary-bg hover:bg-white'
                    : 'bg-gray-800 text-white hover:bg-gray-700'
                }`}
              >
                Stake Now
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
