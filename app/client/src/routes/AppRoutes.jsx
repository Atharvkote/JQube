import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import AppLayout from '../components/layout/AppLayout';
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import GitIntegration from '../pages/GitIntegration/GitIntegration';
import Repositories from '../pages/Repositories/Repositories';
import Vulnerabilities from '../pages/Vulnerabilities/Vulnerabilities';
import VulnerabilityDetails from '../pages/VulnerabilityDetails/VulnerabilityDetails';
import AIRemediation from '../pages/AIRemediation/AIRemediation';
import RemediationHistory from '../pages/RemediationHistory/RemediationHistory';
import PullRequests from '../pages/PullRequests/PullRequests';
import WebhookLogs from '../pages/WebhookLogs/WebhookLogs';
import ScanHistory from '../pages/ScanHistory/ScanHistory';
import Reports from '../pages/Reports/Reports';
import Notifications from '../pages/Notifications/Notifications';
import Profile from '../pages/Profile/Profile';
import Settings from '../pages/Settings/Settings';
import ErrorPage from '../components/common/ErrorPage';

const AppRoutes = () => {
  const { isLoggedIn } = useContext(AppContext);

  // Protected Routing Logic
  if (!isLoggedIn) {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/git-integration" element={<GitIntegration />} />
        <Route path="/repositories" element={<Repositories />} />
        <Route path="/vulnerabilities" element={<Vulnerabilities />} />
        <Route path="/vulnerabilities/:id" element={<VulnerabilityDetails />} />
        <Route path="/ai-remediation" element={<AIRemediation />} />
        <Route path="/ai-remediation/:id" element={<AIRemediation />} />
        <Route path="/remediation-history" element={<RemediationHistory />} />
        <Route path="/pull-requests" element={<PullRequests />} />
        <Route path="/webhook-logs" element={<WebhookLogs />} />
        <Route path="/scan-history" element={<ScanHistory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </AppLayout>
  );
};

export default AppRoutes;
