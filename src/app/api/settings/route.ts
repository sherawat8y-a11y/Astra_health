import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ThresholdSettings } from '@/lib/types';

export async function GET() {
  try {
    const db = getDb();
    
    const thresholdsRow = db.prepare("SELECT value FROM settings WHERE key = 'thresholds'").get() as any;
    const demoModeRow = db.prepare("SELECT value FROM settings WHERE key = 'demo_mode'").get() as any;
    const speedRow = db.prepare("SELECT value FROM settings WHERE key = 'simulation_speed'").get() as any;
    const auditLogs = db.prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT 20').all() as any[];

    const defaultThresholds: ThresholdSettings = {
      heartRateMin: 45,
      heartRateMax: 100,
      spo2Min: 95.0,
      bodyTempMax: 37.5,
      respiratoryRateMax: 20,
      dailyRadiationMaxMsv: 1.5,
      cumulativeRadiationMaxMsv: 50.0,
      minSleepDurationHours: 6.0,
      stressScoreMax: 70
    };

    return NextResponse.json({
      success: true,
      thresholds: thresholdsRow ? JSON.parse(thresholdsRow.value) : defaultThresholds,
      demoMode: demoModeRow ? demoModeRow.value === 'true' : true,
      simulationSpeed: speedRow ? speedRow.value : 'normal',
      auditLogs: auditLogs.map(l => ({
        id: l.id,
        timestamp: l.timestamp,
        actor: l.actor,
        action: l.action,
        details: l.details
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { thresholds, demoMode, simulationSpeed, actor } = body;

    const db = getDb();
    const now = new Date().toISOString();

    if (thresholds) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('thresholds', ?)").run(JSON.stringify(thresholds));
    }
    if (demoMode !== undefined) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('demo_mode', ?)").run(String(demoMode));
    }
    if (simulationSpeed) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('simulation_speed', ?)").run(simulationSpeed);
    }

    db.prepare(`
      INSERT INTO audit_logs (timestamp, actor, action, details)
      VALUES (?, ?, 'SETTINGS_UPDATE', 'Updated mission threshold parameters and telemetry configuration.')
    `).run(now, actor || 'Flight BME');

    return NextResponse.json({ success: true, message: 'Settings saved successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
