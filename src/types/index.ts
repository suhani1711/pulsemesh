export type PriorityLevel = 'critical' | 'high' | 'medium';

export type EmergencyCategory =
  | 'medical'
  | 'trapped'
  | 'fire'
  | 'flood'
  | 'accident'
  | 'other';

export type AlertStatus =
  | 'saved_locally'
  | 'queued'
  | 'broadcast_locally'
  | 'relayed_demo'
  | 'delivered';

export interface Coordinates {
  lat: number;
  lng: number;
  accuracy?: number;
  isManual?: boolean;
}

export interface SosAlert {
  id: string; // PM-YYMMDD-XXXX
  timestamp: number;
  category: EmergencyCategory;
  priority: PriorityLevel;
  name?: string;
  description: string;
  medicalNeeds?: string;
  peopleCount: number;
  location: Coordinates;
  status: AlertStatus;
  hopCount: number;
  isDemo?: boolean;
  deliveryTimeline: {
    state: AlertStatus;
    timestamp: number;
    details?: string;
  }[];
  ackReceivedAt?: number;
  ackPeerId?: string;
}

export interface PeerNode {
  id: string;
  name: string;
  type: 'webrtc' | 'broadcast' | 'simulated' | 'ble_stub';
  status: 'connected' | 'connecting' | 'disconnected';
  lastSeen: number;
  signalStrength?: number; // 0-100%
  latencyMs?: number;
  hopsAway: number;
  isSimulated?: boolean;
}

export interface MeshMessage {
  id: string; // unique message UUID
  type: 'beacon' | 'sos' | 'ack' | 'ping';
  senderId: string;
  senderName: string;
  timestamp: number;
  ttl: number; // Max hops remaining
  hopCount: number;
  payload: any;
  targetPeerId?: string; // Optional target or broadcast
}

export interface RelayRecord {
  id: string;
  messageId: string;
  type: string;
  timestamp: number;
  direction: 'inbound' | 'outbound' | 'forwarded';
  status: 'pending' | 'relayed' | 'delivered';
  hopCount: number;
  peerId?: string;
  isSimulated?: boolean;
}

export interface TriageResult {
  id: string;
  timestamp: number;
  category: string;
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  summary: string;
  immediateSafetySteps: string[];
  whenToSeekHelp: string[];
  firstAidGuidance: string[];
  isDemoHeuristic: boolean;
  imageStats?: {
    dominantColor: string;
    brightness: number;
    dimensions: string;
  };
}

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
}

export interface RescuePoint {
  id: string;
  name: string;
  type: 'shelter' | 'hospital' | 'aid_camp' | 'water_supply';
  lat: number;
  lng: number;
  status: 'active' | 'limited' | 'full';
  capacityNotes: string;
  isDemo: boolean;
}
