import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Analytics } from '@vercel/analytics/react';
import { WalletContextProvider } from './contexts/WalletContext';
import { ToastProvider } from './contexts/ToastContext';
import Layout from './components/Layout';

// Lazy load pages
const Home = React.lazy(() => import('./pages/Home'));
const RewardCalculator = React.lazy(() => import('./pages/RewardCalculator'));
const HowItWorks = React.lazy(() => import('./pages/HowItWorks'));
const NodePlans = React.lazy(() => import('./pages/NodePlans'));
const Technology = React.lazy(() => import('./pages/Technology'));
const Security = React.lazy(() => import('./pages/Security'));
const FAQ = React.lazy(() => import('./pages/FAQ'));
const UserDashboard = React.lazy(() => import('./pages/UserDashboard'));
const SecureAdminAccess = React.lazy(() => import('./pages/SecureAdminAccess'));
const NotFound = React.lazy(() => import('./pages/NotFound'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WalletContextProvider>
        <ToastProvider>
          <BrowserRouter>
            <React.Suspense 
              fallback={
                <div className="min-h-screen flex items-center justify-center bg-primary-bg">
                  <div className="spinner"></div>
                </div>
              }
            >
              <Routes>
                <Route element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="/calculator" element={<RewardCalculator />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/node-plans" element={<NodePlans />} />
                  <Route path="/technology" element={<Technology />} />
                  <Route path="/security" element={<Security />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/dashboard" element={<UserDashboard />} />
                  <Route path="/admin" element={<SecureAdminAccess />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </React.Suspense>
            <Analytics />
          </BrowserRouter>
        </ToastProvider>
      </WalletContextProvider>
    </QueryClientProvider>
  );
}

export default App;
