import { dbGetOutboxQueue, dbRemoveFromOutbox, dbUpdateOutbox } from './db';

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
 * Honest Mock Demo Sync Service
 * Clearly labelled DEMO endpoint that simulates background synchronization
 * when network connection is restored.
 */
export class DemoSyncService implements SyncService {
  async syncOutbox(): Promise<SyncResult> {
    const queue = await dbGetOutboxQueue();
    if (queue.length === 0) {
      return {
        syncedCount: 0,
        failedCount: 0,
        timestamp: Date.now(),
        isDemoEndpoint: true,
        message: 'Outbox is empty. No alerts or beacons pending sync.',
      };
    }

    // Simulate network latency (400ms)
    await new Promise((resolve) => setTimeout(resolve, 400));

    let synced = 0;
    let failed = 0;

    for (const item of queue) {
      try {
        // Mark as synced by removing from outbox or updating state
        await dbRemoveFromOutbox(item.id);
        synced++;
      } catch (err) {
        item.attempts += 1;
        item.lastAttemptAt = Date.now();
        item.status = 'failed';
        await dbUpdateOutbox(item);
        failed++;
      }
    }

    return {
      syncedCount: synced,
      failedCount: failed,
      timestamp: Date.now(),
      isDemoEndpoint: true,
      message: `Demo Sync completed: ${synced} record(s) processed by mock emergency cloud coordinator.`,
    };
  }
}

export const syncService: SyncService = new DemoSyncService();
