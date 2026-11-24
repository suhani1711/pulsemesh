import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertOctagon,
  Radio,
  Stethoscope,
  MapPin,
  MessageSquare,
  Users,
  BookOpen,
  Settings,
  Shield
} from 'lucide-react';
import { useSosStore } from '../../store/useSosStore';

export const Sidebar: React.FC = () => {
  const { alerts } = useSosStore();
  const activeAlertsCount = alerts.filter((a) => a.status !== 'delivered').length;

  const navItems = [
    { to: '/app', icon: LayoutDashboard, label: 'Overview', end: true },
    { to: '/app/sos', icon: AlertOctagon, label: 'SOS Emergency', badge: activeAlertsCount, isEmergency: true },
    { to: '/app/network', icon: Radio, label: 'Nearby Network' },
    { to: '/app/triage', icon: Stethoscope, label: 'AI Triage' },
    { to: '/app/map', icon: MapPin, label: 'Rescue Map' },
    { to: '/app/sms', icon: MessageSquare, label: 'SMS Fallback' },
    { to: '/app/contacts', icon: Users, label: 'Emergency Contacts' },
    { to: '/app/guide', icon: BookOpen, label: 'Offline Guide' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-cyan-500/20 bg-[#07111F] min-h-screen sticky top-0">
      {/* Brand Logo */}
      <div className="h-16 flex items-center px-6 border-b border-cyan-500/20">
        <NavLink to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-9 h-9 rounded-lg bg-[#0D1B2A] border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-300 group-hover:shadow-[0_0_12px_rgba(0,217,255,0.4)] transition-all">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-wider text-white">PULSE</span>
            <span className="text-lg font-black tracking-wider text-cyan-400">MESH</span>
            <span className="block text-[9px] uppercase tracking-widest text-slate-400">Offline Triage</span>
          </div>
        </NavLink>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,217,255,0.15)] font-semibold'
                    : item.isEmergency
                    ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-850'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${item.isEmergency ? 'text-red-400' : ''}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    item.isEmergency ? 'bg-red-500 text-white' : 'bg-cyan-500/20 text-cyan-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Safety Notice Footer in Sidebar */}
      <div className="p-4 border-t border-cyan-950 text-[11px] text-slate-500 leading-normal">
        <p className="font-semibold text-slate-400 mb-1">Emergency Protocol:</p>
        <p>In life-threatening danger, always dial 112 / 911 / 108 if cellular towers operate.</p>
      </div>
    </aside>
  );
};
