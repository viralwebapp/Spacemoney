import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Menu, X, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Calculator', path: '/calculator' },
    { name: 'Node Plans', path: '/node-plans' },
    { name: 'How It Works', path: '/how-it-works' },
    { name: 'Technology', path: '/technology' },
    { name: 'Security', path: '/security' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Dashboard', path: '/dashboard' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-primary-bg/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-violet rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">SpaceMoney</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-primary-cyan/10 text-primary-cyan'
                    : 'text-text-secondary hover:text-white hover:bg-gray-800'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Wallet Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-4">
            <WalletMultiButton className="!bg-gradient-to-r !from-primary-cyan !to-primary-violet hover:!shadow-lg !transition-all" />
            
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden overflow-hidden border-t border-border"
          >
            <nav className="px-4 py-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive(link.path)
                      ? 'bg-primary-cyan/10 text-primary-cyan'
                      : 'text-text-secondary hover:text-white hover:bg-gray-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
