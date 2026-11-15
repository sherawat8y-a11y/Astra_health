import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const astronauts = db.prepare('SELECT * FROM astronauts').all() as any[];

    const results = astronauts.map(a => {
      const latestReading = db.prepare(`
        SELECT * FROM health_readings WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
      `).get(a.id) as any;

      const latestRad = db.prepare(`
        SELECT * FROM radiation_records WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
      `).get(a.id) as any;

      const latestSleep = db.prepare(`
        SELECT * FROM sleep_records WHERE astronaut_id = ? ORDER BY date DESC LIMIT 1
      `).get(a.id) as any;

      const alertCount = db.prepare(`
        SELECT COUNT(*) as count FROM health_alerts WHERE astronaut_id = ? AND status = 'active'
      `).get(a.id) as any;

      return {
        id: a.id,
        code: a.code,
        name: a.name,
        rank: a.rank,
        role: a.role,
        age: a.age,
        gender: a.gender,
        bloodType: a.blood_type,
        missionId: a.mission_id,
        avatarUrl: a.avatar_url,
        baselineHr: a.baseline_hr,
        baselineSys: a.baseline_sys,
        baselineDia: a.baseline_dia,
        baselineSpo2: a.baseline_spo2,
        baselineTemp: a.baseline_temp,
        baselineResp: a.baseline_resp,
        baselineSleep: a.baseline_sleep,
        status: a.status,
        missionDay: a.mission_day,
        currentHr: latestReading ? latestReading.heart_rate : a.baseline_hr,
        currentSys: latestReading ? latestReading.systolic_bp : a.baseline_sys,
        currentDia: latestReading ? latestReading.diastolic_bp : a.baseline_dia,
        currentSpo2: latestReading ? latestReading.spo2 : a.baseline_spo2,
        currentTemp: latestReading ? latestReading.body_temp : a.baseline_temp,
        currentResp: latestReading ? latestReading.respiratory_rate : a.baseline_resp,
        currentStress: latestReading ? latestReading.stress_score : 35,
        currentMood: latestReading ? latestReading.mood_score : 8,
        currentExercise: latestReading ? latestReading.exercise_minutes : 120,
        dailyRadiationMsv: latestRad ? latestRad.daily_exposure_msv : 0.45,
        cumulativeRadiationMsv: latestRad ? latestRad.cumulative_exposure_msv : 28.4,
        recentSleepDuration: latestSleep ? latestSleep.duration_hours : a.baseline_sleep,
        recentSleepEfficiency: latestSleep ? latestSleep.efficiency_pct : 88,
        activeAlertsCount: alertCount ? alertCount.count : 0
      };
    });

    return NextResponse.json({ success: true, astronauts: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
