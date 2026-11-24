import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertOctagon,
  Radio,
  Stethoscope,
  MapPin,
  Menu,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#07111F]/95 backdrop-blur-lg border-t border-cyan-500/20 flex items-center justify-around h-16 px-1"
      aria-label="Mobile Navigation"
    >
      <NavLink
        to="/app"
        end
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span>Overview</span>
      </NavLink>

      <NavLink
        to="/app/network"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Radio className="w-5 h-5 mb-0.5" />
        <span>Network</span>
      </NavLink>

      {/* Central Pulsing SOS Button */}
      <NavLink
        to="/app/sos"
        className="flex flex-col items-center justify-center relative -top-3.5 group focus:outline-none"
        aria-label="SOS Emergency Action"
      >
        <div className="w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(255,59,79,0.5)] group-hover:scale-105 transition-transform border-2 border-red-400">
          <AlertOctagon className="w-7 h-7 animate-pulse" />
        </div>
        <span className="text-[10px] font-bold text-red-400 mt-0.5 tracking-wider uppercase">SOS</span>
      </NavLink>

      <NavLink
        to="/app/triage"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Stethoscope className="w-5 h-5 mb-0.5" />
        <span>Triage</span>
      </NavLink>

      <NavLink
        to="/app/map"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <MapPin className="w-5 h-5 mb-0.5" />
        <span>Map</span>
      </NavLink>

      <NavLink
        to="/app/settings"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center flex-1 h-full py-1 text-[11px] font-medium transition-colors ${
            isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`
        }
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span>More</span>
      </NavLink>
    </nav>
  );
};
