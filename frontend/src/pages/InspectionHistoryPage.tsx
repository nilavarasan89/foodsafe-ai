import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { History, Search, Filter, ArrowUpDown, ChevronRight, Eye } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Inspection } from '../types';

export const InspectionHistoryPage: React.FC = () => {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [search, setSearch] = useState('');
  const [foodFilter, setFoodFilter] = useState('ALL');
  const [decisionFilter, setDecisionFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchInspections = async () => {
    try {
      setLoading(true);
      let url = '/inspections?limit=100';
      if (foodFilter !== 'ALL') url += `&food_type=${encodeURIComponent(foodFilter)}`;
      if (decisionFilter !== 'ALL') url += `&decision=${encodeURIComponent(decisionFilter)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const res = await apiClient.get(url);
      setInspections(res.data);
    } catch (err) {
      console.error('Error fetching inspections history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [foodFilter, decisionFilter, search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <History className="w-5 h-5 text-blue-600" />
            INSPECTION HISTORY & AUDIT TRAIL
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete Filterable Log of All Inline Food Inspection Telemetry & Decisions
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search Inspection ID, Batch ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Food Filter */}
        <div>
          <select
            value={foodFilter}
            onChange={(e) => setFoodFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All Food Types</option>
            <option value="Chicken">Chicken</option>
            <option value="Leafy Greens">Leafy Greens</option>
            <option value="Tomato">Tomato</option>
            <option value="Fish">Fish</option>
          </select>
        </div>

        {/* Decision Filter */}
        <div>
          <select
            value={decisionFilter}
            onChange={(e) => setDecisionFilter(e.target.value)}
            className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="ALL">All AI Decisions</option>
            <option value="ACCEPTED">ACCEPTED (Green)</option>
            <option value="VERIFY">VERIFY (Yellow)</option>
            <option value="REJECTED">REJECTED (Red)</option>
          </select>
        </div>
      </div>

      {/* Inspection Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Inspection ID</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Food Type</th>
                <th className="py-3 px-4">Batch ID</th>
                <th className="py-3 px-4">Prediction</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">3-Way Decision</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Model Ver</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">Loading inspection records...</td>
                </tr>
              ) : inspections.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">No inspections found matching criteria.</td>
                </tr>
              ) : (
                inspections.map((ins) => (
                  <tr key={ins.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{ins.inspection_code}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {new Date(ins.timestamp).toLocaleDateString()} {new Date(ins.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{ins.food_type}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{ins.batch_id}</td>
                    <td className="py-3 px-4 font-semibold">{ins.prediction_raw}</td>
                    <td className="py-3 px-4 font-mono">{(ins.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4 font-mono text-slate-500">{ins.action_taken}</td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">FoodSafe-v1.2</td>
                    <td className="py-3 px-4 text-right">
                      <NavLink
                        to={`/inspections/${ins.id}`}
                        className="inline-flex items-center space-x-1 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </NavLink>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
