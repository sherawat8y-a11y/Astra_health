'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Heart, 
  Users, 
  AlertTriangle, 
  Droplets, 
  Moon, 
  Radiation, 
  MoreHorizontal, 
  ChevronDown, 
  ChevronRight,
  Activity,
  ArrowRight
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import EcgMonitor from '@/components/EcgMonitor';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Cell,
  Tooltip
} from 'recharts';

// Helper for curved Apple-style SVG sparklines
function SmoothSparkline({ 
  data, 
  color = '#0071E3', 
  height = 24 
}: { 
  data: number[]; 
  color?: string; 
  height?: number 
}) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const width = 100;

  const points = data.map((val, idx) => ({
    x: (idx / (data.length - 1)) * width,
    y: height - ((val - min) / range) * (height - 8) - 4
  }));

  // Build quadratic bezier curve path
  let path = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    path += ` Q ${p0.x},${p0.y} ${midX},${midY}`;
  }
  path += ` T ${points[points.length - 1].x},${points[points.length - 1].y}`;

  return (
    <svg className="w-full overflow-visible" height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <path 
        d={path} 
        stroke={color} 
        strokeWidth="2.2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}

export default function MissionCommandCenter() {
  const { 
    missionData, 
    astronauts, 
    activeAlerts, 
    selectedAstronautId, 
    setSelectedAstronautId 
  } = useTelemetry();

  const [radiationRange, setRadiationRange] = useState<'7d' | '14d' | '30d'>('7d');

  // Radiation 7-day data matching reference image
  const radiationData = [
    { day: 'Nov 8', exposure: 0.45 },
    { day: 'Nov 9', exposure: 0.48 },
    { day: 'Nov 10', exposure: 0.50 },
    { day: 'Nov 11', exposure: 0.58 },
    { day: 'Nov 12', exposure: 0.65 },
    { day: 'Nov 13', exposure: 0.72 },
    { day: 'Nov 14', exposure: 1.33, isEvent: true },
  ];

  // Astronaut metadata matching reference image
  const crewProfiles = [
    {
      id: 'AST-0421',
      code: 'EVA-01',
      name: 'Dr. Elena Vance',
      role: 'Commander',
      avatar: '/images/avatar-elena.png',
      status: 'Stable',
      statusType: 'stable',
      hr: '64 BPM',
      spo2: '99%',
      sleep: '7.8 h',
      sparkData: [62, 63, 61, 65, 64, 63, 64],
      sparkColor: '#0071E3'
    },
    {
      id: 'AST-0422',
      code: 'PLT-02',
      name: 'Col. Marcus Hayes',
      role: 'Pilot',
      avatar: '/images/avatar-marcus.png',
      status: 'Stable',
      statusType: 'stable',
      hr: '56 BPM',
      spo2: '99.2%',
      sleep: '7.9 h',
      sparkData: [58, 57, 56, 58, 55, 56, 56],
      sparkColor: '#0071E3'
    },
    {
      id: 'AST-0423',
      code: 'MS-01',
      name: 'Dr. Kenji Sato',
      role: 'Mission Specialist',
      avatar: '/images/avatar-kenji.png',
      status: 'Stable',
      statusType: 'stable',
      hr: '63 BPM',
      spo2: '98.6%',
      sleep: '7.4 h',
      sparkData: [64, 62, 65, 63, 62, 64, 63],
      sparkColor: '#0071E3'
    },
    {
      id: 'AST-0424',
      code: 'MS-02',
      name: 'Dr. Sarah Lindqvist',
      role: 'Flight Engineer',
      avatar: '/images/avatar-sarah.png',
      status: 'Review',
      statusType: 'review',
      hr: '68 BPM',
      spo2: '98.1%',
      sleep: '6.9 h',
      sparkData: [60, 62, 63, 65, 67, 66, 68],
      sparkColor: '#D18A22'
    }
  ];

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">

      {/* =========================================================================
          HERO BANNER: Apple minimal heading with right-aligned astronaut art
          ========================================================================= */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E5E5EA] p-6 lg:p-8 flex items-center justify-between shadow-sm min-h-[140px]">
        <div className="z-10 max-w-2xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1D1D1F] tracking-tight">
            Mission Command Center
          </h1>
          <p className="text-sm sm:text-base text-[#6E6E73] mt-1.5 font-normal">
            Precision health intelligence for humans exploring beyond Earth.
          </p>
        </div>

        {/* Astronaut Artwork */}
        <div className="absolute right-0 top-0 bottom-0 w-[280px] sm:w-[340px] pointer-events-none hidden md:block">
          <div className="relative w-full h-full">
            <Image
              src="/images/hero-astronaut.png"
              alt="Astronaut exploring beyond Earth"
              fill
              className="object-cover object-left-top"
              priority
            />
            {/* Soft left gradient fade into white background */}
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
          </div>
        </div>
      </div>

      {/* =========================================================================
          6 WHITE METRIC CARDS (Apple Design System)
          ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        
        {/* CARD 1: Crew Monitored */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Crew Monitored</div>
            <Users className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              4
            </div>
            <div className="text-xs font-semibold text-[#248A3D] mt-0.5">
              All Active
            </div>
          </div>
          <div className="flex items-center -space-x-1.5 pt-1">
            {crewProfiles.map((c) => (
              <div key={c.id} className="relative w-6 h-6 rounded-full border-2 border-white overflow-hidden shadow-xs">
                <Image src={c.avatar} alt={c.name} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* CARD 2: Active Health Alerts */}
        <Link 
          href="/alerts"
          className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Active Health Alerts</div>
            <AlertTriangle className="w-4 h-4 text-[#D93025] group-hover:scale-110 transition-transform" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              2
            </div>
            <div className="text-xs text-[#6E6E73] mt-1 flex items-center gap-1.5 whitespace-nowrap">
              <span className="flex items-center gap-1 text-[#D93025] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D93025]"></span>
                1 Critical
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-[#D18A22] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D18A22]"></span>
                1 Warning
              </span>
            </div>
          </div>
          <div className="text-[11px] font-semibold text-[#0071E3] group-hover:underline flex items-center gap-1 pt-1">
            <span>Review triage</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </Link>

        {/* CARD 3: Avg Heart Rate */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Avg Heart Rate</div>
            <Heart className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              61 <span className="text-xs font-semibold text-[#6E6E73] tracking-normal">BPM</span>
            </div>
            <div className="text-xs font-semibold text-[#248A3D] mt-0.5">
              ↓ -3% vs. baseline
            </div>
          </div>
          <div className="pt-1">
            <SmoothSparkline data={[64, 63, 62, 60, 61, 59, 61]} color="#0071E3" height={22} />
          </div>
        </div>

        {/* CARD 4: Avg SpO2 */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Avg SpO₂</div>
            <Droplets className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              98.8%
            </div>
            <div className="text-xs font-semibold text-[#248A3D] mt-0.5">
              ↑ +0.4%
            </div>
          </div>
          <div className="pt-1">
            <SmoothSparkline data={[98.4, 98.5, 98.6, 98.7, 98.7, 98.8, 98.8]} color="#0071E3" height={22} />
          </div>
        </div>

        {/* CARD 5: Avg Sleep */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Avg Sleep</div>
            <Moon className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              7.7 h
            </div>
            <div className="text-xs font-semibold text-[#248A3D] mt-0.5">
              ↑ +0.6 h
            </div>
          </div>
          <div className="pt-1">
            <SmoothSparkline data={[7.1, 7.2, 7.3, 7.5, 7.4, 7.6, 7.7]} color="#0071E3" height={22} />
          </div>
        </div>

        {/* CARD 6: Daily Radiation */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-4 flex flex-col justify-between shadow-sm hover:shadow transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs font-semibold text-[#1D1D1F]">Daily Radiation</div>
            <Radiation className="w-4 h-4 text-[#0071E3]" />
          </div>
          <div className="my-2">
            <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
              1.33 <span className="text-xs font-semibold text-[#6E6E73] tracking-normal">mSv</span>
            </div>
            <div className="text-xs font-semibold text-[#D93025] mt-0.5">
              ↑ +143% (Event)
            </div>
          </div>
          <div className="pt-1">
            <SmoothSparkline data={[0.45, 0.48, 0.50, 0.58, 0.65, 0.72, 1.33]} color="#D93025" height={22} />
          </div>
        </div>

      </div>

      {/* =========================================================================
          SIGNATURE TELEMETRY PANELS (DARK NAVY BACKGROUND)
          Panel 1: Cardiovascular Telemetry (Lead II ECG)
          Panel 2: Radiation Exposure (Bar Chart)
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* TELEMETRY PANEL 1: Cardiovascular Telemetry */}
        <div className="bg-[#101B2B] rounded-2xl border border-[#1D2D44] p-5 shadow-lg flex flex-col justify-between text-white">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-gray-300" />
                <h2 className="text-base font-semibold text-white">
                  Cardiovascular Telemetry
                </h2>
                <span className="ml-1 px-2 py-0.5 rounded-full bg-[#248A3D]/20 text-[#248A3D] text-[11px] font-semibold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#248A3D] animate-pulse"></span>
                  Live
                </span>
              </div>
              <button 
                className="text-gray-400 hover:text-white p-1 rounded transition-colors"
                title="Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics Row */}
            <div className="flex items-end justify-between mb-4">
              <div className="flex items-center gap-3">
                <Heart className="w-7 h-7 text-[#26C6E8] fill-[#26C6E8] animate-pulse" />
                <div>
                  <div className="text-4xl font-extrabold text-white tracking-tight font-mono">
                    61 <span className="text-sm font-normal text-gray-400">BPM</span>
                  </div>
                  <div className="text-xs text-[#94A3B8] font-medium mt-0.5">
                    Normal Rhythm
                  </div>
                </div>
              </div>

              {/* Interval readings */}
              <div className="text-right text-xs font-mono text-[#94A3B8] space-y-0.5">
                <div>PR <span className="text-white font-semibold ml-2">156 ms</span></div>
                <div>QRS <span className="text-white font-semibold ml-2">88 ms</span></div>
                <div>QTc <span className="text-white font-semibold ml-2">412 ms</span></div>
              </div>
            </div>
          </div>

          {/* Lead II Waveform */}
          <div className="mt-2 w-full overflow-hidden rounded-xl bg-[#101B2B]">
            <EcgMonitor heartRate={61} status="nominal" height={130} bare={true} />
          </div>
        </div>

        {/* TELEMETRY PANEL 2: Radiation Exposure */}
        <div className="bg-[#101B2B] rounded-2xl border border-[#1D2D44] p-5 shadow-lg flex flex-col justify-between text-white">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Radiation className="w-5 h-5 text-[#26C6E8]" />
                <h2 className="text-base font-semibold text-white">
                  Radiation Exposure
                </h2>
              </div>

              {/* 7 Days selector pill */}
              <div className="relative">
                <button 
                  onClick={() => setRadiationRange(prev => prev === '7d' ? '14d' : '7d')}
                  className="bg-[#162338] border border-[#1D2D44] text-xs text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:bg-[#1D2D44] transition-colors"
                >
                  <span>{radiationRange === '7d' ? '7 Days' : '14 Days'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Metrics Row */}
            <div className="mb-3">
              <div className="text-3xl font-extrabold text-white tracking-tight font-mono">
                1.33 <span className="text-base font-normal text-gray-400">mSv / day</span>
              </div>
              <div className="text-xs text-[#94A3B8] mt-0.5">
                Cumulative: 189.6 mSv
              </div>
            </div>
          </div>

          {/* Radiation Bar Chart */}
          <div className="h-[145px] w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={radiationData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1D2D44" vertical={false} />
                <XAxis 
                  dataKey="day" 
                  stroke="#64748B" 
                  tick={{ fontSize: 11, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <YAxis 
                  domain={[0, 2.0]} 
                  ticks={[0, 0.5, 1.0, 1.5, 2.0]} 
                  stroke="#64748B" 
                  tick={{ fontSize: 10, fill: '#94A3B8' }} 
                  axisLine={false} 
                  tickLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#162338', 
                    borderColor: '#1D2D44', 
                    borderRadius: '8px', 
                    fontSize: '11px', 
                    color: '#FFFFFF' 
                  }}
                  formatter={(value: any) => [`${value} mSv/d`, 'Dosimeter']}
                />
                <Bar dataKey="exposure" radius={[4, 4, 0, 0]}>
                  {radiationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isEvent ? '#26C6E8' : '#1D4ED8'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* =========================================================================
          LOWER SECTION:
          LEFT: Crew Monitoring (4 Astronaut Cards)
          RIGHT: Active Alerts (2 Cards)
          ========================================================================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* LEFT SECTION: CREW MONITORING (8 Cols) */}
        <div className="xl:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              Crew Monitoring
            </h2>
            <Link 
              href="/crew" 
              className="text-sm font-semibold text-[#0071E3] hover:underline flex items-center gap-1"
            >
              <span>View All Crew</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {crewProfiles.map((astro) => {
              const isSelected = astro.id === selectedAstronautId;
              const isReview = astro.statusType === 'review';

              return (
                <div
                  key={astro.id}
                  onClick={() => setSelectedAstronautId(astro.id)}
                  className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected ? 'ring-2 ring-[#0071E3] border-transparent' : 'border-[#E5E5EA]'
                  }`}
                >
                  <div>
                    {/* Astronaut Photo + Role */}
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#E5E5EA] shadow-xs">
                        <Image src={astro.avatar} alt={astro.name} fill className="object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[#1D1D1F] tracking-wide">
                          {astro.code}
                        </div>
                        <div className="text-xs font-semibold text-[#1D1D1F] truncate">
                          {astro.name}
                        </div>
                        <div className="text-[10px] text-[#6E6E73] truncate">
                          {astro.role}
                        </div>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                        isReview 
                          ? 'bg-[#FFF3E0] text-[#D18A22]' 
                          : 'bg-[#E8F5E9] text-[#248A3D]'
                      }`}>
                        {astro.status}
                      </span>
                    </div>
                  </div>

                  {/* Vitals Snapshot + Sparkline */}
                  <div className="mt-4 pt-3 border-t border-[#F5F5F7] flex items-end justify-between">
                    <div className="space-y-1 text-xs font-semibold text-[#1D1D1F]">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span>{astro.hr}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Droplets className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span>{astro.spo2}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Moon className="w-3.5 h-3.5 text-[#6E6E73]" />
                        <span>{astro.sleep}</span>
                      </div>
                    </div>

                    {/* Mini Sparkline */}
                    <div className="w-20 pl-2">
                      <SmoothSparkline 
                        data={astro.sparkData} 
                        color={astro.sparkColor} 
                        height={26} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SECTION: ACTIVE ALERTS (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#1D1D1F]">
              Active Alerts ({activeAlerts.length || 2})
            </h2>
            <Link 
              href="/alerts" 
              className="text-sm font-semibold text-[#0071E3] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">

            {/* ALERT 1: Radiation Exposure Rate (Critical) */}
            <Link 
              href="/alerts"
              className="block bg-[#FEF2F2] border border-[#FEE2E2] rounded-2xl p-4 shadow-xs hover:shadow transition-all group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEE2E2] flex items-center justify-center shrink-0 text-[#D93025]">
                  <Radiation className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1D1D1F] truncate">
                      Radiation Exposure Rate
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                    Dosimeter rate 3.65 mSv exceeds operational ceiling by 143%.
                  </p>
                  <div className="text-[11px] text-[#6E6E73] font-medium mt-2">
                    10:24 UTC
                  </div>
                </div>
              </div>
            </Link>

            {/* ALERT 2: Elevated Heart Rate (Warning) */}
            <Link 
              href="/alerts"
              className="block bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-4 shadow-xs hover:shadow transition-all group"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#D18A22]">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-[#1D1D1F] truncate">
                      Elevated Heart Rate
                    </h3>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF] group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <p className="text-xs text-[#6E6E73] mt-1 leading-relaxed">
                    Sustained increase detected for MS-02 (68 BPM).
                  </p>
                  <div className="text-[11px] text-[#6E6E73] font-medium mt-2">
                    09:47 UTC
                  </div>
                </div>
              </div>
            </Link>

          </div>
        </div>

      </div>

    </div>
  );
}
