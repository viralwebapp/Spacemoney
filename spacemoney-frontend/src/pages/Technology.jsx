import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Zap, Globe, Layers, Code, Database } from 'lucide-react';

const techStack = [
  {
    name: "Solana Blockchain",
    description: "High-performance L1 blockchain capable of 65,000+ TPS with sub-second finality and extremely low transaction costs.",
    icon: Zap
  },
  {
    name: "Anchor Framework",
    description: "A framework for Solana's Sealevel runtime providing eDSL, IDL, and type safety for secure smart contract development.",
    icon: Code
  },
  {
    name: "Rust",
    description: "Memory-safe, high-performance programming language used for writing our on-chain program logic.",
    icon: Cpu
  },
  {
    name: "React & Vite",
    description: "Modern frontend stack for a lightning-fast, responsive user interface with real-time blockchain synchronization.",
    icon: Globe
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first CSS framework for creating a beautiful, modern, and consistent design system.",
    icon: Layers
  },
  {
    name: "Lucide Icons",
    description: "Beautifully simple, pixel-perfect icons for a clear and intuitive user experience.",
    icon: Database
  }
];

export default function Technology() {
  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black mb-6 gradient-text"
          >
            Built on Cutting-Edge Tech
          </motion.h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            SpaceMoney leverages the most advanced technologies in the Web3 ecosystem to provide a secure and efficient staking experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-32">
          {techStack.map((tech, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative p-1 border-border bg-gray-900/50 rounded-3xl overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary-cyan/20 to-primary-violet/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative z-10 p-10 bg-gray-900 rounded-[22px] h-full">
                <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-primary-cyan mb-8 group-hover:scale-110 transition-transform">
                  <tech.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">{tech.name}</h3>
                <p className="text-text-secondary leading-relaxed text-lg">{tech.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">Architectural Excellence</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-primary-cyan/10 rounded-xl flex items-center justify-center text-primary-cyan">1</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">On-Chain State Management</h4>
                  <p className="text-text-secondary">All staking data, including balances and lock periods, are stored directly on the blockchain in optimized account structures.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-primary-violet/10 rounded-xl flex items-center justify-center text-primary-violet">2</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Atomic Transactions</h4>
                  <p className="text-text-secondary">Instructions are executed atomically, ensuring that either the entire operation succeeds or it fails without affecting state.</p>
                </div>
              </div>
              <div className="flex gap-6">
                <div className="w-12 h-12 shrink-0 bg-green-400/10 rounded-xl flex items-center justify-center text-green-400">3</div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Event Emission</h4>
                  <p className="text-text-secondary">Our contract emits real-time events for all major actions, allowing for immediate frontend updates and off-chain indexing.</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gradient-to-br from-primary-cyan/20 to-primary-violet/20 rounded-full blur-3xl absolute inset-0 animate-pulse" />
            <div className="relative bg-gray-900 border border-border p-10 rounded-3xl overflow-hidden">
               <pre className="text-xs md:text-sm text-primary-cyan font-mono overflow-x-auto">
{`#[program]
pub mod spacemoney {
    use super::*;

    pub fn deposit_sol(
        ctx: Context<DepositSol>, 
        amount: u64, 
        tier: u8
    ) -> Result<()> {
        instructions::deposit_sol::handler(
            ctx, amount, tier
        )
    }

    pub fn claim_rewards(
        ctx: Context<ClaimRewards>, 
        stake_index: u64
    ) -> Result<()> {
        instructions::claim_rewards::handler(
            ctx, stake_index
        )
    }
}`}
               </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
