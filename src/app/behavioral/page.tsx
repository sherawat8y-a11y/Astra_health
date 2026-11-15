'use client';

import React, { useState, useEffect } from 'react';
import { 
  Moon, 
  Activity, 
  Sparkles, 
  Brain, 
  Lock,
  Lightbulb,
  CheckCircle2
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

export default function BehavioralHealthPage() {
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
  const sleepRecords = profileData?.sleepRecords || [];
  const wellnessRecords = profileData?.wellnessRecords || [];

  const latestSleep = sleepRecords[sleepRecords.length - 1] || {
    durationHours: astro?.baselineSleep || 7.4,
    deepSleepPct: 22.5,
    remSleepPct: 24.0,
    lightSleepPct: 53.5,
    efficiencyPct: 88,
    latencyMinutes: 18,
    disruptionsCount: 2
  };

  const latestWellness = wellnessRecords[wellnessRecords.length - 1] || {
    moodValence: 8.0,
    energyLevel: 7.5,
    teamCohesion: 8.8,
    cognitivePvtMs: 224,
    subjectiveFatigue: 2.6
  };

  const sleepChartData = sleepRecords.slice(-14).map((s: any) => {
    const d = new Date(s.date);
    return {
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      duration: s.durationHours,
      efficiency: s.efficiencyPct,
      deep: s.deepSleepPct,
      rem: s.remSleepPct
    };
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Moon className="h-4 w-4" />
            <span>Neuro-Performance &amp; Circadian Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Behavioral Health &amp; Sleep
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Surveillance of sleep architecture, circadian rhythm alignment, Psychomotor Vigilance Task (PVT) latency, and cognitive resilience.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-medium text-[#6E6E73] shadow-xs">
          <Lock className="h-4 w-4 text-[#0071E3]" />
          <span>NASA Behavioral Health Privacy Protocol Protected</span>
        </div>
      </div>

      {/* Astronaut Selector */}
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E5E5EA] text-xs shadow-sm">
        <span className="text-[#6E6E73] font-medium">Subject:</span>
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
              {a.code} — {a.name}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Behavioral & Sleep KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Sleep Duration */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Sleep Duration</span>
            <Moon className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {latestSleep.durationHours} <span className="text-xs font-normal text-[#6E6E73]">hrs</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Target: {astro?.baselineSleep} hrs • Latency: {latestSleep.latencyMinutes} min
          </div>
        </div>

        {/* Sleep Efficiency */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Sleep Efficiency</span>
            <Sparkles className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-3xl font-extrabold text-[#248A3D] tracking-tight">
            {latestSleep.efficiencyPct}%
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Deep: {latestSleep.deepSleepPct}% • REM: {latestSleep.remSleepPct}%
          </div>
        </div>

        {/* PVT Cognitive Reaction Time */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">PVT Reaction Time</span>
            <Brain className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0071E3] tracking-tight">
            {latestWellness.cognitivePvtMs} <span className="text-xs font-normal text-[#6E6E73]">ms</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Nominal Vigilance Baseline: &lt; 250 ms
          </div>
        </div>

        {/* Samn-Perelli Fatigue Scale */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Subjective Fatigue</span>
            <Activity className="h-4 w-4 text-[#D18A22]" />
          </div>
          <div className="text-3xl font-extrabold text-[#D18A22] tracking-tight">
            {latestWellness.subjectiveFatigue} <span className="text-xs font-normal text-[#6E6E73]">/ 7.0</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Samn-Perelli Scale (1=Alert, 7=Exhausted)
          </div>
        </div>

      </div>

      {/* 14-Day Sleep Duration & Efficiency Chart */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Moon className="h-4 w-4 text-[#0071E3]" />
              <span>14-Day Sleep Duration Architecture</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Identifies acute circadian phase shifts and restorative slow-wave sleep cycles.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-[#0071E3] font-semibold">
              <span className="h-2 w-2 rounded-full bg-[#0071E3]"></span> Sleep Duration (hrs)
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sleepChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="sleepGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071E3" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
              <XAxis dataKey="date" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
              <YAxis domain={[3, 10]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} unit="h" axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              <Area type="monotone" dataKey="duration" stroke="#0071E3" strokeWidth={2.5} fillOpacity={1} fill="url(#sleepGrad)" name="Sleep Duration (hrs)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Wellness & Circadian Countermeasures */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Psychological Assessment */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <Brain className="h-4 w-4 text-[#0071E3]" />
            <span>Psychological &amp; Cohesion Indices</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
              <span className="text-[#6E6E73] font-medium">Mood Valence Index</span>
              <span className="font-bold text-[#248A3D] text-sm">{latestWellness.moodValence} / 10.0 (Positive)</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
              <span className="text-[#6E6E73] font-medium">Subjective Energy Level</span>
              <span className="font-bold text-[#0071E3] text-sm">{latestWellness.energyLevel} / 10.0</span>
            </div>
            <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between">
              <span className="text-[#6E6E73] font-medium">Expedition Team Cohesion</span>
              <span className="font-bold text-[#248A3D] text-sm">{latestWellness.teamCohesion} / 10.0 (High)</span>
            </div>
          </div>
        </div>

        {/* Countermeasures Protocol */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
          <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#D18A22]" />
            <span>Circadian &amp; Rest Countermeasures</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-[#248A3D]">
              <span className="font-medium">Cabin Spectrum Modulation</span>
              <span className="font-bold">Active (480nm Morning Phase)</span>
            </div>
            <div className="p-3 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] flex items-center justify-between text-[#248A3D]">
              <span className="font-medium">Sleep Hygiene Quarters Sound-Damping</span>
              <span className="font-bold">&lt; 45 dBA Target Met</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between text-[#1D1D1F]">
              <span className="font-medium">Exogenous Melatonin Protocol</span>
              <span className="font-semibold text-[#6E6E73]">Held in Reserve</span>
            </div>
            <div className="p-3 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] flex items-center justify-between text-[#1D1D1F]">
              <span className="font-medium">Virtual Earth Reality Relaxation</span>
              <span className="font-semibold text-[#0071E3]">Scheduled 20:00 UTC</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
