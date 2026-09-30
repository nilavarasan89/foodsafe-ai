import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, QrCode, ExternalLink, CheckCircle2, AlertTriangle, XCircle, FileText } from 'lucide-react';
import { apiClient } from '../api/client';

export const BatchDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [batch, setBatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showQrModal, setShowQrModal] = useState(false);

  useEffect(() => {
    const fetchBatchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/batches/${id}`);
        setBatch(res.data);
      } catch (err) {
        console.error('Error fetching batch detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchBatchDetail();
  }, [id]);

  if (loading) return <div className="p-8 text-center text-slate-400 text-xs">Loading batch details...</div>;
  if (!batch) return <div className="p-8 text-center text-red-500 text-xs">Batch record not found.</div>;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <NavLink to="/batches" className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Batch Directory</span>
        </NavLink>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <QrCode className="w-4 h-4" />
            <span>Generate Batch QR</span>
          </button>

          <NavLink
            to={`/verify/batch/${batch.batch_code}`}
            target="_blank"
            className="px-3 py-1.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
          >
            <span>Open Public Digital Passport</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </NavLink>
        </div>
      </div>

      {/* Main Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{batch.batch_code}</h1>
            <span className="text-xs font-bold px-3 py-1 rounded bg-emerald-100 text-emerald-800 uppercase">
              {batch.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Food Type: <strong>{batch.food_type}</strong> | Supplier: <strong>{batch.supplier}</strong> | Registered: {new Date(batch.production_date).toLocaleDateString()}
          </p>
        </div>

        {/* Breakdown Stats */}
        <div className="grid grid-cols-4 gap-2 text-center text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="px-2">
            <span className="text-[10px] text-slate-400 block font-semibold">TOTAL</span>
            <span className="font-mono font-bold text-slate-900 text-base">{batch.inspected_count}</span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[10px] text-emerald-600 block font-semibold">ACCEPTED</span>
            <span className="font-mono font-bold text-emerald-700 text-base">{batch.accepted_count}</span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[10px] text-amber-600 block font-semibold">VERIFY</span>
            <span className="font-mono font-bold text-amber-700 text-base">{batch.verify_count}</span>
          </div>
          <div className="px-2 border-l border-slate-200">
            <span className="text-[10px] text-red-600 block font-semibold">REJECTED</span>
            <span className="font-mono font-bold text-red-700 text-base">{batch.rejected_count}</span>
          </div>
        </div>
      </div>

      {/* Progress Bars */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-3">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Batch Three-Way Yield Breakdown
        </h2>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
          <div style={{ width: `${batch.acceptance_rate}%` }} className="bg-emerald-600 h-full" title={`Accepted: ${batch.acceptance_rate}%`}></div>
          <div style={{ width: `${batch.verification_rate}%` }} className="bg-amber-500 h-full" title={`Verify: ${batch.verification_rate}%`}></div>
          <div style={{ width: `${batch.reject_rate}%` }} className="bg-red-600 h-full" title={`Rejected: ${batch.reject_rate}%`}></div>
        </div>
        <div className="flex justify-between text-xs font-mono text-slate-600">
          <span>Accepted: <strong>{batch.acceptance_rate}%</strong></span>
          <span>Verification: <strong>{batch.verification_rate}%</strong></span>
          <span>Rejection Rate: <strong>{batch.reject_rate}%</strong></span>
        </div>
      </div>

      {/* Inspections Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
          Inspected Items Log ({batch.inspections?.length || 0} Records)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Inspection ID</th>
                <th className="py-2.5 px-3">Time</th>
                <th className="py-2.5 px-3">Prediction</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">AI Decision</th>
                <th className="py-2.5 px-3">Action Executed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {batch.inspections?.map((ins: any) => (
                <tr key={ins.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-blue-600">{ins.inspection_code}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-500">{new Date(ins.timestamp).toLocaleTimeString()}</td>
                  <td className="py-2.5 px-3 font-semibold">{ins.prediction_raw}</td>
                  <td className="py-2.5 px-3 font-mono">{(ins.confidence * 100).toFixed(1)}%</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQrModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-6 text-center shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm uppercase">Digital Batch Passport QR</h3>
              <button onClick={() => setShowQrModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <p className="text-xs text-slate-500">Scan this QR code to view the public Digital Food Inspection Passport.</p>
            <div className="w-48 h-48 mx-auto p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center">
              <img
                src={`http://localhost:8000/api/verify/batch/${batch.batch_code}/qr`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="font-mono text-xs text-blue-600 font-bold">{batch.batch_code}</div>
            <button
              onClick={() => window.open(`/verify/batch/${batch.batch_code}`, '_blank')}
              className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold shadow"
            >
              Open Digital Passport Link
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
