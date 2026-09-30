import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Activity,
  Layers,
  ArrowUpRight,
  Eye,
  RefreshCw,
  Clock,
  ShieldCheck
} from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { apiClient } from '../api/client';
import type { DashboardSummary, DashboardTrend, Inspection } from '../types';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary>({
    total_inspected: 12450,
    accepted_count: 11920,
    verify_count: 310,
    rejected_count: 220,
    reject_rate: 1.77,
    system_status: 'ONLINE',
    active_batch_code: 'CHK-2026-017'
  });
  const [trends, setTrends] = useState<DashboardTrend[]>([]);
  const [batchTrends, setBatchTrends] = useState<any[]>([]);
  const [recentInspections, setRecentInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [sumRes, trendRes, batchRes, insRes] = await Promise.all([
        apiClient.get('/dashboard/summary'),
        apiClient.get('/dashboard/trends'),
        apiClient.get('/dashboard/batch-rejection-trends'),
        apiClient.get('/inspections?limit=6')
      ]);

      if (sumRes.data) setSummary(sumRes.data);
      if (trendRes.data) setTrends(trendRes.data);
      if (batchRes.data) setBatchTrends(batchRes.data);
      if (insRes.data) setRecentInspections(insRes.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Pie chart colors
  const PIE_COLORS = ['#16a34a', '#d97706', '#dc2626'];
  const pieData = [
    { name: 'Accepted', value: summary.accepted_count },
    { name: 'Verify', value: summary.verify_count },
    { name: 'Rejected', value: summary.rejected_count },
  ];

  const latestIns = recentInspections[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            INLINE FOOD INSPECTION DASHBOARD
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-Time NIR Hyperspectral & Confidence-Aware Three-Way Sorting Telemetry
          </p>
        </div>
        <div className="mt-3 md:mt-0 flex items-center space-x-3">
          <button
            onClick={fetchDashboardData}
            className="p-2 text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-colors border border-slate-200"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <NavLink
            to="/live-inspection"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all"
          >
            <Eye className="w-4 h-4" />
            <span>Open Live Stream</span>
          </NavLink>
        </div>
      </div>

      {/* KPI Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Inspected */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase">Total Inspected</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.total_inspected.toLocaleString()}
            </div>
            <p className="text-[10px] text-emerald-600 font-medium mt-1 flex items-center">
              <span>● Active Batch: {summary.active_batch_code}</span>
            </p>
          </div>
        </div>

        {/* Accepted */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-emerald-700">Accepted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-emerald-700 font-mono">
              {summary.accepted_count.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              {((summary.accepted_count / (summary.total_inspected || 1)) * 100).toFixed(1)}% of total
            </p>
          </div>
        </div>

        {/* Verification Required */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-amber-700">Verification</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-amber-700 font-mono">
              {summary.verify_count.toLocaleString()}
            </div>
            <p className="text-[10px] text-amber-600 font-medium mt-1">
              Requires human operator validation
            </p>
          </div>
        </div>

        {/* Rejected */}
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase text-red-700">Rejected</span>
            <XCircle className="w-4 h-4 text-red-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-red-700 font-mono">
              {summary.rejected_count.toLocaleString()}
            </div>
            <p className="text-[10px] text-red-600 font-medium mt-1">
              Servo rejection diverter triggered
            </p>
          </div>
        </div>

        {/* Reject Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold tracking-wider uppercase">Reject Rate</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold text-slate-900 font-mono">
              {summary.reject_rate}%
            </div>
            <p className="text-[10px] text-slate-500 font-medium mt-1">
              Target threshold &lt; 2.50%
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Section A & B */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Live Inspection Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
              </span>
              Latest Inspection Event
            </h2>
            <span className="text-[10px] font-mono text-slate-500">
              {latestIns ? new Date(latestIns.timestamp).toLocaleTimeString() : '18:42:16'}
            </span>
          </div>

          <div className="my-4 space-y-3">
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Food Type:</span>
              <span className="font-semibold text-slate-900">{latestIns?.food_type || 'Chicken'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Batch ID:</span>
              <span className="font-mono font-medium text-slate-800">{latestIns?.batch_id || 'CHK-2026-017'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Inspection ID:</span>
              <span className="font-mono text-blue-600 font-bold">{latestIns?.inspection_code || 'INS-00421'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Raw ML Prediction:</span>
              <span className="font-semibold text-slate-900">{latestIns?.prediction_raw || 'SUSPICIOUS'}</span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Model Confidence:</span>
              <span className="font-mono font-bold text-slate-900">
                {latestIns ? `${(latestIns.confidence * 100).toFixed(1)}%` : '94.7%'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Action Executed:</span>
              <span className="font-mono text-xs font-semibold text-slate-800">{latestIns?.action_taken || 'SERVO_REJECT'}</span>
            </div>
          </div>

          {/* Result Badge */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">3-Way AI Decision:</span>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                latestIns?.decision === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : latestIns?.decision === 'VERIFY'
                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                  : 'bg-red-100 text-red-800 border border-red-300'
              }`}
            >
              {latestIns?.decision || 'REJECTED'}
            </span>
          </div>
        </div>

        {/* Section B: Inspection Trend Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Inspection Volume & Decision Trends
              </h2>
              <p className="text-xs text-slate-500">Weekly throughput broken down by AI sorting decisions</p>
            </div>
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="timestamp" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Line type="monotone" dataKey="accepted" stroke="#16a34a" strokeWidth={2} name="Accepted" />
                <Line type="monotone" dataKey="verify" stroke="#d97706" strokeWidth={2} name="Verify" />
                <Line type="monotone" dataKey="rejected" stroke="#dc2626" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid: Section C, D */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section C: Decision Distribution Donut */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
            Overall Decision Distribution
          </h2>
          <p className="text-xs text-slate-500 mb-4">Proportion of ACCEPTED vs VERIFY vs REJECTED outcomes</p>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center space-x-6 text-xs mt-2">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-600"></span> Accepted ({((summary.accepted_count/(summary.total_inspected||1))*100).toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-600"></span> Verify ({((summary.verify_count/(summary.total_inspected||1))*100).toFixed(1)}%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-600"></span> Rejected ({((summary.rejected_count/(summary.total_inspected||1))*100).toFixed(1)}%)</span>
          </div>
        </div>

        {/* Section D: Batch Rejection Trend Bar Chart */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-1">
            Batch Rejection Rate Comparison (%)
          </h2>
          <p className="text-xs text-slate-500 mb-4">Rejection percentage across active and historical batches</p>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={batchTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="batch_code" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} unit="%" />
                <Tooltip />
                <Bar dataKey="reject_rate" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Reject Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Section E: Recent Inspection Events Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
            Recent Inspection Event Log
          </h2>
          <NavLink to="/inspections" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">
            <span>View All Inspections</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </NavLink>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Food Product</th>
                <th className="py-2.5 px-3">Batch Code</th>
                <th className="py-2.5 px-3">ML Prediction</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">AI Decision</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentInspections.map((ins) => (
                <tr key={ins.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{ins.inspection_code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{ins.food_type}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{ins.batch_id}</td>
                  <td className="py-2.5 px-3 font-semibold">{ins.prediction_raw}</td>
                  <td className="py-2.5 px-3 font-mono">{(ins.confidence * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        ins.decision === 'ACCEPTED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ins.decision === 'VERIFY'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {ins.decision}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{ins.action_taken}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">
                    {new Date(ins.timestamp).toLocaleTimeString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
