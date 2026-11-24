import { create } from 'zustand';
import { PeerNode, RelayRecord } from '../types';
import { meshManager } from '../lib/mesh/meshManager';

interface MeshState {
  peers: PeerNode[];
  localPeer: { id: string; name: string };
  isSimulationEnabled: boolean;
  relayHistory: RelayRecord[];
  isScanning: boolean;

  initMesh: () => Promise<void>;
  toggleSimulationMode: (enabled: boolean) => void;
  sendBeacon: () => Promise<{ success: boolean; peerCount: number }>;
  scanBroadcastPeers: () => Promise<void>;
}

export const useMeshStore = create<MeshState>((set) => ({
  peers: [],
  localPeer: meshManager.getLocalPeerInfo(),
  isSimulationEnabled: false,
  relayHistory: [],
  isScanning: false,

  initMesh: async () => {
    await meshManager.initialize();

    // Hook listeners
    meshManager.addListener((event) => {
      if (event.type === 'peer_change') {
        set({ peers: event.data });
      } else if (event.type === 'relay') {
        set({ relayHistory: meshManager.getRelayHistory() });
      }
    });

    set({
      peers: meshManager.getAllPeers(),
      relayHistory: meshManager.getRelayHistory(),
      localPeer: meshManager.getLocalPeerInfo(),
    });
  },

  toggleSimulationMode: (enabled: boolean) => {
    meshManager.setSimulationMode(enabled);
    set({
      isSimulationEnabled: enabled,
      peers: meshManager.getAllPeers(),
      relayHistory: meshManager.getRelayHistory(),
    });
  },

  sendBeacon: async () => {
    return meshManager.sendTestBeacon();
  },

  scanBroadcastPeers: async () => {
    set({ isScanning: true });
    // Trigger announcement
    await meshManager.sendTestBeacon();
    await new Promise((r) => setTimeout(r, 600));
    set({
      peers: meshManager.getAllPeers(),
      isScanning: false,
    });
  },
}));
