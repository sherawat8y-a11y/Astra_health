import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { generateAstronautHealthPdf } from '@/lib/report-generator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const astronautId = searchParams.get('astronautId') || 'AST-0421';

    const db = getDb();
    const astro = db.prepare('SELECT * FROM astronauts WHERE id = ?').get(astronautId) as any;

    if (!astro) {
      return NextResponse.json({ success: false, error: 'Astronaut not found' }, { status: 404 });
    }

    const mission = db.prepare('SELECT * FROM missions WHERE id = ?').get(astro.mission_id) as any;

    const latestReading = db.prepare(`
      SELECT * FROM health_readings WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
    `).get(astronautId) as any;

    const latestRad = db.prepare(`
      SELECT * FROM radiation_records WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
    `).get(astronautId) as any;

    const recentSleep = db.prepare(`
      SELECT * FROM sleep_records WHERE astronaut_id = ? ORDER BY date DESC LIMIT 7
    `).all(astronautId) as any[];

    const boneMuscle = db.prepare(`
      SELECT * FROM bone_muscle_records WHERE astronaut_id = ? ORDER BY recorded_date DESC LIMIT 1
    `).get(astronautId) as any;

    const alerts = db.prepare(`
      SELECT * FROM health_alerts WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 5
    `).all(astronautId) as any[];

    const pdfDoc = generateAstronautHealthPdf({
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
      missionName: mission ? mission.name : 'Artemis IV Deep-Space Gateway Expedition',
      latestReading: latestReading ? {
        heartRate: latestReading.heart_rate,
        systolicBp: latestReading.systolic_bp,
        diastolicBp: latestReading.diastolic_bp,
        spo2: latestReading.spo2,
        bodyTemp: latestReading.body_temp,
        respiratoryRate: latestReading.respiratory_rate,
        stressScore: latestReading.stress_score,
        moodScore: latestReading.mood_score,
        exerciseMinutes: latestReading.exercise_minutes,
        timestamp: latestReading.timestamp,
        isSynthetic: true,
        astronautId
      } : undefined,
      alerts: alerts.map(a => ({
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
        status: a.status
      })),
      latestRadiation: latestRad ? {
        dailyExposureMsv: latestRad.daily_exposure_msv,
        cumulativeExposureMsv: latestRad.cumulative_exposure_msv,
        dosimeterLocation: latestRad.dosimeter_location,
        speIndex: latestRad.spe_index,
        gcrIndex: latestRad.gcr_index,
        status: latestRad.status,
        astronautId,
        timestamp: latestRad.timestamp
      } : undefined,
      recentSleep: recentSleep.map(s => ({
        date: s.date,
        durationHours: s.duration_hours,
        deepSleepPct: s.deep_sleep_pct,
        remSleepPct: s.rem_sleep_pct,
        lightSleepPct: s.light_sleep_pct,
        efficiencyPct: s.efficiency_pct,
        latencyMinutes: s.latency_minutes,
        disruptionsCount: s.disruptions_count,
        astronautId
      })),
      boneMuscle: boneMuscle ? {
        recordedDate: boneMuscle.recorded_date,
        bmdTScoreSpine: boneMuscle.bmd_t_score_spine,
        bmdTScoreFemur: boneMuscle.bmd_t_score_femur,
        gripStrengthKg: boneMuscle.grip_strength_kg,
        aredCompliancePct: boneMuscle.ared_compliance_pct,
        calciumIntakeMg: boneMuscle.calcium_intake_mg,
        vitaminDIu: boneMuscle.vitamin_d_iu,
        astronautId
      } : undefined
    });

    const pdfArrayBuffer = pdfDoc.output('arraybuffer');
    const safeCode = astro.code || astro.id;

    return new NextResponse(pdfArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="ASTRA_HEALTH_REPORT_${safeCode}_MD${astro.mission_day}.pdf"`
      }
    });
  } catch (error: any) {
    console.error('Report generation error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
