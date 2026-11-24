import React, { useState, useEffect } from 'react';
import { LeafletMap } from './LeafletMap';
import { OfflineSvgMap } from './OfflineSvgMap';
import { RescuePoint } from '../../types';
import { useSosStore } from '../../store/useSosStore';
import { INITIAL_DEMO_RESCUE_POINTS } from '../../data/demoData';
import { requestCurrentPosition } from '../../lib/geo';
import { Badge } from '../common/Badge';
import { Filter, Layers, ExternalLink, ShieldCheck, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export const RescueMapContainer: React.FC = () => {
  const { alerts, selectedAlert, setSelectedAlert } = useSosStore();
  const [selectedRescuePoint, setSelectedRescuePoint] = useState<RescuePoint | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [forceOfflineMap, setForceOfflineMap] = useState<boolean>(!navigator.onLine);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Attempt geolocation on load
  useEffect(() => {
    requestCurrentPosition().then((res) => {
      if (res.coords) {
        setUserCoords({ lat: res.coords.lat, lng: res.coords.lng });
      }
    });

    const handleOffline = () => setForceOfflineMap(true);
    const handleOnline = () => setForceOfflineMap(false);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const filteredAlerts = alerts.filter((alert) => {
    if (priorityFilter === 'all') return true;
    return alert.priority === priorityFilter;
  });

  return (
    <div className="space-y-4">
      {/* Controls & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-[#0D1B2A] rounded-xl border border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-semibold text-slate-200">Filter Alerts:</span>
          <div className="flex items-center gap-1.5">
            {['all', 'critical', 'high', 'medium'].map((p) => (
              <button
                key={p}
                onClick={() => setPriorityFilter(p)}
                className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
                  priorityFilter === p
                    ? 'bg-cyan-500 text-black font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Mode Switcher Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setForceOfflineMap(!forceOfflineMap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              forceOfflineMap
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{forceOfflineMap ? 'Using Offline SVG' : 'Using OSM Tile Map'}</span>
          </button>
        </div>
      </div>

      {/* Map View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative min-h-[500px]">
          {forceOfflineMap ? (
            <OfflineSvgMap
              userLocation={userCoords}
              alerts={filteredAlerts}
              rescuePoints={INITIAL_DEMO_RESCUE_POINTS}
              selectedAlert={selectedAlert}
              onSelectAlert={(a) => {
                setSelectedRescuePoint(null);
                setSelectedAlert(a);
              }}
              onSelectRescuePoint={(rp) => {
                setSelectedAlert(null);
                setSelectedRescuePoint(rp);
              }}
            />
          ) : (
            <LeafletMap
              userLocation={userCoords}
              alerts={filteredAlerts}
              rescuePoints={INITIAL_DEMO_RESCUE_POINTS}
              selectedAlert={selectedAlert}
              onSelectAlert={(a) => {
                setSelectedRescuePoint(null);
                setSelectedAlert(a);
              }}
              onSelectRescuePoint={(rp) => {
                setSelectedAlert(null);
                setSelectedRescuePoint(rp);
              }}
              onTileError={() => setForceOfflineMap(true)}
            />
          )}
        </div>

        {/* Selected Marker Detail Panel */}
        <div className="p-5 bg-[#0D1B2A] rounded-xl border border-cyan-500/20 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h3 className="font-bold text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-cyan-400" />
                <span>Station & Alert Details</span>
              </h3>
              {selectedAlert?.isDemo && <Badge variant="demo" />}
            </div>

            {selectedAlert ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold text-base">{selectedAlert.id}</span>
                  <Badge variant="priority" priority={selectedAlert.priority} />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Category</span>
                  <span className="text-sm font-semibold text-slate-200 capitalize">
                    {selectedAlert.category} Emergency
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Status</span>
                  <Badge variant="status" status={selectedAlert.status} />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Description</span>
                  <p className="text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {selectedAlert.description}
                  </p>
                </div>

                {selectedAlert.medicalNeeds && (
                  <div>
                    <span className="text-xs text-slate-400 block mb-0.5">Medical Requirements</span>
                    <p className="text-xs text-amber-300 font-medium">{selectedAlert.medicalNeeds}</p>
                  </div>
                )}

                <div className="text-xs text-slate-400">
                  <span>GPS Coords: </span>
                  <span className="font-mono text-slate-200">
                    {selectedAlert.location.lat.toFixed(4)}, {selectedAlert.location.lng.toFixed(4)}
                  </span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/app/sms"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold border border-cyan-500/30 transition-colors"
                  >
                    <span>Generate SMS Fallback</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ) : selectedRescuePoint ? (
              <div className="mt-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-white">{selectedRescuePoint.name}</span>
                  <Badge variant="demo" />
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Type</span>
                  <span className="text-sm font-semibold text-cyan-300 capitalize">
                    {selectedRescuePoint.type.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Status</span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Operational ({selectedRescuePoint.status})
                  </span>
                </div>

                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Capacity & Resources</span>
                  <p className="text-sm text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {selectedRescuePoint.capacityNotes}
                  </p>
                </div>

                <div className="text-xs text-slate-400">
                  <span>Location: </span>
                  <span className="font-mono text-slate-200">
                    {selectedRescuePoint.lat.toFixed(4)}, {selectedRescuePoint.lng.toFixed(4)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center py-12 text-slate-500 text-sm">
                <MapPin className="w-10 h-10 mx-auto mb-2 opacity-30 text-cyan-400" />
                <p>Click any SOS marker or rescue point on the map to inspect details and coordinates.</p>
              </div>
            )}
          </div>

          {/* Map Legend */}
          <div className="pt-4 border-t border-cyan-950/60 text-xs text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 mb-1">Legend</div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span>Critical Emergency</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              <span>High Priority SOS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm border border-cyan-400 inline-block text-[8px] text-cyan-400 text-center font-bold">S</span>
              <span>Shelter / Aid Depot</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
