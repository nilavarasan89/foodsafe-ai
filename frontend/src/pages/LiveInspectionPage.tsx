import React, { useState, useEffect } from 'react';
import {
  Eye,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  Radio,
  Zap,
  ShieldAlert,
  ArrowDown,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiClient, createWebSocketConnection } from '../api/client';
import type { Inspection } from '../types';

export const LiveInspectionPage: React.FC = () => {
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>({
    id: 'ins-demo-421',
    inspection_code: 'INS-00421',
    batch_id: 'CHK-2026-017',
    food_type: 'Chicken',
    timestamp: new Date().toISOString(),
    prediction_raw: 'SUSPICIOUS',
    confidence: 0.947,
    decision: 'REJECTED',
    action_taken: 'SERVO_REJECT',
    verification_status: 'NOT_REQUIRED',
    image_url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop'
  });

  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(true);
  const [demoStage, setDemoStage] = useState<string>('DECISION_MADE');
  const [stageMessage, setStageMessage] = useState<string>('System operational in real-time screening mode.');
  const [selectedFood, setSelectedFood] = useState<string>('Chicken');
  const [selectedBatch, setSelectedBatch] = useState<string>('CHK-2026-017');

  // WebSocket listener for live inspection updates
  useEffect(() => {
    const ws = createWebSocketConnection((event: any) => {
      if (event.event_type === 'NEW_INSPECTION') {
        setCurrentInspection(event.data);
        setDemoStage('DECISION_MADE');
      } else if (event.event_type === 'DEMO_STAGE') {
        setDemoStage(event.stage);
        setStageMessage(event.message);
      }
    });

    return () => {
      ws.close();
    };
  }, []);

  // Demo step trigger function for jury presentation flow
  const triggerDemoStep = async (stepType: 'ACCEPTED' | 'VERIFY' | 'REJECTED') => {
    try {
      setDemoStage('PRODUCT_DETECTED');
      setStageMessage(`IR Sensor triggered for ${selectedFood} on conveyor.`);
      await apiClient.post('/simulator/demo-step', {
        step_type: stepType,
        food_type: selectedFood,
        batch_code: selectedBatch
      });
    } catch (err) {
      console.error('Error triggering demo step:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Hardware Status Indicators Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Eye className="w-5 h-5 text-blue-600" />
            LIVE INLINE INSPECTION STREAM
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-Time Raspberry Pi Edge Sensor Pipeline & Machine Learning Telemetry
          </p>
        </div>

        {/* Presentation Demo Scenario Flow Controls */}
        <div className="mt-4 md:mt-0 flex items-center space-x-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
          <span className="text-[10px] font-bold text-slate-500 uppercase px-2">Presentation Scenario:</span>
          <button
            onClick={() => triggerDemoStep('ACCEPTED')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold text-xs shadow-sm flex items-center gap-1 transition-all"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Product #1 (Pass)</span>
          </button>
          <button
            onClick={() => triggerDemoStep('VERIFY')}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded font-semibold text-xs shadow-sm flex items-center gap-1 transition-all"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Product #2 (Verify)</span>
          </button>
          <button
            onClick={() => triggerDemoStep('REJECTED')}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded font-semibold text-xs shadow-sm flex items-center gap-1 transition-all"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Product #3 (Reject)</span>
          </button>
        </div>
      </div>

      {/* Hardware Telemetry Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Raspberry Pi</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ONLINE</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">NIR Camera</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ONLINE</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">IR Object Sensor</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ONLINE</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">NIR Illumination</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">ONLINE</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Inline Conveyor</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">RUNNING</span>
        </div>
        <div className="bg-white p-3 rounded-lg border border-slate-200 flex items-center justify-between">
          <span className="text-[11px] font-semibold text-slate-500">Servo Mechanism</span>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">READY</span>
        </div>
      </div>

      {/* Main Inspection View Split Screen */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT: Live Camera Preview & Conveyor Simulation (7 cols) */}
        <div className="lg:col-span-7 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden shadow-xl flex flex-col justify-between relative">
          {/* Top Camera HUD Overlay */}
          <div className="p-4 bg-slate-900/80 backdrop-blur border-b border-slate-800/80 flex items-center justify-between z-10">
            <div className="flex items-center space-x-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse"></span>
              <span className="text-xs font-mono font-bold text-slate-200 tracking-wider">LIVE NIR CAM 01 (750nm - 1700nm)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">FPS: 60.0 | 1080p</span>
          </div>

          {/* Camera View Area */}
          <div className="relative min-h-[340px] bg-slate-900 flex items-center justify-center overflow-hidden">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>

            {/* Laser Target Scan Overlay */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-blue-500/80 shadow-[0_0_15px_#3b82f6] animate-pulse"></div>

            {/* Product Image moving under inspection beam */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative w-64 h-48 rounded-lg overflow-hidden border-2 border-blue-500/60 shadow-2xl">
                <img
                  src={currentInspection?.image_url || 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?w=600&auto=format&fit=crop'}
                  alt="Food inspection preview"
                  className="w-full h-full object-cover"
                />
                {/* NIR Hyperspectral Heatmap Grid Overlay */}
                <div className="absolute inset-0 bg-blue-900/20 mix-blend-color-dodge pointer-events-none"></div>
                <div className="absolute top-2 left-2 bg-slate-950/80 px-2 py-1 rounded text-[10px] font-mono text-blue-400 border border-blue-500/40">
                  REFLECTANCE: 1450nm ABSORPTION
                </div>
              </div>

              {/* Live Stage Message */}
              <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-mono text-slate-200 flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                <span>{stageMessage}</span>
              </div>
            </div>
          </div>

          {/* Bottom Conveyor Telemetry Controls */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center space-x-3 text-slate-400">
              <span>FOOD: <strong className="text-white">{currentInspection?.food_type || 'Chicken'}</strong></span>
              <span>BATCH: <strong className="text-blue-400">{currentInspection?.batch_id || 'CHK-2026-017'}</strong></span>
            </div>
            <div className="text-slate-400">
              SERVO: <strong className="text-emerald-400">READY (120ms)</strong>
            </div>
          </div>
        </div>

        {/* RIGHT: Current Product Telemetry & 3-Way Engine (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Current Product Decision Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Current Product Telemetry
              </h2>
              <span className="text-[10px] font-mono text-slate-400">
                {currentInspection ? new Date(currentInspection.timestamp).toLocaleTimeString() : '18:42:16'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Food Item</span>
                <span className="font-bold text-slate-900 text-sm">{currentInspection?.food_type || 'Chicken'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Batch Code</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{currentInspection?.batch_id || 'CHK-2026-017'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Inspection ID</span>
                <span className="font-mono font-bold text-blue-600 text-sm">{currentInspection?.inspection_code || 'INS-00421'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">ML Prediction</span>
                <span className="font-bold text-slate-900 text-sm">{currentInspection?.prediction_raw || 'SUSPICIOUS'}</span>
              </div>
            </div>

            {/* Confidence Score Bar */}
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-slate-600">Model Confidence:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {currentInspection ? `${(currentInspection.confidence * 100).toFixed(1)}%` : '94.7%'}
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-500"
                  style={{ width: `${(currentInspection?.confidence || 0.947) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* 3-Way AI Sorting Decision Result Banner */}
            <div
              className={`p-4 rounded-xl text-center border-2 shadow-sm ${
                currentInspection?.decision === 'ACCEPTED'
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900'
                  : currentInspection?.decision === 'VERIFY'
                  ? 'bg-amber-50 border-amber-500 text-amber-900'
                  : 'bg-red-50 border-red-500 text-red-900'
              }`}
            >
              <span className="text-[10px] font-bold uppercase tracking-widest block opacity-75">3-Way Decision Output</span>
              <span className="text-2xl font-black tracking-wider uppercase block my-0.5">
                {currentInspection?.decision || 'REJECTED'}
              </span>
              <span className="text-xs font-medium block opacity-90">
                Action: {currentInspection?.action_taken || 'SERVO_REJECT'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prominent Visual Component: THREE-WAY DECISION ENGINE */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <div className="text-center max-w-xl mx-auto mb-6">
          <h2 className="text-base font-bold text-slate-900 tracking-tight uppercase flex items-center justify-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            AI THREE-WAY SORTING DECISION ENGINE
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Confidence-Aware Tri-Path Sorting Architecture (Configurable Thresholds)
          </p>
        </div>

        {/* Visual Flow Architecture */}
        <div className="flex flex-col items-center">
          <div className="px-5 py-2.5 bg-slate-900 text-white rounded-lg font-mono text-xs font-bold tracking-wider shadow-md">
            ML MODEL SCREENING PREDICTION
          </div>
          <ArrowDown className="w-5 h-5 text-slate-400 my-2" />
          <div className="px-5 py-2 bg-blue-50 border border-blue-300 text-blue-900 rounded-lg font-mono text-xs font-bold shadow-sm">
            CONFIDENCE SCORE EVALUATION
          </div>
          <ArrowDown className="w-5 h-5 text-slate-400 my-2" />

          {/* 3 Outcome Paths */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-3xl mt-2">
            {/* ACCEPTED */}
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4 text-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                ✓
              </div>
              <h3 className="font-bold text-emerald-900 text-sm uppercase">ACCEPTED</h3>
              <p className="text-[11px] font-mono text-emerald-700 mt-1">Normal (≥ 90.0% Confidence)</p>
              <p className="text-[10px] text-emerald-600 mt-2 font-medium">Continue on Main Conveyor</p>
            </div>

            {/* VERIFY */}
            <div className="bg-amber-50 border-2 border-amber-500 rounded-xl p-4 text-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                ?
              </div>
              <h3 className="font-bold text-amber-900 text-sm uppercase">VERIFY</h3>
              <p className="text-[11px] font-mono text-amber-700 mt-1">Uncertain (70.0% - 90.0%)</p>
              <p className="text-[10px] text-amber-600 mt-2 font-medium">Routed to Verification Bin</p>
            </div>

            {/* REJECTED */}
            <div className="bg-red-50 border-2 border-red-500 rounded-xl p-4 text-center shadow-sm">
              <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center mx-auto mb-2 font-bold">
                ✕
              </div>
              <h3 className="font-bold text-red-900 text-sm uppercase">REJECTED</h3>
              <p className="text-[11px] font-mono text-red-700 mt-1">Suspicious (&lt; 70.0% / Flagged)</p>
              <p className="text-[10px] text-red-600 mt-2 font-medium">Servo Rejection Mechanism</p>
            </div>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center mt-6 italic">
          * Note: Thresholds are application configuration parameters and require validation before production deployment.
        </p>
      </div>
    </div>
  );
};
