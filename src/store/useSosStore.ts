import { create } from 'zustand';
import { SosAlert, AlertStatus } from '../types';
import {
  dbGetAllAlerts,
  dbSaveAlert,
  dbDeleteAlert,
  dbAddToOutbox,
  dbClearAllData
} from '../lib/db';
import { INITIAL_DEMO_ALERTS } from '../data/demoData';
import { meshManager } from '../lib/mesh/meshManager';

interface SosState {
  alerts: SosAlert[];
  isLoading: boolean;
  selectedAlert: SosAlert | null;
  lastCreatedAlertId: string | null;

  loadAlerts: () => Promise<void>;
  createAlert: (alert: SosAlert) => Promise<string>;
  updateAlertStatus: (id: string, status: AlertStatus, details?: string) => Promise<void>;
  markPeerAck: (id: string, peerAckName: string) => Promise<void>;
  deleteAlert: (id: string) => Promise<void>;
  setSelectedAlert: (alert: SosAlert | null) => void;
  resetToDemoData: () => Promise<void>;
  clearAllAlerts: () => Promise<void>;
}

export const useSosStore = create<SosState>((set, get) => ({
  alerts: [],
  isLoading: true,
  selectedAlert: null,
  lastCreatedAlertId: null,

  loadAlerts: async () => {
    set({ isLoading: true });
    try {
      const stored = await dbGetAllAlerts();
      // Sort newest first
      stored.sort((a, b) => b.timestamp - a.timestamp);
      set({ alerts: stored, isLoading: false });
    } catch (err) {
      console.error('Failed to load alerts from IndexedDB:', err);
      set({ alerts: [], isLoading: false });
    }
  },

  createAlert: async (newAlert: SosAlert) => {
    // 1. Save locally in IndexedDB
    await dbSaveAlert(newAlert);

    // 2. Add to outbox queue
    await dbAddToOutbox({
      id: newAlert.id,
      type: 'sos',
      payload: newAlert,
      createdAt: Date.now(),
      attempts: 0,
      status: 'queued',
    });

    // 3. Update store
    set((state) => ({
      alerts: [newAlert, ...state.alerts],
      lastCreatedAlertId: newAlert.id,
      selectedAlert: newAlert,
    }));

    // 4. Update status to queued
    await get().updateAlertStatus(newAlert.id, 'queued', 'Queued in local outbox');

    // 5. Attempt P2P broadcast via Mesh Manager
    try {
      const broadcastResult = await meshManager.broadcastSosAlert(newAlert);
      if (broadcastResult.success && broadcastResult.peerCount > 0) {
        await get().updateAlertStatus(
          newAlert.id,
          'broadcast_locally',
          `Transmitted to ${broadcastResult.peerCount} local peer(s)`
        );
      } else {
        await get().updateAlertStatus(
          newAlert.id,
          'queued',
          'No peer confirmed receipt. Kept in the local outbox.'
        );
      }
    } catch (err) {
      console.error('Mesh broadcast error:', err);
    }

    return newAlert.id;
  },

  updateAlertStatus: async (id: string, status: AlertStatus, details?: string) => {
    const currentAlerts = get().alerts;
    const target = currentAlerts.find((a) => a.id === id);
    if (!target) return;

    const updatedTimeline = [
      ...target.deliveryTimeline,
      { state: status, timestamp: Date.now(), details },
    ];

    const updatedAlert: SosAlert = {
      ...target,
      status,
      deliveryTimeline: updatedTimeline,
    };

    await dbSaveAlert(updatedAlert);

    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? updatedAlert : a)),
      selectedAlert: state.selectedAlert?.id === id ? updatedAlert : state.selectedAlert,
    }));
  },

  markPeerAck: async (id: string, peerAckName: string) => {
    const currentAlerts = get().alerts;
    const target = currentAlerts.find((a) => a.id === id);
    if (!target) return;

    const updatedTimeline = [
      ...target.deliveryTimeline,
      {
        state: 'delivered' as AlertStatus,
        timestamp: Date.now(),
        details: `Peer ACK confirmed by: ${peerAckName}`,
      },
    ];

    const updatedAlert: SosAlert = {
      ...target,
      status: 'delivered',
      ackReceivedAt: Date.now(),
      ackPeerId: peerAckName,
      deliveryTimeline: updatedTimeline,
    };

    await dbSaveAlert(updatedAlert);

    set((state) => ({
      alerts: state.alerts.map((a) => (a.id === id ? updatedAlert : a)),
      selectedAlert: state.selectedAlert?.id === id ? updatedAlert : state.selectedAlert,
    }));
  },

  deleteAlert: async (id: string) => {
    await dbDeleteAlert(id);
    set((state) => ({
      alerts: state.alerts.filter((a) => a.id !== id),
      selectedAlert: state.selectedAlert?.id === id ? null : state.selectedAlert,
    }));
  },

  setSelectedAlert: (alert) => {
    set({ selectedAlert: alert });
  },

  resetToDemoData: async () => {
    await dbClearAllData();
    for (const demo of INITIAL_DEMO_ALERTS) {
      await dbSaveAlert(demo);
    }
    set({ alerts: [...INITIAL_DEMO_ALERTS], selectedAlert: null });
  },

  clearAllAlerts: async () => {
    await dbClearAllData();
    set({ alerts: [], selectedAlert: null });
  },
}));
