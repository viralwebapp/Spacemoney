import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Send, 
  Settings, 
  Shield, 
  LogOut, 
  RefreshCcw, 
  Lock, 
  Unlock,
  Users,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useContractData } from '../hooks/useContractData';
import { useAdminActions } from '../hooks/useAdminActions';
import { ADMIN_CREDENTIALS, TIERS } from '../utils/constants';
import { formatAddress, formatSOL } from '../utils/formatters';
import { useToast } from '../contexts/ToastContext';

export default function SecureAdminAccess() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  
  const { publicKey, connected } = useWallet();
  const { platformState, tierConfig, loading: dataLoading, refresh: refreshData } = useContractData();
  const { adminTransfer, updateTierConfig, pauseProgram, resumeProgram, loading: actionLoading } = useAdminActions();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [transferForm, setTransferForm] = useState({ amount: '', tokenType: 0, recipient: '' });
  const [tierForm, setTierForm] = useState({ tier: 0, minStake: '', multiplier: '', lockDays: '' });

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const isAdmin = publicKey && platformState && platformState.admin.toBase58() === publicKey.toBase58();

  const onTransfer = async (e) => {
    e.preventDefault();
    try {
      await adminTransfer(transferForm.amount, parseInt(transferForm.tokenType), transferForm.recipient);
      showToast('Transfer successful!', 'success');
      refreshData();
      setTransferForm({ amount: '', tokenType: 0, recipient: '' });
    } catch (err) {
      showToast(err.message || 'Transfer failed', 'error');
    }
  };

  const onUpdateTier = async (e) => {
    e.preventDefault();
    try {
      await updateTierConfig(
        tierForm.tier,
        parseFloat(tierForm.minStake),
        parseInt(tierForm.multiplier),
        parseInt(tierForm.lockDays)
      );
      showToast('Tier configuration updated!', 'success');
      refreshData();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const onTogglePause = async () => {
    try {
      if (platformState.isPaused) {
        await resumeProgram();
        showToast('Program resumed', 'success');
      } else {
        await pauseProgram();
        showToast('Program paused', 'warning');
      }
      refreshData();
    } catch (err) {
      showToast(err.message || 'Action failed', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl bg-gray-900 border border-border shadow-2xl"
        >
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-primary-cyan/10 rounded-xl flex items-center justify-center mb-4 text-primary-cyan">
              <Shield className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-white">Admin Access</h1>
            <p className="text-text-secondary">Enter credentials to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                required
              />
            </div>
            {loginError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {loginError}
              </div>
            )}
            <button
              type="submit"
              className="w-full btn btn-primary py-3"
            >
              Sign In
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg">
        <div className="text-center">
          <Wallet className="w-16 h-16 text-primary-cyan mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-4">Connect Admin Wallet</h2>
          <p className="text-text-secondary mb-8">Please connect the authorized administrator wallet.</p>
          <WalletMultiButton className="mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAdmin && !dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-primary-bg">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-500">
            <Lock className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-white">Access Denied</h2>
          <p className="text-text-secondary mb-8">
            The connected wallet <span className="text-white font-mono">{formatAddress(publicKey.toBase58())}</span> is not authorized for administrative access.
          </p>
          <button onClick={handleLogout} className="btn bg-gray-800 hover:bg-gray-700 w-full mb-4">
            Logout Admin Account
          </button>
          <WalletMultiButton className="mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-primary-bg">
      {/* Sidebar */}
      <div className="w-64 border-r border-border hidden lg:flex flex-col p-6 sticky top-0 h-screen">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-cyan to-primary-violet rounded-lg flex items-center justify-center">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold">Admin Portal</span>
        </div>

        <nav className="space-y-2 flex-1">
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'treasury', label: 'Treasury', icon: Send },
            { id: 'tiers', label: 'Tier Config', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-primary-cyan/10 text-primary-cyan border border-primary-cyan/20' 
                  : 'text-text-secondary hover:bg-white/5'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-border">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-4xl font-bold mb-2 gradient-text">
                {activeTab === 'overview' ? 'System Overview' : 
                 activeTab === 'treasury' ? 'Treasury Management' : 'Tier Configuration'}
              </h1>
              <p className="text-text-secondary flex items-center gap-2">
                Authorized: <span className="text-white font-mono">{formatAddress(publicKey.toBase58())}</span>
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={onTogglePause}
                disabled={actionLoading}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all ${
                  platformState?.isPaused 
                    ? 'bg-green-500 hover:bg-green-600 text-white' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {platformState?.isPaused ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                {platformState?.isPaused ? 'Resume Program' : 'Pause Program'}
              </button>
              <button 
                onClick={refreshData}
                disabled={dataLoading}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-text-secondary hover:text-white transition-colors"
              >
                <RefreshCcw className={`w-5 h-5 ${dataLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </header>

          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { label: 'Treasury (SOL)', value: formatSOL(platformState?.treasurySol || 0), icon: Wallet, color: 'text-primary-cyan' },
                    { label: 'Treasury (USDT)', value: `${(Number(platformState?.treasuryUsdt || 0) / 1e6).toFixed(2)} USDT`, icon: TrendingUp, color: 'text-primary-violet' },
                    { label: 'Total Staked (SOL)', value: formatSOL(platformState?.totalStakedSol || 0), icon: Users, color: 'text-green-400' },
                    { label: 'Program Status', value: platformState?.isPaused ? 'PAUSED' : 'ACTIVE', icon: Shield, color: platformState?.isPaused ? 'text-red-500' : 'text-green-500' },
                  ].map((stat, i) => (
                    <div key={i} className="p-6 rounded-2xl bg-gray-900/50 border border-border">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`p-3 rounded-xl bg-gray-800 ${stat.color}`}>
                          <stat.icon className="w-6 h-6" />
                        </div>
                        <span className="text-text-secondary font-medium">{stat.label}</span>
                      </div>
                      <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="p-8 rounded-2xl bg-gray-900/50 border border-border">
                    <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <ArrowUpRight className="text-primary-cyan" /> Recent Activities
                    </h3>
                    <div className="space-y-4">
                      {/* Placeholder for logs */}
                      {[1, 2, 3, 4, 5].map((_, i) => (
                        <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-xs">TX</div>
                            <div>
                              <div className="text-sm font-medium text-white">Platform sync completed</div>
                              <div className="text-xs text-text-secondary">2 minutes ago</div>
                            </div>
                          </div>
                          <div className="text-xs text-primary-cyan cursor-pointer">View</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-2xl bg-gray-900/50 border border-border">
                    <h3 className="text-xl font-bold mb-6">Platform Settings</h3>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Automatic Backups</div>
                          <div className="text-sm text-text-secondary">Sync state to off-chain db</div>
                        </div>
                        <div className="w-12 h-6 bg-primary-cyan rounded-full relative">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Email Notifications</div>
                          <div className="text-sm text-text-secondary">Alert on large withdrawals</div>
                        </div>
                        <div className="w-12 h-6 bg-gray-800 rounded-full relative">
                          <div className="absolute left-1 top-1 w-4 h-4 bg-gray-500 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'treasury' && (
              <motion.div
                key="treasury"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl"
              >
                <div className="p-8 rounded-2xl bg-gray-900/50 border border-border">
                  <h3 className="text-xl font-bold mb-6">Admin Transfer</h3>
                  <p className="text-text-secondary mb-8">
                    Transfer accumulated fees from the treasury to an external address.
                  </p>
                  
                  <form onSubmit={onTransfer} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Token Type</label>
                        <select
                          value={transferForm.tokenType}
                          onChange={(e) => setTransferForm({ ...transferForm, tokenType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                        >
                          <option value={0}>SOL</option>
                          <option value={1}>USDT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Amount</label>
                        <input
                          type="number"
                          step="0.000000001"
                          value={transferForm.amount}
                          onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-secondary mb-2">Recipient Address</label>
                      <input
                        type="text"
                        value={transferForm.recipient}
                        onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan font-mono"
                        placeholder="Solana Address"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full btn btn-primary py-4 text-lg"
                    >
                      {actionLoading ? 'Processing...' : 'Confirm Transfer'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}

            {activeTab === 'tiers' && (
              <motion.div
                key="tiers"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {Object.values(TIERS).map((tier) => (
                    <div key={tier.id} className="p-6 rounded-2xl bg-gray-900/50 border border-border relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings className="w-12 h-12" />
                      </div>
                      <div className="text-3xl mb-4">{tier.icon}</div>
                      <h4 className="text-xl font-bold mb-2">{tier.name}</h4>
                      <div className="space-y-2 text-sm text-text-secondary mb-6">
                        <div className="flex justify-between">
                          <span>Min Stake:</span>
                          <span className="text-white">{tier.minStake} SOL</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Multiplier:</span>
                          <span className="text-white">{tier.multiplier}x</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lock Period:</span>
                          <span className="text-white">{tier.lockDays} Days</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setTierForm({ 
                          tier: tier.id, 
                          minStake: tier.minStake, 
                          multiplier: tier.multiplier, 
                          lockDays: tier.lockDays 
                        })}
                        className="w-full py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold transition-colors"
                      >
                        Edit Configuration
                      </button>
                    </div>
                  ))}
                </div>

                <div className="max-w-2xl p-8 rounded-2xl bg-gray-900/50 border border-border">
                  <h3 className="text-xl font-bold mb-6">Update Tier: {Object.values(TIERS).find(t => t.id === tierForm.tier)?.name}</h3>
                  <form onSubmit={onUpdateTier} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Min Stake (SOL)</label>
                        <input
                          type="number"
                          value={tierForm.minStake}
                          onChange={(e) => setTierForm({ ...tierForm, minStake: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Multiplier</label>
                        <input
                          type="number"
                          value={tierForm.multiplier}
                          onChange={(e) => setTierForm({ ...tierForm, multiplier: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Lock Period (Days)</label>
                        <input
                          type="number"
                          value={tierForm.lockDays}
                          onChange={(e) => setTierForm({ ...tierForm, lockDays: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-gray-800 border border-border text-white focus:outline-none focus:border-primary-cyan"
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="w-full btn btn-primary py-4 text-lg"
                    >
                      {actionLoading ? 'Updating...' : 'Save Configuration'}
                    </button>
                  </form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
