# PULSEMESH – Offline-First Emergency Triage & Assistive Hub

> **Mission:** *"When networks fail, humanity connects."*  
> **Tagline:** *"No Network. No Delay. No One Left Behind."*

---

## 1. Overview
**PULSEMESH** is an offline-first, installable Progressive Web Application (PWA) engineered to maintain civilian communication, localized distress flooding, geospatial relief mapping, and initial casualty triage during total telecommunication infrastructure collapse (e.g., following earthquakes, severe flooding, hurricanes, or power grid severance).

PulseMesh operates inside modern web browsers with **zero cloud dependencies, zero user accounts or logins, and zero remote tracking**. All critical data is stored locally using IndexedDB (`idb`), while mesh communication is powered by browser-native peer transports including **WebRTC RTCDataChannels** (serverless manual signaling via QR codes) and **BroadcastChannel** (zero-config same-device multi-tab communication).

---

## 2. Tech Stack & Architecture

- **Core Framework**: React 18 with TypeScript (`strict: true`)
- **Build Tool**: Vite 6
- **Routing**: `react-router-dom` using `HashRouter` (guaranteeing 100% offline navigation and static host compatibility without server routing fallbacks)
- **State Management**: `zustand` (unidirectional, reactive stores)
- **Local Database**: IndexedDB via `idb` for structured SOS records, outbox queue, and emergency contacts
- **Design System & Styling**: Tailwind CSS, CSS Custom Properties for theme tokens, glassmorphism surfaces (`#07111F` primary, `#0D1B2A` secondary, `#00D9FF` cyan accent, `#FF3B4F` emergency red, `#32E875` rescue green)
- **Icons**: `lucide-react`
- **Mapping**: Leaflet + OpenStreetMap raster tiles with automatic failover to an **Offline SVG Schematic Radar Map**
- **Off-Grid P2P Transport Layer**:
  - `WebRtcTransport`: Direct peer-to-peer data channels using manual SDP exchange (QR codes / copyable tokens)
  - `BroadcastTransport`: Same-device multi-tab/window loopback mesh bus
  - `SimulatedTransport`: Transparently badged simulated nodes for solo demonstrations
  - `BleTransportStub`: Documented interface stub for native Android/iOS Bluetooth Low Energy mesh compilation
- **Device APIs**:
  - Browser Geolocation API (with manual coordinate input fallback)
  - Web Speech API (`SpeechSynthesis` for audible triage/guide instructions and `SpeechRecognition` for hands-free voice navigation)
  - Web Share & `sms:` URI scheme for GSM-7 cellular SMS fallback
  - Battery Status API for device power telemetry
- **PWA / Service Worker**: `vite-plugin-pwa` (Workbox) caching app shell, emergency first-aid guide, and icons for instant offline launch

---

## 3. Honesty Matrix: Real vs. Simulated

PulseMesh adheres strictly to an honest disclosure policy. All features and statuses accurately represent physical reality:

| Capability | Real In-Browser Implementation | Simulated / Documented Demo |
| :--- | :--- | :--- |
| **Offline Persistence** | **REAL**: Alerts, queue, and contacts persist permanently across reloads in browser IndexedDB. | None. 100% local hardware storage. |
| **P2P Multi-Tab Mesh** | **REAL**: Two or more browser tabs or windows on the same device exchange live beacons, SOS packets, and ACKs via `BroadcastChannel`. | None. Live inter-process communication. |
| **Serverless WebRTC** | **REAL**: Two devices on the same Wi-Fi or LAN establish an ad-hoc RTCDataChannel by scanning/pasting QR code SDP offers/answers without signaling servers. | Public STUN servers are optional; works serverless on local subnets. |
| **Bluetooth LE Mesh** | **STUB**: Documented stub in `BleTransport.stub.ts`. Explains why browsers cannot create BLE meshes. | **NOT SUPPORTED IN BROWSER**. Requires native React Native app. |
| **Multi-Hop Relay** | **REAL**: Flooding algorithm with TTL decrement and message ID deduplication cache (`MeshManager`). | Simulated relay nodes (RelayNode-Alpha, Scout-7) are prominently badged `SIMULATED`. |
| **Delivery ACKs** | **REAL**: Status only changes to `Delivered` when a confirmed peer ACK message is physically received. | Hops without confirmed real peers remain `Queued` or `Broadcast Locally`. |
| **AI Casualty Triage** | **HEURISTIC DEMO**: Rule-based categorization + client-side canvas dominant color & brightness stats. | **SIMULATED RESULT**: Clearly badged. Never claims to make medical diagnoses. |
| **SMS Fallback** | **REAL**: Generates GSM-7 payload (≤160 characters) and constructs standard `sms:` URI for the native OS. | **CANNOT CONFIRM DELIVERY**: Browser cannot verify if cellular carrier transmitted the SMS. Offers manual user checkbox. |
| **Rescue Map Tiles** | **REAL**: OpenStreetMap tiles when online; automatic failover to tactical SVG schematic map when offline. | Relief stations in demo data are badged `DEMO`. Real user SOS alerts appear at exact GPS coordinates. |

---

## 4. P2P Connection How-To

### A. Instant Same-Device Multi-Tab Testing (BroadcastChannel)
1. Open PulseMesh in your browser: `http://localhost:5173/#/app/network`
2. Open a second browser tab or private window to the same address.
3. Both tabs will automatically discover each other via `BroadcastTransport` and register in the **Topology Graph**.
4. In Tab 1, go to **SOS Emergency** (`#/app/sos`) and click **Broadcast SOS**.
5. Switch to Tab 2: The alert instantly arrives in Tab 2's **Mesh Activity Feed**, and Tab 2 automatically transmits an `ACK` packet back to Tab 1.
6. In Tab 1, the delivery timeline will update to **Delivered (Peer ACK confirmed)**.

### B. Serverless Cross-Device WebRTC Manual Signaling (Zero Server / Same Wi-Fi)
1. On **Device A (Initiator)**:
   - Navigate to `#/app/network` → select **Serverless WebRTC Bridge**.
   - Under Device A, click **Create Connection Offer**.
   - A QR code and self-contained SDP Offer string will appear.
2. On **Device B (Receiver)**:
   - Navigate to `#/app/network` → select **Serverless WebRTC Bridge**.
   - Paste the Offer string into the input box under Device B and click **Accept Offer & Generate Answer**.
   - An Answer string and QR code will generate.
3. On **Device A**:
   - Paste Device B's Answer string into the "Paste Answer" box and click **Finalize Direct Link**.
4. The direct, serverless `RTCDataChannel` will open. Messages, beacons, and SOS distress calls now travel peer-to-peer between Device A and Device B with zero internet.

---

## 5. Roadmap: Native Bluetooth LE Mesh via React Native

Standard desktop and mobile web browsers (Chrome, Safari, Firefox, Edge) are deliberately restricted by operating system security sandboxes:
- The **Web Bluetooth API** only supports *central/client* mode and requires user gesture pairing per device.
- Browsers **cannot** act as Bluetooth Low Energy (BLE) peripherals or advertisers, and **cannot** form background Bluetooth Mesh flooding topologies.

To achieve true smartphone-to-smartphone off-grid mesh networking across entire neighborhoods without Wi-Fi, PulseMesh provides the architectural abstraction `MeshTransport` (`src/lib/mesh/MeshTransport.ts`).

### React Native Migration Plan:
1. **Transport Implementation**: Implement `BleTransport` replacing `BleTransportStub` using:
   - `react-native-ble-mesh` (SIG Bluetooth Mesh profile standard) or
   - `react-native-nearby-messages` / Google Nearby Connections API (ad-hoc Wi-Fi direct + BLE hybrid)
2. **Packet Format**: Continue using PulseMesh's standardized `MeshMessage` JSON interface (TTL, hop count, sender ID, timestamp, and deduplication IDs).
3. **Background Daemon**: Native foreground service on Android (`android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE`) to continuously re-relay emergency packets in standby sleep mode.

---

## 6. Quick Start & Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation
```bash
# Clone repository
git clone https://github.com/your-username/pulsemesh.git
cd pulsemesh

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Production Build
```bash
# Typecheck and build installable PWA
npm run build

# Preview production build locally
npm run preview
```

---

## 7. Testing Offline Functionality

1. **Service Worker Caching**:
   - Build and serve via `npm run preview`.
   - Open DevTools → Network tab → set throttling to **Offline**.
   - Reload the page (`#/`, `#/app`, `#/app/guide`). The app shell, first-aid protocols, and icons load instantly from Workbox cache.
2. **Offline Outbox Queuing**:
   - While still Offline, trigger a new SOS via `#/app/sos`.
   - Notice the status updates to `Queued in local outbox` with the outbox counter chip incrementing in the top bar.
   - Set Network back to **Online**: The app detects the `online` window event and processes the outbox queue.
3. **Map Tile Failover**:
   - Navigate to `#/app/map`.
   - When offline or if OpenStreetMap tiles are unreachable, click the **Mode Switcher** or let the map automatically fail over to the **Tactical Offline SVG Schematic Radar Map**.

---

## 8. Accessibility & Inclusive Design

- **WCAG AA Compliance**: High-contrast mode token set (`--bg-primary: #000000`, `--accent-cyan: #00FFFF`, `--border-color: #FFFFFF`).
- **Large-Button Mode**: Dynamically elevates all buttons and touch targets to ≥56px height with enlarged typography for users wearing gloves or experiencing tremors.
- **Plain-Language Mode**: Swaps clinical jargon for simple, plain-language emergency action steps across triage and first-aid guides.
- **Voice Navigation**: Hands-free navigation through `SpeechRecognition` ("Open SOS", "Open Map", "Open Triage", "Open Guide").
- **Audible Emergency Readout**: Text-to-speech narration via `SpeechSynthesis` for instructions and hazard warnings.
- **Keyboard Trapping & Skip Links**: Visible cyan focus rings, skip-to-content anchor, and Esc-key modal dismissal.

---

## 9. Safety Protocol Notice

> **IMPORTANT**: PulseMesh is a disaster-resilience assistive technology designed for scenarios where cellular networks and power grids are damaged or unreachable. PulseMesh does not replace official emergency services. In any life-threatening situation where cellular coverage is present, **always dial your local emergency service number (112, 911, 108, 000, 119)** immediately.

---

*Mission line:* **"When networks fail, humanity connects."**  
*Final tagline:* **"No Network. No Delay. No One Left Behind."**
