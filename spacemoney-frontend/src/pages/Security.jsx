import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, CheckCircle, FileText, Server } from 'lucide-react';

const securityFeatures = [
  {
    title: "Audited Smart Contracts",
    description: "Our contracts are written in Anchor (Rust) and have undergone rigorous testing to ensure safety and reliability.",
    icon: FileText
  },
  {
    title: "PDA Vault Management",
    description: "Funds are stored in Program Derived Addresses, meaning only the program logic can authorize transfers. No human has direct access to user funds.",
    icon: Lock
  },
  {
    title: "Non-Custodial Staking",
    description: "You maintain full ownership of your assets. The platform only manages the staking logic while your funds are secured on the Solana blockchain.",
    icon: Shield
  },
  {
    title: "Real-time Monitoring",
    description: "Our platform constantly monitors on-chain activity to detect and prevent any suspicious transactions or anomalies.",
    icon: Eye
  },
  {
    title: "Decentralized Infrastructure",
    description: "Leveraging Solana's high-performance blockchain ensures that the platform is resistant to censorship and downtime.",
    icon: Server
  },
  {
    title: "Role-Based Access",
    description: "Administrative functions are restricted to authorized multi-sig wallets, preventing single points of failure.",
    icon: CheckCircle
  }
];

export default function Security() {
  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex p-4 rounded-3xl bg-primary-cyan/10 text-primary-cyan mb-8"
          >
            <Shield className="w-12 h-12" />
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black mb-6 gradient-text">Security First Approach</h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your trust is our most valuable asset. We employ industry-leading security practices to protect your investments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {securityFeatures.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-3xl bg-gray-900/50 border border-border hover:border-primary-cyan/30 transition-all group"
            >
              <div className="w-14 h-14 bg-gray-800 rounded-2xl flex items-center justify-center text-primary-cyan mb-8 group-hover:scale-110 transition-transform">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-white">{feature.title}</h3>
              <p className="text-text-secondary leading-relaxed text-lg">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <div className="rounded-3xl bg-gradient-to-r from-gray-900 to-black border border-border p-12 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-cyan/5 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl">
              <h2 className="text-3xl font-bold mb-6">Transparent & Open Source</h2>
              <p className="text-lg text-text-secondary mb-8">
                We believe in full transparency. Our smart contract code is open-source and available for anyone to review and verify on GitHub.
              </p>
              <button className="btn btn-primary px-10 py-4 flex items-center gap-2 font-bold">
                View on GitHub <CheckCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="w-full lg:w-1/3 p-8 bg-gray-800/50 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-xl font-bold">Audit Status</div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Smart Contract</span>
                  <span className="text-green-400 font-bold">PASSED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Vault Security</span>
                  <span className="text-green-400 font-bold">VERIFIED</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Last Scan</span>
                  <span className="text-white">Today, 04:20 UTC</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
