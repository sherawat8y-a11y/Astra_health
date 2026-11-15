import { NextRequest, NextResponse } from 'next/server';
import { TelemetrySimulationEngine, SimulationScenario } from '@/lib/simulation-engine';
import { getDb } from '@/lib/db';

const simEngine = new TelemetrySimulationEngine();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { action, scenario } = body;

    const db = getDb();

    if (action === 'reset') {
      // Re-seed all tables cleanly
      db.exec(`
        DELETE FROM health_readings;
        DELETE FROM health_alerts;
        DELETE FROM radiation_records;
        DELETE FROM sleep_records;
        DELETE FROM wellness_records;
        DELETE FROM bone_muscle_records;
        DELETE FROM astronauts;
        DELETE FROM missions;
        DELETE FROM research_datasets;
        DELETE FROM audit_logs;
      `);
      
      // Re-run seed by re-calling getDb internal logic or dropping table check
      const reinit = (await import('@/lib/db')).getDb;
      // Triggers seed
      db.prepare('DELETE FROM astronauts').run();
      // Call re-init
      db.close();
      const newDb = reinit();

      return NextResponse.json({ success: true, message: 'Telemetry database reset to initial baseline.' });
    }

    // Step simulation
    const result = simEngine.stepSimulation(scenario as SimulationScenario);

    // Audit log
    db.prepare(`
      INSERT INTO audit_logs (timestamp, actor, action, details)
      VALUES (?, 'Simulator', 'STEP', ?)
    `).run(new Date().toISOString(), `Simulation step completed. Scenario: ${scenario || 'nominal'}. Updated ${result.updatedReadings.length} astronauts.`);

    return NextResponse.json({
      success: true,
      updatedReadings: result.updatedReadings,
      newAlerts: result.newAlerts,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Simulation step error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const hr = Number(searchParams.get('hr')) || 65;
    const points = Number(searchParams.get('points')) || 80;

    const waveform = simEngine.generateEcgWaveform(hr, points);

    return NextResponse.json({ success: true, waveform, heartRate: hr });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
