'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Activity, 
  AlertTriangle, 
  Radio, 
  Zap, 
  RotateCcw, 
  User, 
  Clock, 
  Play, 
  Pause,
  ChevronDown,
  Sparkles,
  Shield,
  Wifi,
  Bell,
  Rocket
} from 'lucide-react';
import { useTelemetry } from '@/context/TelemetryContext';
import { UserRole, SimulationScenario } from '@/lib/types';

export default function Navbar() {
  const { 
    userRole, 
    setUserRole, 
    isSimulating, 
    setIsSimulating, 
    activeAlerts, 
    stepSimulation,
    missionData
  } = useTelemetry();

  const [scenarioOpen, setScenarioOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [missionOpen, setMissionOpen] = useState(false);

  const handleScenarioInject = async (scenario: SimulationScenario) => {
    setScenarioOpen(false);
    await stepSimulation(scenario);
  };

  return (
    <header className="sticky top-0 z-40 w-full h-[72px] border-b border-[#E5E5EA] bg-white/95 backdrop-blur-md">
      <div className="flex h-full items-center justify-between px-4 sm:px-6 max-w-[1920px] mx-auto">
        
        {/* Left Section: Mission Pills matching Reference Design */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mission Designation Selector Pill */}
          <div className="relative">
            <button
              onClick={() => setMissionOpen(!missionOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] border border-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold transition-all shadow-xs"
              title="Select Active Mission"
            >
              <Rocket className="h-3.5 w-3.5 text-[#0071E3]" />
              <span>ARTEMIS IV — NRHO Gateway</span>
              <ChevronDown className="h-3 w-3 text-[#6E6E73]" />
            </button>

            {missionOpen && (
              <div className="absolute left-0 mt-2 w-64 rounded-2xl border border-[#E5E5EA] bg-white p-2 shadow-xl z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#6E6E73] tracking-wider">
                  Deep Space Missions
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => setMissionOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#0071E3]/10 text-[#0071E3] font-semibold flex items-center justify-between"
                  >
                    <span>ARTEMIS IV (Gateway)</span>
                    <span className="text-[10px] font-mono text-[#248A3D]">ACTIVE</span>
                  </button>
                  <button
                    onClick={() => setMissionOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#6E6E73] hover:bg-[#F5F5F7] flex items-center justify-between"
                  >
                    <span>ARTEMIS III (Surface)</span>
                    <span className="text-[10px] text-[#6E6E73]">Completed</span>
                  </button>
                  <button
                    onClick={() => setMissionOpen(false)}
                    className="w-full text-left px-3 py-2 rounded-xl text-[#6E6E73] hover:bg-[#F5F5F7] flex items-center justify-between"
                  >
                    <span>ARTEMIS V (Deep Space)</span>
                    <span className="text-[10px] text-[#6E6E73]">Planned</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mission Day Counter Pill */}
          <div className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-[#1D1D1F] text-xs font-semibold shadow-xs">
            <span>Day 142 / 365</span>
          </div>

          {/* Communication Status Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F5F5F7] border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] shadow-xs">
            <span className="h-2 w-2 rounded-full bg-[#248A3D] animate-pulse"></span>
            <span className="text-[#248A3D]">Comm: Online</span>
            <span className="text-[#6E6E73] text-[11px] font-normal">• 1.28s delay</span>
          </div>

        </div>

        {/* Right Section: Simulation Controls, Alerts & User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* SIMULATED TELEMETRY Badge & Simulation Play/Pause */}
          <div className="hidden xl:flex items-center gap-1 bg-[#F5F5F7] border border-[#E5E5EA] rounded-full p-1 text-xs">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 font-semibold text-xs transition-colors ${
                isSimulating 
                  ? 'bg-white text-[#0071E3] shadow-xs' 
                  : 'text-[#6E6E73] hover:text-[#1D1D1F]'
              }`}
              title={isSimulating ? 'Pause Telemetry Simulation' : 'Resume Telemetry Stream'}
            >
              {isSimulating ? <Pause className="h-3 w-3 text-[#0071E3]" /> : <Play className="h-3 w-3 text-[#248A3D]" />}
              <span>{isSimulating ? 'Live Telemetry' : 'Paused'}</span>
            </button>
            <button
              onClick={() => stepSimulation()}
              className="p-1.5 text-[#6E6E73] hover:text-[#0071E3] hover:bg-white rounded-full transition-colors"
              title="Step Telemetry (Manual Tick)"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>

          {/* Scenario Injector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setScenarioOpen(!scenarioOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] border border-[#E5E5EA] text-xs font-semibold text-[#1D1D1F] transition-all shadow-xs"
              title="Inject demo anomaly scenario"
            >
              <Zap className="h-3.5 w-3.5 text-[#D18A22]" />
              <span className="hidden sm:inline">Scenario</span>
              <ChevronDown className="h-3 w-3 text-[#6E6E73]" />
            </button>

            {scenarioOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-[#E5E5EA] bg-white p-2 shadow-xl z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#6E6E73] tracking-wider">
                  Inject Clinical Scenario
                </div>
                <div className="space-y-1">
                  <button
                    onClick={() => handleScenarioInject('nominal')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F5F7] text-[#248A3D] font-semibold flex items-center justify-between"
                  >
                    <span>1. Nominal Baseline</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#248A3D]/10 font-mono">NOMINAL</span>
                  </button>
                  <button
                    onClick={() => handleScenarioInject('cv_drift')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F5F7] text-[#D18A22] font-semibold flex items-center justify-between"
                  >
                    <span>2. Cardiovascular Drift (CDR)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D18A22]/10 font-mono">WARNING</span>
                  </button>
                  <button
                    onClick={() => handleScenarioInject('solar_flare')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F5F7] text-[#D93025] font-semibold flex items-center justify-between"
                  >
                    <span>3. Solar Radiation Flare</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D93025]/10 font-mono">CRITICAL</span>
                  </button>
                  <button
                    onClick={() => handleScenarioInject('circadian_crisis')}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-[#F5F5F7] text-[#D18A22] font-semibold flex items-center justify-between"
                  >
                    <span>4. Circadian Sleep Deficit</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D18A22]/10 font-mono">WARNING</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Notification Bell with Badge (matching Reference Image) */}
          <Link
            href="/alerts"
            className="relative h-9 w-9 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] border border-[#E5E5EA] flex items-center justify-center text-[#1D1D1F] transition-all shadow-xs"
            title="View Notifications & Active Alerts"
          >
            <Bell className="h-4 w-4 text-[#1D1D1F]" />
            {activeAlerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#D93025] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {activeAlerts.length}
              </span>
            )}
          </Link>

          {/* User Profile Pill matching Reference Design */}
          <div className="relative">
            <button
              onClick={() => setRoleOpen(!roleOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-3 py-1 rounded-full bg-[#F5F5F7] hover:bg-[#EBEBEF] border border-[#E5E5EA] transition-all shadow-xs"
            >
              <div className="h-7 w-7 rounded-full overflow-hidden bg-slate-200 border border-[#E5E5EA] shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src="/images/elena-nav.png" 
                  alt="Dr. Elena Vance" 
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    // Fallback if image not ready
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-[#1D1D1F] leading-tight">
                  Dr. Elena Vance
                </div>
                <div className="text-[10px] text-[#6E6E73] leading-tight capitalize">
                  {userRole === 'flight_surgeon' ? 'Flight Surgeon' : userRole === 'biomedical_engineer' ? 'BME Officer' : 'Mission Commander'}
                </div>
              </div>
              <ChevronDown className="h-3 w-3 text-[#6E6E73]" />
            </button>

            {roleOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-[#E5E5EA] bg-white p-2 shadow-xl z-50 text-xs">
                <div className="px-3 py-1.5 text-[10px] uppercase font-semibold text-[#6E6E73] tracking-wider">
                  Switch Active Persona
                </div>
                {(['astronaut', 'flight_surgeon', 'biomedical_engineer'] as UserRole[]).map(role => (
                  <button
                    key={role}
                    onClick={() => {
                      setUserRole(role);
                      setRoleOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors capitalize font-medium ${
                      userRole === role 
                        ? 'bg-[#0071E3]/10 text-[#0071E3] font-bold' 
                        : 'text-[#1D1D1F] hover:bg-[#F5F5F7]'
                    }`}
                  >
                    {role === 'astronaut' ? 'Mission Commander (Astronaut)' : role.replace('_', ' ')}
                  </button>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
