import { create } from 'zustand';
import { dbGetOutboxQueue } from '../lib/db';
import { syncService } from '../lib/sync';

let syncInitialized = false;

export interface BatteryInfo {
  level: number | null; // 0.0 to 1.0
  charging: boolean | null;
  supported: boolean;
}

interface SyncState {
  isOnline: boolean;
  queuedCount: number;
  lastSyncTimestamp: number | null;
  isSyncing: boolean;
  battery: BatteryInfo;
  networkMode: 'online' | 'offline' | 'local_mesh';

  initSync: () => Promise<void>;
  refreshOutboxCount: () => Promise<void>;
  triggerSync: () => Promise<void>;
  setOnlineStatus: (online: boolean) => void;
  updateBattery: (info: BatteryInfo) => void;
  updateNetworkMode: (hasLocalPeers: boolean) => void;
}

export const useSyncStore = create<SyncState>((set, get) => ({
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  queuedCount: 0,
  lastSyncTimestamp: Date.now() - 1000 * 60 * 14, // 14 mins ago
  isSyncing: false,
  battery: { level: null, charging: null, supported: false },
  networkMode: 'online',

  initSync: async () => {
    if (syncInitialized) return;
    syncInitialized = true;
    await get().refreshOutboxCount();

    // Setup window online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', async () => {
        get().setOnlineStatus(true);
        // Auto trigger sync on reconnect
        await get().triggerSync();
      });

      window.addEventListener('offline', () => {
        get().setOnlineStatus(false);
      });

      // Battery Status API (if supported)
      if ('getBattery' in navigator) {
        try {
          const batteryObj = await (navigator as any).getBattery();
          const update = () => {
            get().updateBattery({
              level: batteryObj.level,
              charging: batteryObj.charging,
              supported: true,
            });
          };
          update();
          batteryObj.addEventListener('levelchange', update);
          batteryObj.addEventListener('chargingchange', update);
        } catch {
          get().updateBattery({ level: null, charging: null, supported: false });
        }
      } else {
        get().updateBattery({ level: null, charging: null, supported: false });
      }
    }
  },

  refreshOutboxCount: async () => {
    try {
      const queue = await dbGetOutboxQueue();
      set({ queuedCount: queue.length });
    } catch {
      set({ queuedCount: 0 });
    }
  },

  triggerSync: async () => {
    set({ isSyncing: true });
    try {
      const res = await syncService.syncOutbox();
      await get().refreshOutboxCount();
      set({
        lastSyncTimestamp: res.timestamp,
        isSyncing: false,
      });
    } catch {
      set({ isSyncing: false });
    }
  },

  setOnlineStatus: (isOnline: boolean) => {
    set({ isOnline });
  },

  updateBattery: (battery: BatteryInfo) => {
    set({ battery });
  },

  updateNetworkMode: (hasLocalPeers: boolean) => {
    const isOnline = get().isOnline;
    if (isOnline) {
      set({ networkMode: 'online' });
    } else if (hasLocalPeers) {
      set({ networkMode: 'local_mesh' });
    } else {
      set({ networkMode: 'offline' });
    }
  },
}));
