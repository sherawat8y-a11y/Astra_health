import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const severity = searchParams.get('severity');
    const status = searchParams.get('status');
    const astronautId = searchParams.get('astronautId');

    const db = getDb();
    let query = `
      SELECT a.*, ast.name as astronaut_name, ast.rank as astronaut_rank, ast.code as astronaut_code 
      FROM health_alerts a
      LEFT JOIN astronauts ast ON a.astronaut_id = ast.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (severity && severity !== 'all') {
      query += ' AND a.severity = ?';
      params.push(severity);
    }
    if (status && status !== 'all') {
      query += ' AND a.status = ?';
      params.push(status);
    }
    if (astronautId && astronautId !== 'all') {
      query += ' AND a.astronaut_id = ?';
      params.push(astronautId);
    }

    query += ' ORDER BY a.timestamp DESC';

    const rows = db.prepare(query).all(...params) as any[];

    const formatted = rows.map(a => ({
      id: a.id,
      astronautId: a.astronaut_id,
      astronautName: a.astronaut_name ? `${a.astronaut_rank} ${a.astronaut_name}` : a.astronaut_id,
      astronautCode: a.astronaut_code,
      title: a.title,
      severity: a.severity,
      parameter: a.parameter,
      observedValue: a.observed_value,
      baselineValue: a.baseline_value,
      reason: a.reason,
      timestamp: a.timestamp,
      recommendedAction: a.recommended_action,
      status: a.status,
      acknowledgedBy: a.acknowledged_by,
      acknowledgedAt: a.acknowledged_at,
      resolutionNotes: a.resolution_notes,
      explanationDetails: a.explanation_json ? JSON.parse(a.explanation_json) : undefined
    }));

    return NextResponse.json({ success: true, alerts: formatted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, alertId, actor, notes } = body;

    const db = getDb();
    const now = new Date().toISOString();

    if (action === 'acknowledge') {
      db.prepare(`
        UPDATE health_alerts 
        SET status = 'acknowledged', acknowledged_by = ?, acknowledged_at = ?
        WHERE id = ?
      `).run(actor || 'Flight Surgeon', now, alertId);

      db.prepare(`
        INSERT INTO audit_logs (timestamp, actor, action, details)
        VALUES (?, ?, 'ALERT_ACKNOWLEDGE', ?)
      `).run(now, actor || 'Flight Surgeon', `Acknowledged alert ${alertId}`);

      return NextResponse.json({ success: true, message: `Alert ${alertId} acknowledged.` });
    } else if (action === 'resolve') {
      db.prepare(`
        UPDATE health_alerts 
        SET status = 'resolved', resolution_notes = ?
        WHERE id = ?
      `).run(notes || 'Protocol verified nominal.', alertId);

      db.prepare(`
        INSERT INTO audit_logs (timestamp, actor, action, details)
        VALUES (?, ?, 'ALERT_RESOLVE', ?)
      `).run(now, actor || 'Flight Surgeon', `Resolved alert ${alertId}. Notes: ${notes || 'None'}`);

      return NextResponse.json({ success: true, message: `Alert ${alertId} resolved.` });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
