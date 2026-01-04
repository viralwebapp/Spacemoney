import React from 'react';
import { motion } from 'framer-motion';
import { Wallet, MousePointer2, TrendingUp, Coins, Calendar, CheckCircle } from 'lucide-react';

const steps = [
  {
    title: "Connect Your Wallet",
    description: "Link your Solana wallet (Phantom, Solflare, or Backpack) to the SpaceMoney platform in one click.",
    icon: Wallet,
    color: "bg-primary-cyan"
  },
  {
    title: "Choose a Node Plan",
    description: "Select from our three tiers: Boot, Symbiotic, or Space. Each offers different reward multipliers.",
    icon: MousePointer2,
    color: "bg-primary-violet"
  },
  {
    title: "Stake Your Assets",
    description: "Deposit SOL or USDT into your chosen plan. A small 2% fee applies to help maintain the platform.",
    icon: Coins,
    color: "bg-green-400"
  },
  {
    title: "Earn Daily Rewards",
    description: "Your rewards start accumulating immediately. Track your earnings in real-time on your dashboard.",
    icon: TrendingUp,
    color: "bg-yellow-400"
  },
  {
    title: "Wait for Maturity",
    description: "Your stake is locked for the duration of the plan. Higher lock periods mean higher multipliers.",
    icon: Calendar,
    color: "bg-pink-400"
  },
  {
    title: "Claim and Withdraw",
    description: "Once the lock period ends, claim your rewards and withdraw your principal with zero extra fees.",
    icon: CheckCircle,
    color: "bg-blue-400"
  }
];

export default function HowItWorks() {
  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 gradient-text"
          >
            How It Works
          </motion.h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Get started with SpaceMoney in six simple steps. Our platform makes decentralized staking accessible to everyone.
          </p>
        </div>

        <div className="relative">
          {/* Connector Line (Desktop) */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary-cyan via-primary-violet to-primary-cyan opacity-20 -translate-x-1/2" />

          <div className="space-y-24">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col lg:flex-row items-center gap-12 ${i % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className="flex-1 text-center lg:text-left">
                  <div className={`inline-flex p-4 rounded-2xl ${step.color} text-primary-bg mb-6 shadow-lg shadow-${step.color.split('-')[1]}-500/20`}>
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4">{step.title}</h3>
                  <p className="text-xl text-text-secondary leading-relaxed">{step.description}</p>
                </div>
                
                <div className="flex-1 flex justify-center relative">
                  <div className={`w-32 h-32 rounded-full bg-gray-900 border-4 border-gray-800 flex items-center justify-center text-4xl font-black z-10 shadow-2xl`}>
                    {i + 1}
                  </div>
                  {/* Decorative element */}
                  <div className={`absolute inset-0 bg-${step.color.split('-')[1]}-500 opacity-10 blur-3xl rounded-full scale-150`} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-32 p-12 rounded-[40px] bg-white/5 border border-white/10 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary-cyan/10 to-transparent opacity-50" />
          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-8">Ready to start your journey?</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <button className="btn btn-primary px-12 py-4 text-lg font-bold">Launch Dashboard</button>
              <button className="btn bg-gray-800 hover:bg-gray-700 px-12 py-4 text-lg font-bold">View Documentation</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
