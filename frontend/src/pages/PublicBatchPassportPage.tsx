import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShieldCheck, CheckCircle2, AlertCircle, Award, Layers, ExternalLink } from 'lucide-react';
import { apiClient } from '../api/client';
import type { BatchPassport } from '../types';

export const PublicBatchPassportPage: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const [passport, setPassport] = useState<BatchPassport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPassport = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/verify/batch/${batchId}`);
        setPassport(res.data);
      } catch (err) {
        console.error('Error fetching batch passport:', err);
      } finally {
        setLoading(false);
      }
    };
    if (batchId) fetchPassport();
  }, [batchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 text-slate-300 text-xs font-mono">
        Verifying digital passport cryptography...
      </div>
    );
  }

  if (!passport) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-950 p-8 rounded-2xl border border-red-900 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-white font-bold text-lg">Invalid Batch Passport QR</h1>
          <p className="text-slate-400 text-xs mt-2">The requested batch code could not be verified in the FOODSAFE AI traceability ledger.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative z-10">
        {/* Passport Header */}
        <div className="text-center pb-6 border-b border-slate-800">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-3">
            <Award className="w-8 h-8" />
          </div>
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full block w-max mx-auto mb-2">
            ✓ Verified Digital Passport
          </span>
          <h1 className="text-2xl font-black text-white tracking-tight">{passport.batch_code}</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">FOODSAFE AI Inline Inspection & Traceability Record</p>
        </div>

        {/* Core Metadata */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Food Item</span>
            <span className="font-bold text-white text-sm">{passport.food_type}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Supplier</span>
            <span className="font-bold text-white text-sm truncate block">{passport.supplier}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Production Date</span>
            <span className="font-mono text-slate-300">{new Date(passport.production_date).toLocaleDateString()}</span>
          </div>
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Batch Status</span>
            <span className="font-bold text-emerald-400 uppercase">{passport.status}</span>
          </div>
        </div>

        {/* 3-Way Inspection Yield Table */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Inline Telemetry Yield Summary
          </h2>

          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-slate-400 block font-semibold">TOTAL</span>
              <span className="font-mono font-bold text-white">{passport.inspected_count}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-emerald-400 block font-semibold">ACCEPTED</span>
              <span className="font-mono font-bold text-emerald-400">{passport.accepted_count}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-amber-400 block font-semibold">VERIFY</span>
              <span className="font-mono font-bold text-amber-400">{passport.verify_count}</span>
            </div>
            <div className="bg-slate-900 p-2 rounded-lg border border-slate-800">
              <span className="text-[9px] text-red-400 block font-semibold">REJECTED</span>
              <span className="font-mono font-bold text-red-400">{passport.rejected_count}</span>
            </div>
          </div>
        </div>

        {/* Inspection Summary Description */}
        <div className="bg-blue-950/40 border border-blue-800/60 p-4 rounded-xl text-xs text-blue-200">
          <p className="font-medium leading-relaxed">{passport.inspection_summary}</p>
        </div>

        {/* Verification Footer */}
        <div className="pt-4 border-t border-slate-800/80 text-center text-[10px] text-slate-500 font-mono">
          FOODSAFE AI System Platform • Problem SIH26233
        </div>
      </div>
    </div>
  );
};
