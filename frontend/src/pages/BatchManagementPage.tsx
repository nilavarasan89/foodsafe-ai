import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Boxes, Plus, QrCode, ChevronRight, Layers, ArrowUpRight } from 'lucide-react';
import { apiClient } from '../api/client';
import type { Batch } from '../types';

export const BatchManagementPage: React.FC = () => {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBatchCode, setNewBatchCode] = useState('CHK-2026-018');
  const [foodType, setFoodType] = useState('Chicken');
  const [supplier, setSupplier] = useState('AgriSafe Farms Ltd');
  const [totalQty, setTotalQty] = useState(2000);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/batches');
      setBatches(res.data);
    } catch (err) {
      console.error('Error fetching batches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/batches', {
        batch_code: newBatchCode,
        food_type: foodType,
        supplier: supplier,
        total_quantity: Number(totalQty)
      });
      setShowModal(false);
      fetchBatches();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create batch');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-600" />
            BATCH MANAGEMENT & DIGITAL TRACEABILITY
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Physical Food Lot Tracking, Inline Inspection Aggregation & Digital Passport Verification
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="mt-3 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center space-x-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Batch</span>
        </button>
      </div>

      {/* Batches Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Batch Code</th>
                <th className="py-3 px-4">Food Item</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4">Total Qty</th>
                <th className="py-3 px-4">Inspected</th>
                <th className="py-3 px-4">Accepted</th>
                <th className="py-3 px-4">Verify</th>
                <th className="py-3 px-4">Rejected</th>
                <th className="py-3 px-4">Reject Rate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={11} className="py-8 text-center text-slate-400">Loading food batches...</td></tr>
              ) : batches.length === 0 ? (
                <tr><td colSpan={11} className="py-8 text-center text-slate-400">No batches registered.</td></tr>
              ) : (
                batches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{b.batch_code}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.food_type}</td>
                    <td className="py-3 px-4 text-slate-600">{b.supplier}</td>
                    <td className="py-3 px-4 font-mono">{b.total_quantity.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono">{b.inspected_count.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700 font-semibold">{b.accepted_count.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-amber-700 font-semibold">{b.verify_count.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-red-700 font-semibold">{b.rejected_count.toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono font-bold">{b.reject_rate}%</td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <NavLink
                        to={`/batches/${b.id}`}
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

      {/* New Batch Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wide">Register New Food Batch</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 font-bold">✕</button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Batch Code</label>
                <input
                  type="text"
                  required
                  value={newBatchCode}
                  onChange={(e) => setNewBatchCode(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Food Product</label>
                <select
                  value={foodType}
                  onChange={(e) => setFoodType(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                >
                  <option value="Chicken">Chicken</option>
                  <option value="Leafy Greens">Leafy Greens</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Fish">Fish</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Total Quantity</label>
                <input
                  type="number"
                  required
                  value={totalQty}
                  onChange={(e) => setTotalQty(Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded text-slate-900 font-mono"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded font-semibold"
                >
                  Cancel
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 text-white rounded font-bold shadow">
                  Create Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
