'use client';

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sliders, 
  User, 
  ShieldCheck, 
  RotateCcw, 
  Check, 
  Save, 
  History
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import { ThresholdSettings, UserRole } from '@/lib/types';

export default function SettingsPage() {
  const { userRole, setUserRole, demoMode, showToast } = useTelemetry();

  const [thresholds, setThresholds] = useState<ThresholdSettings>({
    heartRateMin: 45,
    heartRateMax: 100,
    spo2Min: 95.0,
    bodyTempMax: 37.5,
    respiratoryRateMax: 20,
    dailyRadiationMaxMsv: 1.5,
    cumulativeRadiationMaxMsv: 50.0,
    minSleepDurationHours: 6.0,
    stressScoreMax: 70
  });

  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            if (data.thresholds) setThresholds(data.thresholds);
            if (data.auditLogs) setAuditLogs(data.auditLogs);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadSettings();
  }, []);

  const handleSaveThresholds = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thresholds,
          demoMode,
          actor: userRole
        })
      });
      if (res.ok) {
        showToast('Telemetry thresholds and configuration saved.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleResetDatabase = async () => {
    if (confirm('Are you sure you want to reset all telemetry readings and alerts to the initial baseline seed state?')) {
      try {
        const res = await fetch('/api/simulation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset' })
        });
        if (res.ok) {
          showToast('Telemetry database reset to initial baseline.');
          window.location.reload();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Settings className="h-4 w-4" />
            <span>Mission Configuration Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Settings &amp; Thresholds
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Configure clinical decision-support thresholds, simulation engine parameters, persona roles, and security audit trail.
          </p>
        </div>

        <button
          onClick={handleSaveThresholds}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white text-xs font-semibold transition-all shadow-xs"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* Role-Based Access Control (RBAC) Selector */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
        <div>
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <User className="h-4 w-4 text-[#0071E3]" />
            <span>Role-Based Operational Personas (RBAC)</span>
          </h2>
          <p className="text-xs text-[#6E6E73] mt-0.5">
            Switch between authorized operational personas to test multi-role mission workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { id: 'flight_surgeon', title: 'Flight Surgeon', desc: 'Full medical authorization, acknowledge and resolve critical health alerts, review clinical protocols.' },
            { id: 'biomedical_engineer', title: 'Biomedical Engineer (BME)', desc: 'Sensor calibration, telemetry simulation controls, dosimeter monitoring, system diagnostics.' },
            { id: 'astronaut', title: 'Crew Member (Astronaut)', desc: 'Personal health profile, private sleep architecture, wellness check-ins, ASTRA AI assistant.' }
          ].map(r => (
            <div
              key={r.id}
              onClick={() => {
                setUserRole(r.id as UserRole);
                showToast(`Switched active persona to ${r.title}`);
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${
                userRole === r.id
                  ? 'border-[#0071E3] bg-[#F0F7FF] text-[#1D1D1F] ring-1 ring-[#0071E3] shadow-xs'
                  : 'border-[#E5E5EA] bg-[#F5F5F7] text-[#6E6E73] hover:bg-white hover:text-[#1D1D1F]'
              }`}
            >
              <div className="flex items-center justify-between font-bold text-sm text-[#1D1D1F]">
                <span>{r.title}</span>
                {userRole === r.id && <Check className="h-4 w-4 text-[#0071E3]" />}
              </div>
              <p className="text-xs text-[#6E6E73] mt-2 leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Illustrative Anomaly Thresholds Configuration */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F5F5F7] pb-3">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Sliders className="h-4 w-4 text-[#0071E3]" />
              <span>Configurable Health Thresholds</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Parameters used by the AI Health Intelligence Engine to flag anomalies.
            </p>
          </div>

          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFFBEB] text-[#D18A22] font-semibold">
            Illustrative Benchmarks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          
          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Max Resting Heart Rate (BPM)</label>
            <input
              type="number"
              value={thresholds.heartRateMax}
              onChange={(e) => setThresholds({ ...thresholds, heartRateMax: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">Triggers amber tachycardia alert if exceeded</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Min Oxygen Saturation (%)</label>
            <input
              type="number"
              step="0.5"
              value={thresholds.spo2Min}
              onChange={(e) => setThresholds({ ...thresholds, spo2Min: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">Triggers sub-optimal SpO2 alert if below</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Max Daily Radiation (mSv/day)</label>
            <input
              type="number"
              step="0.1"
              value={thresholds.dailyRadiationMaxMsv}
              onChange={(e) => setThresholds({ ...thresholds, dailyRadiationMaxMsv: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">Triggers Critical Red Solar Particle Event alarm</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Max Core Temp (°C)</label>
            <input
              type="number"
              step="0.1"
              value={thresholds.bodyTempMax}
              onChange={(e) => setThresholds({ ...thresholds, bodyTempMax: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">Evaluated in Space Fever multi-variate model</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Min Sleep Duration (hrs)</label>
            <input
              type="number"
              step="0.5"
              value={thresholds.minSleepDurationHours}
              onChange={(e) => setThresholds({ ...thresholds, minSleepDurationHours: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">Circadian phase fragmentation threshold</span>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-2">
            <label className="text-[#1D1D1F] block font-semibold">Max Autonomic Stress (0-100)</label>
            <input
              type="number"
              value={thresholds.stressScoreMax}
              onChange={(e) => setThresholds({ ...thresholds, stressScoreMax: Number(e.target.value) })}
              className="w-full bg-white border border-[#E5E5EA] rounded-lg p-2 text-[#1D1D1F] font-bold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
            />
            <span className="text-[11px] text-[#6E6E73]">High cognitive/confinement strain limit</span>
          </div>

        </div>
      </div>

      {/* Database Maintenance & Demonstration Tools */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
          <RotateCcw className="h-4 w-4 text-[#0071E3]" />
          <span>Demonstration &amp; Data Engine Controls</span>
        </h2>

        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs">
          <div>
            <div className="font-bold text-[#1D1D1F]">Reset Telemetry Database to Baseline</div>
            <div className="text-xs text-[#6E6E73] mt-0.5">Clears injected anomalies and restores initial 30-day baseline data.</div>
          </div>
          <button
            onClick={handleResetDatabase}
            className="px-4 py-2 rounded-xl bg-[#FEF2F2] hover:bg-red-100 border border-[#FEE2E2] text-[#D93025] font-semibold transition-all shadow-xs"
          >
            Reset Database
          </button>
        </div>
      </div>

      {/* Security Audit History */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <History className="h-4 w-4 text-[#0071E3]" />
            <span>Operational Audit Trail</span>
          </h2>
          <span className="text-xs text-[#6E6E73]">Immutable Log</span>
        </div>

        <div className="space-y-2 text-xs">
          {auditLogs.map((log, i) => (
            <div key={i} className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded-md bg-white border border-[#E5E5EA] text-[#0071E3] font-bold text-[10px]">
                  {log.action}
                </span>
                <span className="text-[#1D1D1F] font-medium">{log.details}</span>
              </div>
              <div className="text-[#6E6E73] text-[11px] shrink-0">
                Actor: <span className="text-[#1D1D1F] font-semibold">{log.actor}</span> • {new Date(log.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}

          {auditLogs.length === 0 && (
            <div className="p-4 text-center text-[#6E6E73] text-xs">
              No audit log entries recorded.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
