import { MeshMessage, PeerNode } from '../../types';
import { MeshTransport, MessageHandler, PeerStatusHandler } from './MeshTransport';

/**
 * Honest Simulated Transport
 * Clearly labelled SIMULATED / DEMO in the UI.
 * Used for demonstrating multi-hop message flooding and relaying when user has only
 * a single device or single tab open.
 */
export class SimulatedTransport implements MeshTransport {
  readonly name = 'Simulated Mesh Network';
  readonly isSupported = true;

  private onMessageCallback: MessageHandler | null = null;
  private onPeerChangeCallback: PeerStatusHandler | null = null;
  private isRunning = false;
  private virtualPeers: PeerNode[] = [
    {
      id: 'sim_relay_alpha',
      name: 'RelayNode-Alpha (Simulated)',
      type: 'simulated',
      status: 'connected',
      lastSeen: Date.now(),
      signalStrength: 82,
      latencyMs: 45,
      hopsAway: 1,
      isSimulated: true,
    },
    {
      id: 'sim_scout_7',
      name: 'Scout-7 Unit (Simulated)',
      type: 'simulated',
      status: 'connected',
      lastSeen: Date.now(),
      signalStrength: 64,
      latencyMs: 78,
      hopsAway: 2,
      isSimulated: true,
    },
    {
      id: 'sim_shelter_hq',
      name: 'Shelter-HQ Base (Simulated)',
      type: 'simulated',
      status: 'connected',
      lastSeen: Date.now(),
      signalStrength: 91,
      latencyMs: 25,
      hopsAway: 1,
      isSimulated: true,
    },
  ];

  async initialize(onMessage: MessageHandler, onPeerChange: PeerStatusHandler): Promise<void> {
    this.onMessageCallback = onMessage;
    this.onPeerChangeCallback = onPeerChange;
    this.isRunning = true;
    this.notifyPeers();
  }

  private notifyPeers(): void {
    if (this.isRunning) {
      this.onPeerChangeCallback?.([...this.virtualPeers]);
    }
  }

  async sendMessage(message: MeshMessage): Promise<boolean> {
    if (!this.isRunning) return false;

    // Simulate multi-hop acknowledgment (ACK) after brief realistic delay
    if (message.type === 'sos' || message.type === 'beacon') {
      setTimeout(() => {
        if (!this.isRunning || !this.onMessageCallback) return;

        // Simulate RelayNode-Alpha receiving and sending an ACK
        const ackMessage: MeshMessage = {
          id: 'ack_' + Math.random().toString(36).substring(2, 9),
          type: 'ack',
          senderId: 'sim_relay_alpha',
          senderName: 'RelayNode-Alpha (Simulated)',
          timestamp: Date.now(),
          ttl: 2,
          hopCount: 1,
          payload: {
            originalMessageId: message.id,
            status: 'relayed_demo',
            note: 'Acknowledged by simulated peer node. Forwarded to 2 secondary mesh links.',
          },
        };
        this.onMessageCallback(ackMessage, this.name);
      }, 1200);
    }

    return true;
  }

  getPeers(): PeerNode[] {
    return this.isRunning ? [...this.virtualPeers] : [];
  }

  async disconnect(): Promise<void> {
    this.isRunning = false;
    this.onPeerChangeCallback?.([]);
  }
}
