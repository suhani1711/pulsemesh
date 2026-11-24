import React from 'react';
import { Link } from 'react-router-dom';
import {
  Radio,
  Stethoscope,
  MessageSquare,
  Volume2,
  ArrowRight,
  CheckCircle2,
  WifiOff,
  Clock,
  HeartCrack,
  Share2,
} from 'lucide-react';
import { Navbar } from '../../components/common/Navbar';
import { Badge } from '../../components/common/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#07111F] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      <Navbar />

      <main id="main-content" className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden py-16 lg:py-24 border-b border-cyan-500/15">
          {/* Subtle background glow effects */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-red-500/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left Column: Mission & CTAs */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                  <span>Offline-First Emergency Response Platform</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
                  When Networks Fail,{' '}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200">
                    Humanity Connects.
                  </span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-300 max-w-2xl leading-relaxed">
                  An offline-first emergency communication and AI-powered triage platform that keeps people connected
                  when cellular towers collapse, power grids fail, and traditional networks disappear.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                  <Link
                    to="/app"
                    className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-base tracking-wide shadow-[0_0_25px_rgba(0,217,255,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <span>Launch Emergency Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <a
                    href="#how-it-works"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-cyan-500/30 text-base font-semibold transition-colors"
                  >
                    <span>Explore How It Works</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Zero Cloud Dependency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No Login or Signup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Local IndexedDB Persistence</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Animated Inline SVG Illustration of Smartphone P2P Mesh */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative w-full max-w-[420px] aspect-square rounded-2xl p-6 bg-[#0D1B2A]/70 border border-cyan-500/30 backdrop-blur-md shadow-2xl flex items-center justify-center">
                  <svg
                    viewBox="0 0 400 400"
                    className="w-full h-full select-none"
                    aria-label="PULSEMESH Peer-to-Peer Relay Diagram"
                  >
                    {/* Pulsing signal concentric circles */}
                    <circle cx="200" cy="200" r="140" fill="none" stroke="#00D9FF" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4,4">
                      <animate attributeName="r" values="60;160" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.4;0" dur="4s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="200" cy="200" r="100" fill="none" stroke="#FF3B4F" strokeWidth="1.5" strokeOpacity="0.3">
                      <animate attributeName="r" values="30;120" dur="3s" repeatCount="indefinite" />
                      <animate attributeName="stroke-opacity" values="0.6;0" dur="3s" repeatCount="indefinite" />
                    </circle>

                    {/* Connecting Mesh links */}
                    <line x1="200" y1="200" x2="80" y2="120" stroke="#00D9FF" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="200" y1="200" x2="320" y2="110" stroke="#00D9FF" strokeWidth="2" strokeDasharray="3,3" />
                    <line x1="200" y1="200" x2="110" y2="300" stroke="#32E875" strokeWidth="2" />
                    <line x1="200" y1="200" x2="290" y2="290" stroke="#FF3B4F" strokeWidth="2" />
                    <line x1="80" y1="120" x2="320" y2="110" stroke="#00D9FF" strokeWidth="1" strokeOpacity="0.3" />

                    {/* Node 1: Top Left Device */}
                    <g transform="translate(80, 120)">
                      <circle cx="0" cy="0" r="24" fill="#07111F" stroke="#00D9FF" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#00D9FF" fontSize="11" fontWeight="bold">Peer A</text>
                    </g>

                    {/* Node 2: Top Right Device */}
                    <g transform="translate(320, 110)">
                      <circle cx="0" cy="0" r="24" fill="#07111F" stroke="#00D9FF" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#00D9FF" fontSize="11" fontWeight="bold">Peer B</text>
                    </g>

                    {/* Node 3: Bottom Left Aid Camp */}
                    <g transform="translate(110, 300)">
                      <circle cx="0" cy="0" r="24" fill="#07111F" stroke="#32E875" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#32E875" fontSize="10" fontWeight="bold">Aid Post</text>
                    </g>

                    {/* Node 4: Bottom Right Responder */}
                    <g transform="translate(290, 290)">
                      <circle cx="0" cy="0" r="24" fill="#07111F" stroke="#FF3B4F" strokeWidth="2" />
                      <text x="0" y="4" textAnchor="middle" fill="#FF3B4F" fontSize="10" fontWeight="bold">Rescue</text>
                    </g>

                    {/* Central Device: You / Local Hub */}
                    <g transform="translate(200, 200)">
                      <circle cx="0" cy="0" r="34" fill="#0D1B2A" stroke="#00D9FF" strokeWidth="3" />
                      <circle cx="0" cy="0" r="26" fill="#00D9FF" fillOpacity="0.2" />
                      <text x="0" y="-4" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold">THIS</text>
                      <text x="0" y="10" textAnchor="middle" fill="#00D9FF" fontSize="9" fontWeight="bold">DEVICE</text>
                    </g>

                    {/* Animated SOS Pulse Packet travelling along line */}
                    <circle cx="200" cy="200" r="6" fill="#FF3B4F">
                      <animateMotion path="M 0,0 L 90,90 L -120,-80 L 0,0" dur="6s" repeatCount="indefinite" />
                    </circle>
                  </svg>
                  <div className="absolute bottom-3 left-4 right-4 text-center">
                    <span className="text-[11px] font-mono text-cyan-300 uppercase tracking-widest">
                      Zero-Internet Local Mesh Topology
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PROBLEM SECTION */}
        <section className="py-16 sm:py-20 border-b border-cyan-500/15 bg-[#091524]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-red-400 mb-2">
                The Reality of Catastrophe
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                When Natural Disasters Strike, Critical Systems Fail First
              </p>
              <p className="mt-4 text-slate-300 text-base">
                Earthquakes, floods, and severe storms immediately sever the centralized utilities modern survival relies upon.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: WifiOff,
                  color: 'text-red-400',
                  bg: 'bg-red-500/10 border-red-500/20',
                  title: 'Network Infrastructure Failure',
                  desc: 'Cell towers lose power, fiber trunks sever, and cellular congestion locks out 99% of distress calls within minutes of impact.',
                },
                {
                  icon: Clock,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10 border-amber-500/20',
                  title: 'Delayed Emergency Response',
                  desc: 'Without operational telecommunications, rescue squads and emergency dispatchers are forced into blind sector searches.',
                },
                {
                  icon: HeartCrack,
                  color: 'text-red-400',
                  bg: 'bg-red-500/10 border-red-500/20',
                  title: 'Lack of Medical Guidance',
                  desc: 'Uninjured bystanders lack immediate offline guidance to deliver life-saving trauma care or triage multiple casualties.',
                },
                {
                  icon: Share2,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10 border-cyan-500/20',
                  title: 'Total Communication Breakdown',
                  desc: 'Separated families and local civilian volunteer clusters cannot discover each other despite standing only blocks apart.',
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 hover:border-cyan-500/40 transition-colors space-y-3"
                  >
                    <div className={`w-12 h-12 rounded-lg ${item.bg} border flex items-center justify-center ${item.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section id="solution" className="py-16 sm:py-20 border-b border-cyan-500/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 mb-2">
                Decentralized Architecture
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                Four Pillars of Off-Grid Resilience
              </p>
              <p className="mt-4 text-slate-300 text-base">
                Engineered to operate inside browser sandboxes without internet, logins, or external infrastructure.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  icon: Radio,
                  title: 'Offline P2P Mesh Transports',
                  desc: 'Employs browser WebRTC RTCDataChannels for serverless manual signaling (QR code exchange) and BroadcastChannel across tabs to establish an ad-hoc local mesh without internet routers.',
                  features: ['Manual QR code signaling', 'Multi-tab broadcast demo', 'Flooding relay with TTL limits'],
                },
                {
                  icon: Stethoscope,
                  title: 'Emergency AI Triage (Demo Engine)',
                  desc: 'Client-side heuristic engine that assesses photo/injury categories, evaluates immediate danger, and provides step-by-step stabilization guidance while waiting for medical help.',
                  features: ['100% on-device image processing', 'Clear SIMULATED RESULT disclaimer', 'Actionable first-aid protocols'],
                },
                {
                  icon: MessageSquare,
                  title: 'GSM-7 SMS Fallback Generator',
                  desc: 'Encodes critical distress payloads into compact ≤160 character SMS strings with coordinates and medical codes, ready to fire via cellular SMS links when peer radios are out of range.',
                  features: ['Single-segment GSM-7 budget', 'Pre-configured emergency contacts', 'Works on minimal 2G signal'],
                },
                {
                  icon: Volume2,
                  title: 'Voice-Assisted Accessibility',
                  desc: 'Incorporates Web Speech API text-to-speech for audible emergency instruction and voice navigation commands for visually impaired or physically trapped victims.',
                  features: ['Full hands-free voice commands', 'High-contrast & large button modes', 'Plain-language survival guide'],
                },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    className="p-8 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 hover:border-cyan-400/40 transition-all space-y-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">{card.desc}</p>
                    <ul className="space-y-2 pt-2 border-t border-cyan-950">
                      {card.features.map((f, fi) => (
                        <li key={fi} className="flex items-center gap-2 text-xs text-cyan-300 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS (4-Step Flow) */}
        <section id="how-it-works" className="py-16 sm:py-20 border-b border-cyan-500/15 bg-[#091524]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 mb-2">
                Operational Lifecycle
              </h2>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                How PulseMesh Coordinates Off-Grid Rescue
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01',
                  title: 'Detect Emergency',
                  desc: 'User selects emergency category, inputs count of casualties, and captures GPS coordinates or inputs manual landmarks.',
                },
                {
                  step: '02',
                  title: 'Send SOS',
                  desc: 'Generates permanent unique ID (format PM-YYMMDD-XXXX), writes immediately to local IndexedDB, and queues in device outbox.',
                },
                {
                  step: '03',
                  title: 'Relay Through Peers',
                  desc: 'Broadcasts via WebRTC data channel or BroadcastChannel. Nearby peer nodes re-relay with TTL limits and return confirmation ACKs.',
                },
                {
                  step: '04',
                  title: 'Coordinate Rescue',
                  desc: 'Alerts populate on tactical rescue map with priority badges. Responders open navigation routes or export fallback SMS packets.',
                },
              ].map((s, idx) => (
                <div
                  key={idx}
                  className="relative p-6 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 space-y-3"
                >
                  <span className="text-4xl font-black font-mono text-cyan-500/30">{s.step}</span>
                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-sm text-slate-300 leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* IMPACT DESIGN GOALS */}
        <section id="design-goals" className="py-16 sm:py-20 border-b border-cyan-500/15">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-block mb-3">
                <Badge variant="outline">Honest Metrics Policy</Badge>
              </div>
              <p className="text-3xl sm:text-4xl font-extrabold text-white">
                Engineering Design Targets
              </p>
              <p className="mt-3 text-slate-400 text-sm">
                PulseMesh presents clear technical benchmarks and design goals. We never invent fake disaster statistics.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'SOS Composition Speed', value: '< 30 sec', note: 'Target: 3 clicks from launch to outbox broadcast' },
                { label: 'Required Connectivity', value: '0 bps', note: 'Target: Full app shell & guide operative offline' },
                { label: 'SMS Payload Budget', value: '≤ 160 char', note: 'Target: Single standard GSM-7 SMS transmission' },
                { label: 'Local P2P Relay Latency', value: '< 100 ms', note: 'Target: Sub-second peer mesh flood propagation' },
              ].map((goal, i) => (
                <div
                  key={i}
                  className="p-6 rounded-xl bg-[#0D1B2A] border border-cyan-500/20 text-center space-y-2"
                >
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold block">
                    Design Goal
                  </span>
                  <div className="text-3xl font-black font-mono text-cyan-400">{goal.value}</div>
                  <div className="text-sm font-bold text-white">{goal.label}</div>
                  <p className="text-xs text-slate-400 pt-1">{goal.note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#050B14] border-t border-cyan-950 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-8 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="text-xl font-black text-white">PULSE</span>
                <span className="text-xl font-black text-cyan-400">MESH</span>
              </div>
              <p className="text-sm font-semibold text-cyan-300 mt-1">
                No Network. No Delay. No One Left Behind.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400">
              <Link to="/app" className="hover:text-cyan-400 transition-colors">
                Launch Dashboard
              </Link>
              <span>•</span>
              <Link to="/app/guide" className="hover:text-cyan-400 transition-colors">
                First-Aid Protocols
              </Link>
              <span>•</span>
              <Link to="/app/settings" className="hover:text-cyan-400 transition-colors">
                App Settings
              </Link>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 text-center leading-relaxed">
            <strong className="text-slate-200">Emergency Protocol Notice: </strong>
            PulseMesh does not replace official emergency services. Call your local emergency number (e.g., 112 / 911 / 108) when cellular services are reachable.
          </div>
        </div>
      </footer>
    </div>
  );
};
