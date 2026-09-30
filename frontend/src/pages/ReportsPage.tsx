import React, { useState, useEffect } from 'react';
import { FileText, Download, Plus, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Report, Batch } from '../types';

export const ReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [reportType, setReportType] = useState('BATCH_INSPECTION');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const [repRes, batchRes] = await Promise.all([
        apiClient.get('/reports'),
        apiClient.get('/batches')
      ]);
      setReports(repRes.data);
      setBatches(batchRes.data);
      if (batchRes.data.length > 0) setSelectedBatch(batchRes.data[0].id);
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setGenerating(true);
      const res = await apiClient.post('/reports/generate', {
        report_type: reportType,
        batch_id: selectedBatch,
        title: `FOODSAFE AI Quality & Traceability Audit Report`
      });
      fetchReports();
    } catch (err) {
      console.error('Error generating report:', err);
      alert('Failed to generate PDF report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDownloadPdf = (reportId: string) => {
    window.open(`http://localhost:8000/api/reports/download/${reportId}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            PDF INSPECTION REPORT GENERATION
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated Executive PDF Reports for Quality Audit & Regulatory Compliance
          </p>
        </div>
      </div>

      {/* Generator Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide border-b border-slate-100 pb-2">
          Generate New PDF Audit Report
        </h2>

        <form onSubmit={handleGenerateReport} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Select Batch</label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              {batches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.batch_code} ({b.food_type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Report Format / Template</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
            >
              <option value="BATCH_INSPECTION">Full Batch Quality Audit PDF</option>
              <option value="DAILY_SUMMARY">Daily Operations Executive Summary</option>
              <option value="QUALITY_AUDIT">Regulatory Traceability Report</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={generating}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>{generating ? 'Generating PDF...' : 'Generate PDF Report'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-4">
          Generated PDF Report Archive
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Report Title</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Generated By</th>
                <th className="py-2.5 px-3">Date Generated</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">Loading reports...</td></tr>
              ) : reports.length === 0 ? (
                <tr><td colSpan={5} className="py-8 text-center text-slate-400">No generated reports in archive.</td></tr>
              ) : (
                reports.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{r.title}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{r.report_type}</td>
                    <td className="py-2.5 px-3 text-slate-500">{r.generated_by}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDownloadPdf(r.batch_id || r.id)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-xs flex items-center space-x-1 ml-auto"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download PDF</span>
                      </button>
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
