import React, { useState, useEffect } from 'react';
import { Database, Download, CheckCircle2, AlertCircle, Layers } from 'lucide-react';
import { apiClient } from '../api/client';
import type { FeedbackSample } from '../types';

export const FeedbackDatasetPage: React.FC = () => {
  const [samples, setSamples] = useState<FeedbackSample[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchFeedbackSamples = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/feedback');
      setSamples(res.data);
    } catch (err) {
      console.error('Error fetching feedback dataset:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbackSamples();
  }, []);

  const handleExportDataset = async () => {
    try {
      setExporting(true);
      const res = await apiClient.post('/feedback/export', {}, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'foodsafe_feedback_dataset.json');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting dataset:', err);
      alert('Failed to export feedback dataset');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-600" />
            HUMAN FEEDBACK DATASET
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Curated Repository of Human-Verified Samples for Controlled Machine Learning Retraining
          </p>
        </div>
        <button
          onClick={handleExportDataset}
          disabled={exporting}
          className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center space-x-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>{exporting ? 'Exporting...' : 'Export Retraining Dataset'}</span>
        </button>
      </div>

      {/* Controlled Retraining Status Banner */}
      <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            ML
          </div>
          <div>
            <span className="font-bold text-sm block">Dataset Status: Ready for Controlled Model Retraining</span>
            <span className="text-blue-700 text-[11px]">
              {samples.length} human-verified samples aggregated. Automatic model updates are disabled for security and regulatory compliance.
            </span>
          </div>
        </div>
        <span className="px-3 py-1 bg-blue-600 text-white font-mono font-bold text-[11px] rounded-md uppercase shadow-sm">
          READY FOR RETRAINING
        </span>
      </div>

      {/* Samples Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
          Verified Feedback Samples Log
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Sample Code</th>
                <th className="py-2.5 px-3">Original AI Pred</th>
                <th className="py-2.5 px-3">AI Confidence</th>
                <th className="py-2.5 px-3">Verified Verdict</th>
                <th className="py-2.5 px-3">Verifier</th>
                <th className="py-2.5 px-3">Verification Date</th>
                <th className="py-2.5 px-3">Dataset Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">Loading dataset samples...</td></tr>
              ) : samples.length === 0 ? (
                <tr><td colSpan={7} className="py-8 text-center text-slate-400">No verified feedback samples recorded yet.</td></tr>
              ) : (
                samples.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{s.sample_code}</td>
                    <td className="py-2.5 px-3 font-semibold">{s.original_prediction}</td>
                    <td className="py-2.5 px-3 font-mono">{(s.confidence * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold ${
                          s.verified_result === 'NORMAL' ? 'text-emerald-700' : 'text-red-700'
                        }`}
                      >
                        {s.verified_result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{s.verifier_name}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(s.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                        {s.status}
                      </span>
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
