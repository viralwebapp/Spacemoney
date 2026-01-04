import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: "What is SpaceMoney?",
    answer: "SpaceMoney is a decentralized staking platform built on the Solana blockchain. It allows users to stake SOL or USDT in various 'Node Plans' to earn rewards. Each plan has different multipliers and lock-up periods to suit different investment strategies."
  },
  {
    question: "How do the Node Plans work?",
    answer: "We offer three main tiers: Boot Node (30-day lock), Symbiotic Node (90-day lock), and Space Node (180-day lock). Higher tiers require more minimum stake but provide higher multipliers on your daily rewards."
  },
  {
    question: "What are the fees for staking?",
    answer: "SpaceMoney charges a 2% deposit fee. This fee is used to maintain the platform and fund the treasury. There are no fees for claiming rewards after the lock-up period."
  },
  {
    question: "Can I withdraw my funds before the lock-up period ends?",
    answer: "Yes, you can use the 'Force Withdraw' feature. However, this incurs a 20% penalty on your accrued rewards. Your original principal remains safe, but the penalty is deducted from the rewards you've earned up to that point."
  },
  {
    question: "Is SpaceMoney secure?",
    answer: "SpaceMoney is built with security as a priority. Our smart contracts are written in Anchor (Rust) with built-in safety checks. We use PDAs (Program Derived Addresses) for vault management, ensuring that only the program logic can handle funds."
  },
  {
    question: "How are rewards calculated?",
    answer: "Rewards are calculated daily based on your principal amount, your tier's multiplier, and a base rate. The formula is: Daily Reward = Principal × Multiplier × Base Rate (1%)."
  }
];

function FAQItem({ faq, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="mb-4"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 rounded-2xl bg-gray-900/50 border border-border hover:border-primary-cyan/30 transition-all text-left group"
      >
        <span className="text-lg font-bold text-white group-hover:text-primary-cyan transition-colors">{faq.question}</span>
        <div className={`p-2 rounded-lg bg-gray-800 ${isOpen ? 'text-primary-cyan' : 'text-text-secondary'}`}>
          {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="p-8 text-text-secondary leading-relaxed border-x border-b border-border rounded-b-2xl bg-gray-900/20">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <div className="min-h-screen py-32 px-4 bg-primary-bg">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex p-3 rounded-2xl bg-primary-cyan/10 text-primary-cyan mb-6">
            <HelpCircle className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">Frequently Asked Questions</h1>
          <p className="text-xl text-text-secondary">Everything you need to know about SpaceMoney staking.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>

        <div className="mt-20 p-8 rounded-3xl bg-gradient-to-br from-primary-cyan/10 to-primary-violet/10 border border-primary-cyan/20 text-center">
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-text-secondary mb-8">Join our community on Discord or Telegram to get real-time support from the team.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="btn btn-primary px-8">Join Discord</button>
            <button className="btn bg-gray-800 hover:bg-gray-700 px-8">Contact Support</button>
          </div>
        </div>
      </div>
    </div>
  );
}
