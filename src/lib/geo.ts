import { Coordinates } from '../types';

export interface GeoResult {
  coords: Coordinates | null;
  error?: string;
  isDenied?: boolean;
}

// Neutral placeholder only. This is NOT a real location and must be confirmed
// by GPS or manual entry before an SOS can be submitted.
export const DEFAULT_COORDS: Coordinates = {
  lat: 0,
  lng: 0,
  accuracy: undefined,
  isManual: true,
};

export async function requestCurrentPosition(): Promise<GeoResult> {
  if (!navigator.geolocation) {
    return {
      coords: null,
      error: 'Geolocation is not supported by your browser.',
      isDenied: true,
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          coords: {
            lat: Number(position.coords.latitude.toFixed(5)),
            lng: Number(position.coords.longitude.toFixed(5)),
            accuracy: Math.round(position.coords.accuracy),
            isManual: false,
          },
        });
      },
      (err) => {
        let msg = 'Unable to retrieve location.';
        let isDenied = false;
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please enter coordinates manually below.';
          isDenied = true;
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable offline. Enter manual coordinates.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Enter manual coordinates.';
        }
        resolve({
          coords: null,
          error: msg,
          isDenied,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Calculates rough distance in km between two lat/lng pairs using Haversine formula
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}
