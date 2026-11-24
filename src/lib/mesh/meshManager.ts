import { MeshMessage, PeerNode, RelayRecord, SosAlert } from '../../types';
import { MeshTransport } from './MeshTransport';
import { BroadcastTransport } from './BroadcastTransport';
import { WebRtcTransport } from './WebRtcTransport';
import { SimulatedTransport } from './SimulatedTransport';
import { BleTransportStub } from './BleTransport.stub';
import { generatePeerId } from '../ids';

export type MeshEventListener = (event: {
  type: 'message' | 'peer_change' | 'ack' | 'relay';
  data: any;
}) => void;

/**
 * Central Mesh Manager
 * Orchestrates multi-transport meshing, message flooding with TTL,
 * deduplication cache, peer topology aggregation, and honest state tracking.
 */
export class MeshManager {
  private localPeerId: string;
  private localPeerName: string;

  private transports: Map<string, MeshTransport> = new Map();
  private processedMessageIds: Set<string> = new Set();
  private relayHistory: RelayRecord[] = [];
  private listeners: Set<MeshEventListener> = new Set();

  public broadcastTransport: BroadcastTransport;
  public webRtcTransport: WebRtcTransport;
  public simulatedTransport: SimulatedTransport;
  public bleStub: BleTransportStub;

  private simulationActive = false;
  private initialized = false;

  constructor() {
    this.localPeerId = generatePeerId();
    this.localPeerName = 'Device-' + this.localPeerId.slice(-4).toUpperCase();

    this.broadcastTransport = new BroadcastTransport(this.localPeerId, this.localPeerName);
    this.webRtcTransport = new WebRtcTransport(this.localPeerId, this.localPeerName);
    this.simulatedTransport = new SimulatedTransport();
    this.bleStub = new BleTransportStub();

    this.registerTransport(this.broadcastTransport);
    this.registerTransport(this.webRtcTransport);
  }

  public registerTransport(transport: MeshTransport): void {
    this.transports.set(transport.name, transport);
  }

  public async initialize(): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;
    for (const transport of this.transports.values()) {
      await transport.initialize(
        (msg, transName) => this.handleIncomingMessage(msg, transName),
        () => this.handlePeerChange()
      );
    }
  }

  public setSimulationMode(enabled: boolean): void {
    this.simulationActive = enabled;
    if (enabled) {
      this.registerTransport(this.simulatedTransport);
      this.simulatedTransport.initialize(
        (msg, transName) => this.handleIncomingMessage(msg, transName),
        () => this.handlePeerChange()
      );
    } else {
      this.transports.delete(this.simulatedTransport.name);
      this.simulatedTransport.disconnect();
    }
    this.handlePeerChange();
  }

  public isSimulationActive(): boolean {
    return this.simulationActive;
  }

  public getLocalPeerInfo(): { id: string; name: string } {
    return { id: this.localPeerId, name: this.localPeerName };
  }

  public getAllPeers(): PeerNode[] {
    const peers: PeerNode[] = [];
    for (const transport of this.transports.values()) {
      peers.push(...transport.getPeers());
    }
    return peers;
  }

  public getRelayHistory(): RelayRecord[] {
    return [...this.relayHistory];
  }

  public addListener(listener: MeshEventListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(type: 'message' | 'peer_change' | 'ack' | 'relay', data: any): void {
    for (const listener of this.listeners) {
      listener({ type, data });
    }
  }

  private handlePeerChange(): void {
    this.notify('peer_change', this.getAllPeers());
  }

  /**
   * Broadcasts an SOS Alert across all active mesh transports.
   */
  public async broadcastSosAlert(alert: SosAlert): Promise<{ success: boolean; peerCount: number }> {
    const message: MeshMessage = {
      id: alert.id,
      type: 'sos',
      senderId: this.localPeerId,
      senderName: this.localPeerName,
      timestamp: Date.now(),
      ttl: 4, // Max 4 hops
      hopCount: 0,
      payload: alert,
    };

    this.processedMessageIds.add(message.id);

    // Record outbound relay record
    this.addRelayRecord({
      id: 'rec_' + Date.now(),
      messageId: message.id,
      type: 'SOS Alert Broadcast',
      timestamp: Date.now(),
      direction: 'outbound',
      status: 'pending',
      hopCount: 0,
    });

    let sentAny = false;
    const allPeers = this.getAllPeers();

    for (const transport of this.transports.values()) {
      const res = await transport.sendMessage(message);
      if (res) sentAny = true;
    }

    return {
      success: sentAny,
      peerCount: allPeers.length,
    };
  }

  /**
   * Sends a heartbeat test beacon to all connected peers
   */
  public async sendTestBeacon(): Promise<{ success: boolean; peerCount: number }> {
    const message: MeshMessage = {
      id: 'beacon_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      type: 'beacon',
      senderId: this.localPeerId,
      senderName: this.localPeerName,
      timestamp: Date.now(),
      ttl: 2,
      hopCount: 0,
      payload: { note: 'PulseMesh P2P Heartbeat Beacon' },
    };

    this.processedMessageIds.add(message.id);

    this.addRelayRecord({
      id: 'rec_' + Date.now(),
      messageId: message.id,
      type: 'Test Beacon',
      timestamp: Date.now(),
      direction: 'outbound',
      status: 'relayed',
      hopCount: 0,
    });

    let sentAny = false;
    for (const transport of this.transports.values()) {
      if (await transport.sendMessage(message)) sentAny = true;
    }

    return { success: sentAny, peerCount: this.getAllPeers().length };
  }

  /**
   * Flooding relay engine: processes incoming message, deduplicates, decrements TTL,
   * sends ACK, and forwards to remaining transports.
   */
  private async handleIncomingMessage(message: MeshMessage, transportSource: string): Promise<void> {
    // Deduplication check
    if (this.processedMessageIds.has(message.id)) {
      return;
    }
    this.processedMessageIds.add(message.id);

    // If message is an ACK for our previous broadcast
    if (message.type === 'ack') {
      const targetId = message.payload?.originalMessageId;
      this.updateRelayStatus(targetId, 'delivered');
      this.notify('ack', message);
      return;
    }

    // Record incoming message
    this.addRelayRecord({
      id: 'rec_' + Date.now(),
      messageId: message.id,
      type: message.type.toUpperCase(),
      timestamp: Date.now(),
      direction: 'inbound',
      status: 'relayed',
      hopCount: message.hopCount,
      peerId: message.senderId,
      isSimulated: transportSource.includes('Simulated'),
    });

    this.notify('message', message);

    // If it's an SOS, automatically send back a confirmation ACK to the sender
    if (message.type === 'sos') {
      const ackMessage: MeshMessage = {
        id: 'ack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        type: 'ack',
        senderId: this.localPeerId,
        senderName: this.localPeerName,
        timestamp: Date.now(),
        ttl: 2,
        hopCount: 1,
        payload: {
          originalMessageId: message.id,
          status: 'delivered',
          peerAck: this.localPeerName,
        },
      };

      for (const transport of this.transports.values()) {
        await transport.sendMessage(ackMessage);
      }
    }

    // Re-relay (flooding) if TTL allows
    if (message.ttl > 1) {
      const relayedMessage: MeshMessage = {
        ...message,
        ttl: message.ttl - 1,
        hopCount: message.hopCount + 1,
      };

      for (const [name, transport] of this.transports.entries()) {
        // Forward to other transports
        if (name !== transportSource) {
          await transport.sendMessage(relayedMessage);
        }
      }

      this.addRelayRecord({
        id: 'rec_fwd_' + Date.now(),
        messageId: message.id,
        type: `${message.type.toUpperCase()} Forwarded`,
        timestamp: Date.now(),
        direction: 'forwarded',
        status: 'relayed',
        hopCount: relayedMessage.hopCount,
      });
    }
  }

  private addRelayRecord(record: RelayRecord): void {
    this.relayHistory.unshift(record);
    if (this.relayHistory.length > 50) {
      this.relayHistory.pop();
    }
    this.notify('relay', record);
  }

  private updateRelayStatus(messageId: string, status: 'relayed' | 'delivered'): void {
    for (const record of this.relayHistory) {
      if (record.messageId === messageId) {
        record.status = status;
      }
    }
    this.notify('relay', this.relayHistory);
  }
}

// Global singleton instance
export const meshManager = new MeshManager();
