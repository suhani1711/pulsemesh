import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#07111F]/90 backdrop-blur-md border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="w-10 h-10 rounded-xl bg-[#0D1B2A] border border-cyan-500/50 flex items-center justify-center text-cyan-400 group-hover:border-cyan-300 group-hover:shadow-[0_0_15px_rgba(0,217,255,0.5)] transition-all">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-wider text-white">PULSE</span>
              <span className="text-xl font-black tracking-wider text-cyan-400">MESH</span>
            </div>
            <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-mono">
              Offline Triage Hub
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#how-it-works" className="hover:text-cyan-400 transition-colors">
            How It Works
          </a>
          <a href="#solution" className="hover:text-cyan-400 transition-colors">
            Technology
          </a>
          <a href="#design-goals" className="hover:text-cyan-400 transition-colors">
            Design Goals
          </a>
          <Link to="/app/guide" className="hover:text-cyan-400 transition-colors">
            Emergency Guide
          </Link>
        </nav>

        {/* CTA Launch Dashboard */}
        <div className="flex items-center gap-3">
          <Link
            to="/app"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(0,217,255,0.35)] transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Launch Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </header>
  );
};
