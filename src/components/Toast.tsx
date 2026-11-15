'use client';

import React from 'react';
import { useTelemetry } from '@/context/TelemetryContext';
import { AlertCircle, X } from 'lucide-react';

export default function Toast() {
  const { toastMessage, showToast } = useTelemetry();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 right-4 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/95 border border-cyan-500/50 shadow-xl shadow-cyan-950/50 text-slate-100 text-xs font-mono backdrop-blur-md">
        <AlertCircle className="h-5 w-5 text-cyan-400 shrink-0 animate-pulse" />
        <div className="flex-1 font-sans text-xs">{toastMessage}</div>
        <button
          onClick={() => showToast('')}
          className="text-slate-400 hover:text-slate-200 p-1"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
