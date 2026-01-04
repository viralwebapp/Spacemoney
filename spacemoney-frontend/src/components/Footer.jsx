import React from 'react';
import { Link } from 'react-router-dom';
import { Rocket, Twitter, Github, Send, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Product: [
      { name: 'Node Plans', path: '/node-plans' },
      { name: 'Calculator', path: '/calculator' },
      { name: 'Dashboard', path: '/dashboard' },
      { name: 'How It Works', path: '/how-it-works' },
    ],
    Resources: [
      { name: 'Technology', path: '/technology' },
      { name: 'Security', path: '/security' },
      { name: 'FAQ', path: '/faq' },
      { name: 'Admin', path: '/admin' },
    ],
    Company: [
      { name: 'About', path: '/#about' },
      { name: 'Whitepaper', href: '#', external: true },
      { name: 'Blog', href: '#', external: true },
      { name: 'Careers', href: '#', external: true },
    ],
    Legal: [
      { name: 'Terms of Service', href: '#', external: true },
      { name: 'Privacy Policy', href: '#', external: true },
      { name: 'Cookie Policy', href: '#', external: true },
      { name: 'Disclaimer', href: '#', external: true },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Github, href: 'https://github.com', label: 'GitHub' },
    { icon: Send, href: 'https://t.me', label: 'Telegram' },
    { icon: Mail, href: 'mailto:contact@spacemoney.io', label: 'Email' },
  ];

  return (
    <footer className="bg-primary-bg border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-violet rounded-lg flex items-center justify-center">
                <Rocket className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold gradient-text">SpaceMoney</span>
            </Link>
            <p className="text-text-secondary text-sm mb-4">
              Next-generation staking platform on Solana. Stake your assets and earn daily rewards with our tier-based system.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center text-text-secondary hover:text-primary-cyan hover:bg-gray-700 transition-all"
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-text-secondary hover:text-primary-cyan transition-colors"
                      >
                        {link.name}
                      </a>
                    ) : (
                      <Link
                        to={link.path}
                        className="text-sm text-text-secondary hover:text-primary-cyan transition-colors"
                      >
                        {link.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-secondary">
            © {currentYear} SpaceMoney. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-text-secondary">
            <span>Built on Solana</span>
            <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
            <span>Secured by Anchor</span>
            <span className="w-1 h-1 bg-text-secondary rounded-full"></span>
            <span className="text-primary-cyan">Devnet</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
