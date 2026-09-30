import React, { useState, useEffect } from 'react';
import { HardDrive, Activity, Radio, Cpu, RefreshCw } from 'lucide-react';
import { apiClient } from '../api/client';
import type { DeviceStatus } from '../types';

export const HardwareStatusPage: React.FC = () => {
  const [devices, setDevices] = useState<DeviceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/devices');
      setDevices(res.data);
    } catch (err) {
      console.error('Error fetching hardware status:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600" />
            EDGE HARDWARE & DEVICE TELEMETRY STATUS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-Time Heartbeat & Health Monitoring for Raspberry Pi Edge Machine Integration
          </p>
        </div>
        <button
          onClick={fetchDevices}
          className="mt-3 md:mt-0 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center space-x-1 border border-slate-200"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Poll Devices</span>
        </button>
      </div>

      {/* Hardware Component Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((dev) => (
          <div key={dev.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-slate-900 text-sm">{dev.name}</h3>
              </div>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {dev.status}
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Device Code:</span>
                <span className="font-bold text-blue-600">{dev.device_code}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Component Type:</span>
                <span className="text-slate-800">{dev.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">IP Address:</span>
                <span className="text-slate-800">{dev.ip_address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Firmware:</span>
                <span className="text-slate-800">{dev.firmware_version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Heartbeat:</span>
                <span className="text-slate-500 text-[10px]">{new Date(dev.last_heartbeat).toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
