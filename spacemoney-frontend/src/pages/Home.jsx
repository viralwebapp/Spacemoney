import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Shield, Zap, ArrowRight, BarChart2, Globe, Lock } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-primary-bg overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-cyan/10 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-primary-violet/10 rounded-full blur-[120px] animate-pulse transition-all delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary-cyan animate-ping"></span>
              <span className="text-sm font-bold text-primary-cyan uppercase tracking-widest">Live on Solana Devnet</span>
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-6xl md:text-8xl font-black mb-8 leading-tight"
            >
              The Future of <br />
              <span className="gradient-text">Staking is Here.</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Earn high-yield rewards with SpaceMoney's decentralized node plans. 
              Safe, transparent, and built on the world's fastest blockchain.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-6 justify-center"
            >
              <Link
                to="/node-plans"
                className="btn btn-primary text-xl px-12 py-5 rounded-2xl shadow-xl shadow-primary-cyan/20 flex items-center gap-3 font-black"
              >
                Start Staking <ArrowRight className="w-6 h-6" />
              </Link>
              <Link
                to="/calculator"
                className="btn bg-white/5 hover:bg-white/10 text-white text-xl px-12 py-5 rounded-2xl border border-white/10 transition-all font-bold"
              >
                View Calculator
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Total Value Staked', value: '$2.4M+' },
              { label: 'Active Nodes', value: '1,240+' },
              { label: 'Rewards Paid', value: '8.5K SOL' },
              { label: 'Platform Users', value: '4,800+' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white mb-2">{stat.value}</div>
                <div className="text-sm text-text-secondary font-bold uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Unrivaled Power</h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">Experience the most advanced staking features on the market.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: BarChart2,
                title: 'High Yield Tiers',
                description: 'Three distinct node plans designed for different investment appetites, offering up to 540% APY.',
                color: 'text-primary-cyan'
              },
              {
                icon: TrendingUp,
                title: 'Daily Compounding',
                description: 'Our algorithm optimizes your yields daily, ensuring your rewards grow at the fastest possible rate.',
                color: 'text-primary-violet'
              },
              {
                icon: Lock,
                title: 'Secure Vaults',
                description: 'Your assets are secured in Program Derived Addresses, audited and verified on the Solana blockchain.',
                color: 'text-green-400'
              },
              {
                icon: Globe,
                title: 'Decentralized',
                description: 'Operated entirely by smart contracts. No central authority can freeze or mismanage your funds.',
                color: 'text-yellow-400'
              },
              {
                icon: Shield,
                title: 'Transparency',
                description: 'Every transaction and contract interaction is visible on-chain for complete peace of mind.',
                color: 'text-pink-400'
              },
              {
                icon: Zap,
                title: 'Fast & Cheap',
                description: 'Built on Solana for near-instant transactions and fees that are a fraction of a cent.',
                color: 'text-blue-400'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-10 rounded-3xl bg-gray-900/50 border border-border hover:border-white/20 transition-all group"
              >
                <div className={`w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center ${feature.color} mb-8 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-text-secondary leading-relaxed text-lg">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 relative">
        <div className="absolute inset-0 bg-primary-cyan/5 blur-[100px] rounded-full scale-50" />
        <div className="max-w-5xl mx-auto text-center relative z-10 glass-card p-20 rounded-[40px] border border-white/10">
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">Ready to join the <br /><span className="text-primary-cyan">financial revolution?</span></h2>
          <p className="text-2xl text-text-secondary mb-12 max-w-2xl mx-auto">
            Join thousands of users who are already earning rewards with SpaceMoney.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link to="/node-plans" className="btn btn-primary px-12 py-5 text-xl font-black rounded-2xl">
              Launch App
            </Link>
            <Link to="/how-it-works" className="btn bg-gray-800 hover:bg-gray-700 text-white px-12 py-5 text-xl font-bold rounded-2xl">
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
