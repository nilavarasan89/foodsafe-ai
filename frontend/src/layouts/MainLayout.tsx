import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';

interface MainLayoutProps {
  currentUser: { email: string; full_name: string; role: string } | null;
  onLogout: () => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ currentUser, onLogout, demoMode, setDemoMode }) => {
  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Fixed Left Sidebar */}
      <Sidebar
        demoMode={demoMode}
        setDemoMode={setDemoMode}
        currentUser={currentUser}
        onLogout={onLogout}
      />

      {/* Main Right Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header currentUser={currentUser} />
        
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet context={{ demoMode, setDemoMode, currentUser }} />
        </main>
      </div>
    </div>
  );
};
