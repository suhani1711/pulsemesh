import React from 'react';
import { PriorityLevel, AlertStatus } from '../../types';

interface BadgeProps {
  variant?: 'demo' | 'simulated' | 'priority' | 'status' | 'outline';
  priority?: PriorityLevel;
  status?: AlertStatus;
  children?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'outline',
  priority,
  status,
  children,
  className = '',
}) => {
  if (variant === 'demo') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40 select-none ${className}`}
        title="Simulated sample demonstration record"
      >
        DEMO
      </span>
    );
  }

  if (variant === 'simulated') {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 select-none ${className}`}
        title="Simulated heuristic or simulated peer node"
      >
        SIMULATED
      </span>
    );
  }

  if (variant === 'priority' && priority) {
    const config = {
      critical: 'bg-red-500/20 text-red-400 border-red-500/40',
      high: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    }[priority];

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase border ${config} ${className}`}
      >
        {priority}
      </span>
    );
  }

  if (variant === 'status' && status) {
    const statusMap: Record<AlertStatus, { label: string; style: string }> = {
      saved_locally: { label: 'Saved Locally', style: 'bg-slate-700/50 text-slate-300 border-slate-600' },
      queued: { label: 'Queued', style: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
      broadcast_locally: { label: 'Broadcast Locally', style: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
      relayed_demo: { label: 'Relayed (Demo)', style: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
      delivered: { label: 'Delivered (Peer ACK)', style: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
    };

    const current = statusMap[status] || { label: status, style: 'bg-slate-700 text-slate-300' };

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.style} ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {current.label}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border border-cyan-500/30 text-cyan-300 bg-cyan-950/30 ${className}`}
    >
      {children}
    </span>
  );
};
