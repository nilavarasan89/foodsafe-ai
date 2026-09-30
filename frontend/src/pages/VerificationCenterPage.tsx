import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, UserCheck, MessageSquare, ArrowRight, ShieldAlert, Sparkles } from 'lucide-react';
import { apiClient } from '../api/client';
import type { PendingVerification } from '../types';

export const VerificationCenterPage: React.FC = () => {
  const [pendingItems, setPendingItems] = useState<PendingVerification[]>([]);
  const [summary, setSummary] = useState<any>({
    pending_count: 2,
    verified_today: 14,
    normal_after_verification: 10,
    suspicious_after_verification: 4
  });

  const [selectedItem, setSelectedItem] = useState<PendingVerification | null>(null);
  const [humanOutcome, setHumanOutcome] = useState<'NORMAL' | 'SUSPICIOUS'>('NORMAL');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVerificationData = async () => {
    try {
      setLoading(true);
      const [pendingRes, sumRes] = await Promise.all([
        apiClient.get('/verification/pending'),
        apiClient.get('/verification/summary')
      ]);
      setPendingItems(pendingRes.data);
      setSummary(sumRes.data);
    } catch (err) {
      console.error('Error fetching verification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerificationData();
  }, []);

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    try {
      setSubmitting(true);
      await apiClient.post(`/verification/${selectedItem.id}/verify`, {
        human_verification: humanOutcome,
        notes: notes || 'Manual operator inspection completed.'
      });

      setSuccessMsg(`Sample ${selectedItem.inspection_code} verified as ${humanOutcome}. Feedback sample saved to Feedback Dataset.`);
      setSelectedItem(null);
      setNotes('');
      fetchVerificationData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err: any) {
      console.error('Error submitting verification:', err);
      alert(err.response?.data?.detail || 'Failed to submit verification.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-600" />
              HUMAN VERIFICATION CENTER
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded uppercase">
              Key Innovation Feature
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Human-in-the-Loop Validation for AI-Uncertain Food Inspection Samples
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block">Pending Verification</span>
          <span className="text-2xl font-bold text-amber-700 font-mono block mt-1">{summary.pending_count}</span>
          <span className="text-[10px] text-amber-600 font-medium">Bin awaiting operator review</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-slate-500 font-semibold uppercase tracking-wider block">Verified Today</span>
          <span className="text-2xl font-bold text-slate-900 font-mono block mt-1">{summary.verified_today}</span>
          <span className="text-[10px] text-slate-500 font-medium">Completed operator audits</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-sm">
          <span className="text-emerald-700 font-semibold uppercase tracking-wider block">Normal After Review</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono block mt-1">{summary.normal_after_verification}</span>
          <span className="text-[10px] text-emerald-600 font-medium">Cleared for batch inclusion</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-200 bg-red-50/20 shadow-sm">
          <span className="text-red-700 font-semibold uppercase tracking-wider block">Suspicious After Review</span>
          <span className="text-2xl font-bold text-red-700 font-mono block mt-1">{summary.suspicious_after_verification}</span>
          <span className="text-[10px] text-red-600 font-medium">Confirmed anomaly samples</span>
        </div>
      </div>

      {/* Pending Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4">
          Pending Verification Cases (Diverted Samples)
        </h2>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading pending verification items...</div>
        ) : pendingItems.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
            No verification cases pending in queue. All diverted samples have been reviewed.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Inspection ID</th>
                  <th className="py-3 px-4">Food Item</th>
                  <th className="py-3 px-4">Batch Code</th>
                  <th className="py-3 px-4">AI Prediction</th>
                  <th className="py-3 px-4">AI Confidence</th>
                  <th className="py-3 px-4">Time Created</th>
                  <th className="py-3 px-4 text-right">Human Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pendingItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{item.inspection_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{item.food_type}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{item.batch_code}</td>
                    <td className="py-3 px-4 font-bold text-amber-700">{item.prediction_raw}</td>
                    <td className="py-3 px-4 font-mono font-bold">{(item.confidence * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedItem(item)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-xs shadow-sm"
                      >
                        Audit & Verify
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Verification Audit Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-600" />
                Audit Sample: {selectedItem.inspection_code}
              </h3>
              <button onClick={() => setSelectedItem(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 grid grid-cols-2 gap-2 text-xs">
              <div><span className="text-slate-400">Food Item:</span> <strong>{selectedItem.food_type}</strong></div>
              <div><span className="text-slate-400">Batch Code:</span> <strong>{selectedItem.batch_code}</strong></div>
              <div><span className="text-slate-400">AI Prediction:</span> <strong className="text-amber-700">{selectedItem.prediction_raw}</strong></div>
              <div><span className="text-slate-400">AI Confidence:</span> <strong className="font-mono">{(selectedItem.confidence * 100).toFixed(1)}%</strong></div>
            </div>

            <form onSubmit={handleVerifySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Human Verification Verdict:</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setHumanOutcome('NORMAL')}
                    className={`py-2.5 px-3 rounded-lg border font-bold flex items-center justify-center space-x-2 transition-all ${
                      humanOutcome === 'NORMAL'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>MARK NORMAL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHumanOutcome('SUSPICIOUS')}
                    className={`py-2.5 px-3 rounded-lg border font-bold flex items-center justify-center space-x-2 transition-all ${
                      humanOutcome === 'SUSPICIOUS'
                        ? 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    <span>MARK SUSPICIOUS</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operator Notes / Rationale:</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Manual inspection showed no visible abnormality."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-900">
                <span className="font-bold block">Feedback Dataset Note:</span>
                This human verification decision will be saved to the Feedback Dataset for controlled ML model improvement.
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md"
                >
                  {submitting ? 'Saving...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
