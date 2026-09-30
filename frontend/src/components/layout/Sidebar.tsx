import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Eye,
  History,
  CheckCircle2,
  Boxes,
  BarChart3,
  Cpu,
  Database,
  AlertTriangle,
  FileText,
  HardDrive,
  Settings,
  ShieldCheck,
  LogOut,
  Radio
} from 'lucide-react';

interface SidebarProps {
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  currentUser: { email: string; full_name: string; role: string } | null;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ demoMode, setDemoMode, currentUser, onLogout }) => {
  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Live Inspection', path: '/live-inspection', icon: Eye, highlight: true },
    { label: 'Inspections', path: '/inspections', icon: History },
    { label: 'Verification', path: '/verification', icon: CheckCircle2, badge: 'KEY' },
    { label: 'Batches', path: '/batches', icon: Boxes },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Model Monitoring', path: '/model-monitoring', icon: Cpu },
    { label: 'Feedback Dataset', path: '/feedback', icon: Database },
    { label: 'Alerts', path: '/alerts', icon: AlertTriangle },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Hardware', path: '/hardware', icon: HardDrive },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 z-30 border-r border-slate-800 select-none shadow-xl">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-950 flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-white tracking-wider text-lg leading-tight flex items-center gap-1">
            FOODSAFE <span className="text-blue-500 font-mono text-xs px-1.5 py-0.5 bg-blue-950 border border-blue-800 rounded">AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 tracking-tight font-medium">Inline Food Inspection Platform</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Main Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-blue-600 text-white font-semibold shadow-sm shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                } ${item.highlight ? 'border border-blue-500/30 bg-blue-950/20' : ''}`
              }
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* System Status & Demo Mode Control Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-3">
        {/* System Heartbeat */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900 rounded-lg border border-slate-800 text-xs">
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">Edge System</span>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
            ONLINE
          </span>
        </div>

        {/* Demo Mode Toggle */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/60 rounded-lg border border-slate-800/80 text-xs">
          <div className="flex items-center space-x-2">
            <Radio className={`w-3.5 h-3.5 ${demoMode ? 'text-amber-400 animate-pulse' : 'text-slate-500'}`} />
            <span className="text-[11px] font-medium text-slate-300">Demo Mode</span>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`text-[10px] font-semibold px-2.5 py-0.5 rounded transition-colors ${
              demoMode
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {demoMode ? 'ACTIVE' : 'OFF'}
          </button>
        </div>

        {/* User profile & Logout */}
        {currentUser && (
          <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 text-xs">
            <div className="truncate pr-2">
              <p className="text-[11px] font-semibold text-white truncate">{currentUser.full_name}</p>
              <span className="text-[9px] font-mono text-blue-400 uppercase">{currentUser.role}</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
