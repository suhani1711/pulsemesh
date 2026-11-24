import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertOctagon,
  HeartPulse,
  Flame,
  Waves,
  Car,
  HelpCircle,
  MapPin,
  Send,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  Compass
} from 'lucide-react';
import { useSosStore } from '../../store/useSosStore';
import { useToast } from '../../components/common/Toast';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { Badge } from '../../components/common/Badge';
import { generateSosId } from '../../lib/ids';
import { requestCurrentPosition, DEFAULT_COORDS } from '../../lib/geo';
import { SosAlert, EmergencyCategory, PriorityLevel, Coordinates } from '../../types';

export const SosPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { alerts, createAlert, deleteAlert } = useSosStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState<string | null>(null);
  const [submittedAlert, setSubmittedAlert] = useState<SosAlert | null>(null);
  const [selectedDetailAlert, setSelectedDetailAlert] = useState<SosAlert | null>(null);

  // Form State
  const [category, setCategory] = useState<EmergencyCategory>('medical');
  const [priority, setPriority] = useState<PriorityLevel>('critical');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [medicalNeeds, setMedicalNeeds] = useState('');
  const [peopleCount, setPeopleCount] = useState(1);
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [isLocating, setIsLocating] = useState(false);
  const [manualCoords, setManualCoords] = useState(true);
  const [locationConfirmed, setLocationConfirmed] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Category Configuration
  const categories: { id: EmergencyCategory; label: string; icon: React.ElementType; color: string }[] = [
    { id: 'medical', label: 'Medical Emergency', icon: HeartPulse, color: 'text-red-400 border-red-500/40 bg-red-500/10' },
    { id: 'trapped', label: 'Trapped / Rescue', icon: AlertOctagon, color: 'text-orange-400 border-orange-500/40 bg-orange-500/10' },
    { id: 'fire', label: 'Fire / Thermal', icon: Flame, color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
    { id: 'flood', label: 'Flood / Inundation', icon: Waves, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    { id: 'accident', label: 'Accident / Crash', icon: Car, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
    { id: 'other', label: 'Other Hazard', icon: HelpCircle, color: 'text-slate-300 border-slate-600 bg-slate-800' },
  ];

  const handleRequestLocation = async () => {
    setIsLocating(true);
    const result = await requestCurrentPosition();
    setIsLocating(false);

    if (result.coords) {
      setCoords(result.coords);
      setManualCoords(false);
      setLocationConfirmed(true);
      showToast('GPS coordinates acquired. Check that the pin is accurate.', 'success');
    } else {
      setManualCoords(true);
      setLocationConfirmed(false);
      showToast(result.error || 'GPS unavailable. Enter your actual coordinates manually.', 'info');
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      setValidationError('Please provide a brief description of the emergency.');
      return;
    }
    if (peopleCount < 1) {
      setValidationError('Number of people affected must be at least 1.');
      return;
    }
    if (!locationConfirmed || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng) || coords.lat < -90 || coords.lat > 90 || coords.lng < -180 || coords.lng > 180) {
      setValidationError('Get your GPS location or enter valid latitude and longitude before submitting. Placeholder coordinates are never sent.');
      return;
    }
    setValidationError('');

    const newAlertId = generateSosId();
    const newAlert: SosAlert = {
      id: newAlertId,
      timestamp: Date.now(),
      category,
      priority,
      name: name.trim() || undefined,
      description: description.trim(),
      medicalNeeds: medicalNeeds.trim() || undefined,
      peopleCount,
      location: coords,
      status: 'saved_locally',
      hopCount: 0,
      isDemo: false,
      deliveryTimeline: [
        {
          state: 'saved_locally',
          timestamp: Date.now(),
          details: 'Saved in device IndexedDB storage',
        },
      ],
    };

    try {
      await createAlert(newAlert);
    } catch (error) {
      console.error('Unable to save SOS alert:', error);
      setValidationError('Could not save this alert to local storage. Check browser storage permissions and try again.');
      return;
    }

    const savedAlert = useSosStore.getState().alerts.find((alert) => alert.id === newAlertId) || newAlert;
    setSubmittedAlert(savedAlert);
    setIsModalOpen(false);

    // Reset Form
    setDescription('');
    setName('');
    setMedicalNeeds('');
    setPeopleCount(1);

    showToast(
      savedAlert.status === 'broadcast_locally'
        ? `SOS ${newAlertId} sent to an available peer transport. Waiting for peer acknowledgement.`
        : `SOS ${newAlertId} saved on this device. No peer confirmed receipt; it remains queued.`,
      savedAlert.status === 'broadcast_locally' ? 'success' : 'info'
    );
  };

  return (
    <div className="space-y-6">
      {/* Header and Hero SOS Trigger */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-[#132338] to-[#0D1B2A] border border-cyan-500/30 flex flex-col items-center text-center space-y-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
            <span>Off-Grid Distress Signal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Broadcast Emergency SOS</h1>
          <p className="text-sm text-slate-300">
            Triggers immediate high-priority packet flooding across WebRTC and local peer channels.
            Persists to device IndexedDB with offline queuing.
          </p>
        </div>

        {/* Giant Pulsing SOS Button */}
        <div className="relative group">
          <div className="absolute -inset-4 rounded-full bg-red-600/30 blur-xl group-hover:bg-red-600/50 transition-all animate-pulse" />
          <button
            type="button"
            onClick={() => {
              setSubmittedAlert(null);
              setIsModalOpen(true);
            }}
            className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-gradient-to-tr from-red-700 via-red-600 to-red-500 text-white flex flex-col items-center justify-center border-4 border-red-400/80 shadow-[0_0_50px_rgba(255,59,79,0.7)] group-hover:scale-105 group-active:scale-95 transition-all focus:outline-none focus:ring-4 focus:ring-cyan-400"
            aria-label="Trigger SOS Emergency Broadcast Form"
          >
            <AlertOctagon className="w-12 h-12 sm:w-16 sm:h-16 animate-pulse mb-1" />
            <span className="text-2xl sm:text-3xl font-black tracking-widest">SOS</span>
            <span className="text-[10px] tracking-wider uppercase opacity-90 font-mono">PUSH TO BROADCAST</span>
          </button>
        </div>

        <p className="text-xs text-slate-400 max-w-md">
          Zero login required. Coordinates are retrieved locally and cached in device storage.
        </p>
      </div>

      {/* Confirmation Screen Banner (if just submitted) */}
      {submittedAlert && (
        <div className="p-6 rounded-2xl bg-[#0D1B2A] border-2 border-emerald-500/50 space-y-4 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-cyan-950">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest font-bold">
                  Distress Broadcast Logged
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-mono mt-1">{submittedAlert.id}</h2>
            </div>
            <Badge variant="status" status={submittedAlert.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Category & Priority</span>
              <span className="font-bold text-white capitalize">
                {submittedAlert.category} ({submittedAlert.priority.toUpperCase()})
              </span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">People Affected</span>
              <span className="font-bold text-white">{submittedAlert.peopleCount} Person(s)</span>
            </div>
            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-slate-400 block mb-1">Coordinates</span>
              <span className="font-mono font-bold text-cyan-300">
                {submittedAlert.location.lat.toFixed(4)}, {submittedAlert.location.lng.toFixed(4)}
              </span>
            </div>
          </div>

          {/* Delivery Status Timeline */}
          <div className="space-y-2 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Delivery Status Timeline
            </h3>
            <div className="space-y-2">
              {submittedAlert.deliveryTimeline.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 text-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-cyan-400 flex-shrink-0" />
                  <Badge variant="status" status={step.state} />
                  <span className="text-slate-300 flex-1">{step.details || 'Step recorded'}</span>
                  <span className="text-slate-500 font-mono text-[11px]">
                    {new Date(step.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate('/app/sms')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs tracking-wide transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send via SMS Fallback</span>
            </button>
            <button
              onClick={() => navigate('/app/map')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-colors"
            >
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>View On Rescue Map</span>
            </button>
            <button
              onClick={() => setSubmittedAlert(null)}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Real Local Alerts History */}
      <div className="p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
          <div>
            <h2 className="text-lg font-bold text-white">Local Device Alerts History</h2>
            <p className="text-xs text-slate-400">
              IndexedDB records stored on this physical device. Persists without internet.
            </p>
          </div>
          <span className="text-xs font-mono text-cyan-400 font-bold">{alerts.length} Total</span>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono font-bold text-white text-sm">{alert.id}</span>
                  <Badge variant="priority" priority={alert.priority} />
                  <Badge variant="status" status={alert.status} />
                  {alert.isDemo && <Badge variant="demo" />}
                </div>

                <div className="text-xs font-semibold text-cyan-300 capitalize">
                  {alert.category} • {alert.peopleCount} Person(s) affected
                  {alert.name && ` • Reporter: ${alert.name}`}
                </div>

                <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {alert.description}
                </p>

                <div className="flex items-center gap-4 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  <span className="font-mono">
                    {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => setSelectedDetailAlert(alert)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-semibold transition-colors"
                >
                  Details
                </button>
                <button
                  onClick={() => navigate('/app/sms')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
                  title="Export to SMS Fallback"
                  aria-label="Export to SMS Fallback"
                >
                  <MessageSquare className="w-4 h-4 text-cyan-400" />
                </button>
                <button
                  onClick={() => setIsConfirmingDelete(alert.id)}
                  className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 transition-colors"
                  title="Delete Alert"
                  aria-label="Delete Alert"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {alerts.length === 0 && (
            <div className="text-center py-12 text-slate-400 text-sm">
              <AlertOctagon className="w-10 h-10 mx-auto mb-2 opacity-30 text-red-400" />
              <p>No emergency alerts logged. Click the red button above to trigger an SOS.</p>
            </div>
          )}
        </div>
      </div>

      {/* SOS CREATION MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Broadcast Emergency Distress (SOS)" maxWidth="xl">
        <form onSubmit={handleBroadcast} className="space-y-5">
          {validationError && (
            <div className="p-3 bg-red-950/80 border border-red-500/50 rounded-lg text-xs text-red-200">
              {validationError}
            </div>
          )}

          {/* Emergency Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Select Emergency Category *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                      isSelected
                        ? `${cat.color} ring-2 ring-cyan-400 shadow-[0_0_15px_rgba(0,217,255,0.2)]`
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority Level */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Priority Severity *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {(['critical', 'high', 'medium'] as PriorityLevel[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${
                    priority === p
                      ? p === 'critical'
                        ? 'bg-red-500/20 text-red-400 border-red-500 ring-2 ring-red-400'
                        : p === 'high'
                        ? 'bg-orange-500/20 text-orange-400 border-orange-500 ring-2 ring-orange-400'
                        : 'bg-yellow-500/20 text-yellow-300 border-yellow-500 ring-2 ring-yellow-400'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Requirements */}
          <div className="space-y-3">
            <div>
              <label htmlFor="sos-desc" className="block text-xs font-semibold text-slate-300 mb-1">
                Emergency Description *
              </label>
              <textarea
                id="sos-desc"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="State your exact situation, immediate hazards, trapped status, or urgent threats..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="sos-med" className="block text-xs font-semibold text-slate-300 mb-1">
                  Medical Requirements (Optional)
                </label>
                <input
                  id="sos-med"
                  type="text"
                  value={medicalNeeds}
                  onChange={(e) => setMedicalNeeds(e.target.value)}
                  placeholder="e.g. Tourniquet, Insulin, Burn dressing..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label htmlFor="sos-count" className="block text-xs font-semibold text-slate-300 mb-1">
                  People Affected / Casualties *
                </label>
                <input
                  id="sos-count"
                  type="number"
                  min={1}
                  max={500}
                  value={peopleCount}
                  onChange={(e) => setPeopleCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="sos-name" className="block text-xs font-semibold text-slate-300 mb-1">
                Reporter / Contact Name (Optional)
              </label>
              <input
                id="sos-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Name or callsign"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm text-white placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Location Coordinates & Geolocation */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Geographical Coordinates</span>
              </span>
              <button
                type="button"
                onClick={handleRequestLocation}
                disabled={isLocating}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isLocating ? 'Acquiring GPS...' : 'Update GPS'}</span>
              </button>
            </div>

            {manualCoords ? (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="text-[10px] text-slate-400 block">Latitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={coords.lat}
                    onChange={(e) => {
                      setCoords({ ...coords, lat: e.target.value === '' ? 0 : Number(e.target.value), isManual: true });
                      setLocationConfirmed(false);
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block">Longitude</label>
                  <input
                    type="number"
                    step="0.0001"
                    value={coords.lng}
                    onChange={(e) => {
                      setCoords({ ...coords, lng: e.target.value === '' ? 0 : Number(e.target.value), isManual: true });
                      setLocationConfirmed(true);
                    }}
                    className="w-full px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs font-mono text-white focus:outline-none"
                  />
                </div>
                <label className="col-span-2 flex items-start gap-2 text-xs text-amber-300">
                  <input
                    type="checkbox"
                    checked={locationConfirmed}
                    onChange={(e) => setLocationConfirmed(e.target.checked)}
                    className="mt-0.5 accent-cyan-400"
                  />
                  I confirm these manually entered coordinates are my actual current location.
                </label>
              </div>
            ) : (
              <div className="text-xs text-slate-400 font-mono">
                Lat: <span className="text-cyan-300">{coords.lat.toFixed(5)}</span> • Lng:{' '}
                <span className="text-cyan-300">{coords.lng.toFixed(5)}</span>
                {coords.isManual && <span className="text-amber-400 ml-2">(Manual Fallback)</span>}
              </div>
            )}
          </div>

          {/* Submit CTA */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-slate-300 hover:bg-slate-800 border border-slate-700 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(255,59,79,0.4)] transition-all"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast SOS Signal</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* ALERT DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedDetailAlert)}
        onClose={() => setSelectedDetailAlert(null)}
        title="Distress Signal Telemetry & Timeline"
        maxWidth="lg"
      >
        {selectedDetailAlert && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <span className="text-lg font-mono font-bold text-cyan-300">{selectedDetailAlert.id}</span>
              <Badge variant="priority" priority={selectedDetailAlert.priority} />
            </div>

            <div className="space-y-2">
              <div>
                <span className="text-slate-400 block mb-0.5">Description</span>
                <p className="text-slate-200 bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-sm leading-relaxed">
                  {selectedDetailAlert.description}
                </p>
              </div>

              {selectedDetailAlert.medicalNeeds && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Medical Requirements</span>
                  <p className="text-amber-300 font-medium">{selectedDetailAlert.medicalNeeds}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Category: <span className="capitalize font-semibold">{selectedDetailAlert.category}</span></div>
                <div>Casualties: <span className="font-semibold">{selectedDetailAlert.peopleCount} Person(s)</span></div>
                <div>Coordinates: <span className="font-mono">{selectedDetailAlert.location.lat.toFixed(4)}, {selectedDetailAlert.location.lng.toFixed(4)}</span></div>
                <div>Reporter: <span>{selectedDetailAlert.name || 'Anonymous / Device'}</span></div>
              </div>
            </div>

            {/* Delivery Timeline */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-slate-400 font-bold uppercase tracking-wider block">Hop & Status Timeline</span>
              <div className="space-y-1.5">
                {selectedDetailAlert.deliveryTimeline.map((step, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <Badge variant="status" status={step.state} />
                      <span className="text-slate-300">{step.details || 'State changed'}</span>
                    </div>
                    <span className="text-slate-500 font-mono">{new Date(step.timestamp).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedDetailAlert(null);
                  navigate('/app/sms');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Export to SMS</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDetailAlert(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={Boolean(isConfirmingDelete)}
        title="Delete Emergency Alert?"
        message="This will permanently delete this SOS record from this device's IndexedDB and cancel any pending mesh re-broadcasts."
        confirmLabel="Delete Alert"
        cancelLabel="Keep Alert"
        variant="danger"
        onConfirm={async () => {
          if (isConfirmingDelete) {
            await deleteAlert(isConfirmingDelete);
            showToast('Alert deleted from local device storage.', 'info');
            setIsConfirmingDelete(null);
          }
        }}
        onCancel={() => setIsConfirmingDelete(null)}
      />
    </div>
  );
};
