import React, { useState, useEffect } from 'react';
import { Search, Bell, Activity, Clock, ShieldCheck, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentUser: { email: string; full_name: string; role: string } | null;
  alertsCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ currentUser, alertsCount = 1 }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      {/* Left: Global Search */}
      <div className="flex items-center space-x-4 w-1/3">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Inspection ID, Batch ID, Food Type..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Center & Right Status Indicators */}
      <div className="flex items-center space-x-5 text-xs">
        {/* System Online Badge */}
        <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-emerald-700 font-semibold text-[11px]">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>● SYSTEM ONLINE</span>
        </div>

        {/* Live Clock */}
        <div className="flex items-center space-x-1.5 text-slate-500 font-mono bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 text-[11px]">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{time || '18:42:16'}</span>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-4 h-4" />
            {alertsCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>
        </div>

        {/* Current User */}
        <div className="flex items-center space-x-2.5 pl-3 border-l border-slate-200">
          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            {currentUser?.full_name?.charAt(0) || 'A'}
          </div>
          <div className="hidden md:block text-left">
            <p className="text-[11px] font-semibold text-slate-800 leading-tight">{currentUser?.full_name || 'Admin Operator'}</p>
            <p className="text-[9px] text-slate-500 font-medium">{currentUser?.email || 'admin@foodsafe.ai'}</p>
          </div>
        </div>
      </div>
    </header>
  );
};
