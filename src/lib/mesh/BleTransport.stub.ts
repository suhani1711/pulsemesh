import { MeshMessage, PeerNode } from '../../types';
import { MeshTransport, MessageHandler, PeerStatusHandler } from './MeshTransport';

/**
 * BleTransport (Documented Stub for Future React Native App)
 *
 * NOTE & ARCHITECTURAL REALITY:
 * Standard web browsers (Chrome, Safari, Firefox, Edge) CANNOT create a background
 * Bluetooth Low Energy (BLE) Mesh network or act as a BLE peripheral/broadcaster.
 * Web Bluetooth API is client/central only and requires explicit user gesture per device.
 *
 * For true off-grid device-to-device smartphone meshing without cellular or Wi-Fi,
 * this interface provides the exact bridge to be implemented in a native React Native
 * wrapper using native libraries such as react-native-ble-mesh or react-native-nearby-messages.
 */
export class BleTransportStub implements MeshTransport {
  readonly name = 'Bluetooth LE Mesh (Native Stub)';
  readonly isSupported = false; // Honestly false in browser context

  async initialize(_onMessage: MessageHandler, _onPeerChange: PeerStatusHandler): Promise<void> {
    console.info(
      '[PulseMesh Architecture] BleTransportStub initialized. Requires native bridge runtime (React Native / iOS CoreBluetooth / Android BLE Advertiser).'
    );
  }

  async sendMessage(_message: MeshMessage): Promise<boolean> {
    console.warn(
      '[PulseMesh] BleTransport is a documented architectural stub. Browser environments cannot transmit BLE Mesh packets.'
    );
    return false;
  }

  getPeers(): PeerNode[] {
    return [];
  }

  async disconnect(): Promise<void> {}
}
