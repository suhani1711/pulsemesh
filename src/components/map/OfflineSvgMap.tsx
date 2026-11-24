import React from 'react';
import { SosAlert, RescuePoint, Coordinates } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface OfflineSvgMapProps {
  userLocation: Coordinates | null;
  alerts: SosAlert[];
  rescuePoints: RescuePoint[];
  selectedAlert: SosAlert | null;
  onSelectAlert: (alert: SosAlert) => void;
  onSelectRescuePoint: (rp: RescuePoint) => void;
}

/**
 * Offline SVG Schematic Map
 * Renders an off-grid tactical radar-style schematic visualization
 * when internet is disconnected or map tiles are unreachable.
 */
export const OfflineSvgMap: React.FC<OfflineSvgMapProps> = ({
  userLocation,
  alerts,
  rescuePoints,
  selectedAlert,
  onSelectAlert,
  onSelectRescuePoint,
}) => {
  const centerLat = userLocation?.lat ?? 37.7749;
  const centerLng = userLocation?.lng ?? -122.4194;

  // Transform coordinates to 800x600 SVG viewBox
  const scale = 5000;
  const toSvgX = (lng: number) => 400 + (lng - centerLng) * scale;
  const toSvgY = (lat: number) => 300 - (lat - centerLat) * scale;

  return (
    <div className="relative w-full h-[550px] bg-[#07111F] rounded-xl border border-cyan-500/30 overflow-hidden flex flex-col">
      {/* Offline Banner */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between px-3.5 py-2 bg-amber-950/80 border border-amber-500/40 rounded-lg backdrop-blur-md text-xs text-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Offline Schematic Mode:</strong> Map tiles unreachable. Showing vector tactical grid with stored GPS coordinates.
          </span>
        </div>
      </div>

      <svg
        viewBox="0 0 800 600"
        className="w-full h-full cursor-crosshair select-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* Tactical Grid Background */}
        <rect width="800" height="600" fill="#07111F" />
        <rect width="800" height="600" fill="url(#grid)" />

        {/* Concentric distance radar rings from center */}
        <circle cx="400" cy="300" r="100" fill="none" stroke="rgba(0, 217, 255, 0.15)" strokeWidth="1" strokeDasharray="3,3" />
        <circle cx="400" cy="300" r="200" fill="none" stroke="rgba(0, 217, 255, 0.12)" strokeWidth="1" strokeDasharray="4,4" />
        <circle cx="400" cy="300" r="300" fill="none" stroke="rgba(0, 217, 255, 0.08)" strokeWidth="1" strokeDasharray="6,6" />

        {/* Range labels */}
        <text x="405" y="200" fill="#4A6984" fontSize="10" fontFamily="monospace">1.2 KM</text>
        <text x="405" y="100" fill="#4A6984" fontSize="10" fontFamily="monospace">2.5 KM</text>

        {/* Center Crosshairs */}
        <line x1="390" y1="300" x2="410" y2="300" stroke="#00D9FF" strokeWidth="1.5" />
        <line x1="400" y1="290" x2="400" y2="310" stroke="#00D9FF" strokeWidth="1.5" />

        {/* Simulated Hazard Zone */}
        <circle cx="430" cy="270" r="80" fill="rgba(255, 59, 79, 0.08)" stroke="#FF3B4F" strokeWidth="1.5" strokeDasharray="5,5" />
        <text x="430" y="270" textAnchor="middle" fill="#FF5E6F" fontSize="10" opacity="0.7">HAZARD PERIMETER</text>

        {/* Rescue Points */}
        {rescuePoints.map((rp) => {
          const x = toSvgX(rp.lng);
          const y = toSvgY(rp.lat);
          return (
            <g
              key={rp.id}
              onClick={() => onSelectRescuePoint(rp)}
              className="cursor-pointer hover:opacity-80"
            >
              <rect
                x={x - 12}
                y={y - 12}
                width="24"
                height="24"
                rx="4"
                fill="#0D1B2A"
                stroke="#00D9FF"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#00D9FF"
                fontSize="11"
                fontWeight="bold"
              >
                {rp.type === 'hospital' ? 'H' : 'S'}
              </text>
              <text
                x={x}
                y={y + 24}
                textAnchor="middle"
                fill="#9FB3C8"
                fontSize="9"
                fontFamily="sans-serif"
              >
                {rp.name.slice(0, 14)}
              </text>
            </g>
          );
        })}

        {/* SOS Alerts */}
        {alerts.map((alert) => {
          const x = toSvgX(alert.location.lng);
          const y = toSvgY(alert.location.lat);
          const isSelected = selectedAlert?.id === alert.id;
          const color =
            alert.priority === 'critical'
              ? '#FF3B4F'
              : alert.priority === 'high'
              ? '#FF8C00'
              : '#FFD700';

          return (
            <g
              key={alert.id}
              onClick={() => onSelectAlert(alert)}
              className="cursor-pointer hover:scale-110 transition-transform"
            >
              {isSelected && (
                <circle
                  cx={x}
                  cy={y}
                  r="22"
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
              )}
              <circle
                cx={x}
                cy={y}
                r={isSelected ? 16 : 13}
                fill={color}
                stroke="#FFFFFF"
                strokeWidth="2"
              />
              <text
                x={x}
                y={y + 4}
                textAnchor="middle"
                fill="#000"
                fontSize="11"
                fontWeight="900"
              >
                !
              </text>
              <text
                x={x}
                y={y + 24}
                textAnchor="middle"
                fill={color}
                fontSize="10"
                fontWeight="bold"
              >
                {alert.id}
              </text>
            </g>
          );
        })}

        {/* User Marker */}
        <g>
          <circle cx="400" cy="300" r="14" fill="rgba(0, 217, 255, 0.25)" />
          <circle cx="400" cy="300" r="7" fill="#00D9FF" stroke="#FFFFFF" strokeWidth="2" />
          <text x="400" y="324" textAnchor="middle" fill="#00D9FF" fontSize="10" fontWeight="bold">
            THIS DEVICE
          </text>
        </g>
      </svg>
    </div>
  );
};
