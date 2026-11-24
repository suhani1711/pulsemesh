import React from 'react';
import { RescueMapContainer } from '../../components/map/RescueMapContainer';
import { MapPin } from 'lucide-react';

export const MapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Tactical Rescue Map</h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Real-time geospatial visualization of local distress alerts, shelters, and medical aid points.
          </p>
        </div>
      </div>

      <RescueMapContainer />
    </div>
  );
};
