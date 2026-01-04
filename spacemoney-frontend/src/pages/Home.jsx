import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Rocket, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-50"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="gradient-text">Stake. Earn. Grow.</span>
            </h1>
            <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
              Next-generation staking platform on Solana with tier-based rewards and daily yields up to 540% APY
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/node-plans"
                className="btn btn-primary text-lg px-8 py-4"
              >
                Explore Node Plans
              </Link>
              <Link
                to="/calculator"
                className="btn btn-outline text-lg px-8 py-4"
              >
                Calculate Rewards
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12">Why SpaceMoney?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Rocket,
                title: 'High Yields',
                description: 'Earn up to 540% APY with our Space Node tier'
              },
              {
                icon: TrendingUp,
                title: 'Daily Rewards',
                description: 'Claim your rewards daily with no lock requirements'
              },
              {
                icon: Shield,
                title: 'Secure',
                description: 'Built on Solana with Anchor framework security'
              },
              {
                icon: Zap,
                title: 'Instant',
                description: 'Fast transactions on Solana blockchain'
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card card-hover"
              >
                <feature.icon className="w-12 h-12 text-primary-cyan mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-text-secondary">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Earning?</h2>
          <p className="text-xl text-text-secondary mb-8">
            Connect your wallet and start staking in minutes
          </p>
          <Link to="/dashboard" className="btn btn-primary text-lg px-8 py-4">
            Go to Dashboard
          </Link>
        </div>
      </section>
    </div>
  );
}
