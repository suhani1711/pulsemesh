import { MeshMessage, PeerNode } from '../../types';
import { MeshTransport, MessageHandler, PeerStatusHandler } from './MeshTransport';

/**
 * BroadcastTransport enables zero-config peer-to-peer communication between
 * multiple browser tabs, windows, or iframes on the same device.
 * Perfect for local multi-node demonstration and testing.
 */
export class BroadcastTransport implements MeshTransport {
  readonly name = 'BroadcastChannel';
  readonly isSupported: boolean;
  
  private channel: BroadcastChannel | null = null;
  private onMessageCallback: MessageHandler | null = null;
  private onPeerChangeCallback: PeerStatusHandler | null = null;
  private localPeerId: string;
  private localPeerName: string;
  private activePeers: Map<string, PeerNode> = new Map();
  private heartbeatInterval: number | null = null;

  constructor(localPeerId: string, localPeerName: string) {
    this.localPeerId = localPeerId;
    this.localPeerName = localPeerName;
    this.isSupported = typeof window !== 'undefined' && 'BroadcastChannel' in window;
  }

  async initialize(onMessage: MessageHandler, onPeerChange: PeerStatusHandler): Promise<void> {
    if (!this.isSupported) {
      console.warn('BroadcastChannel not supported in this browser.');
      return;
    }

    this.onMessageCallback = onMessage;
    this.onPeerChangeCallback = onPeerChange;
    this.channel = new BroadcastChannel('pulsemesh-p2p-bus');

    this.channel.onmessage = (event) => {
      const data = event.data;
      if (!data || !data.type) return;

      // Filter out self-echo if any
      if (data.senderId === this.localPeerId) return;

      // Handle peer discovery ping / pong
      if (data.type === 'ping' || data.type === 'beacon') {
        this.registerPeer(data.senderId, data.senderName || 'Browser Tab Peer');
      }

      this.onMessageCallback?.(data as MeshMessage, this.name);
    };

    // Broadcast self announcement
    this.broadcastPing();

    // Periodic heartbeat to maintain peer list
    this.heartbeatInterval = window.setInterval(() => {
      this.broadcastPing();
      this.cleanStalePeers();
    }, 5000);
  }

  private broadcastPing(): void {
    if (!this.channel) return;
    try {
      this.channel.postMessage({
        id: 'ping_' + Date.now(),
        type: 'ping',
        senderId: this.localPeerId,
        senderName: this.localPeerName,
        timestamp: Date.now(),
        ttl: 1,
        hopCount: 0,
        payload: { state: 'active' },
      });
    } catch {}
  }

  private registerPeer(peerId: string, peerName: string): void {
    const updated: PeerNode = {
      id: peerId,
      name: peerName,
      type: 'broadcast',
      status: 'connected',
      lastSeen: Date.now(),
      signalStrength: 100, // Same-device loopback is 100%
      latencyMs: 1,
      hopsAway: 1,
      isSimulated: false,
    };
    this.activePeers.set(peerId, updated);
    this.notifyPeers();
  }

  private cleanStalePeers(): void {
    const now = Date.now();
    let changed = false;
    for (const [id, peer] of this.activePeers.entries()) {
      if (now - peer.lastSeen > 12000) {
        this.activePeers.delete(id);
        changed = true;
      }
    }
    if (changed) {
      this.notifyPeers();
    }
  }

  private notifyPeers(): void {
    this.onPeerChangeCallback?.(Array.from(this.activePeers.values()));
  }

  async sendMessage(message: MeshMessage): Promise<boolean> {
    if (!this.channel) return false;
    try {
      this.channel.postMessage(message);
      return true;
    } catch (err) {
      console.error('BroadcastChannel send error:', err);
      return false;
    }
  }

  getPeers(): PeerNode[] {
    return Array.from(this.activePeers.values());
  }

  async disconnect(): Promise<void> {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    if (this.channel) {
      this.channel.close();
      this.channel = null;
    }
    this.activePeers.clear();
    this.notifyPeers();
  }
}
