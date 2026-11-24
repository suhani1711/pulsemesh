import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { SosAlert, RescuePoint, Coordinates } from '../../types';

interface LeafletMapProps {
  userLocation: Coordinates | null;
  alerts: SosAlert[];
  rescuePoints: RescuePoint[];
  selectedAlert: SosAlert | null;
  onSelectAlert: (alert: SosAlert) => void;
  onSelectRescuePoint: (rp: RescuePoint) => void;
  onTileError: () => void;
}

export const LeafletMap: React.FC<LeafletMapProps> = ({
  userLocation,
  alerts,
  rescuePoints,
  selectedAlert,
  onSelectAlert,
  onSelectRescuePoint,
  onTileError,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const centerLat = userLocation?.lat ?? 37.7749;
  const centerLng = userLocation?.lng ?? -122.4194;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [centerLat, centerLng],
        zoom: 13,
        zoomControl: true,
      });

      // Dark styled OpenStreetMap tiles
      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      });

      tileLayer.on('tileerror', () => {
        // Automatically alert container to trigger offline fallback
        onTileError();
      });

      tileLayer.addTo(map);

      // Add a simulated affected-area hazard perimeter circle
      L.circle([centerLat + 0.004, centerLng - 0.003], {
        color: '#FF3B4F',
        fillColor: '#FF3B4F',
        fillOpacity: 0.12,
        radius: 1200,
        weight: 1.5,
        dashArray: '4, 8',
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when alerts, rescue points or selection change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    // User location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div style="position:relative; width:24px; height:24px;">
            <div style="position:absolute; width:24px; height:24px; background:rgba(0,217,255,0.4); border-radius:50%; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="position:absolute; top:4px; left:4px; width:16px; height:16px; background:#00D9FF; border:2px solid #FFFFFF; border-radius:50%;"></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .bindTooltip('Your Location (This Device)', { permanent: false, direction: 'top' })
        .addTo(markersLayer);
    }

    // SOS Alerts markers
    alerts.forEach((alert) => {
      const isSelected = selectedAlert?.id === alert.id;
      const color =
        alert.priority === 'critical'
          ? '#FF3B4F'
          : alert.priority === 'high'
          ? '#FF8C00'
          : '#FFD700';

      const alertIcon = L.divIcon({
        className: 'custom-sos-marker',
        html: `
          <div style="
            width: ${isSelected ? '32px' : '26px'};
            height: ${isSelected ? '32px' : '26px'};
            background: ${color};
            border: 2px solid #FFFFFF;
            border-radius: 50%;
            box-shadow: 0 0 12px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 11px;
            font-weight: bold;
            color: #000;
          ">
            !
          </div>
        `,
        iconSize: [isSelected ? 32 : 26, isSelected ? 32 : 26],
        iconAnchor: [isSelected ? 16 : 13, isSelected ? 16 : 13],
      });

      const marker = L.marker([alert.location.lat, alert.location.lng], { icon: alertIcon });
      marker.on('click', () => onSelectAlert(alert));
      marker.addTo(markersLayer);
    });

    // Rescue Points markers
    rescuePoints.forEach((rp) => {
      const rpColor = rp.type === 'hospital' ? '#32E875' : '#00D9FF';
      const rpIcon = L.divIcon({
        className: 'custom-rp-marker',
        html: `
          <div style="
            width: 22px;
            height: 22px;
            background: #0D1B2A;
            border: 2px solid ${rpColor};
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: ${rpColor};
            font-weight: bold;
          ">
            ${rp.type === 'hospital' ? 'H' : 'S'}
          </div>
        `,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      const marker = L.marker([rp.lat, rp.lng], { icon: rpIcon });
      marker.on('click', () => onSelectRescuePoint(rp));
      marker.addTo(markersLayer);
    });
  }, [alerts, rescuePoints, userLocation, selectedAlert]);

  return <div ref={mapContainerRef} className="w-full h-full min-h-[500px] rounded-xl z-0" />;
};
