'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  BrainCircuit, 
  Activity, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

export default function AiHealthIntelligencePage() {
  const { astronauts, activeAlerts, selectedAstronautId, setSelectedAstronautId } = useTelemetry();

  const currentAstronaut = astronauts.find(a => a.id === selectedAstronautId) || astronauts[0];

  const [inspectedAlertId, setInspectedAlertId] = useState<string>(
    activeAlerts.length > 0 ? activeAlerts[0].id : 'ALT-2026-001'
  );

  const inspectedAlert = activeAlerts.find(a => a.id === inspectedAlertId) || activeAlerts[0] || {
    id: 'ALT-2026-001',
    title: 'Solar Flare Cumulative Dosimetry Warning',
    severity: 'red',
    parameter: 'Radiation Exposure Rate',
    observedValue: '3.45 mSv/24h',
    baselineValue: '0.45 mSv/24h',
    reason: 'Exterior secondary proton dosimeter spike during scheduled EVA maintenance corridor. Corresponds with NOAA S2 Solar Radiation Storm alert.',
    timestamp: new Date().toISOString(),
    recommendedAction: 'Immediate transit to Gateway Water-Shielded Crew Sleeping Quarter. Administer prophylactic antioxidant protocol.',
    status: 'active',
    explanationDetails: {
      deviationScore: 6.8,
      contributingFactors: ['Coronal Mass Ejection (CME) shockwave', 'EVA hatch proximity', 'Dosimeter high-energy LET peak'],
      affectedSystems: ['Hematopoietic system', 'Cellular DNA repair', 'Acute radiation defense'],
      riskScore: 89
    }
  };

  const details = inspectedAlert?.explanationDetails || {
    deviationScore: 3.2,
    contributingFactors: ['Microgravity fluid shift', 'Circadian phase disruption', 'Sympathetic autonomic tone elevation'],
    affectedSystems: ['Cardiovascular', 'Thermoregulation'],
    riskScore: 68
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <BrainCircuit className="h-4 w-4" />
            <span>Analytical Engine • Explainable Intelligence</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            AI Health Intelligence Engine
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Surveillance model evaluating multi-indicator physiological correlation, longitudinal deviation scores, and spaceflight environmental stressors.
          </p>
        </div>

        {/* Clinical Disclaimer Badge */}
        <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FEF3C7] text-xs text-[#6E6E73] max-w-md shadow-xs">
          <div className="flex items-center gap-1.5 font-bold mb-0.5 text-[#D18A22]">
            <Info className="h-4 w-4 shrink-0" />
            <span>ILLUSTRATIVE DEMO THRESHOLDS</span>
          </div>
          <p className="text-[11px] leading-tight">
            Demo thresholds are illustrative. The system supports mission medical review and does not replace professional medical judgment.
          </p>
        </div>
      </div>

      {/* 3-Tier Alert Architecture Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* GREEN */}
        <div className="bg-white rounded-2xl border border-[#C8E6C9] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#248A3D] font-bold uppercase tracking-wider">Tier 1 • Green</span>
              <CheckCircle2 className="h-4 w-4 text-[#248A3D]" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] mt-2">Nominal Telemetry</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              Readings track within 1.5 standard deviations of the astronaut&apos;s baseline. No persistent anomalous trajectory detected.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F5F7] text-[11px] text-[#248A3D] font-semibold">
            Protocol: Standard flight operations &amp; daily 2.5h countermeasure routine.
          </div>
        </div>

        {/* AMBER */}
        <div className="bg-white rounded-2xl border border-[#FEF3C7] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#D18A22] font-bold uppercase tracking-wider">Tier 2 • Amber</span>
              <AlertTriangle className="h-4 w-4 text-[#D18A22]" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] mt-2">Elevated Physiological Drift</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              Readings demonstrate multi-parameter drift, persistent upward trajectory over 48h+, or significant deviation (&gt;2.0 Z-score).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F5F7] text-[11px] text-[#D18A22] font-semibold">
            Protocol: Flight Surgeon notification, hydration adjustment, targeted surveillance.
          </div>
        </div>

        {/* RED */}
        <div className="bg-white rounded-2xl border border-[#FEE2E2] p-5 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#D93025] font-bold uppercase tracking-wider">Tier 3 • Red</span>
              <ShieldAlert className="h-4 w-4 text-[#D93025] animate-pulse" />
            </div>
            <h3 className="text-base font-bold text-[#1D1D1F] mt-2">Critical Acute Event</h3>
            <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
              Urgent threshold violation (e.g. Solar Particle Event radiation spike &gt;2.5 mSv/day or acute cardiovascular destabilization).
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F5F5F7] text-[11px] text-[#D93025] font-semibold">
            Protocol: Immediate storm shelter, medical countermeasure, Houston BME downlink.
          </div>
        </div>

      </div>

      {/* Main Interactive Anomaly Inspector (The Core Explanation Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Detected Alerts List */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5F5F7]">
            <div>
              <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
                <Layers className="h-4 w-4 text-[#0071E3]" />
                <span>Detected Patterns ({activeAlerts.length})</span>
              </h2>
              <p className="text-xs text-[#6E6E73] mt-0.5">
                Select an alert to inspect full AI explainable reasoning.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {activeAlerts.map(alert => {
              const isSelected = alert.id === inspectedAlert?.id;
              const isRed = alert.severity === 'red';
              const isAmber = alert.severity === 'amber';

              return (
                <div
                  key={alert.id}
                  onClick={() => setInspectedAlertId(alert.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isRed ? 'border-[#FEE2E2] bg-[#FEF2F2]/50' :
                    isAmber ? 'border-[#FEF3C7] bg-[#FFFBEB]/50' :
                    'border-[#E5E5EA] bg-white'
                  } ${
                    isSelected ? 'ring-2 ring-[#0071E3] border-transparent shadow-xs' : 'hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold uppercase px-2 py-0.5 rounded text-[11px] ${
                      isRed ? 'bg-[#FEF2F2] text-[#D93025]' : 'bg-[#FFF3E0] text-[#D18A22]'
                    }`}>
                      {alert.severity} • {alert.id}
                    </span>
                    <span className="text-[#6E6E73] font-medium">{alert.astronautName || alert.astronautId}</span>
                  </div>

                  <h3 className="font-bold text-[#1D1D1F] text-sm mt-2">{alert.title}</h3>

                  <div className="text-xs text-[#6E6E73] mt-1">
                    <span className="text-[#0071E3] font-medium">{alert.parameter}:</span> {alert.observedValue}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100 text-xs text-[#0071E3] font-semibold">
                    <span>Inspect Diagnostic Rationale</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: EXPLANATION PANEL */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-6 shadow-sm">
          
          <div className="flex items-start justify-between">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#EBF5FF] text-[#0071E3] text-xs font-semibold uppercase tracking-wider">
                Explainability &amp; Reasoning Engine
              </span>
              <h2 className="text-xl font-bold text-[#1D1D1F] mt-2.5">
                {inspectedAlert?.title}
              </h2>
              <p className="text-xs text-[#6E6E73] mt-1">
                ID: {inspectedAlert?.id} • Subject: {inspectedAlert?.astronautName || inspectedAlert?.astronautId} • Generated: {new Date(inspectedAlert?.timestamp).toLocaleString()}
              </p>
            </div>

            {/* Risk Score Gauge */}
            <div className="text-center p-4 rounded-2xl bg-[#F5F5F7] border border-[#E5E5EA] min-w-[100px]">
              <div className="text-[10px] text-[#6E6E73] uppercase font-bold">Risk Index</div>
              <div className={`text-3xl font-extrabold ${details.riskScore > 75 ? 'text-[#D93025]' : 'text-[#D18A22]'}`}>
                {details.riskScore}
              </div>
              <div className="text-[10px] text-[#6E6E73]">out of 100</div>
            </div>
          </div>

          {/* Telemetry Comparison Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs">
            <div>
              <div className="text-[10px] text-[#6E6E73] uppercase font-medium">Monitored Parameter</div>
              <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">{inspectedAlert?.parameter}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#6E6E73] uppercase font-medium">Observed Value</div>
              <div className="font-bold text-[#D93025] text-sm mt-0.5">{inspectedAlert?.observedValue}</div>
            </div>
            <div>
              <div className="text-[10px] text-[#6E6E73] uppercase font-medium">Resting Baseline</div>
              <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">{inspectedAlert?.baselineValue}</div>
            </div>
          </div>

          {/* Clinical Detection Rationale */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#0071E3]" />
              <span>Multi-Variate Detection Rationale</span>
            </h3>
            <div className="p-4 rounded-xl bg-[#F0F7FF] border border-[#D0E2FF] text-xs text-[#1D1D1F] leading-relaxed">
              {inspectedAlert?.reason}
            </div>
          </div>

          {/* Contributing Environmental & Physiological Factors */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider">
              Contributing Factors &amp; Multi-Indicator Vectors
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {details.contributingFactors?.map((factor: string, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#1D1D1F] font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0071E3]"></span>
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Clinical Countermeasure */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-[#1D1D1F] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#248A3D]" />
              <span>Recommended Flight Countermeasure</span>
            </h3>
            <div className="p-4 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#1D1D1F] leading-relaxed font-medium">
              {inspectedAlert?.recommendedAction}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
