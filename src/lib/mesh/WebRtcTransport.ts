import { MeshMessage, PeerNode } from '../../types';
import { MeshTransport, MessageHandler, PeerStatusHandler } from './MeshTransport';

/**
 * WebRtcTransport implements real serverless peer-to-peer data channels.
 * Signaling is done completely off-grid:
 * Initiator creates an Offer -> generates a QR code / copyable payload.
 * Receiver pastes the Offer -> creates an Answer -> QR code / copyable payload.
 * Initiator pastes Answer -> P2P RTCDataChannel opens directly with ZERO server or internet.
 */
export class WebRtcTransport implements MeshTransport {
  readonly name = 'WebRTC DataChannel';
  readonly isSupported: boolean;

  private onMessageCallback: MessageHandler | null = null;
  private onPeerChangeCallback: PeerStatusHandler | null = null;
  private localPeerId: string;
  private localPeerName: string;

  private peerConnection: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private activePeers: Map<string, PeerNode> = new Map();

  // Public STUN configuration (optional, works offline without STUN on same LAN)
  private rtcConfig: RTCConfiguration = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  constructor(localPeerId: string, localPeerName: string) {
    this.localPeerId = localPeerId;
    this.localPeerName = localPeerName;
    this.isSupported = typeof window !== 'undefined' && 'RTCPeerConnection' in window;
  }

  async initialize(onMessage: MessageHandler, onPeerChange: PeerStatusHandler): Promise<void> {
    this.onMessageCallback = onMessage;
    this.onPeerChangeCallback = onPeerChange;
  }

  /**
   * STEP 1 (Initiator): Create Offer and collect ICE candidates into a self-contained string
   */
  async createOffer(): Promise<string> {
    this.resetConnection();
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    // Setup Data Channel
    this.dataChannel = this.peerConnection.createDataChannel('pulsemesh-mesh', {
      ordered: true,
    });
    this.setupDataChannel(this.dataChannel);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // Wait briefly for ICE candidates to gather so payload is self-contained
    await this.waitForIceGatheringComplete(this.peerConnection);

    const signalData = {
      type: 'offer',
      senderId: this.localPeerId,
      senderName: this.localPeerName,
      sdp: this.peerConnection.localDescription,
    };

    return JSON.stringify(signalData);
  }

  /**
   * STEP 2 (Receiver): Accept Offer string, generate Answer string
   */
  async acceptOfferAndCreateAnswer(offerJsonString: string): Promise<string> {
    this.resetConnection();
    this.peerConnection = new RTCPeerConnection(this.rtcConfig);

    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannel(this.dataChannel);
    };

    const offerData = JSON.parse(offerJsonString);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offerData.sdp));

    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    await this.waitForIceGatheringComplete(this.peerConnection);

    const signalData = {
      type: 'answer',
      senderId: this.localPeerId,
      senderName: this.localPeerName,
      sdp: this.peerConnection.localDescription,
    };

    return JSON.stringify(signalData);
  }

  /**
   * STEP 3 (Initiator): Accept Answer string to finalize direct P2P link
   */
  async acceptAnswer(answerJsonString: string): Promise<void> {
    if (!this.peerConnection) {
      throw new Error('PeerConnection not initialized. Generate offer first.');
    }
    const answerData = JSON.parse(answerJsonString);
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answerData.sdp));
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => {
      const peerId = 'webrtc_' + Math.random().toString(36).substring(2, 8);
      const peer: PeerNode = {
        id: peerId,
        name: 'Direct WebRTC Peer',
        type: 'webrtc',
        status: 'connected',
        lastSeen: Date.now(),
        signalStrength: 95,
        latencyMs: 12,
        hopsAway: 1,
        isSimulated: false,
      };
      this.activePeers.set(peerId, peer);
      this.notifyPeers();
    };

    channel.onclose = () => {
      this.activePeers.clear();
      this.notifyPeers();
    };

    channel.onmessage = (event) => {
      try {
        const message: MeshMessage = JSON.parse(event.data);
        this.onMessageCallback?.(message, this.name);
      } catch (err) {
        console.error('WebRTC parse message error:', err);
      }
    };
  }

  private waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
      } else {
        const checkState = () => {
          if (pc.iceGatheringState === 'complete') {
            pc.removeEventListener('icegatheringstatechange', checkState);
            resolve();
          }
        };
        pc.addEventListener('icegatheringstatechange', checkState);
        // Safety timeout in case some candidates delay
        setTimeout(() => {
          resolve();
        }, 1500);
      }
    });
  }

  private resetConnection(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    this.activePeers.clear();
  }

  private notifyPeers(): void {
    this.onPeerChangeCallback?.(Array.from(this.activePeers.values()));
  }

  async sendMessage(message: MeshMessage): Promise<boolean> {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      this.dataChannel.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  getPeers(): PeerNode[] {
    return Array.from(this.activePeers.values());
  }

  async disconnect(): Promise<void> {
    this.resetConnection();
    this.notifyPeers();
  }
}
