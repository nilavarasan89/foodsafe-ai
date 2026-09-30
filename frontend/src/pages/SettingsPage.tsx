import React, { useState, useEffect } from 'react';
import { Settings, Save, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../api/client';
import type { SystemSettings } from '../types';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    normal_confidence_threshold: 0.90,
    suspicious_confidence_threshold: 0.70,
    simulator_speed_ms: 2000,
    disclaimer: 'Thresholds are application configuration values and require validation before production deployment.'
  });

  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await apiClient.put('/settings', {
        normal_confidence_threshold: Number(settings.normal_confidence_threshold),
        suspicious_confidence_threshold: Number(settings.suspicious_confidence_threshold),
        simulator_speed_ms: Number(settings.simulator_speed_ms)
      });
      setSettings(res.data);
      setSuccessMsg('Settings and Decision Engine thresholds updated successfully.');
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600" />
            SYSTEM CONFIGURATION & DECISION ENGINE THRESHOLDS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Configurable Confidence Cutoffs & Hardware Simulator Telemetry Parameters
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium">
          {successMsg}
        </div>
      )}

      {/* Mandatory Scientific Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block">Scientific & Regulatory Disclaimer:</span>
          <p className="text-amber-800 mt-0.5">{settings.disclaimer}</p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs max-w-xl">
          {/* Normal Confidence Threshold */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Normal Confidence Threshold (ACCEPTED Cutoff):
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0.50"
                max="1.00"
                step="0.01"
                value={settings.normal_confidence_threshold}
                onChange={(e) => setSettings({ ...settings, normal_confidence_threshold: parseFloat(e.target.value) })}
                className="flex-1 accent-blue-600"
              />
              <span className="font-mono font-bold text-blue-600 text-sm w-16 text-right">
                {(settings.normal_confidence_threshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Samples classified as NORMAL with confidence &ge; {(settings.normal_confidence_threshold * 100).toFixed(0)}% will be automatically ACCEPTED.
            </p>
          </div>

          {/* Suspicious Confidence Threshold */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Suspicious Confidence Threshold (REJECTED Cutoff):
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="0.10"
                max="0.95"
                step="0.01"
                value={settings.suspicious_confidence_threshold}
                onChange={(e) => setSettings({ ...settings, suspicious_confidence_threshold: parseFloat(e.target.value) })}
                className="flex-1 accent-red-600"
              />
              <span className="font-mono font-bold text-red-600 text-sm w-16 text-right">
                {(settings.suspicious_confidence_threshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Samples classified as SUSPICIOUS with confidence &ge; {(settings.suspicious_confidence_threshold * 100).toFixed(0)}% will trigger SERVO_REJECT.
            </p>
          </div>

          {/* Simulator Speed */}
          <div>
            <label className="block font-bold text-slate-800 mb-1">
              Demo Mode Inspection Speed (ms):
            </label>
            <input
              type="number"
              min="500"
              max="10000"
              step="500"
              value={settings.simulator_speed_ms}
              onChange={(e) => setSettings({ ...settings, simulator_speed_ms: parseInt(e.target.value) })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">Delay interval between simulated inline inspection events.</p>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
