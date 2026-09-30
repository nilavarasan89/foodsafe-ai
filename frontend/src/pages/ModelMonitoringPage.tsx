import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, ShieldCheck, Database, Layers, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../api/client';
import type { ModelVersion } from '../types';

export const ModelMonitoringPage: React.FC = () => {
  const [activeModel, setActiveModel] = useState<ModelVersion | null>(null);
  const [modelHistory, setModelHistory] = useState<ModelVersion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        const [activeRes, histRes] = await Promise.all([
          apiClient.get('/models/active'),
          apiClient.get('/models')
        ]);
        setActiveModel(activeRes.data);
        setModelHistory(histRes.data);
      } catch (err) {
        console.error('Error fetching model telemetry:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              EDGE ML MODEL MONITORING & TELEMETRY
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
              DEMO BENCHMARK DATA
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Performance Metrics, Version Control & Edge Deployment Health for Raspberry Pi Edge Model
          </p>
        </div>
      </div>

      {/* Active Model Main Card */}
      {activeModel && (
        <div className="bg-slate-950 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-blue-600 text-white uppercase">
                  {activeModel.status}
                </span>
                <h2 className="text-2xl font-black font-mono tracking-tight">{activeModel.version_code}</h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Architecture: <strong>{activeModel.model_name}</strong> ({activeModel.type}) • Target: <strong>{activeModel.deployment_target}</strong>
              </p>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Last Updated: {new Date(activeModel.created_at).toLocaleDateString()}
            </div>
          </div>

          {/* 4 Core Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Accuracy</span>
              <span className="text-3xl font-black font-mono text-emerald-400 block mt-1">{activeModel.accuracy}%</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Precision</span>
              <span className="text-3xl font-black font-mono text-blue-400 block mt-1">{activeModel.precision}%</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Recall</span>
              <span className="text-3xl font-black font-mono text-indigo-400 block mt-1">{activeModel.recall}%</span>
            </div>
            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">F1 Score</span>
              <span className="text-3xl font-black font-mono text-amber-400 block mt-1">{activeModel.f1_score}%</span>
            </div>
          </div>

          {/* Dataset Sizes */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-slate-900 p-4 rounded-xl border border-slate-800 font-mono">
            <div>
              <span className="text-slate-400 block">TRAINING DATASET SIZE</span>
              <span className="text-base font-bold text-white">{activeModel.training_samples_count.toLocaleString()} samples</span>
            </div>
            <div>
              <span className="text-slate-400 block">VALIDATION DATASET SIZE</span>
              <span className="text-base font-bold text-white">{activeModel.validation_samples_count.toLocaleString()} samples</span>
            </div>
          </div>
        </div>
      )}

      {/* Model History Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
          Model Version History & Lineage
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Version Code</th>
                <th className="py-2.5 px-3">Model Name</th>
                <th className="py-2.5 px-3">Target Platform</th>
                <th className="py-2.5 px-3">Accuracy</th>
                <th className="py-2.5 px-3">Precision</th>
                <th className="py-2.5 px-3">Recall</th>
                <th className="py-2.5 px-3">F1 Score</th>
                <th className="py-2.5 px-3">Training Size</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {modelHistory.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{m.version_code}</td>
                  <td className="py-2.5 px-3 font-medium text-slate-900">{m.model_name}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-600">{m.deployment_target}</td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold">{m.accuracy}%</td>
                  <td className="py-2.5 px-3 font-mono">{m.precision}%</td>
                  <td className="py-2.5 px-3 font-mono">{m.recall}%</td>
                  <td className="py-2.5 px-3 font-mono">{m.f1_score}%</td>
                  <td className="py-2.5 px-3 font-mono">{m.training_samples_count.toLocaleString()}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        m.status === 'ACTIVE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {m.status}
                    </span>
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
