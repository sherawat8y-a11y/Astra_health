'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Download, 
  User, 
  Calendar, 
  Clock, 
  Heart, 
  Wind, 
  Radiation, 
  Dumbbell, 
  Moon,
  Info,
  ShieldCheck
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';

export default function HealthReportsPage() {
  const { astronauts, selectedAstronautId, setSelectedAstronautId, missionData } = useTelemetry();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/astronauts/${selectedAstronautId}?timeFilter=7d`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedAstronautId]);

  const astro = profileData?.astronaut || astronauts.find(a => a.id === selectedAstronautId) || astronauts[0];
  const latest = profileData?.latestReading || {};
  const alerts = profileData?.alerts || [];
  const radiation = profileData?.radiationRecords?.[profileData?.radiationRecords?.length - 1] || {};
  const sleep = profileData?.sleepRecords?.[profileData?.sleepRecords?.length - 1] || {};
  const boneMuscle = profileData?.boneMuscleRecords?.[profileData?.boneMuscleRecords?.length - 1] || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <FileText className="h-4 w-4" />
            <span>Biomedical Documentation Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Health Report Generator
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1">
            Generate and export mission-ready PDF health reports with authenticated telemetry summaries and clinical recommendations.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 text-xs">
          <a
            href={`/api/reports/download?astronautId=${selectedAstronautId}`}
            download
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold transition-all shadow-xs"
          >
            <Download className="h-4 w-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>

      {/* Astronaut Selector */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs shadow-sm">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-[#0071E3]" />
          <span className="text-[#6E6E73] font-medium">Generate Report For:</span>
          <select
            value={selectedAstronautId}
            onChange={(e) => setSelectedAstronautId(e.target.value)}
            className="bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl py-1.5 px-3 text-[#1D1D1F] font-semibold focus:outline-none focus:ring-1 focus:ring-[#0071E3]"
          >
            {astronauts.map(a => (
              <option key={a.id} value={a.id}>
                {a.code} — {a.name} ({a.rank})
              </option>
            ))}
          </select>
        </div>

        <span className="text-[#6E6E73] text-[11px] hidden sm:inline">
          Mission Day 142 • Artemis IV Gateway
        </span>
      </div>

      {/* Printable Report Canvas Document */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-8 sm:p-10 shadow-sm space-y-6 text-[#1D1D1F]">
        
        {/* Document Header */}
        <div className="border-b border-[#E5E5EA] pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#0071E3] text-lg tracking-wider">ASTRA HEALTH</span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#F5F5F7] text-[#6E6E73] font-medium">
                OFFICIAL BIOMEDICAL DOSSIER
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#1D1D1F] mt-2">
              ASTRONAUT CLINICAL HEALTH SUMMARY
            </h2>
            <p className="text-xs text-[#6E6E73] mt-1">
              National Aeronautics and Space Administration • Space Apps Challenge 2026
            </p>
          </div>

          <div className="text-right text-xs text-[#6E6E73] space-y-1">
            <div>Doc Ref: <span className="font-semibold text-[#1D1D1F]">ASTRA-MED-2026-042</span></div>
            <div>Date: <span className="font-semibold text-[#1D1D1F]">{new Date().toLocaleDateString()}</span></div>
            <div>Mission Day: <span className="font-semibold text-[#1D1D1F]">MD 142 / 365</span></div>
          </div>
        </div>

        {/* Astronaut Demographics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs">
          <div>
            <div className="text-[#6E6E73] text-[10px] uppercase font-medium">Name</div>
            <div className="font-bold text-sm text-[#1D1D1F] mt-0.5">{astro?.name}</div>
          </div>
          <div>
            <div className="text-[#6E6E73] text-[10px] uppercase font-medium">Callsign / Rank</div>
            <div className="font-bold text-sm text-[#1D1D1F] mt-0.5">{astro?.code} • {astro?.rank}</div>
          </div>
          <div>
            <div className="text-[#6E6E73] text-[10px] uppercase font-medium">Role</div>
            <div className="font-bold text-sm text-[#1D1D1F] mt-0.5">{astro?.role}</div>
          </div>
          <div>
            <div className="text-[#6E6E73] text-[10px] uppercase font-medium">Age / Blood Type</div>
            <div className="font-bold text-sm text-[#1D1D1F] mt-0.5">{astro?.age} yrs • {astro?.bloodType}</div>
          </div>
        </div>

        {/* 1. Vital Signs & Cardiopulmonary Surveillance */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wide flex items-center gap-2 border-b border-[#F5F5F7] pb-2">
            <Heart className="h-4 w-4 text-[#D93025]" />
            <span>1. Physiological Telemetry (7-Day Mean)</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73] text-[11px]">Heart Rate</div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {latest?.heartRate || astro?.baselineHr} <span className="text-xs font-normal text-[#6E6E73]">BPM</span>
              </div>
              <div className="text-[10px] text-[#248A3D] font-medium mt-1">Base: {astro?.baselineHr} BPM</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73] text-[11px]">Blood Pressure</div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {latest?.systolicBp || astro?.baselineSys}/{latest?.diastolicBp || astro?.baselineDia}
              </div>
              <div className="text-[10px] text-[#6E6E73] mt-1">mmHg</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73] text-[11px]">Oxygen Saturation</div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {latest?.spo2 || astro?.baselineSpo2}%
              </div>
              <div className="text-[10px] text-[#248A3D] font-medium mt-1">Nominal</div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73] text-[11px]">Core Temp</div>
              <div className="text-xl font-bold text-[#1D1D1F] mt-0.5">
                {latest?.bodyTemp || astro?.baselineTemp}°C
              </div>
              <div className="text-[10px] text-[#6E6E73] mt-1">Isoelectric</div>
            </div>
          </div>
        </div>

        {/* 2. Radiation & Environmental Dosimetry */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wide flex items-center gap-2 border-b border-[#F5F5F7] pb-2">
            <Radiation className="h-4 w-4 text-[#D18A22]" />
            <span>2. Space Environmental Radiation Dosimetry</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73]">24-Hour Dose Rate</div>
              <div className="text-lg font-bold text-[#1D1D1F] mt-0.5">
                {radiation?.dailyExposureMsv || astro?.dailyRadiationMsv} mSv/d
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73]">Career Cumulative Exposure</div>
              <div className="text-lg font-bold text-[#0071E3] mt-0.5">
                {radiation?.cumulativeExposureMsv || astro?.cumulativeRadiationMsv} mSv
              </div>
            </div>

            <div className="p-3.5 rounded-xl border border-[#E5E5EA] bg-white">
              <div className="text-[#6E6E73]">Career Permissible Limit</div>
              <div className="text-lg font-bold text-[#248A3D] mt-0.5">
                {((Number(radiation?.cumulativeExposureMsv || 28.4) / 600.0) * 100).toFixed(1)}% of PEL
              </div>
            </div>
          </div>
        </div>

        {/* 3. Clinical Recommendations & Sign-off */}
        <div className="pt-4 border-t border-[#E5E5EA] space-y-3">
          <h3 className="text-sm font-bold text-[#1D1D1F] uppercase tracking-wide">
            3. Flight Surgeon Operational Follow-up
          </h3>
          <p className="text-xs text-[#6E6E73] leading-relaxed">
            Astronaut {astro?.name} maintains acceptable spaceflight physical performance parameters. Continue prescribed 2.5 hours/day resistive (ARED) and cycle ergometer conditioning. Maintain hydration protocol to counter cephalad fluid shifts.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#6E6E73]">
            <div>
              Flight Surgeon Signature: <span className="font-semibold text-[#1D1D1F]">Dr. Michael Chang, MD / BME Lead</span>
            </div>
            <div>
              Verification Stamp: <span className="font-semibold text-[#0071E3]">NASA Artemis IV Medical Operations Deck</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
