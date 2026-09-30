import React, { useState, useEffect } from 'react';
import { BarChart3, Filter, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, CartesianGrid } from 'recharts';
import { apiClient } from '../api/client';

export const AnalyticsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [dateRange, setDateRange] = useState('7d');
  const [foodType, setFoodType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/analytics/overview?date_range=${dateRange}&food_type=${foodType}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, foodType]);

  const PIE_COLORS = ['#16a34a', '#d97706', '#dc2626'];

  return (
    <div className="space-y-6">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            ANALYTICS & INLINE TELEMETRY INSIGHTS
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Historical Three-Way Classification Performance, Food Types & Confidence Metrics
          </p>
        </div>

        {/* Filters */}
        <div className="mt-3 md:mt-0 flex items-center space-x-3 text-xs">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
          >
            <option value="today">Today</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
          <select
            value={foodType}
            onChange={(e) => setFoodType(e.target.value)}
            className="py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800"
          >
            <option value="ALL">All Food Types</option>
            <option value="Chicken">Chicken</option>
            <option value="Leafy Greens">Leafy Greens</option>
            <option value="Tomato">Tomato</option>
            <option value="Fish">Fish</option>
          </select>
        </div>
      </div>

      {loading || !data ? (
        <div className="p-8 text-center text-slate-400 text-xs">Loading analytics visualizations...</div>
      ) : (
        <>
          {/* Top Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 1. Decision Breakdown Pie */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                1. 3-Way AI Decision Distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">ACCEPTED vs VERIFY vs REJECTED percentage</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.decision_distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                      {data.decision_distribution.map((e: any, i: number) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Food Type Comparison */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                2. Food Product Category Throughput
              </h2>
              <p className="text-xs text-slate-500 mb-4">Comparison of inspection volume by food product</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.food_comparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="food_type" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="accepted" fill="#16a34a" name="Accepted" stackId="a" />
                    <Bar dataKey="verify" fill="#d97706" name="Verify" stackId="a" />
                    <Bar dataKey="rejected" fill="#dc2626" name="Rejected" stackId="a" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 3. Confidence Distribution */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                3. Model Confidence Score Distribution
              </h2>
              <p className="text-xs text-slate-500 mb-4">Sample counts grouped by confidence interval</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.confidence_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Sample Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 4. Verification Human Outcomes */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-1">
                4. Human Verification Audit Outcomes
              </h2>
              <p className="text-xs text-slate-500 mb-4">Results of operator review on UNCERTAIN samples</p>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.verification_outcomes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="outcome" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#d97706" radius={[4, 4, 0, 0]} name="Audit Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
