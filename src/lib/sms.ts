import { SosAlert } from '../types';

/**
 * Encodes an SOS alert into a compact GSM-7 compatible payload.
 * Target: <= 160 characters (1 SMS segment).
 * Format: PM|ID|TYPE|PRI|LAT,LNG|N|short_note
 */
export function formatSmsPayload(alert: SosAlert): string {
  const shortId = alert.id.replace('PM-', '');
  const typeCode = alert.category.substring(0, 3).toUpperCase();
  const priCode = alert.priority.substring(0, 3).toUpperCase();
  const lat = alert.location.lat.toFixed(4);
  const lng = alert.location.lng.toFixed(4);
  const count = alert.peopleCount;
  
  // Note truncated to keep overall length <= 160 chars
  // Header: PM|XXXXXX-XXXX|MED|CRI|37.7749,-122.4194|2|
  const prefix = `PM|${shortId}|${typeCode}|${priCode}|${lat},${lng}|${count}|`;
  const maxNoteLen = Math.max(0, 160 - prefix.length);
  const cleanNote = alert.description
    .replace(/[\r\n]+/g, ' ')
    .trim()
    .substring(0, maxNoteLen);

  return `${prefix}${cleanNote}`;
}

/**
 * Returns character count and SMS segment count (standard GSM-7 is 160 chars per segment)
 */
export function getSmsMetrics(message: string): {
  charCount: number;
  segments: number;
  isOverLimit: boolean;
} {
  const charCount = message.length;
  const segments = charCount <= 160 ? 1 : Math.ceil(charCount / 153);
  return {
    charCount,
    segments,
    isOverLimit: charCount > 160,
  };
}

/**
 * Builds an sms: URI scheme link with the encoded body.
 * Works across iOS and Android browsers.
 */
export function buildSmsUri(phone: string, body: string): string {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedBody = encodeURIComponent(body);
  
  // Check if iOS (requires &body= rather than ?body=)
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const separator = isIOS ? '&' : '?';

  return `sms:${cleanPhone}${separator}body=${encodedBody}`;
}
