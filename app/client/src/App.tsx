// app entry layout

// dependencies
import React, { Suspense, lazy } from 'react';
import { Toaster } from 'sonner';

// routing imports
import { Routes, Route, Navigate } from 'react-router-dom';

// context & hooks
import { AppProviders } from '@/contexts';
import { useApp } from '@/hooks/useApp';

// layout
import AppLayout from '@/components/layout/app-layout';

// loaders
import MainLoader from './components/loaders/main-loader';
import UserProfile from './pages/github/user-profile';

// lazy loaded page components
const AuthPage = lazy(() => import('@/pages/auth/auth-page'));
const VerifyEmail = lazy(() => import('@/pages/auth/verify-email'));
const Dashboard = lazy(() => import('@/pages/dashboard/dashboard'));
const GitIntegration = lazy(() => import('@/pages/git/git-integration'));
const Repositories = lazy(() => import('@/pages/repositories/repositories'));
const ConnectToGitHub = lazy(() => import('@/pages/auth/connect-github'));
const Vulnerabilities = lazy(() => import('@/pages/vulnerabilities/vulnerabilities'));
const VulnerabilityDetails = lazy(() => import('@/pages/vulnerability-details/vulnerability-details'));
const AIRemediation = lazy(() => import('@/pages/remediation/ai-remediation'));
const RemediationHistory = lazy(() => import('@/pages/remediation-history/remediation-history'));
const PullRequests = lazy(() => import('@/pages/pull-request/pull-requests'));
const WebhookLogs = lazy(() => import('@/pages/webhook-logs/webhook-logs'));
const ScanHistory = lazy(() => import('@/pages/scan-history/scan-history'));
const Reports = lazy(() => import('@/pages/reports/reports'));
const Notifications = lazy(() => import('@/pages/notification/notifications'));
const Settings = lazy(() => import('@/pages/settings/settings'));
const ErrorPage = lazy(() => import('@/pages/error'));

// protected route guard
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isGithubConnected, loading } = useApp();

  if (loading) {
    return <MainLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isGithubConnected) {
    return <Navigate to="/connect-github" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AppProviders>
      <Toaster
        position="top-right"
        theme="dark"
        icons={{
          success: <span className="text-[#FF3B3B] font-mono font-black text-sm shrink-0 select-none mr-1">&gt;_</span>,
          error: <span className="text-[#FF3B3B] font-mono font-black text-sm shrink-0 select-none mr-1">&gt;_</span>,
          info: <span className="text-[#FF3B3B] font-mono font-black text-sm shrink-0 select-none mr-1">&gt;_</span>,
          warning: <span className="text-[#FF3B3B] font-mono font-black text-sm shrink-0 select-none mr-1">&gt;_</span>,
          loading: <div className="w-3.5 h-3.5 border-2 border-[#FF3B3B] border-t-transparent rounded-full animate-spin shrink-0 mr-1" />,
        }}
        toastOptions={{
          style: {
            background: 'linear-gradient(135deg, rgba(22, 6, 6, 0.96) 0%, rgba(9, 3, 3, 0.98) 100%)',
            border: '1px solid rgba(185, 28, 28, 0.65)',
            borderRadius: '18px',
            boxShadow: '0 0 25px rgba(255, 59, 59, 0.22), 0 10px 30px rgba(0, 0, 0, 0.85)',
            color: '#FFFFFF',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            fontWeight: 600,
            padding: '10px 22px',
            letterSpacing: '0.025em',
          },
        }}
      />
      <Suspense fallback={<MainLoader />}>
        <Routes>
          {/* public auth routes */}
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/connect-github" element={<ConnectToGitHub />} />
          <Route path="/loader" element={<MainLoader />} />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* protected main platform routes wrapped in AppLayout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/git-integration" element={<GitIntegration />} />
            <Route path="/repositories" element={<Repositories />} />
            <Route path="/vulnerabilities" element={<Vulnerabilities />} />
            <Route path="/vulnerabilities/:id" element={<VulnerabilityDetails />} />
            <Route path="/ai-remediation" element={<AIRemediation />} />
            <Route path="/ai-remediation/:vulnId" element={<AIRemediation />} />
            <Route path="/remediation-history" element={<RemediationHistory />} />
            <Route path="/pull-requests" element={<PullRequests />} />
            <Route path="/webhook-logs" element={<WebhookLogs />} />
            <Route path="/scan-history" element={<ScanHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />

          {/* fallback 404 route */}
          <Route
            path="*"
            element={<ErrorPage />}
          />
        </Routes>
      </Suspense>
    </AppProviders>
  );
}