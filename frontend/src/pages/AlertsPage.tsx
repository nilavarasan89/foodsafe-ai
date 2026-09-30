import React, { useState, useEffect } from 'react';
import { AlertTriangle, ShieldAlert, CheckCircle2, Bell } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Alert } from '../types';

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/alerts');
      setAlerts(res.data);
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleResolveAlert = async (id: string) => {
    try {
      await apiClient.post(`/alerts/${id}/resolve`);
      fetchAlerts();
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            EARLY WARNING ANOMALY ALERTS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated Anomaly Trend Frequency & Inline System Telemetry Warning Center
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading early warning alerts...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No active alerts in system. All inline inspection metrics are within nominal limits.
          </div>
        ) : (
          alerts.map((alt) => (
            <div
              key={alt.id}
              className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm ${
                alt.severity === 'CRITICAL'
                  ? 'bg-red-50 border-red-200'
                  : alt.severity === 'WARNING'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 ${
                    alt.severity === 'CRITICAL'
                      ? 'bg-red-600'
                      : alt.severity === 'WARNING'
                      ? 'bg-amber-600'
                      : 'bg-blue-600'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                        alt.severity === 'CRITICAL'
                          ? 'bg-red-200 text-red-900'
                          : alt.severity === 'WARNING'
                          ? 'bg-amber-200 text-amber-900'
                          : 'bg-blue-200 text-blue-900'
                      }`}
                    >
                      {alt.severity}
                    </span>
                    <h3 className="font-bold text-slate-900 text-sm">{alt.title}</h3>
                  </div>
                  <p className="text-xs text-slate-700 mt-1">{alt.message}</p>
                  <div className="flex items-center space-x-3 text-[10px] font-mono text-slate-500 mt-2">
                    <span>Code: {alt.alert_code}</span>
                    <span>Created: {new Date(alt.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                {alt.is_resolved ? (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved
                  </span>
                ) : (
                  <button
                    onClick={() => handleResolveAlert(alt.id)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs shadow-sm transition-all"
                  >
                    Acknowledge & Resolve
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
