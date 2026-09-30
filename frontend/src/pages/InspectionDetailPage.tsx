import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Clock, Cpu, HardDrive, Camera, FileCheck } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { apiClient } from '../api/client';
import type { InspectionDetail } from '../types';

export const InspectionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<InspectionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/inspections/${id}`);
        setDetail(res.data);
      } catch (err) {
        console.error('Error fetching inspection detail:', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchDetail();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading inspection details...</div>;
  }

  if (!detail) {
    return <div className="p-8 text-center text-red-500">Inspection record not found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <NavLink to="/inspections" className="inline-flex items-center space-x-1.5 text-slate-600 hover:text-slate-900 text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Inspection Log</span>
        </NavLink>
        <span className="font-mono text-xs text-slate-400">UUID: {detail.id}</span>
      </div>

      {/* Main Inspection Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{detail.inspection_code}</h1>
            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                detail.decision === 'ACCEPTED'
                  ? 'bg-emerald-100 text-emerald-800'
                  : detail.decision === 'VERIFY'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {detail.decision}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Food Product: <strong>{detail.food_type}</strong> | Batch ID: <strong>{detail.batch_id}</strong> | Timestamp: {new Date(detail.timestamp).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200 font-mono">
          <div>
            <span className="text-slate-400 block text-[10px]">PREDICTION</span>
            <span className="font-bold text-slate-900">{detail.prediction_raw}</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px]">CONFIDENCE</span>
            <span className="font-bold text-blue-600">{(detail.confidence * 100).toFixed(1)}%</span>
          </div>
          <div className="border-l border-slate-200 pl-4">
            <span className="text-slate-400 block text-[10px]">ACTION</span>
            <span className="font-bold text-slate-800">{detail.action_taken}</span>
          </div>
        </div>
      </div>

      {/* Grid: Details, Image Evidence, NIR Spectrum Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware & Metadata */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            Hardware & System Telemetry
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Model Version:</span>
              <span className="font-mono font-semibold text-slate-900">{detail.model_version_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Edge Gateway ID:</span>
              <span className="font-mono text-slate-800">{detail.device_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">NIR Camera ID:</span>
              <span className="font-mono text-slate-800">{detail.camera_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Object Sensor ID:</span>
              <span className="font-mono text-slate-800">{detail.sensor_id}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Verification Status:</span>
              <span className="font-semibold text-slate-800">{detail.verification_status}</span>
            </div>
          </div>

          {detail.verification_record && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs">
              <span className="font-bold text-blue-900 block mb-1">Human Operator Verification:</span>
              <p className="text-blue-800">Result: <strong>{detail.verification_record.human_verification}</strong></p>
              <p className="text-blue-700 text-[11px] mt-1">Verifier: {detail.verification_record.verifier_name}</p>
              {detail.verification_record.notes && <p className="text-blue-900 text-[11px] italic mt-1">"{detail.verification_record.notes}"</p>}
            </div>
          )}
        </div>

        {/* Image Evidence & Spectral Curve */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-2">
            <Camera className="w-4 h-4 text-blue-600" />
            NIR Image Evidence & Spectral Reflectance Curve
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Image */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Captured NIR Frame</span>
              <div className="w-full h-44 rounded-lg overflow-hidden border border-slate-200 bg-slate-900">
                <img src={detail.image_url} alt="Evidence" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* NIR Curve */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">NIR Spectral Curve (750nm - 1700nm)</span>
              <div className="h-44 w-full bg-slate-50 p-2 rounded-lg border border-slate-200">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={detail.nir_spectrum_data?.data_points || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="wavelength_nm" stroke="#94a3b8" fontSize={9} unit="nm" />
                    <YAxis stroke="#94a3b8" fontSize={9} domain={[0, 1]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="reflectance" stroke="#2563eb" strokeWidth={2} dot={{ r: 3 }} name="Reflectance" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Physical Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Step-by-Step Event Execution Timeline
        </h2>

        <div className="space-y-3">
          {detail.timeline.map((step, idx) => (
            <div key={idx} className="flex items-start space-x-3 text-xs">
              <div className="font-mono text-slate-400 w-24 shrink-0 text-[11px] pt-0.5">{step.time_offset}</div>
              <div className="w-2.5 h-2.5 rounded-full bg-blue-600 mt-1 shrink-0"></div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200 flex-1">
                <span className="font-bold text-slate-900 block">{step.step}</span>
                <span className="text-slate-600 text-[11px]">{step.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
