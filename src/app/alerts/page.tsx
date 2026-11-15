'use client';

import React, { useState, useEffect } from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Check, 
  CheckCheck, 
  X, 
  ArrowRight
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

export default function AlertCenterPage() {
  const { astronauts, activeAlerts, acknowledgeAlert, resolveAlert } = useTelemetry();

  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [astronautFilter, setAstronautFilter] = useState<string>('all');
  const [alertsList, setAlertsList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [resolvingAlertId, setResolvingAlertId] = useState<string | null>(null);
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (severityFilter !== 'all') params.append('severity', severityFilter);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (astronautFilter !== 'all') params.append('astronautId', astronautFilter);

      const res = await fetch(`/api/alerts?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setAlertsList(data.alerts);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [severityFilter, statusFilter, astronautFilter]);

  const handleResolveSubmit = async (alertId: string) => {
    await resolveAlert(alertId, resolutionNote || 'Clinical countermeasure verified by Flight Surgeon.');
    setResolvingAlertId(null);
    setResolutionNote('');
    await fetchAlerts();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D93025] uppercase tracking-wide">
            <AlertOctagon className="h-4 w-4" />
            <span>Clinical Alert Operations Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Alert Center &amp; Clinical Triage
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Surveillance queue of detected physiological deviations, acute radiation surges, and flight surgeon countermeasure protocols.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-[#D93025] font-semibold text-xs flex items-center gap-2 shadow-xs">
            <AlertTriangle className="h-4 w-4" />
            <span>{activeAlerts.length} Active Protocols</span>
          </div>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs shadow-sm">
        
        {/* Severity Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[#6E6E73] font-medium">Severity:</span>
          <div className="flex bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-1">
            {['all', 'red', 'amber', 'green'].map(sev => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-1 rounded-lg uppercase transition-all font-semibold ${
                  severityFilter === sev
                    ? sev === 'red' ? 'bg-white text-[#D93025] shadow-xs' :
                      sev === 'amber' ? 'bg-white text-[#D18A22] shadow-xs' :
                      sev === 'green' ? 'bg-white text-[#248A3D] shadow-xs' :
                      'bg-white text-[#0071E3] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-[#6E6E73] font-medium">Status:</span>
          <div className="flex bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-1">
            {['all', 'active', 'acknowledged', 'resolved'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition-all font-semibold ${
                  statusFilter === st
                    ? 'bg-white text-[#0071E3] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Astronaut Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[#6E6E73] font-medium">Crew Member:</span>
          <select
            value={astronautFilter}
            onChange={(e) => setAstronautFilter(e.target.value)}
            className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl py-1.5 px-3 text-xs text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            <option value="all">All Crew</option>
            {astronauts.map(a => (
              <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Alerts Feed */}
      <div className="space-y-4">
        {alertsList.map(alert => {
          const isRed = alert.severity === 'red';
          const isAmber = alert.severity === 'amber';
          const isResolved = alert.status === 'resolved';
          const isAcknowledged = alert.status === 'acknowledged';

          return (
            <div
              key={alert.id}
              className={`rounded-2xl border p-5 transition-all bg-white shadow-sm space-y-4 ${
                isRed
                  ? 'border-[#FEE2E2]'
                  : isAmber
                  ? 'border-[#FEF3C7]'
                  : 'border-[#E5E5EA]'
              } ${isResolved ? 'opacity-70 bg-gray-50' : ''}`}
            >
              {/* Alert Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F5F7] pb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold uppercase ${
                    isRed ? 'bg-[#FEF2F2] text-[#D93025]' :
                    isAmber ? 'bg-[#FFF3E0] text-[#D18A22]' :
                    'bg-[#E8F5E9] text-[#248A3D]'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-[#6E6E73]">{alert.id}</span>
                  <span className="text-gray-300">•</span>
                  <span className="text-xs font-bold text-[#1D1D1F]">{alert.astronautName || alert.astronautId}</span>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <span className={`capitalize px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                    isResolved ? 'bg-[#F5F5F7] text-[#6E6E73]' :
                    isAcknowledged ? 'bg-[#EBF5FF] text-[#0071E3]' :
                    'bg-[#FEF2F2] text-[#D93025]'
                  }`}>
                    {alert.status}
                  </span>
                  <span className="text-[#6E6E73] text-xs flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Title & Parameter Badges */}
              <div>
                <h3 className="text-base font-bold text-[#1D1D1F] tracking-tight">
                  {alert.title}
                </h3>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs">
                  <div className="text-[#6E6E73]">
                    Target: <span className="text-[#1D1D1F] font-semibold">{alert.parameter}</span>
                  </div>
                  <div className="text-[#6E6E73]">
                    Observed: <span className="text-[#D93025] font-bold">{alert.observedValue}</span>
                  </div>
                  <div className="text-[#6E6E73]">
                    Baseline: <span className="text-[#1D1D1F]">{alert.baselineValue}</span>
                  </div>
                </div>
              </div>

              {/* Reason Description */}
              <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] leading-relaxed">
                <span className="font-semibold text-[#0071E3]">Detection Rationale: </span>
                {alert.reason}
              </div>

              {/* Recommended Action */}
              <div className="p-3.5 rounded-xl bg-[#F0F7FF] border border-[#D0E2FF] text-xs text-[#1D1D1F] leading-relaxed">
                <span className="font-semibold text-[#0071E3] block mb-0.5">
                  Recommended Flight Countermeasure:
                </span>
                {alert.recommendedAction}
              </div>

              {/* Action Buttons */}
              {!isResolved && (
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#F5F5F7]">
                  <div className="flex items-center gap-2">
                    {!isAcknowledged && (
                      <button
                        onClick={async () => {
                          await acknowledgeAlert(alert.id);
                          await fetchAlerts();
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-[#F5F5F7] hover:bg-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#E5E5EA]"
                      >
                        <Check className="h-3.5 w-3.5 text-[#0071E3]" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {resolvingAlertId !== alert.id ? (
                      <button
                        onClick={() => setResolvingAlertId(alert.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CheckCheck className="h-3.5 w-3.5" />
                        <span>Resolve Protocol</span>
                      </button>
                    ) : null}
                  </div>

                  {resolvingAlertId === alert.id && (
                    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-2">
                      <input
                        type="text"
                        value={resolutionNote}
                        onChange={(e) => setResolutionNote(e.target.value)}
                        placeholder="Clinical rationale / countermeasure verification..."
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
                      />
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleResolveSubmit(alert.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#248A3D] text-white text-xs font-semibold hover:bg-emerald-700 transition-colors"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setResolvingAlertId(null)}
                          className="px-2.5 py-1.5 rounded-xl bg-[#F5F5F7] text-[#6E6E73] text-xs hover:text-[#1D1D1F] transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {alertsList.length === 0 && !loading && (
          <div className="bg-white rounded-2xl border border-[#E5E5EA] p-12 text-center text-[#6E6E73] shadow-sm">
            <CheckCircle2 className="h-10 w-10 text-[#248A3D] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#1D1D1F]">All Flight Protocols Nominal</h3>
            <p className="text-xs text-[#6E6E73] mt-1">No alerts match the active filter criteria.</p>
          </div>
        )}
      </div>

    </div>
  );
}
