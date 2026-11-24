import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Copy,
  ExternalLink,
  Check,
  AlertTriangle,
  Info,
  Smartphone
} from 'lucide-react';
import { useSosStore } from '../../store/useSosStore';
import { useContactsStore } from '../../store/useContactsStore';
import { useToast } from '../../components/common/Toast';
import { Badge } from '../../components/common/Badge';
import { formatSmsPayload, getSmsMetrics, buildSmsUri } from '../../lib/sms';
import { SosAlert } from '../../types';

export const SmsPage: React.FC = () => {
  const { showToast } = useToast();
  const { alerts, selectedAlert, setSelectedAlert } = useSosStore();
  const { contacts } = useContactsStore();

  const [activeAlert, setActiveAlert] = useState<SosAlert | null>(
    selectedAlert || alerts[0] || null
  );
  const [recipientNumber, setRecipientNumber] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [userReportedSent, setUserReportedSent] = useState(false);

  useEffect(() => {
    if (selectedAlert) {
      setActiveAlert(selectedAlert);
    } else if (alerts.length > 0 && !activeAlert) {
      setActiveAlert(alerts[0]);
    }
  }, [selectedAlert, alerts]);

  // Set default primary contact phone
  useEffect(() => {
    if (contacts.length > 0 && !recipientNumber) {
      const primary = contacts.find((c) => c.isPrimary) || contacts[0];
      setRecipientNumber(primary.phone);
    }
  }, [contacts]);

  const smsText = activeAlert
    ? formatSmsPayload(activeAlert)
    : 'PM|ALERT|SOS|CRI|37.7749,-122.4194|1|Emergency Help Needed';

  const metrics = getSmsMetrics(smsText);
  const smsUri = buildSmsUri(recipientNumber, smsText);

  const handleCopy = () => {
    navigator.clipboard.writeText(smsText);
    setCopied(true);
    showToast('SMS payload copied to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelectContact = (phone: string) => {
    setRecipientNumber(phone);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-cyan-400" />
          <h1 className="text-2xl font-black text-white">GSM-7 SMS Emergency Fallback</h1>
        </div>
        <p className="text-sm text-slate-300 mt-1">
          When mesh radios are out of range, encode your SOS into a standardized, single-segment 160-character cellular SMS.
        </p>
      </div>

      {/* Honest Limitation Disclaimer */}
      <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold">Honest Transmission Policy:</p>
          <p className="text-slate-300 leading-relaxed">
            Clicking &quot;Open SMS App&quot; hands this message over to your operating system&apos;s default SMS client.
            <strong> PulseMesh cannot verify whether your carrier delivered the message</strong>. Cellular coverage and
            device SIM support are required.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Alert Selector & Contact Input */}
        <div className="lg:col-span-5 space-y-5 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">
            1. Select Alert & Recipient
          </h2>

          {/* Select Alert dropdown */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
              Select Distress Alert Source
            </label>
            {alerts.length > 0 ? (
              <select
                value={activeAlert?.id || ''}
                onChange={(e) => {
                  const target = alerts.find((a) => a.id === e.target.value) || null;
                  setActiveAlert(target);
                  setSelectedAlert(target);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                {alerts.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.id} ({a.category.toUpperCase()} - {a.priority.toUpperCase()})
                  </option>
                ))}
              </select>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900 text-xs text-slate-400">
                No active SOS alerts found. Using standard template.
              </div>
            )}
          </div>

          {/* Recipient Number */}
          <div className="space-y-2">
            <label htmlFor="sms-recipient" className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
              Recipient Phone Number *
            </label>
            <input
              id="sms-recipient"
              type="tel"
              value={recipientNumber}
              onChange={(e) => setRecipientNumber(e.target.value)}
              placeholder="+1 555-0199 or emergency dispatch"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 focus:border-cyan-400 text-sm font-mono text-cyan-300 focus:outline-none"
            />

            {/* Quick Select From Saved Contacts */}
            {contacts.length > 0 && (
              <div className="pt-2">
                <span className="text-[11px] text-slate-400 block mb-1.5">Quick fill from contacts:</span>
                <div className="flex flex-wrap gap-2">
                  {contacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectContact(c.phone)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
                    >
                      {c.name} ({c.phone})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* GSM-7 Technical Spec Note */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
              <span>GSM-7 Protocol Format</span>
            </div>
            <p className="text-[11px] leading-relaxed font-mono text-cyan-300">
              PM|ID|TYPE|PRI|LAT,LNG|COUNT|NOTE
            </p>
            <p className="text-[11px] leading-relaxed">
              Targeted to single 160-character budget. Works through degraded 2G cell towers where data/calls fail.
            </p>
          </div>
        </div>

        {/* Right Column: Encoded Payload Preview & Actions */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0D1B2A] border border-cyan-500/20 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-cyan-950">
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                2. Encoded Compact Payload
              </h2>
              {activeAlert?.isDemo && <Badge variant="demo" />}
            </div>

            {/* Payload Box */}
            <div className="space-y-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-cyan-500/40 relative">
                <p className="font-mono text-sm text-cyan-300 break-all select-all leading-relaxed">
                  {smsText}
                </p>
              </div>

              {/* Character & Segment Counter Bar */}
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span>Character count:</span>
                  <span
                    className={`font-mono font-bold ${
                      metrics.isOverLimit ? 'text-red-400' : 'text-emerald-400'
                    }`}
                  >
                    {metrics.charCount} / 160
                  </span>
                </div>
                <div>
                  Segments:{' '}
                  <span className="font-mono font-bold text-slate-200">
                    {metrics.segments} {metrics.segments === 1 ? 'SMS (Optimal)' : 'SMS (Multi-part)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-2">
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={smsUri}
                  className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(0,217,255,0.3)] transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open SMS App</span>
                </a>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{copied ? 'Copied' : 'Copy Payload'}</span>
                </button>
              </div>

              {/* Manual Confirmation Checkbox */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="user-sent-confirm"
                  checked={userReportedSent}
                  onChange={(e) => {
                    setUserReportedSent(e.target.checked);
                    if (e.target.checked) {
                      showToast('User marked SMS as dispatched.', 'info');
                    }
                  }}
                  className="w-4 h-4 rounded border-slate-700 text-cyan-500 focus:ring-0 focus:outline-none cursor-pointer"
                />
                <label htmlFor="user-sent-confirm" className="text-xs text-slate-300 cursor-pointer">
                  I manually confirmed sending this message via my carrier SMS app. (User-reported only)
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-cyan-950 text-[11px] text-slate-500 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>
              Format works across standard Android, iOS, and satellite-capable SMS gateways without third-party apps.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
