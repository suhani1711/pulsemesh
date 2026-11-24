import { MeshMessage, PeerNode } from '../../types';

export type MessageHandler = (message: MeshMessage, transportName: string) => void;
export type PeerStatusHandler = (peers: PeerNode[]) => void;

export interface MeshTransport {
  readonly name: string;
  readonly isSupported: boolean;
  
  initialize(onMessage: MessageHandler, onPeerChange: PeerStatusHandler): Promise<void>;
  sendMessage(message: MeshMessage): Promise<boolean>;
  getPeers(): PeerNode[];
  disconnect(): Promise<void>;
}
