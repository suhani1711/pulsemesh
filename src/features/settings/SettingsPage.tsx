import React, { useState, useEffect } from 'react';
import {
  Settings,
  Eye,
  Volume2,
  Mic,
  Database,
  Download,
  RotateCcw,
  Trash2,
  Smartphone
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useSosStore } from '../../store/useSosStore';
import { useToast } from '../../components/common/Toast';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { getAvailableVoices, speakText } from '../../lib/speech';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    theme,
    setTheme,
    largeButtonMode,
    setLargeButtonMode,
    simpleLanguageMode,
    setSimpleLanguageMode,
    textSize,
    setTextSize,
    ttsVoiceIndex,
    setTtsVoiceIndex,
    ttsRate,
    setTtsRate,
    voiceNavigationEnabled,
    setVoiceNavigationEnabled
  } = useSettingsStore();

  const { alerts, resetToDemoData, clearAllAlerts } = useSosStore();

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Populate SpeechSynthesis voices
    const loadVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    // PWA install prompt handler
    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Check if standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleTestTts = () => {
    speakText('PulseMesh voice telemetry operative. Offline speech synthesis test successful.', {
      rate: ttsRate,
      voiceIndex: ttsVoiceIndex,
    });
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(alerts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `pulsemesh-alerts-export-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${alerts.length} alert records as JSON.`, 'success');
  };

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        showToast('PWA installation accepted!', 'success');
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      showToast('To install PulseMesh: tap your browser menu and select "Install app" or "Add to Home Screen".', 'info');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">System Settings & Accessibility</h1>
        </div>
        <p className="text-sm text-slate-300 mt-1">
          Customize assistive display modes, speech engine, voice navigation, and offline storage.
        </p>
      </div>

      {/* 1. ACCESSIBILITY & DISPLAY */}
      <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-950">
          <Eye className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Accessibility & Visual Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Theme Mode */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Color Theme</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  theme === 'dark'
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,217,255,0.3)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Cyber Dark (Default)
              </button>
              <button
                type="button"
                onClick={() => setTheme('high-contrast')}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  theme === 'high-contrast'
                    ? 'bg-cyan-400 text-black ring-2 ring-white shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                High Contrast (WCAG)
              </button>
            </div>
          </div>

          {/* Large-Button Mode */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Large Button Mode</span>
              <span className="text-[11px] text-slate-400">Expands touch targets to ≥56px for tremors or gloves</span>
            </div>
            <button
              type="button"
              onClick={() => setLargeButtonMode(!largeButtonMode)}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none flex-shrink-0 ${
                largeButtonMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  largeButtonMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Simple Language Mode */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-200 block">Simple Language Mode</span>
              <span className="text-[11px] text-slate-400">Replaces complex medical copy with short plain words</span>
            </div>
            <button
              type="button"
              onClick={() => setSimpleLanguageMode(!simpleLanguageMode)}
              className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none flex-shrink-0 ${
                simpleLanguageMode ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  simpleLanguageMode ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Text Size */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Interface Text Size</span>
            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'large', 'xlarge'] as const).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setTextSize(size)}
                  className={`py-2 rounded-lg text-xs font-bold capitalize transition-all ${
                    textSize === size
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPEECH & VOICE NAVIGATION */}
      <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-950">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            Speech Synthesis (TTS) & Voice Navigation
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* TTS Voice Selector */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">Speech Synthesis Voice</span>
            <select
              value={ttsVoiceIndex}
              onChange={(e) => setTtsVoiceIndex(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none"
            >
              {voices.length > 0 ? (
                voices.map((v, idx) => (
                  <option key={idx} value={idx}>
                    {v.name} ({v.lang})
                  </option>
                ))
              ) : (
                <option value={0}>Default System Voice</option>
              )}
            </select>
          </div>

          {/* Speech Rate Slider */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="font-semibold">Speech Rate ({ttsRate}x)</span>
              <button
                type="button"
                onClick={handleTestTts}
                className="text-cyan-400 hover:underline font-semibold"
              >
                Test Voice
              </button>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.5"
              step="0.1"
              value={ttsRate}
              onChange={(e) => setTtsRate(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Voice Navigation Toggle */}
          <div className="md:col-span-2 p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Mic className="w-4 h-4 text-cyan-400" />
                  <span>Hands-Free Voice Navigation</span>
                </span>
                <span className="text-[11px] text-slate-400">
                  Continuous browser speech recognition for hands-trapped victims
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVoiceNavigationEnabled(!voiceNavigationEnabled)}
                className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none flex-shrink-0 ${
                  voiceNavigationEnabled ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                    voiceNavigationEnabled ? 'translate-x-7' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Voice Command Cheat Sheet */}
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300 block mb-1">Available spoken commands:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono">
                <span className="bg-slate-950 px-2 py-1 rounded text-cyan-300">&quot;Open SOS&quot;</span>
                <span className="bg-slate-950 px-2 py-1 rounded text-cyan-300">&quot;Open Map&quot;</span>
                <span className="bg-slate-950 px-2 py-1 rounded text-cyan-300">&quot;Open Triage&quot;</span>
                <span className="bg-slate-950 px-2 py-1 rounded text-cyan-300">&quot;Open Guide&quot;</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PWA & DATA MANAGEMENT */}
      <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-950">
          <Database className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            PWA Installation & Local Database
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* PWA Install */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-cyan-400" />
              <span>Offline PWA App Status</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {isInstalled
                ? 'PulseMesh is installed in standalone mode with full service worker caching.'
                : 'Install PulseMesh to run full-screen without internet on mobile or desktop.'}
            </p>
            <button
              onClick={handleInstallPwa}
              disabled={isInstalled}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-colors disabled:opacity-50"
            >
              {isInstalled ? 'Installed as Standalone App' : 'Install PWA to Device'}
            </button>
          </div>

          {/* Export JSON */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export Distress Telemetry</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Download your complete local distress history, timestamps, and coordinates in standard JSON format.
            </p>
            <button
              onClick={handleExportJson}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-colors"
            >
              Export Alerts ({alerts.length}) as JSON
            </button>
          </div>

          {/* Reset Demo Data */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Reset Demo Seed Data</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Restore default demonstration alerts, simulated relief stations, and sample contacts into IndexedDB.
            </p>
            <button
              onClick={() => setConfirmResetOpen(true)}
              className="w-full py-2.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors"
            >
              Reset to Demo Seed Data
            </button>
          </div>

          {/* Clear All Data */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-semibold text-red-300 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Wipe All Local Storage</span>
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Permanently purges all IndexedDB stores (alerts, outbox queue, contacts) and local settings.
            </p>
            <button
              onClick={() => setConfirmClearOpen(true)}
              className="w-full py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold transition-colors"
            >
              Wipe Local Database
            </button>
          </div>
        </div>
      </div>

      {/* RESET CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmResetOpen}
        title="Reset to Demo Data?"
        message="This will overwrite current alerts and reload initial disaster demonstration records."
        confirmLabel="Reset Data"
        variant="warning"
        onConfirm={async () => {
          await resetToDemoData();
          showToast('Database reset to initial demo state.', 'success');
          setConfirmResetOpen(false);
        }}
        onCancel={() => setConfirmResetOpen(false)}
      />

      {/* WIPE CLEAR CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={confirmClearOpen}
        title="Wipe All Local Data?"
        message="This will irrevocably erase all stored alerts, message queues, and personal contacts from this browser."
        confirmLabel="Wipe Everything"
        variant="danger"
        onConfirm={async () => {
          await clearAllAlerts();
          showToast('All local IndexedDB stores erased.', 'info');
          setConfirmClearOpen(false);
        }}
        onCancel={() => setConfirmClearOpen(false)}
      />
    </div>
  );
};
