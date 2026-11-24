import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SosAlert, EmergencyContact } from '../types';

interface OutboxItem {
  id: string; // matches alert.id or message.id
  type: 'sos' | 'beacon' | 'ack';
  payload: any;
  createdAt: number;
  attempts: number;
  lastAttemptAt?: number;
  status: 'queued' | 'syncing' | 'failed';
}

interface PulseMeshDB extends DBSchema {
  alerts: {
    key: string;
    value: SosAlert;
    indexes: { 'by-timestamp': number; 'by-status': string };
  };
  outbox: {
    key: string;
    value: OutboxItem;
    indexes: { 'by-status': string; 'by-created': number };
  };
  contacts: {
    key: string;
    value: EmergencyContact;
  };
  cached_meta: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'pulsemesh-storage';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<PulseMeshDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<PulseMeshDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PulseMeshDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('alerts')) {
          const alertStore = db.createObjectStore('alerts', { keyPath: 'id' });
          alertStore.createIndex('by-timestamp', 'timestamp');
          alertStore.createIndex('by-status', 'status');
        }

        if (!db.objectStoreNames.contains('outbox')) {
          const outboxStore = db.createObjectStore('outbox', { keyPath: 'id' });
          outboxStore.createIndex('by-status', 'status');
          outboxStore.createIndex('by-created', 'createdAt');
        }

        if (!db.objectStoreNames.contains('contacts')) {
          db.createObjectStore('contacts', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('cached_meta')) {
          db.createObjectStore('cached_meta');
        }
      },
    });
  }
  return dbPromise;
}

// SOS Alert DB Helpers
export async function dbSaveAlert(alert: SosAlert): Promise<void> {
  const db = await getDB();
  await db.put('alerts', alert);
}

export async function dbGetAlert(id: string): Promise<SosAlert | undefined> {
  const db = await getDB();
  return db.get('alerts', id);
}

export async function dbGetAllAlerts(): Promise<SosAlert[]> {
  const db = await getDB();
  return db.getAllFromIndex('alerts', 'by-timestamp');
}

export async function dbDeleteAlert(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('alerts', id);
  await db.delete('outbox', id);
}

// Outbox Helpers
export async function dbAddToOutbox(item: OutboxItem): Promise<void> {
  const db = await getDB();
  await db.put('outbox', item);
}

export async function dbGetOutboxQueue(): Promise<OutboxItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('outbox', 'by-created');
}

export async function dbRemoveFromOutbox(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('outbox', id);
}

export async function dbUpdateOutbox(item: OutboxItem): Promise<void> {
  const db = await getDB();
  await db.put('outbox', item);
}

// Contacts Helpers
export async function dbSaveContact(contact: EmergencyContact): Promise<void> {
  const db = await getDB();
  await db.put('contacts', contact);
}

export async function dbGetAllContacts(): Promise<EmergencyContact[]> {
  const db = await getDB();
  return db.getAll('contacts');
}

export async function dbDeleteContact(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('contacts', id);
}

// Clear all local data
export async function dbClearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear('alerts');
  await db.clear('outbox');
  await db.clear('contacts');
  await db.clear('cached_meta');
}
