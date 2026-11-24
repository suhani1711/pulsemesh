import React, { useState } from 'react';
import {
  Stethoscope,
  Camera,
  X,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Waves,
  Building2,
  HeartPulse,
  HelpCircle,
  Cpu
} from 'lucide-react';
import { triageEngine } from '../../lib/triageEngine';
import { speakText, stopSpeaking, isSpeechSynthesisSupported } from '../../lib/speech';
import { useToast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { TriageResult } from '../../types';

export const TriagePage: React.FC = () => {
  const { showToast } = useToast();

  const [category, setCategory] = useState<'injury' | 'fire' | 'structural' | 'flooding' | 'other'>('injury');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const categories = [
    { id: 'injury', label: 'Physical Injury / Wound', icon: HeartPulse, color: 'text-red-400' },
    { id: 'fire', label: 'Fire / Burn Hazard', icon: Flame, color: 'text-amber-400' },
    { id: 'structural', label: 'Structural Damage', icon: Building2, color: 'text-orange-400' },
    { id: 'flooding', label: 'Water / Flooding Hazard', icon: Waves, color: 'text-cyan-400' },
    { id: 'other', label: 'Other Hazard', icon: HelpCircle, color: 'text-slate-300' },
  ] as const;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('Image size exceeds 10MB limit.', 'error');
        return;
      }
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
      setResult(null);
      showToast('Image loaded for local on-device inspection.', 'info');
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    stopSpeaking();
    setIsSpeaking(false);

    try {
      const res = await triageEngine.analyze({
        file: imageFile || undefined,
        previewUrl: imagePreview || undefined,
        category,
      });
      setResult(res);
      showToast('Triage analysis complete (Simulated Heuristic).', 'success');
    } catch {
      showToast('Analysis error occurred.', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleToggleReadAloud = () => {
    if (!result) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    if (!isSpeechSynthesisSupported()) {
      showToast('Text-to-speech is not supported in this browser.', 'error');
      return;
    }

    const narrative = `Triage evaluation for ${result.category}. Risk level is ${result.riskLevel}. ${result.summary}. Immediate steps: ${result.immediateSafetySteps.join('. ')}`;

    setIsSpeaking(true);
    speakText(narrative, {
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">AI Emergency Triage</h1>
          <Badge variant="simulated" />
        </div>
        <p className="text-sm text-slate-300 mt-1">
          On-device computer-vision heuristic for rapid casualty hazard assessment and first-aid triage guidance.
        </p>
      </div>

      {/* Mandatory Medical Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Transparent Medical & AI Disclaimer:</p>
          <p className="text-slate-300 leading-relaxed">
            This module operates a client-side heuristic demo engine. PulseMesh{' '}
            <strong>never claims to make medical diagnoses</strong>. All first-aid guidance adheres to conservative,
            standard emergency stabilization protocols. When official emergency services are reachable, always dial 112 / 911 / 108.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Image Input & Category Selection */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            1. Provide Emergency Visual & Context
          </h2>

          {/* Image Upload Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Attach Hazard or Injury Photo (Processed 100% On-Device)
            </label>

            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-cyan-500/40 bg-slate-900 group">
                <img
                  src={imagePreview}
                  alt="Triage Preview"
                  className="w-full h-48 object-cover object-center"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black text-white transition-colors"
                  aria-label="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded bg-black/70 backdrop-blur-sm text-[11px] font-mono text-cyan-300">
                  {imageFile?.name || 'Captured Image'}
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-cyan-500/30 hover:border-cyan-500/60 rounded-xl p-6 text-center bg-slate-900/50 transition-colors">
                <input
                  type="file"
                  id="triage-upload"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="sr-only"
                />
                <label
                  htmlFor="triage-upload"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-white">Capture Photo or Upload Image</span>
                  <span className="text-[11px] text-slate-400">
                    JPG, PNG up to 10MB • Never transmitted over network
                  </span>
                </label>
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Incident Category *
            </label>
            <div className="space-y-2">
              {categories.map((c) => {
                const Icon = c.icon;
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.id);
                      setResult(null);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400 shadow-[0_0_15px_rgba(0,217,255,0.15)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${c.color}`} />
                    <span>{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Analyze Button */}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Cpu className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'Analyzing On-Device Heuristic...' : 'Run Triage Assessment'}</span>
          </button>
        </div>

        {/* Right Column: Results Panel */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Triage Evaluation & Protocol
              </h2>
              {result && (
                <button
                  type="button"
                  onClick={handleToggleReadAloud}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-colors"
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-red-400" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Read Aloud</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {result ? (
              <div className="mt-5 space-y-5 animate-fade-in text-xs">
                {/* Prominent Simulated Result Banner */}
                <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/40 flex items-center justify-between text-purple-200">
                  <div className="flex items-center gap-2">
                    <Badge variant="simulated" />
                    <span className="font-semibold text-xs">Rule-based demo heuristic result.</span>
                  </div>
                  <span className="text-[11px] text-purple-300">
                    Confidence: 94% (Demo Rule)
                  </span>
                </div>

                {/* Risk & Summary Header */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Evaluated Threat Category</span>
                    <span className="text-sm font-bold text-white">{result.category}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="text-slate-400 text-[11px] block">Assessed Risk Level</span>
                    <span
                      className={`text-sm font-bold uppercase tracking-wider ${
                        result.riskLevel === 'Critical'
                          ? 'text-red-400'
                          : result.riskLevel === 'High'
                          ? 'text-orange-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {result.riskLevel} Priority
                    </span>
                  </div>
                </div>

                {/* Summary narrative */}
                <p className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed text-sm">
                  {result.summary}
                </p>

                {/* Immediate Safety Steps */}
                <div className="space-y-2">
                  <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Immediate Safety Steps</span>
                  </h3>
                  <div className="space-y-1.5">
                    {result.immediateSafetySteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 text-slate-200 flex items-start gap-2.5"
                      >
                        <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* When to Seek Help */}
                <div className="space-y-2">
                  <h3 className="font-bold text-red-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    <span>When to Seek Professional Medical Help</span>
                  </h3>
                  <ul className="space-y-1.5">
                    {result.whenToSeekHelp.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-2 rounded-lg bg-red-950/20 border border-red-500/20 text-red-200 flex items-center gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image Heuristic Stats */}
                {result.imageStats && (
                  <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-2">
                      <span>Dominant Color:</span>
                      <span
                        className="w-3.5 h-3.5 rounded border border-white/40"
                        style={{ backgroundColor: result.imageStats.dominantColor }}
                      />
                      <span>{result.imageStats.dominantColor}</span>
                    </div>
                    <div>Brightness: {result.imageStats.brightness}%</div>
                    <div>Canvas: {result.imageStats.dimensions}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-16 text-center py-12 text-slate-500">
                <Stethoscope className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
                <p className="text-sm">
                  Select an incident category and click &quot;Run Triage Assessment&quot; to inspect immediate safety protocols.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-cyan-950 text-[11px] text-slate-500 leading-normal">
            Modular Engine Architecture: <code className="text-cyan-400">TriageEngine</code> interface allows seamless drop-in of quantized TensorFlow.js / ONNX offline vision models.
          </div>
        </div>
      </div>
    </div>
  );
};
