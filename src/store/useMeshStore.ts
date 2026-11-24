import { create } from 'zustand';
import { PeerNode, RelayRecord } from '../types';
import { meshManager } from '../lib/mesh/meshManager';
import { useSosStore } from './useSosStore';

let unsubscribeMeshListener: (() => void) | null = null;

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

    // Subscribe once: AppLayout can mount twice in React StrictMode.
    if (!unsubscribeMeshListener) {
      unsubscribeMeshListener = meshManager.addListener((event) => {
      if (event.type === 'peer_change') {
        set({ peers: event.data });
      } else if (event.type === 'relay') {
        set({ relayHistory: meshManager.getRelayHistory() });
      } else if (event.type === 'ack') {
        const originalMessageId = event.data?.payload?.originalMessageId;
        if (typeof originalMessageId === 'string') {
          void useSosStore.getState().markPeerAck(originalMessageId, event.data.senderName || 'Nearby peer');
        }
      }
      });
    }

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
