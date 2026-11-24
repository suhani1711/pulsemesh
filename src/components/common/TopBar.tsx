import React from 'react';
import { Wifi, WifiOff, Radio, Battery, BatteryCharging, RefreshCw, Mic } from 'lucide-react';
import { useSyncStore } from '../../store/useSyncStore';
import { useMeshStore } from '../../store/useMeshStore';
import { useSettingsStore } from '../../store/useSettingsStore';

export const TopBar: React.FC = () => {
  const { isOnline, queuedCount, lastSyncTimestamp, isSyncing, battery, triggerSync } = useSyncStore();
  const { peers } = useMeshStore();
  const { voiceNavigationEnabled, setVoiceNavigationEnabled } = useSettingsStore();

  const connectedPeersCount = peers.filter((p) => p.status === 'connected').length;

  // Network State determination
  const getNetworkStatus = () => {
    if (isOnline) {
      return {
        label: 'Online',
        color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
        icon: <Wifi className="w-3.5 h-3.5 text-emerald-400" />,
      };
    }
    if (connectedPeersCount > 0) {
      return {
        label: `Local Mesh (${connectedPeersCount} P2P)`,
        color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
        icon: <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />,
      };
    }
    return {
      label: 'Offline (Airgapped)',
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
      icon: <WifiOff className="w-3.5 h-3.5 text-amber-400" />,
    };
  };

  const netStatus = getNetworkStatus();

  const formatLastSync = (timestamp: number | null) => {
    if (!timestamp) return 'Never';
    const diffMins = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return `${Math.floor(diffMins / 60)}h ago`;
  };

  return (
    <header className="h-16 border-b border-cyan-500/20 bg-[#07111F]/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Left: Brand / System Status */}
      <div className="flex items-center gap-3">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${netStatus.color}`}
          title={isOnline ? 'Internet connection verified' : 'Operating in offline local-first mode'}
        >
          {netStatus.icon}
          <span>{netStatus.label}</span>
        </div>

        {/* Queued Outbox Counter */}
        {queuedCount > 0 && (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse"
            title={`${queuedCount} alert(s) queued in local outbox`}
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span>{queuedCount} Queued</span>
          </div>
        )}
      </div>

      {/* Right: Battery, Last Sync, Voice Toggle */}
      <div className="flex items-center gap-2 sm:gap-4 text-xs text-slate-300">
        {/* Battery chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
          {battery.supported && battery.level !== null ? (
            <>
              {battery.charging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-400" />
              ) : (
                <Battery className="w-4 h-4 text-cyan-400" />
              )}
              <span>{Math.round(battery.level * 100)}%</span>
            </>
          ) : (
            <>
              <Battery className="w-4 h-4 text-slate-500" />
              <span className="text-slate-400">Battery: Unavailable</span>
            </>
          )}
        </div>

        {/* Last sync & manual trigger button */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-slate-400 hidden md:inline">Sync:</span>
          <span>{formatLastSync(lastSyncTimestamp)}</span>
          <button
            onClick={() => triggerSync()}
            disabled={isSyncing}
            className="p-1 text-slate-400 hover:text-cyan-400 disabled:opacity-50 transition-colors"
            title="Trigger demo sync with local outbox"
            aria-label="Synchronize outbox"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Voice Navigation Quick Toggle */}
        <button
          onClick={() => setVoiceNavigationEnabled(!voiceNavigationEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs transition-colors ${
            voiceNavigationEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
          title={voiceNavigationEnabled ? 'Voice navigation listening' : 'Enable voice navigation'}
          aria-label="Toggle voice navigation"
        >
          <Mic className={`w-3.5 h-3.5 ${voiceNavigationEnabled ? 'animate-pulse text-cyan-300' : ''}`} />
          <span className="hidden sm:inline">Voice</span>
        </button>
      </div>
    </header>
  );
};
