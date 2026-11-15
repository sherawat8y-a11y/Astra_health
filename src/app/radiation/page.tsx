'use client';

import React, { useState, useEffect } from 'react';
import { 
  Radiation, 
  ShieldCheck, 
  Sun, 
  TrendingUp, 
  Info, 
  AlertTriangle,
  Shield,
  Activity
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function RadiationMonitorPage() {
  const { astronauts, selectedAstronautId, setSelectedAstronautId } = useTelemetry();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/astronauts/${selectedAstronautId}?timeFilter=30d`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [selectedAstronautId]);

  const astro = astronauts.find(a => a.id === selectedAstronautId) || astronauts[0];
  const radiationRecords = profileData?.radiationRecords || [];
  const latestRad = radiationRecords[radiationRecords.length - 1] || {
    dailyExposureMsv: astro?.dailyRadiationMsv || 0.45,
    cumulativeExposureMsv: astro?.cumulativeRadiationMsv || 28.4,
    speIndex: 1.2,
    gcrIndex: 2.1,
    status: 'normal'
  };

  const careerLimitMsv = 600.0;
  const annualLimitMsv = 250.0;
  const pctCareer = ((latestRad.cumulativeExposureMsv / careerLimitMsv) * 100).toFixed(2);
  const pctAnnual = ((latestRad.cumulativeExposureMsv / annualLimitMsv) * 100).toFixed(2);

  const chartData = radiationRecords.map((r: any) => {
    const d = new Date(r.timestamp);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      dailyMsv: r.dailyExposureMsv,
      spe: r.speIndex,
      gcr: r.gcrIndex,
      cumulative: r.cumulativeExposureMsv
    };
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#D18A22] uppercase tracking-wide">
            <Radiation className="h-4 w-4" />
            <span>Environmental Dosimetry Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Space Radiation &amp; SPE Monitor
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Real-time active dosimeter tracking, Galactic Cosmic Radiation (GCR) background surveillance, and Solar Particle Event (SPE) storm alarms.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#6E6E73] max-w-md shadow-xs">
          <div className="flex items-center gap-1.5 text-[#0071E3] font-semibold mb-0.5">
            <Info className="h-3.5 w-3.5" />
            <span>DATA ATTRIBUTION</span>
          </div>
          <p className="text-[11px] leading-tight">
            Daily telemetry values are synthetically simulated for Artemis IV Gateway demonstration. Research baselines reflect NASA Human Research Roadmap benchmarks.
          </p>
        </div>
      </div>

      {/* Primary Dosimetry KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Daily Exposure */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Daily Absorbed Dose</span>
            <Radiation className="h-4 w-4 text-[#D18A22]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {latestRad.dailyExposureMsv} <span className="text-xs font-normal text-[#6E6E73]">mSv/24h</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Quiet Background: ~0.45 mSv/day (Gateway)
          </div>
        </div>

        {/* Cumulative Mission Dose */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Cumulative Mission Dose</span>
            <TrendingUp className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0071E3] tracking-tight">
            {latestRad.cumulativeExposureMsv} <span className="text-xs font-normal text-[#6E6E73]">mSv</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Mission Day 142 • Active Torso Dosimeter
          </div>
        </div>

        {/* NASA Annual Limit Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">NASA Annual Limit (250 mSv)</span>
            <ShieldCheck className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-3xl font-extrabold text-[#248A3D] tracking-tight">
            {pctAnnual}%
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            {latestRad.cumulativeExposureMsv} / {annualLimitMsv} mSv (1-Year Ceiling)
          </div>
        </div>

        {/* NASA Career PEL Limit Progress */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">NASA Career PEL Limit (600 mSv)</span>
            <Sun className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {pctCareer}%
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            {latestRad.cumulativeExposureMsv} / {careerLimitMsv} mSv Career Lifetime
          </div>
        </div>

      </div>

      {/* Astronaut Switcher */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs shadow-sm">
        <span className="text-[#6E6E73] font-medium">Dosimeter Target:</span>
        <div className="flex flex-wrap gap-2">
          {astronauts.map(a => (
            <button
              key={a.id}
              onClick={() => setSelectedAstronautId(a.id)}
              className={`px-3 py-1.5 rounded-xl transition-all font-semibold ${
                selectedAstronautId === a.id
                  ? 'bg-[#0071E3] text-white shadow-xs'
                  : 'bg-[#F5F5F7] text-[#6E6E73] border border-[#E5E5EA] hover:text-[#1D1D1F]'
              }`}
            >
              {a.code} — {a.name} ({a.dailyRadiationMsv} mSv/d)
            </button>
          ))}
        </div>
      </div>

      {/* 30-Day Exposure Trajectory Chart */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Radiation className="h-4 w-4 text-[#D18A22]" />
              <span>30-Day Daily Absorbed Radiation Trajectory</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Daily dosimeter measurements showing baseline GCR rate vs acute SPE Solar Flare events.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#D18A22] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#D18A22]"></span> Daily Dose (mSv)
            </span>
            <span className="text-[#D93025] border border-[#FEE2E2] px-2.5 py-0.5 rounded-md bg-[#FEF2F2] text-[11px] font-semibold">
              Warning Limit: 1.50 mSv/day
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="radGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D18A22" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#D18A22" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
              <XAxis dataKey="date" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 4.0]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} unit=" mSv" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Area type="monotone" dataKey="dailyMsv" stroke="#D18A22" strokeWidth={2.5} fillOpacity={1} fill="url(#radGrad)" name="Daily Dose (mSv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* GCR vs SPE Breakdown & Solar Storm Haven Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Deep Space Radiation Environment Breakdown */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <Sun className="h-4 w-4 text-[#0071E3]" />
            <span>Deep Space Radiation Components</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1D1D1F]">
                <span>Galactic Cosmic Rays (GCR)</span>
                <span className="text-[#0071E3]">Steady Omnidirectional Flux</span>
              </div>
              <p className="text-[#6E6E73] leading-relaxed">
                High-energy protons and HZE nuclei originating outside the solar system. High linear energy transfer (LET) causing sustained biological micro-damage.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] space-y-1.5">
              <div className="flex items-center justify-between font-bold text-[#1D1D1F]">
                <span>Solar Particle Events (SPE)</span>
                <span className="text-[#D18A22]">Acute Coronal Injections</span>
              </div>
              <p className="text-[#6E6E73] leading-relaxed">
                Intermittent energetic proton surges following coronal mass ejections. Requires crew relocation to the Gateway Storm Shelter when flux exceeds 10 MeV threshold.
              </p>
            </div>
          </div>
        </div>

        {/* Countermeasures & Storm Haven Protocol */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-[#248A3D]" />
            <span>Radiation Shielding Countermeasures</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-[#248A3D]">
              <span className="font-semibold">Polyethylene Storm Bunker</span>
              <span className="font-bold">Operational (Ready)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-[#248A3D]">
              <span className="font-semibold">Active Water Wall Mass Buffers</span>
              <span className="font-bold">100% Volume Locked</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-[#248A3D]">
              <span className="font-semibold">AstroRad Personal Vest (Sarah)</span>
              <span className="font-bold">Deployed (In Use)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between text-[#1D1D1F]">
              <span className="font-medium">Antioxidant &amp; Radioprotectant Protocol</span>
              <span className="font-semibold text-[#0071E3]">Prescribed</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
