import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Pages
import { MainLayout } from './layouts/MainLayout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { LiveInspectionPage } from './pages/LiveInspectionPage';
import { InspectionHistoryPage } from './pages/InspectionHistoryPage';
import { InspectionDetailPage } from './pages/InspectionDetailPage';
import { VerificationCenterPage } from './pages/VerificationCenterPage';
import { BatchManagementPage } from './pages/BatchManagementPage';
import { BatchDetailPage } from './pages/BatchDetailPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ModelMonitoringPage } from './pages/ModelMonitoringPage';
import { FeedbackDatasetPage } from './pages/FeedbackDatasetPage';
import { AlertsPage } from './pages/AlertsPage';
import { ReportsPage } from './pages/ReportsPage';
import { HardwareStatusPage } from './pages/HardwareStatusPage';
import { SettingsPage } from './pages/SettingsPage';
import { PublicBatchPassportPage } from './pages/PublicBatchPassportPage';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const saved = localStorage.getItem('foodsafe_user');
    return saved ? JSON.parse(saved) : { id: 'usr-admin', email: 'admin@foodsafe.ai', full_name: 'Admin Supervisor', role: 'ADMIN' };
  });

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('foodsafe_token') || 'demo-token');
  const [demoMode, setDemoMode] = useState<boolean>(true);

  const handleLoginSuccess = (user: any, jwtToken: string) => {
    setCurrentUser(user);
    setToken(jwtToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('foodsafe_token');
    localStorage.removeItem('foodsafe_user');
    setCurrentUser(null);
    setToken(null);
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Digital Passport Route */}
        <Route path="/verify/batch/:batchId" element={<PublicBatchPassportPage />} />

        {/* Auth Route */}
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />

        {/* Authenticated Main App Routes */}
        <Route
          element={
            token ? (
              <MainLayout
                currentUser={currentUser}
                onLogout={handleLogout}
                demoMode={demoMode}
                setDemoMode={setDemoMode}
              />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/live-inspection" element={<LiveInspectionPage />} />
          <Route path="/inspections" element={<InspectionHistoryPage />} />
          <Route path="/inspections/:id" element={<InspectionDetailPage />} />
          <Route path="/verification" element={<VerificationCenterPage />} />
          <Route path="/batches" element={<BatchManagementPage />} />
          <Route path="/batches/:id" element={<BatchDetailPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/model-monitoring" element={<ModelMonitoringPage />} />
          <Route path="/feedback" element={<FeedbackDatasetPage />} />
          <Route path="/alerts" element={<AlertsPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/hardware" element={<HardwareStatusPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
