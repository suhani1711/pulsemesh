import { SosAlert, RescuePoint, EmergencyContact } from '../types';

export const INITIAL_DEMO_ALERTS: SosAlert[] = [
  {
    id: 'PM-261124-M4K9',
    timestamp: Date.now() - 1000 * 60 * 18, // 18 mins ago
    category: 'medical',
    priority: 'critical',
    name: 'Elena Rostova',
    description: 'Elderly diabetic patient suffering severe hypoglycemic reaction. Oxygen tank depleted.',
    medicalNeeds: 'Insulin, Glucose IV, Portable O2',
    peopleCount: 1,
    location: {
      lat: 37.7791,
      lng: -122.4142,
      accuracy: 25,
      isManual: false,
    },
    status: 'relayed_demo',
    hopCount: 2,
    isDemo: true,
    deliveryTimeline: [
      { state: 'saved_locally', timestamp: Date.now() - 1000 * 60 * 18, details: 'Stored in device IndexedDB' },
      { state: 'queued', timestamp: Date.now() - 1000 * 60 * 17, details: 'Added to local mesh outbox' },
      { state: 'broadcast_locally', timestamp: Date.now() - 1000 * 60 * 15, details: 'Transmitted via WebRTC/BroadcastChannel' },
      { state: 'relayed_demo', timestamp: Date.now() - 1000 * 60 * 12, details: 'Simulated relay via Peer-Alpha (hop 2)' },
    ],
  },
  {
    id: 'PM-261124-T8B2',
    timestamp: Date.now() - 1000 * 60 * 42, // 42 mins ago
    category: 'trapped',
    priority: 'high',
    name: 'Marcus Chen',
    description: 'Stairwell collapsed in 2nd-floor residential wing. 3 individuals trapped, all conscious.',
    medicalNeeds: 'Minor cuts, dust inhalation',
    peopleCount: 3,
    location: {
      lat: 37.7725,
      lng: -122.4215,
      accuracy: 40,
      isManual: false,
    },
    status: 'relayed_demo',
    hopCount: 1,
    isDemo: true,
    deliveryTimeline: [
      { state: 'saved_locally', timestamp: Date.now() - 1000 * 60 * 42 },
      { state: 'broadcast_locally', timestamp: Date.now() - 1000 * 60 * 40 },
      { state: 'relayed_demo', timestamp: Date.now() - 1000 * 60 * 36, details: 'Simulated node Scout-7 relayed' },
    ],
  },
  {
    id: 'PM-261124-F3X1',
    timestamp: Date.now() - 1000 * 60 * 95, // 95 mins ago
    category: 'flood',
    priority: 'medium',
    name: 'Sarah & David Miller',
    description: 'Basement and ground level flooded up to 3 feet. Family sheltering on rooftop deck.',
    medicalNeeds: 'Dry blankets, drinking water',
    peopleCount: 4,
    location: {
      lat: 37.7682,
      lng: -122.4289,
      accuracy: 50,
      isManual: true,
    },
    status: 'broadcast_locally',
    hopCount: 0,
    isDemo: true,
    deliveryTimeline: [
      { state: 'saved_locally', timestamp: Date.now() - 1000 * 60 * 95 },
      { state: 'broadcast_locally', timestamp: Date.now() - 1000 * 60 * 94 },
    ],
  },
];

export const INITIAL_DEMO_RESCUE_POINTS: RescuePoint[] = [
  {
    id: 'rp-shelter-civic',
    name: 'Civic Center Emergency Shelter',
    type: 'shelter',
    lat: 37.7812,
    lng: -122.4178,
    status: 'active',
    capacityNotes: '180/300 capacity occupied. Generators running, cots and hot meals available.',
    isDemo: true,
  },
  {
    id: 'rp-hospital-stfrancis',
    name: 'St. Francis Trauma Triage Station',
    type: 'hospital',
    lat: 37.7885,
    lng: -122.4131,
    status: 'limited',
    capacityNotes: 'Emergency power active. ER handling severe trauma only.',
    isDemo: true,
  },
  {
    id: 'rp-aid-mission',
    name: 'Mission District Water & Food Camp',
    type: 'aid_camp',
    lat: 37.7654,
    lng: -122.4195,
    status: 'active',
    capacityNotes: 'Potable water tanker and dry MRE distribution operative.',
    isDemo: true,
  },
  {
    id: 'rp-water-market',
    name: 'Market St. Clean Water Depot',
    type: 'water_supply',
    lat: 37.7758,
    lng: -122.4150,
    status: 'active',
    capacityNotes: 'Purified water filling point. Bring clean containers.',
    isDemo: true,
  },
];

export const INITIAL_DEFAULT_CONTACTS: EmergencyContact[] = [
  {
    id: 'c-primary-family',
    name: 'Family Emergency Lead',
    relationship: 'Family',
    phone: '+1 555-0199',
    isPrimary: true,
  },
  {
    id: 'c-red-cross',
    name: 'Red Cross Disaster Team (Sample)',
    relationship: 'Aid Agency',
    phone: '+1 800-733-2767',
    isPrimary: false,
  },
];

export const GENERAL_EMERGENCY_NUMBERS = [
  { country: 'United States & Canada', police: '911', ambulance: '911', fire: '911', note: 'Single universal dispatch' },
  { country: 'European Union & UK', police: '112 / 999', ambulance: '112 / 999', fire: '112 / 999', note: '112 works across all EU networks' },
  { country: 'India', police: '112 / 100', ambulance: '102 / 108', fire: '101', note: '112 is pan-India single emergency number' },
  { country: 'Australia', police: '000', ambulance: '000', fire: '000', note: '112 secondary GSM mobile redirect' },
  { country: 'Japan', police: '110', ambulance: '119', fire: '119', note: 'Multilingual support available' },
];
