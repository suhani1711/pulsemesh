import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Radio,
  Share2,
  RefreshCw,
  QrCode,
  Copy,
  Check,
  Info
} from 'lucide-react';
import { useMeshStore } from '../../store/useMeshStore';
import { useToast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { meshManager } from '../../lib/mesh/meshManager';

export const NetworkPage: React.FC = () => {
  const { showToast } = useToast();
  const {
    peers,
    localPeer,
    isSimulationEnabled,
    relayHistory,
    isScanning,
    toggleSimulationMode,
    sendBeacon,
    scanBroadcastPeers
  } = useMeshStore();

  const [activeTab, setActiveTab] = useState<'topology' | 'webrtc' | 'history'>('topology');

  // WebRTC Manual Signaling Wizard State
  const [isSignalingModalOpen, setIsSignalingModalOpen] = useState(false);
  const [offerPayload, setOfferPayload] = useState('');
  const [offerQrDataUrl, setOfferQrDataUrl] = useState('');
  const [answerPayload, setAnswerPayload] = useState('');
  const [answerQrDataUrl, setAnswerQrDataUrl] = useState('');
  const [inputRemoteOffer, setInputRemoteOffer] = useState('');
  const [inputRemoteAnswer, setInputRemoteAnswer] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isGeneratingSignal, setIsGeneratingSignal] = useState(false);

  const connectedPeers = peers.filter((p) => p.status === 'connected');

  // Generate Initiator Offer
  const handleGenerateOffer = async () => {
    setIsGeneratingSignal(true);
    try {
      const offerStr = await meshManager.webRtcTransport.createOffer();
      setOfferPayload(offerStr);
      const qr = await QRCode.toDataURL(offerStr, {
        width: 260,
        margin: 1,
        color: { dark: '#00D9FF', light: '#07111F' },
      });
      setOfferQrDataUrl(qr);
      showToast('WebRTC Offer generated with ICE candidates.', 'success');
    } catch (err: any) {
      showToast('Failed to generate WebRTC offer: ' + err.message, 'error');
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  // Receiver accepts offer and generates answer
  const handleAcceptOfferAndCreateAnswer = async () => {
    if (!inputRemoteOffer.trim()) {
      showToast('Please paste the Offer payload from Device A.', 'error');
      return;
    }
    setIsGeneratingSignal(true);
    try {
      const answerStr = await meshManager.webRtcTransport.acceptOfferAndCreateAnswer(inputRemoteOffer.trim());
      setAnswerPayload(answerStr);
      const qr = await QRCode.toDataURL(answerStr, {
        width: 260,
        margin: 1,
        color: { dark: '#00D9FF', light: '#07111F' },
      });
      setAnswerQrDataUrl(qr);
      showToast('Answer created! Paste this back into Device A.', 'success');
    } catch (err: any) {
      showToast('Invalid offer payload: ' + err.message, 'error');
    } finally {
      setIsGeneratingSignal(false);
    }
  };

  // Initiator accepts answer to establish link
  const handleFinalizeConnection = async () => {
    if (!inputRemoteAnswer.trim()) {
      showToast('Please paste the Answer payload from Device B.', 'error');
      return;
    }
    try {
      await meshManager.webRtcTransport.acceptAnswer(inputRemoteAnswer.trim());
      showToast('WebRTC RTCDataChannel connected successfully!', 'success');
      setIsSignalingModalOpen(false);
    } catch (err: any) {
      showToast('Failed to finalize WebRTC link: ' + err.message, 'error');
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    showToast('Copied to clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleSendBeacon = async () => {
    const res = await sendBeacon();
    showToast(`Test beacon broadcasted across all active transports (${res.peerCount} peers)`, 'success');
  };

  // Auto scan broadcast channel peers on load
  useEffect(() => {
    scanBroadcastPeers();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-500/20">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            <h1 className="text-2xl font-black text-white">Nearby Mesh Network</h1>
          </div>
          <p className="text-sm text-slate-300 mt-1">
            Serverless P2P telemetry via WebRTC RTCDataChannels, local BroadcastChannel, and flooding relay with TTL.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => scanBroadcastPeers()}
            disabled={isScanning}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Discover Nearby</span>
          </button>

          <button
            onClick={handleSendBeacon}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,217,255,0.25)]"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Send Test Beacon</span>
          </button>

          <button
            onClick={() => setIsSignalingModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/40 text-xs font-semibold transition-colors"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>P2P QR Wizard</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-cyan-950">
        <button
          onClick={() => setActiveTab('topology')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'topology'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Topology Graph ({connectedPeers.length} Peers)
        </button>
        <button
          onClick={() => setActiveTab('webrtc')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'webrtc'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Serverless WebRTC Bridge
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 ${
            activeTab === 'history'
              ? 'border-cyan-400 text-cyan-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Relay Log ({relayHistory.length})
        </button>
      </div>

      {/* TAB 1: TOPOLOGY GRAPH */}
      {activeTab === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* SVG Topology Graph Canvas */}
          <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 flex flex-col items-center justify-center min-h-[440px] relative overflow-hidden">
            {/* Simulation Banner Switch */}
            <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Demo Simulation Mode:</span>
                {isSimulationEnabled && <Badge variant="simulated" />}
              </div>
              <button
                onClick={() => toggleSimulationMode(!isSimulationEnabled)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  isSimulationEnabled
                    ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                {isSimulationEnabled ? 'Disable Simulation' : 'Enable Simulation Mode'}
              </button>
            </div>

            {/* SVG Visual Graph */}
            <svg viewBox="0 0 600 400" className="w-full h-full max-h-[380px] mt-8 select-none">
              {/* Concentric Signal Rings */}
              <circle cx="300" cy="200" r="160" fill="none" stroke="rgba(0,217,255,0.08)" strokeWidth="1" strokeDasharray="3,3" />
              <circle cx="300" cy="200" r="110" fill="none" stroke="rgba(0,217,255,0.12)" strokeWidth="1" strokeDasharray="4,4" />
              <circle cx="300" cy="200" r="60" fill="none" stroke="rgba(0,217,255,0.2)" strokeWidth="1" />

              {/* Connected Links and Remote Nodes */}
              {peers.map((peer, idx) => {
                const total = Math.max(peers.length, 1);
                const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
                const distance = peer.hopsAway > 1 ? 155 : 110;
                const nodeX = 300 + Math.cos(angle) * distance;
                const nodeY = 200 + Math.sin(angle) * distance;

                const linkColor =
                  peer.status === 'connected'
                    ? peer.isSimulated
                      ? '#A855F7'
                      : '#00D9FF'
                    : '#64748B';

                return (
                  <g key={peer.id}>
                    {/* Animated Connection Line */}
                    <line
                      x1="300"
                      y1="200"
                      x2={nodeX}
                      y2={nodeY}
                      stroke={linkColor}
                      strokeWidth={peer.status === 'connected' ? '2' : '1'}
                      strokeDasharray={peer.status === 'connected' ? '4,4' : '2,2'}
                      strokeOpacity="0.8"
                    />

                    {/* Remote Node */}
                    <g transform={`translate(${nodeX}, ${nodeY})`} className="cursor-pointer">
                      <circle
                        cx="0"
                        cy="0"
                        r={peer.hopsAway > 1 ? '18' : '22'}
                        fill="#07111F"
                        stroke={linkColor}
                        strokeWidth="2.5"
                      />
                      <text
                        x="0"
                        y="4"
                        textAnchor="middle"
                        fill={linkColor}
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        H{peer.hopsAway}
                      </text>
                      <text
                        x="0"
                        y={peer.hopsAway > 1 ? '30' : '34'}
                        textAnchor="middle"
                        fill="#CBD5E1"
                        fontSize="10"
                        fontWeight="bold"
                      >
                        {peer.name.slice(0, 16)}
                      </text>
                    </g>
                  </g>
                );
              })}

              {/* Center Node (This Device) */}
              <g transform="translate(300, 200)">
                <circle cx="0" cy="0" r="30" fill="#0D1B2A" stroke="#00D9FF" strokeWidth="3" />
                <circle cx="0" cy="0" r="22" fill="#00D9FF" fillOpacity="0.2" />
                <text x="0" y="-3" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontWeight="bold">
                  THIS
                </text>
                <text x="0" y="10" textAnchor="middle" fill="#00D9FF" fontSize="9" fontWeight="bold">
                  DEVICE
                </text>
              </g>
            </svg>

            {peers.length === 0 && (
              <div className="absolute bottom-4 text-center text-xs text-slate-400 bg-slate-900/80 px-4 py-2 rounded-lg border border-slate-800">
                0 peer nodes discovered. Open another tab in this browser, or click &quot;Enable Simulation Mode&quot; above to demo multi-hop relaying.
              </div>
            )}
          </div>

          {/* Right Column: Peer Roster & Local Peer Specs */}
          <div className="lg:col-span-4 space-y-4">
            {/* Local Peer Node Card */}
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-cyan-500/30 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 block">
                Local Device Radio Node
              </span>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-white font-mono">{localPeer.name}</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Peer ID: <span className="text-slate-200">{localPeer.id}</span>
              </div>
            </div>

            {/* Peer List */}
            <div className="p-4 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-cyan-950">
                <span className="text-xs font-bold text-white uppercase tracking-wider">Connected Nodes</span>
                <span className="text-xs text-cyan-400 font-mono">{connectedPeers.length} Active</span>
              </div>

              <div className="space-y-2.5 max-h-[320px] overflow-y-auto">
                {peers.map((peer) => (
                  <div
                    key={peer.id}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{peer.name}</span>
                      {peer.isSimulated ? (
                        <Badge variant="simulated" />
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono uppercase">
                          {peer.type}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Hop distance: {peer.hopsAway}</span>
                      <span>Signal: {peer.signalStrength ?? 100}%</span>
                    </div>
                  </div>
                ))}

                {peers.length === 0 && (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No active peers connected.
                  </div>
                )}
              </div>
            </div>

            {/* Bluetooth Mesh Native Info */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                <Info className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <span>Bluetooth LE Mesh Reality</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Standard web browsers cannot broadcast background BLE packets. PulseMesh provides an architectural{' '}
                <code className="text-cyan-300">BleTransportStub</code> designed for drop-in compilation within React Native.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SERVERLESS WEBRTC BRIDGE */}
      {activeTab === 'webrtc' && (
        <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white">Serverless Manual Signaling (Zero-Server WebRTC)</h2>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              When internet and STUN servers are completely down, WebRTC can still establish direct peer-to-peer data
              channels between two devices on the same Wi-Fi/hotspot or direct cable by manually exchanging SDP tokens
              via QR code or copy-paste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Step 1: Initiator */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                  Device A: Initiator
                </span>
                <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  1
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Click below to generate a self-contained WebRTC connection Offer with bundled ICE candidates.
              </p>

              <button
                onClick={handleGenerateOffer}
                disabled={isGeneratingSignal}
                className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isGeneratingSignal ? 'Generating Offer...' : 'Create Connection Offer'}
              </button>

              {offerPayload && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  {offerQrDataUrl && (
                    <div className="flex justify-center p-3 bg-[#07111F] rounded-lg border border-cyan-500/30">
                      <img src={offerQrDataUrl} alt="WebRTC Offer QR Code" className="w-48 h-48 rounded" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Offer Payload:</span>
                    <button
                      onClick={() => copyToClipboard(offerPayload, 'offer')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'offer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'offer' ? 'Copied' : 'Copy String'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Paste Answer Section */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">
                  Paste Answer From Device B (Final Step):
                </label>
                <textarea
                  rows={2}
                  value={inputRemoteAnswer}
                  onChange={(e) => setInputRemoteAnswer(e.target.value)}
                  placeholder="Paste Answer JSON string..."
                  className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
                />
                <button
                  onClick={handleFinalizeConnection}
                  className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                >
                  Finalize Direct Link
                </button>
              </div>
            </div>

            {/* Step 2: Receiver */}
            <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                  Device B: Receiver
                </span>
                <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  2
                </span>
              </div>

              <p className="text-xs text-slate-300">
                Paste the Offer from Device A below to generate an Answer.
              </p>

              <textarea
                rows={3}
                value={inputRemoteOffer}
                onChange={(e) => setInputRemoteOffer(e.target.value)}
                placeholder="Paste Offer JSON string from Device A here..."
                className="w-full p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 focus:outline-none"
              />

              <button
                onClick={handleAcceptOfferAndCreateAnswer}
                disabled={isGeneratingSignal}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition-colors disabled:opacity-50"
              >
                {isGeneratingSignal ? 'Processing...' : 'Accept Offer & Generate Answer'}
              </button>

              {answerPayload && (
                <div className="space-y-3 pt-2 animate-fade-in">
                  {answerQrDataUrl && (
                    <div className="flex justify-center p-3 bg-[#07111F] rounded-lg border border-purple-500/30">
                      <img src={answerQrDataUrl} alt="WebRTC Answer QR Code" className="w-48 h-48 rounded" />
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Answer Payload:</span>
                    <button
                      onClick={() => copyToClipboard(answerPayload, 'answer')}
                      className="text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                    >
                      {copiedKey === 'answer' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'answer' ? 'Copied' : 'Copy Answer'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Now copy this Answer back to Device A and click &quot;Finalize Direct Link&quot;.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RELAY HISTORY LOG */}
      {activeTab === 'history' && (
        <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
            <div>
              <h2 className="text-lg font-bold text-white">Mesh Packet Relay History</h2>
              <p className="text-xs text-slate-400">
                Log of all broadcasted, received, deduplicated, and forwarded packets across transports.
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">{relayHistory.length} Packets</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-3">Timestamp</th>
                  <th className="pb-3">Packet Type</th>
                  <th className="pb-3">Message ID</th>
                  <th className="pb-3">Direction</th>
                  <th className="pb-3">Hops</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {relayHistory.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-900/40">
                    <td className="py-3 text-slate-400 font-sans">{new Date(rec.timestamp).toLocaleTimeString()}</td>
                    <td className="py-3 font-bold text-slate-200">
                      <div className="flex items-center gap-2">
                        <span>{rec.type}</span>
                        {rec.isSimulated && <Badge variant="simulated" />}
                      </div>
                    </td>
                    <td className="py-3 text-cyan-300">{rec.messageId.slice(0, 18)}...</td>
                    <td className="py-3 capitalize text-slate-300 font-sans">{rec.direction}</td>
                    <td className="py-3 text-slate-400">{rec.hopCount}</td>
                    <td className="py-3 text-right">
                      <span
                        className={`inline-block px-2 py-0.5 rounded font-sans font-semibold capitalize ${
                          rec.status === 'delivered'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : rec.status === 'relayed'
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                  </tr>
                ))}

                {relayHistory.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No mesh packets recorded yet. Trigger an SOS or send a beacon to see real relays.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK WEBRTC MODAL WIZARD */}
      <Modal
        isOpen={isSignalingModalOpen}
        onClose={() => setIsSignalingModalOpen(false)}
        title="Direct WebRTC Connection Wizard"
        maxWidth="lg"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-300 leading-relaxed">
            Choose your device role to create a direct RTCDataChannel connection:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                setActiveTab('webrtc');
                setIsSignalingModalOpen(false);
              }}
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-left space-y-1 transition-colors"
            >
              <span className="font-bold text-cyan-300 block">I am Device A (Initiator)</span>
              <span className="text-slate-400 text-[11px] block">Creates the Offer QR code for the other device</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('webrtc');
                setIsSignalingModalOpen(false);
              }}
              className="p-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-purple-500/30 text-left space-y-1 transition-colors"
            >
              <span className="font-bold text-purple-300 block">I am Device B (Receiver)</span>
              <span className="text-slate-400 text-[11px] block">Scans or pastes Offer to return an Answer</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
