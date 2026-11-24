import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../common/Sidebar';
import { TopBar } from '../common/TopBar';
import { BottomNav } from '../common/BottomNav';
import { SkipLink } from '../common/SkipLink';
import { useSosStore } from '../../store/useSosStore';
import { useMeshStore } from '../../store/useMeshStore';
import { useSyncStore } from '../../store/useSyncStore';
import { useContactsStore } from '../../store/useContactsStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToast } from '../common/Toast';
import { startListening, stopListening, isSpeechRecognitionSupported } from '../../lib/speech';
import { Mic } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const loadAlerts = useSosStore((state) => state.loadAlerts);
  const initMesh = useMeshStore((state) => state.initMesh);
  const initSync = useSyncStore((state) => state.initSync);
  const loadContacts = useContactsStore((state) => state.loadContacts);
  const { voiceNavigationEnabled, initFromStorage } = useSettingsStore();

  // Initialize application stores on mount
  useEffect(() => {
    initFromStorage();
    loadAlerts();
    initMesh();
    initSync();
    loadContacts();
  }, []);

  // Voice Navigation listener
  useEffect(() => {
    if (!voiceNavigationEnabled) {
      stopListening();
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      showToast('Voice navigation is not supported in this browser.', 'error');
      return;
    }

    const success = startListening({
      onResult: (command) => {
        const cmd = command.toLowerCase().trim();
        if (cmd.includes('sos') || cmd.includes('emergency')) {
          showToast(`Voice command: navigating to SOS`, 'info');
          navigate('/app/sos');
        } else if (cmd.includes('map') || cmd.includes('rescue')) {
          showToast(`Voice command: navigating to Rescue Map`, 'info');
          navigate('/app/map');
        } else if (cmd.includes('network') || cmd.includes('mesh') || cmd.includes('peers')) {
          showToast(`Voice command: navigating to Nearby Network`, 'info');
          navigate('/app/network');
        } else if (cmd.includes('triage') || cmd.includes('diagnose') || cmd.includes('injury')) {
          showToast(`Voice command: navigating to AI Triage`, 'info');
          navigate('/app/triage');
        } else if (cmd.includes('sms') || cmd.includes('text') || cmd.includes('fallback')) {
          showToast(`Voice command: navigating to SMS Fallback`, 'info');
          navigate('/app/sms');
        } else if (cmd.includes('contact') || cmd.includes('phone') || cmd.includes('people')) {
          showToast(`Voice command: navigating to Contacts`, 'info');
          navigate('/app/contacts');
        } else if (cmd.includes('guide') || cmd.includes('first aid') || cmd.includes('instruction')) {
          showToast(`Voice command: navigating to Offline Guide`, 'info');
          navigate('/app/guide');
        } else if (cmd.includes('setting') || cmd.includes('config')) {
          showToast(`Voice command: navigating to Settings`, 'info');
          navigate('/app/settings');
        } else if (cmd.includes('overview') || cmd.includes('dashboard') || cmd.includes('home')) {
          showToast(`Voice command: navigating to Overview`, 'info');
          navigate('/app');
        }
      },
      onError: (err) => {
        console.warn('Speech recognition notice:', err);
      },
    });

    if (success) {
      showToast('Voice navigation active. Say "Open SOS", "Open Map", "Open Guide", etc.', 'info');
    }

    return () => {
      stopListening();
    };
  }, [voiceNavigationEnabled, navigate, showToast]);

  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col lg:flex-row selection:bg-cyan-500 selection:text-black">
      <SkipLink />

      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-8">
        <TopBar />

        {/* Voice Navigation Active Banner */}
        {voiceNavigationEnabled && (
          <div className="bg-cyan-950/60 border-b border-cyan-500/30 px-4 py-1.5 flex items-center justify-between text-xs text-cyan-300">
            <div className="flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              <span>
                <strong>Voice Navigation Active:</strong> Say &quot;Open SOS&quot;, &quot;Open Map&quot;, &quot;Open Triage&quot;, &quot;Open Guide&quot;...
              </span>
            </div>
          </div>
        )}

        <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
};
