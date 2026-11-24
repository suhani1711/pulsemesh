import { dbGetOutboxQueue } from './db';

export interface SyncResult {
  syncedCount: number;
  failedCount: number;
  timestamp: number;
  isDemoEndpoint: boolean;
  message: string;
}

export interface SyncService {
  syncOutbox(): Promise<SyncResult>;
}

/**
 * Safe placeholder until a real, authenticated emergency backend exists.
 *
 * Being online does not mean an emergency message reached a coordinator.
 * Never delete queued SOS records or report them as synced without a
 * verifiable server acknowledgement.
 */
export class DemoSyncService implements SyncService {
  async syncOutbox(): Promise<SyncResult> {
    const queue = await dbGetOutboxQueue();
    const timestamp = Date.now();

    if (queue.length === 0) {
      return {
        syncedCount: 0,
        failedCount: 0,
        timestamp,
        isDemoEndpoint: true,
        message: 'Outbox is empty. No alerts or beacons are pending.',
      };
    }

    return {
      syncedCount: 0,
      failedCount: queue.length,
      timestamp,
      isDemoEndpoint: true,
      message: `No emergency server is configured. Kept ${queue.length} queued record(s) safely on this device; no delivery is claimed.`,
    };
  }
}

export const syncService: SyncService = new DemoSyncService();
