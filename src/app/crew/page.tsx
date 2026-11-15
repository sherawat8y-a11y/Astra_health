'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, 
  Heart, 
  Wind, 
  Moon, 
  Radiation, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle,
  UserCheck
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function CrewHealthPage() {
  const { astronauts, setSelectedAstronautId } = useTelemetry();

  const comparisonData = astronauts.map(a => ({
    name: a.code,
    fullName: a.name,
    heartRate: a.currentHr,
    baselineHr: a.baselineHr,
    spo2: a.currentSpo2,
    sleepHours: a.recentSleepDuration,
    stress: a.currentStress,
    dailyRad: a.dailyRadiationMsv,
    status: a.status
  }));

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

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Users className="h-4 w-4" />
            <span>Biomedical Surveillance Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Crew Health & Surveillance
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Comprehensive physiological monitoring and real-time comparative vitals across all 4 expeditionary crew members.
          </p>
        </div>

        <div className="flex items-center gap-2.5 text-xs font-medium">
          <div className="px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F]">
            Crew: <span className="text-[#0071E3] font-semibold">{astronauts.length} Active</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F]">
            Mission Day: <span className="text-[#0071E3] font-semibold">142 / 365</span>
          </div>
        </div>
      </div>

      {/* Crew Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {astronauts.map(astro => {
          const isCritical = astro.status === 'critical';
          const isElevated = astro.status === 'elevated';
          const avatarUrl = avatarMap[astro.id] || avatarMap[astro.code] || '/images/avatar-elena.png';

          return (
            <div 
              key={astro.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm hover:shadow transition-all ${
                isCritical 
                  ? 'border-[#D93025]/50 ring-1 ring-[#D93025]/20' 
                  : isElevated 
                  ? 'border-[#D18A22]/50 ring-1 ring-[#D18A22]/20' 
                  : 'border-[#E5E5EA]'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-[#E5E5EA] shadow-xs">
                      <Image src={avatarUrl} alt={astro.name} fill className="object-cover" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-[#1D1D1F] tracking-wide">
                        {astro.code} • {astro.rank}
                      </div>
                      <h3 className="font-bold text-[#1D1D1F] text-sm leading-tight">{astro.name}</h3>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                    isCritical 
                      ? 'bg-[#FEF2F2] text-[#D93025]' 
                      : isElevated 
                      ? 'bg-[#FFF3E0] text-[#D18A22]' 
                      : 'bg-[#E8F5E9] text-[#248A3D]'
                  }`}>
                    {astro.status === 'elevated' ? 'Review' : astro.status === 'critical' ? 'Alert' : 'Stable'}
                  </span>
                </div>

                <p className="text-xs text-[#6E6E73] mt-2.5 line-clamp-1">{astro.role}</p>

                {/* Key Physiological Metrics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-[#F5F5F7] text-xs">
                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#6E6E73] flex items-center gap-1 font-semibold uppercase">
                      <Heart className="h-3 w-3 text-[#D93025]" />
                      <span>Heart Rate</span>
                    </div>
                    <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">
                      {astro.currentHr} <span className="text-[10px] font-normal text-[#6E6E73]">BPM</span>
                    </div>
                    <div className="text-[9px] text-[#6E6E73]">Base: {astro.baselineHr}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#6E6E73] flex items-center gap-1 font-semibold uppercase">
                      <Wind className="h-3 w-3 text-[#0071E3]" />
                      <span>Oxygen (SpO2)</span>
                    </div>
                    <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">
                      {astro.currentSpo2}%
                    </div>
                    <div className="text-[9px] text-[#6E6E73]">Base: {astro.baselineSpo2}%</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#6E6E73] flex items-center gap-1 font-semibold uppercase">
                      <Radiation className="h-3 w-3 text-[#D18A22]" />
                      <span>Daily Dose</span>
                    </div>
                    <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">
                      {astro.dailyRadiationMsv} <span className="text-[10px] font-normal text-[#6E6E73]">mSv</span>
                    </div>
                    <div className="text-[9px] text-[#6E6E73]">Tot: {astro.cumulativeRadiationMsv}</div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
                    <div className="text-[10px] text-[#6E6E73] flex items-center gap-1 font-semibold uppercase">
                      <Moon className="h-3 w-3 text-[#0071E3]" />
                      <span>Sleep</span>
                    </div>
                    <div className="font-bold text-[#1D1D1F] text-sm mt-0.5">
                      {astro.recentSleepDuration} <span className="text-[10px] font-normal text-[#6E6E73]">hrs</span>
                    </div>
                    <div className="text-[9px] text-[#6E6E73]">Eff: {astro.recentSleepEfficiency}%</div>
                  </div>
                </div>

                {/* Active Alerts Banner if any */}
                {astro.activeAlertsCount > 0 ? (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FEE2E2] text-xs text-[#D93025] flex items-center gap-2 font-semibold">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{astro.activeAlertsCount} Active Protocol Alert(s)</span>
                  </div>
                ) : (
                  <div className="mt-3 p-2.5 rounded-xl bg-[#E8F5E9] border border-[#C8E6C9] text-xs text-[#248A3D] flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <span>Nominal Flight Telemetry</span>
                  </div>
                )}
              </div>

              {/* Action Link */}
              <div className="mt-4 pt-3 border-t border-[#F5F5F7]">
                <Link
                  href={`/profile?id=${astro.id}`}
                  onClick={() => setSelectedAstronautId(astro.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#F5F5F7] hover:bg-[#0071E3] text-[#0071E3] hover:text-white border border-[#E5E5EA] text-xs font-semibold transition-all shadow-xs"
                >
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>Inspect Health Dossier</span>
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Charts: Heart Rate & Radiation across the Crew */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Heart Rate vs Baseline Comparison */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Heart className="h-4 w-4 text-[#D93025]" />
              <span>Current vs Baseline Heart Rate (BPM)</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Assesses cardiovascular drift and microgravity fluid redistribution.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="name" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                <YAxis domain={[40, 100]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} unit=" bpm" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="baselineHr" name="Resting Baseline" fill="#2997FF" radius={[6, 6, 0, 0]} />
                <Bar dataKey="heartRate" name="Current Real-Time" fill="#0071E3" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Radiation vs Career Cumulative Exposure */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Radiation className="h-4 w-4 text-[#D18A22]" />
              <span>Daily Absorbed Radiation Dose (mSv/day)</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Identifies acute dosimeter spikes exceeding the 1.5 mSv/day operational threshold.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="name" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 4]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} unit=" mSv" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="dailyRad" name="Absorbed Daily Dose (mSv)" fill="#D18A22" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
}
