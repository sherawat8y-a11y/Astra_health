'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserRole, SimulationScenario } from '@/lib/types';

interface TelemetryContextType {
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  selectedAstronautId: string;
  setSelectedAstronautId: (id: string) => void;
  demoMode: boolean;
  setDemoMode: (val: boolean) => void;
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  missionData: any;
  astronauts: any[];
  activeAlerts: any[];
  refreshTelemetry: () => Promise<void>;
  stepSimulation: (scenario?: SimulationScenario) => Promise<void>;
  acknowledgeAlert: (alertId: string, actorName?: string) => Promise<void>;
  resolveAlert: (alertId: string, notes?: string) => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  lastUpdated: string;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>('flight_surgeon');
  const [selectedAstronautId, setSelectedAstronautId] = useState<string>('AST-0421');
  const [demoMode, setDemoMode] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [missionData, setMissionData] = useState<any>(null);
  const [astronauts, setAstronauts] = useState<any[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  }, []);

  const refreshTelemetry = useCallback(async () => {
    try {
      const [missionRes, astronautsRes, alertsRes] = await Promise.all([
        fetch('/api/mission'),
        fetch('/api/astronauts'),
        fetch('/api/alerts?status=active')
      ]);

      if (missionRes.ok) {
        const data = await missionRes.json();
        if (data.success) {
          setMissionData(data);
        }
      }

      if (astronautsRes.ok) {
        const data = await astronautsRes.json();
        if (data.success) {
          setAstronauts(data.astronauts);
        }
      }

      if (alertsRes.ok) {
        const data = await alertsRes.json();
        if (data.success) {
          setActiveAlerts(data.alerts);
        }
      }

      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error refreshing telemetry:', err);
    }
  }, []);

  // Simulation Step Trigger
  const stepSimulation = useCallback(async (scenario?: SimulationScenario) => {
    try {
      const res = await fetch('/api/simulation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'step', scenario })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (data.newAlerts && data.newAlerts.length > 0) {
            showToast(`⚠️ NEW ALERT GENERATED: ${data.newAlerts[0].title}`);
          } else if (scenario) {
            showToast(`Simulation scenario injected: ${scenario.toUpperCase().replace('_', ' ')}`);
          }
          await refreshTelemetry();
        }
      }
    } catch (err) {
      console.error('Simulation step error:', err);
    }
  }, [refreshTelemetry, showToast]);

  const acknowledgeAlert = useCallback(async (alertId: string, actorName?: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'acknowledge',
          alertId,
          actor: actorName || (userRole === 'flight_surgeon' ? 'Flight Surgeon (NASA JSC)' : 'Biomedical Engineer')
        })
      });
      if (res.ok) {
        showToast(`Alert ${alertId} acknowledged.`);
        await refreshTelemetry();
      }
    } catch (err) {
      console.error('Error acknowledging alert:', err);
    }
  }, [refreshTelemetry, showToast, userRole]);

  const resolveAlert = useCallback(async (alertId: string, notes?: string) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'resolve',
          alertId,
          actor: userRole === 'flight_surgeon' ? 'Flight Surgeon' : 'BME Officer',
          notes: notes || 'Verified nominal by medical flight controller.'
        })
      });
      if (res.ok) {
        showToast(`Alert ${alertId} resolved.`);
        await refreshTelemetry();
      }
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  }, [refreshTelemetry, showToast, userRole]);

  // Initial load
  useEffect(() => {
    refreshTelemetry();
  }, [refreshTelemetry]);

  // Live simulation ticker (runs every 6 seconds when simulating)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      stepSimulation();
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimulating, stepSimulation]);

  return (
    <TelemetryContext.Provider
      value={{
        userRole,
        setUserRole,
        selectedAstronautId,
        setSelectedAstronautId,
        demoMode,
        setDemoMode,
        isSimulating,
        setIsSimulating,
        missionData,
        astronauts,
        activeAlerts,
        refreshTelemetry,
        stepSimulation,
        acknowledgeAlert,
        resolveAlert,
        toastMessage,
        showToast,
        lastUpdated
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error('useTelemetry must be used within a TelemetryProvider');
  }
  return context;
}
