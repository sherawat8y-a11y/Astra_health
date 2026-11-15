import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const timeFilter = searchParams.get('timeFilter') || '7d'; // '24h', '7d', '30d', 'all'

    const db = getDb();
    const astro = db.prepare('SELECT * FROM astronauts WHERE id = ?').get(id) as any;

    if (!astro) {
      return NextResponse.json({ success: false, error: 'Astronaut not found' }, { status: 404 });
    }

    // Determine day limit for time filter
    let limitDays = 7;
    if (timeFilter === '24h') limitDays = 1;
    else if (timeFilter === '30d') limitDays = 30;
    else if (timeFilter === 'all') limitDays = 142;

    const readings = db.prepare(`
      SELECT * FROM health_readings 
      WHERE astronaut_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(id, limitDays * 24) as any[];

    // Reverse to chronological order for charts
    const chronologicalReadings = readings.reverse().map(r => ({
      id: r.id,
      timestamp: r.timestamp,
      heartRate: r.heart_rate,
      systolicBp: r.systolic_bp,
      diastolicBp: r.diastolic_bp,
      spo2: r.spo2,
      bodyTemp: r.body_temp,
      respiratoryRate: r.respiratory_rate,
      stressScore: r.stress_score,
      moodScore: r.mood_score,
      exerciseMinutes: r.exercise_minutes,
      isSynthetic: Boolean(r.is_synthetic)
    }));

    const radiationRecords = db.prepare(`
      SELECT * FROM radiation_records 
      WHERE astronaut_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(id, limitDays) as any[];

    const sleepRecords = db.prepare(`
      SELECT * FROM sleep_records 
      WHERE astronaut_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `).all(id, limitDays) as any[];

    const wellnessRecords = db.prepare(`
      SELECT * FROM wellness_records 
      WHERE astronaut_id = ? 
      ORDER BY timestamp DESC 
      LIMIT ?
    `).all(id, limitDays) as any[];

    const boneMuscleRecords = db.prepare(`
      SELECT * FROM bone_muscle_records 
      WHERE astronaut_id = ? 
      ORDER BY recorded_date ASC
    `).all(id) as any[];

    const alerts = db.prepare(`
      SELECT * FROM health_alerts 
      WHERE astronaut_id = ? 
      ORDER BY timestamp DESC
    `).all(id) as any[];

    const formattedAlerts = alerts.map(a => ({
      id: a.id,
      astronautId: a.astronaut_id,
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

    const latest = chronologicalReadings[chronologicalReadings.length - 1];

    return NextResponse.json({
      success: true,
      astronaut: {
        id: astro.id,
        code: astro.code,
        name: astro.name,
        rank: astro.rank,
        role: astro.role,
        age: astro.age,
        gender: astro.gender,
        bloodType: astro.blood_type,
        missionId: astro.mission_id,
        avatarUrl: astro.avatar_url,
        baselineHr: astro.baseline_hr,
        baselineSys: astro.baseline_sys,
        baselineDia: astro.baseline_dia,
        baselineSpo2: astro.baseline_spo2,
        baselineTemp: astro.baseline_temp,
        baselineResp: astro.baseline_resp,
        baselineSleep: astro.baseline_sleep,
        status: astro.status,
        missionDay: astro.mission_day
      },
      latestReading: latest || {
        heartRate: astro.baseline_hr,
        systolicBp: astro.baseline_sys,
        diastolicBp: astro.baseline_dia,
        spo2: astro.baseline_spo2,
        bodyTemp: astro.baseline_temp,
        respiratoryRate: astro.baseline_resp,
        stressScore: 35,
        moodScore: 8.0,
        exerciseMinutes: 120
      },
      readings: chronologicalReadings,
      radiationRecords: radiationRecords.reverse().map(r => ({
        id: r.id,
        timestamp: r.timestamp,
        dailyExposureMsv: r.daily_exposure_msv,
        cumulativeExposureMsv: r.cumulative_exposure_msv,
        dosimeterLocation: r.dosimeter_location,
        speIndex: r.spe_index,
        gcrIndex: r.gcr_index,
        status: r.status
      })),
      sleepRecords: sleepRecords.reverse().map(s => ({
        id: s.id,
        date: s.date,
        durationHours: s.duration_hours,
        deepSleepPct: s.deep_sleep_pct,
        remSleepPct: s.rem_sleep_pct,
        lightSleepPct: s.light_sleep_pct,
        efficiencyPct: s.efficiency_pct,
        latencyMinutes: s.latency_minutes,
        disruptionsCount: s.disruptions_count
      })),
      wellnessRecords: wellnessRecords.reverse().map(w => ({
        id: w.id,
        timestamp: w.timestamp,
        moodValence: w.mood_valence,
        energyLevel: w.energy_level,
        teamCohesion: w.team_cohesion,
        cognitivePvtMs: w.cognitive_pvt_ms,
        subjectiveFatigue: w.subjective_fatigue,
        notes: w.notes
      })),
      boneMuscleRecords: boneMuscleRecords.map(b => ({
        id: b.id,
        recordedDate: b.recorded_date,
        bmdTScoreSpine: b.bmd_t_score_spine,
        bmdTScoreFemur: b.bmd_t_score_femur,
        gripStrengthKg: b.grip_strength_kg,
        aredCompliancePct: b.ared_compliance_pct,
        calciumIntakeMg: b.calcium_intake_mg,
        vitaminDIu: b.vitamin_d_iu
      })),
      alerts: formattedAlerts
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
