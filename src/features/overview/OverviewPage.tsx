import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  Radio,
  Stethoscope,
  MapPin,
  BatteryCharging,
  Battery,
  Wifi,
  WifiOff,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { useSosStore } from '../../store/useSosStore';
import { useMeshStore } from '../../store/useMeshStore';
import { useSyncStore } from '../../store/useSyncStore';
import { Badge } from '../../components/common/Badge';

export const OverviewPage: React.FC = () => {
  const { alerts } = useSosStore();
  const { peers, relayHistory } = useMeshStore();
  const { isOnline, queuedCount, lastSyncTimestamp, battery } = useSyncStore();

  const activeAlerts = alerts.filter((a) => a.status !== 'delivered');
  const criticalCount = alerts.filter((a) => a.priority === 'critical').length;
  const connectedPeers = peers.filter((p) => p.status === 'connected' && !p.isSimulated);

  const formatTime = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    return `${Math.floor(diff / 60)}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Pulse Callout */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0D1B2A] to-[#122238] border border-cyan-500/30 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
              Tactical Hub Active
            </span>
          </div>
          <h1 className="text-2xl font-black text-white">Emergency Response Mission Control</h1>
          <p className="text-sm text-slate-300">
            Offline triage hub connected to local device storage and ad-hoc radio transports.
          </p>
        </div>

        <Link
          to="/app/sos"
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(255,59,79,0.5)] transition-all transform hover:scale-105 active:scale-100 flex-shrink-0"
        >
          <AlertOctagon className="w-5 h-5 animate-pulse" />
          <span>Broadcast SOS</span>
        </Link>
      </div>

      {/* Primary Telemetry Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Network Status */}
        <div className="p-5 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Network Mode</span>
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div>
            <div className="text-xl font-bold text-white flex items-center gap-2">
              <span>{isOnline ? 'Online' : connectedPeers.length > 0 ? 'Local P2P' : 'Offline'}</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isOnline
                ? 'Internet connection detected'
                : connectedPeers.length > 0
                  ? 'Connected to real browser peers'
                  : 'No internet or connected peer detected'}
            </p>
          </div>
        </div>

        {/* Card 2: Connected Nearby Peers */}
        <div className="p-5 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Nearby Mesh Peers</span>
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-300 font-mono">
              {connectedPeers.length} {connectedPeers.length === 1 ? 'Node' : 'Nodes'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {connectedPeers.length > 0
                ? `${connectedPeers.length} active radio links`
                : 'No real peer connection'}
            </p>
          </div>
        </div>

        {/* Card 3: Active SOS Alerts */}
        <div className="p-5 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Alerts</span>
            <AlertOctagon className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono flex items-center gap-2">
              <span>{activeAlerts.length} Total</span>
              {criticalCount > 0 && (
                <span className="text-xs font-sans px-2 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                  {criticalCount} Critical
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {queuedCount > 0 ? `${queuedCount} awaiting outbox relay` : 'All alerts saved in IndexedDB'}
            </p>
          </div>
        </div>

        {/* Card 4: Battery & Sync Telemetry */}
        <div className="p-5 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Device Health</span>
            {battery.charging ? (
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
            ) : (
              <Battery className="w-4 h-4 text-cyan-400" />
            )}
          </div>
          <div>
            <div className="text-xl font-bold text-white font-mono">
              {battery.supported && battery.level !== null
                ? `${Math.round(battery.level * 100)}%`
                : 'Battery: N/A'}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Sync: {lastSyncTimestamp ? formatTime(lastSyncTimestamp) : 'Pending'}
            </p>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Active Local Alerts & Recent Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Active Emergency Alerts */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Active Distress Alerts</h2>
              <span className="text-xs text-slate-400">({alerts.length} on device)</span>
            </div>
            <Link
              to="/app/sos"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Manage SOS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-white">{alert.id}</span>
                    {alert.isDemo && <Badge variant="demo" />}
                  </div>
                  <Badge variant="priority" priority={alert.priority} />
                </div>

                <div className="text-xs font-semibold text-cyan-300 capitalize">
                  {alert.category} Emergency • {alert.peopleCount} people affected
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                  <Badge variant="status" status={alert.status} />
                  <span>{formatTime(alert.timestamp)}</span>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-10 text-slate-400 text-sm">
                No active SOS alerts found. Device outbox is clear.
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 cols): Real-Time Mesh Relay Activity Feed */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h2 className="text-lg font-bold text-white">Mesh Activity Feed</h2>
            </div>
            <Link
              to="/app/network"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>View Network</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {relayHistory.slice(0, 6).map((rec) => (
              <div
                key={rec.id}
                className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{rec.type}</span>
                    {rec.isSimulated && <Badge variant="simulated" />}
                  </div>
                  <div className="text-slate-400 font-mono text-[10px]">
                    ID: {rec.messageId.slice(0, 16)} • Hop: {rec.hopCount}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-semibold capitalize ${
                      rec.status === 'delivered'
                        ? 'text-emerald-400'
                        : rec.status === 'relayed'
                        ? 'text-cyan-400'
                        : 'text-amber-400'
                    }`}
                  >
                    {rec.status}
                  </span>
                  <div className="text-[10px] text-slate-500">{formatTime(rec.timestamp)}</div>
                </div>
              </div>
            ))}

            {relayHistory.length === 0 && (
              <div className="text-center py-10 text-slate-500 text-sm">
                No recent mesh packets. Open another tab or connect a peer to see live relays.
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="pt-4 border-t border-cyan-950/60 grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/app/triage"
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-center font-semibold transition-colors flex flex-col items-center gap-1"
            >
              <Stethoscope className="w-4 h-4 text-cyan-400" />
              <span>AI Triage</span>
            </Link>
            <Link
              to="/app/map"
              className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-center font-semibold transition-colors flex flex-col items-center gap-1"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Rescue Map</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
