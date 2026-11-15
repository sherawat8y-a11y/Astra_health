'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Activity, 
  Info, 
  TrendingDown, 
  ShieldCheck
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Legend 
} from 'recharts';

export default function MusculoskeletalPage() {
  const { astronauts, selectedAstronautId, setSelectedAstronautId } = useTelemetry();
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/astronauts/${selectedAstronautId}?timeFilter=all`);
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
  const boneMuscleRecords = profileData?.boneMuscleRecords || [];
  const latestRecord = boneMuscleRecords[boneMuscleRecords.length - 1] || {
    bmdTScoreSpine: -0.72,
    bmdTScoreFemur: -0.85,
    gripStrengthKg: 46.5,
    aredCompliancePct: 96,
    calciumIntakeMg: 1250,
    vitaminDIu: 2000
  };

  const bmdChartData = boneMuscleRecords.map((r: any, idx: number) => ({
    month: `Month ${idx + 1}`,
    date: r.recordedDate,
    spineT: r.bmdTScoreSpine,
    femurT: r.bmdTScoreFemur,
    gripStrength: r.gripStrengthKg,
    aredCompliance: r.aredCompliancePct
  }));

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-10">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0071E3] uppercase tracking-wide">
            <Dumbbell className="h-4 w-4" />
            <span>Countermeasure Conditioning Deck</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight mt-1">
            Bone &amp; Muscle Health
          </h1>
          <p className="text-sm text-[#6E6E73] mt-1 max-w-2xl">
            Surveillance of microgravity bone mineral density (BMD) demineralization, isometric muscle torque, and ARED protocol compliance.
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA] text-xs text-[#6E6E73] max-w-md shadow-xs">
          <div className="flex items-center gap-1.5 text-[#0071E3] font-semibold mb-0.5">
            <Info className="h-3.5 w-3.5" />
            <span>SCIENTIFIC CLARIFICATION</span>
          </div>
          <p className="text-[11px] leading-tight">
            Wearable telemetry sensors do not directly measure bone density. Periodic quantitative ultrasound, HR-pQCT scans, and calibrated ARED mechanical load sensors are used.
          </p>
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

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Lumbar Spine BMD T-Score */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Lumbar Spine BMD</span>
            <TrendingDown className="h-4 w-4 text-[#D18A22]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {latestRecord.bmdTScoreSpine} <span className="text-xs font-normal text-[#6E6E73]">T-score</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Nominal Space Benchmark: &gt; -1.0 SD
          </div>
        </div>

        {/* Femoral Neck BMD T-Score */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Femoral Neck BMD</span>
            <TrendingDown className="h-4 w-4 text-[#D18A22]" />
          </div>
          <div className="text-3xl font-extrabold text-[#1D1D1F] tracking-tight">
            {latestRecord.bmdTScoreFemur} <span className="text-xs font-normal text-[#6E6E73]">T-score</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Resorption rate: -0.9%/mo
          </div>
        </div>

        {/* Isometric Grip Strength */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">Isometric Grip Force</span>
            <Activity className="h-4 w-4 text-[#0071E3]" />
          </div>
          <div className="text-3xl font-extrabold text-[#0071E3] tracking-tight">
            {latestRecord.gripStrengthKg} <span className="text-xs font-normal text-[#6E6E73]">kg</span>
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            Calibrated Dynamometer • 94% pre-flight
          </div>
        </div>

        {/* ARED Prescription Compliance */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-5 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-[#6E6E73] text-xs">
            <span className="font-medium">ARED Compliance</span>
            <ShieldCheck className="h-4 w-4 text-[#248A3D]" />
          </div>
          <div className="text-3xl font-extrabold text-[#248A3D] tracking-tight">
            {latestRecord.aredCompliancePct}%
          </div>
          <div className="text-[11px] text-[#6E6E73]">
            2.5h daily target (Squats, Deadlifts)
          </div>
        </div>

      </div>

      {/* Monthly BMD Degradation & Grip Strength Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* BMD T-Score Monthly Trajectory */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-[#0071E3]" />
              <span>Periodic Bone Mineral Density (T-Score)</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Longitudinal scan trajectory comparing lumbar spine and femoral neck.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bmdChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="month" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                <YAxis domain={[-1.5, 0]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="spineT" name="Spine BMD (T-score)" stroke="#0071E3" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="femurT" name="Femur BMD (T-score)" stroke="#D18A22" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Isometric Muscle Strength Trajectory */}
        <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-[#248A3D]" />
              <span>Isometric Muscle Strength Retention (kg)</span>
            </h2>
            <p className="text-xs text-[#6E6E73] mt-0.5">
              Monthly handgrip dynamometer measurements reflecting neuromuscular conditioning.
            </p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bmdChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F2" vertical={false} />
                <XAxis dataKey="month" stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} axisLine={false} tickLine={false} />
                <YAxis domain={[35, 55]} stroke="#6E6E73" tick={{ fontSize: 11, fill: '#6E6E73' }} unit=" kg" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E5EA', borderRadius: '12px', fontSize: '12px', color: '#1D1D1F', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' }}
                />
                <Bar dataKey="gripStrength" name="Grip Strength (kg)" fill="#248A3D" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Daily Nutritional & Calcium Countermeasure Tracking */}
      <div className="bg-white rounded-2xl border border-[#E5E5EA] p-6 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-[#1D1D1F] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#0071E3]" />
          <span>Bone Resorption Nutritional Countermeasures</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <div className="text-[#6E6E73] uppercase text-[10px] font-semibold">Daily Dietary Calcium</div>
            <div className="text-2xl font-bold text-[#1D1D1F] mt-1">{latestRecord.calciumIntakeMg} mg</div>
            <p className="text-[11px] text-[#6E6E73] mt-1">Prescribed Target: 1200 mg/day (Compensates for increased urinary calcium excretion)</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <div className="text-[#6E6E73] uppercase text-[10px] font-semibold">Vitamin D3 Supplementation</div>
            <div className="text-2xl font-bold text-[#1D1D1F] mt-1">{latestRecord.vitaminDIu} IU</div>
            <p className="text-[11px] text-[#6E6E73] mt-1">Daily oral cholecalciferol capsule (Compensates for absence of solar UV synthesis)</p>
          </div>

          <div className="p-4 rounded-xl bg-[#F5F5F7] border border-[#E5E5EA]">
            <div className="text-[#6E6E73] uppercase text-[10px] font-semibold">Osteopenia Risk Index</div>
            <div className="text-2xl font-bold text-[#248A3D] mt-1">LOW (Controlled)</div>
            <p className="text-[11px] text-[#6E6E73] mt-1">ARED compliance &gt;90% prevents accelerated trabecular architectural deterioration</p>
          </div>
        </div>
      </div>

    </div>
  );
}
