'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { 
  UserCheck, 
  Heart, 
  Activity, 
  Wind, 
  Thermometer, 
  Moon, 
  Dumbbell, 
  Smile, 
  Download, 
  Filter, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import EcgMonitor from '@/components/EcgMonitor';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

function ProfileLoadingSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-12 bg-white rounded-2xl w-1/3"></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-24 bg-white rounded-2xl"></div>
        ))}
      </div>
      <div className="h-64 bg-white rounded-2xl"></div>
    </div>
  );
}

function AstronautProfileContent() {
  const searchParams = useSearchParams();
  const queryId = searchParams.get('id');

  const { astronauts, selectedAstronautId, setSelectedAstronautId } = useTelemetry();

  // Active selected ID
  const activeId = queryId || selectedAstronautId || 'AST-0421';

  const [timeFilter, setTimeFilter] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeParamTab, setActiveParamTab] = useState<'hr' | 'bp' | 'spo2' | 'temp' | 'stress'>('hr');

  const avatarMap: Record<string, string> = {
    'AST-0421': '/images/avatar-elena.png',
    'AST-0422': '/images/avatar-marcus.png',
    'AST-0423': '/images/avatar-kenji.png',
    'AST-0424': '/images/avatar-sarah.png',
    'EVA-01': '/images/avatar-elena.png',
    'PLT-02': '/images/avatar-marcus.png',
    'MS-01': '/images/avatar-kenji.png',
    'MS-02': '/images/avatar-sarah.png',
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/astronauts/${activeId}?timeFilter=${timeFilter}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setProfileData(data);
          }
        }
      } catch (err) {
        console.error('Failed to load astronaut profile:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, [activeId, timeFilter]);

  const astro = profileData?.astronaut || astronauts.find(a => a.id === activeId) || astronauts[0];
  const latest = profileData?.latestReading || {};
  const readings = profileData?.readings || [];
  const alerts = profileData?.alerts || [];
  const avatarUrl = avatarMap[astro?.id] || avatarMap[astro?.code] || '/images/avatar-elena.png';

  const chartData = readings.map((r: any) => {
    const d = new Date(r.timestamp);
    const label = timeFilter === '24h' 
      ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      : `${d.getMonth() + 1}/${d.getDate()}`;

    return {
      label,
      heartRate: r.heartRate,
      systolic: r.systolicBp,
      diastolic: r.diastolicBp,
      spo2: r.spo2,
      temp: r.bodyTemp,
      stress: r.stressScore,
      exercise: r.exerciseMinutes
    };
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Astronaut Header Bar */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-full overflow-hidden shrink-0 border border-[#E5E5EA] shadow-xs">
            <Image src={avatarUrl} alt={astro?.name || 'Astronaut'} fill className="object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
              <UserCheck className="h-4 w-4" />
              <span>Biomedical Dossier • Longitudinal Spaceflight</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-0.5">
              {astro?.rank} {astro?.name} ({astro?.code})
            </h1>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              {astro?.role} • Age {astro?.age} • Blood Type {astro?.bloodType} • Day 142 of 365
            </p>
          </div>
        </div>

        {/* Quick Switcher & PDF Download */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-1">
            {astronauts.map(a => (
              <button
                key={a.id}
                onClick={() => {
                  setSelectedAstronautId(a.id);
                  window.history.pushState(null, '', `/profile?id=${a.id}`);
                }}
                className={`px-3 py-1.5 rounded-lg transition-all font-semibold ${
                  activeId === a.id
                    ? 'bg-white text-[#0071E3] shadow-xs'
                    : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                }`}
              >
                {a.code}
              </button>
            ))}
          </div>

          <a
            href={`/api/reports/download?astronautId=${activeId}`}
            download
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0071E3] hover:bg-[#0077ED] text-white font-semibold shadow-xs transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Download PDF Report</span>
          </a>
        </div>
      </div>

      {/* 10 Health Parameters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* 1. Heart Rate */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">1. Heart Rate</span>
            <Heart className="h-4 w-4 text-[#D93025]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.heartRate || astro?.baselineHr} <span className="text-xs font-normal text-[#6E6E73]">BPM</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">Baseline: {astro?.baselineHr} BPM</div>
        </div>

        {/* 2. Blood Pressure */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">2. Blood Pressure</span>
            <Activity className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-xl font-bold text-[#1D1D1F]">
            {latest?.systolicBp || astro?.baselineSys}/{latest?.diastolicBp || astro?.baselineDia} <span className="text-xs font-normal text-[#6E6E73]">mmHg</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">Baseline: {astro?.baselineSys}/{astro?.baselineDia}</div>
        </div>

        {/* 3. SpO2 */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">3. Oxygen (SpO2)</span>
            <Wind className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.spo2 || astro?.baselineSpo2}%
          </div>
          <div className="text-[11px] text-[#6E6E73]">Baseline: {astro?.baselineSpo2}%</div>
        </div>

        {/* 4. Core Body Temperature */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">4. Core Temp</span>
            <Thermometer className="h-4 w-4 text-[#D18A22]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.bodyTemp || astro?.baselineTemp}°C
          </div>
          <div className="text-[11px] text-[#6E6E73]">Baseline: {astro?.baselineTemp}°C</div>
        </div>

        {/* 5. Respiratory Rate */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">5. Resp Rate</span>
            <Activity className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.respiratoryRate || astro?.baselineResp} <span className="text-xs font-normal text-[#6E6E73]">br/min</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">Baseline: {astro?.baselineResp} br/min</div>
        </div>

        {/* 6. ECG Status */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#0071E3]">
            <span className="text-xs font-medium">6. ECG Status</span>
            <Activity className="h-4 w-4 text-[#0071E3] animate-pulse" />
          </div>
          <div className="text-sm font-bold text-[#0071E3] mt-1">
            Normal Sinus Rhythm
          </div>
          <div className="text-[11px] text-[#6E6E73]">Lead II Vector Lock</div>
        </div>

        {/* 7. Sleep Duration */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">7. Sleep Duration</span>
            <Moon className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {astro?.baselineSleep} <span className="text-xs font-normal text-[#6E6E73]">hrs</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">Efficiency: 88%</div>
        </div>

        {/* 8. Stress Level */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">8. Stress Index</span>
            <Sparkles className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.stressScore || 35} <span className="text-xs font-normal text-[#6E6E73]">/ 100</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">HRV Autonomic</div>
        </div>

        {/* 9. Mood Score */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">9. Mood Score</span>
            <Smile className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.moodScore || 8.0} <span className="text-xs font-normal text-[#6E6E73]">/ 10</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">Daily Check-in</div>
        </div>

        {/* 10. Exercise Duration */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73]">
            <span className="text-xs font-medium">10. Exercise</span>
            <Dumbbell className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-2xl font-bold text-[#1D1D1F]">
            {latest?.exerciseMinutes || 120} <span className="text-xs font-normal text-[#6E6E73]">mins</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">ARED + T2 Ergometer</div>
        </div>

      </div>

      {/* Real-time ECG Waveform in Dark Navy Telemetry Container */}
      <div className="bg-[#101B2B] rounded-2xl border border-[#1D2D44] p-5 shadow-lg text-white">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#26C6E8] animate-pulse" />
            <h2 className="text-base font-semibold text-white">
              Real-Time Vector Surveillance: {astro?.name} ({astro?.code})
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#248A3D]/20 text-[#248A3D] text-[11px] font-semibold">
            • Lead II Locked
          </span>
        </div>
        <div className="w-full overflow-hidden rounded-xl bg-[#101B2B]">
          <EcgMonitor
            heartRate={latest?.heartRate || astro?.baselineHr || 65}
            status={astro?.status || 'nominal'}
            height={120}
            bare={true}
          />
        </div>
      </div>

      {/* Time Filters & Interactive Historical Trend Visualizer */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5F5F7]">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Activity className="h-4 w-4 text-[#0071E3]" />
              <span>Longitudinal Physiological Telemetry</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Multi-epoch time-series comparison against astronaut personal baseline.
            </p>
          </div>

          {/* Time Filter Buttons */}
          <div className="flex items-center gap-2">
            <div className="flex bg-[#F5F5F7] border border-[#E5E5EA] rounded-xl p-1 text-xs">
              {(['24h', '7d', '30d', 'all'] as const).map(tf => (
                <button
                  key={tf}
                  onClick={() => setTimeFilter(tf)}
                  className={`px-3 py-1 rounded-lg transition-all font-semibold ${
                    timeFilter === tf
                      ? 'bg-white text-[#0071E3] shadow-xs'
                      : 'text-[#6E6E73] hover:text-[#1D1D1F]'
                  }`}
                >
                  {tf === '24h' ? 'Last 24h' : tf === '7d' ? 'Last 7 Days' : tf === '30d' ? 'Last 30 Days' : 'Full Mission'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Metric Selector Tabs */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            { id: 'hr', label: 'Heart Rate (BPM)' },
            { id: 'bp', label: 'Blood Pressure (mmHg)' },
            { id: 'spo2', label: 'Oxygen Saturation (%)' },
            { id: 'temp', label: 'Core Temp (°C)' },
            { id: 'stress', label: 'Autonomic Stress Index' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveParamTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl border transition-all font-medium ${
                activeParamTab === tab.id
                  ? 'bg-[#0071E3] text-white border-[#0071E3] shadow-xs font-semibold'
                  : 'bg-[#F5F5F7] text-[#6E6E73] border-[#E5E5EA] hover:text-[#1D1D1F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Chart View */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071E3" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#0071E3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
              <XAxis dataKey="label" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
              <YAxis 
                stroke="#6E6E73" 
                tick={{ fontSize: 11, fill: '#6E6E73' }}
                axisLine={false}
                tickLine={false}
                domain={
                  activeParamTab === 'hr' ? [45, 110] :
                  activeParamTab === 'spo2' ? [92, 100] :
                  activeParamTab === 'temp' ? [36.0, 38.0] :
                  activeParamTab === 'stress' ? [0, 100] : ['auto', 'auto']
                }
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
              />
              {activeParamTab === 'hr' && (
                <Area type="monotone" dataKey="heartRate" stroke="#0071E3" strokeWidth={2.5} fillOpacity={1} fill="url(#areaGradient)" name="Heart Rate (BPM)" />
              )}
              {activeParamTab === 'bp' && (
                <>
                  <Area type="monotone" dataKey="systolic" stroke="#0071E3" strokeWidth={2} fill="none" name="Systolic (mmHg)" />
                  <Area type="monotone" dataKey="diastolic" stroke="#2997FF" strokeWidth={1.8} fill="none" name="Diastolic (mmHg)" />
                </>
              )}
              {activeParamTab === 'spo2' && (
                <Area type="monotone" dataKey="spo2" stroke="#248A3D" strokeWidth={2.2} fillOpacity={1} fill="url(#areaGradient)" name="SpO2 (%)" />
              )}
              {activeParamTab === 'temp' && (
                <Area type="monotone" dataKey="temp" stroke="#D18A22" strokeWidth={2.2} fillOpacity={1} fill="url(#areaGradient)" name="Core Temp (°C)" />
              )}
              {activeParamTab === 'stress' && (
                <Area type="monotone" dataKey="stress" stroke="#8E8E93" strokeWidth={2.2} fillOpacity={1} fill="url(#areaGradient)" name="Stress Score (0-100)" />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Alerts for this Astronaut */}
      {alerts.length > 0 && (
        <div className="bg-[#FEF2F2] rounded-2xl border border-[#FEE2E2] p-6 space-y-3 shadow-xs">
          <div className="flex items-center gap-2 text-xs uppercase text-[#D93025] font-bold tracking-wide">
            <AlertTriangle className="h-4 w-4" />
            <span>Active Medical Protocol Alerts for {astro?.name}</span>
          </div>

          <div className="space-y-3">
            {alerts.map((al: any) => (
              <div key={al.id} className="p-4 rounded-xl border border-[#FEE2E2] bg-white text-xs space-y-1.5 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#1D1D1F] text-sm">[{al.severity.toUpperCase()}] {al.title}</span>
                  <span className="text-[#6E6E73] text-[11px]">{new Date(al.timestamp).toLocaleString()}</span>
                </div>
                <div className="text-[#6E6E73]">
                  <span className="text-[#0071E3] font-medium">Parameter:</span> {al.parameter} • <span className="text-[#0071E3] font-medium">Observed:</span> {al.observedValue} (Base: {al.baselineValue})
                </div>
                <p className="text-[#6E6E73] text-xs pt-1">{al.reason}</p>
                <div className="pt-2 text-[#D93025] text-xs font-medium">
                  <span className="font-bold">Protocol Action:</span> {al.recommendedAction}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

export default function AstronautProfilePage() {
  return (
    <Suspense fallback={<ProfileLoadingSkeleton />}>
      <AstronautProfileContent />
    </Suspense>
  );
}
