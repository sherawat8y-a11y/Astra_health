import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Mission, Astronaut, HealthAlert } from '@/lib/types';

export async function GET() {
  try {
    const db = getDb();
    
    const mission = db.prepare("SELECT * FROM missions WHERE status = 'active' LIMIT 1").get() as any;
    const astronauts = db.prepare('SELECT * FROM astronauts').all() as any[];
    const activeAlerts = db.prepare("SELECT * FROM health_alerts WHERE status = 'active'").all() as any[];
    
    // Get latest vitals for each astronaut
    const crewWithVitals = astronauts.map(a => {
      const latestReading = db.prepare(`
        SELECT * FROM health_readings WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
      `).get(a.id) as any;

      const latestRad = db.prepare(`
        SELECT * FROM radiation_records WHERE astronaut_id = ? ORDER BY timestamp DESC LIMIT 1
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
        status: a.status,
        missionDay: a.mission_day,
        baselineHr: a.baseline_hr,
        baselineSpo2: a.baseline_spo2,
        baselineSleep: a.baseline_sleep,
        currentHr: latestReading ? latestReading.heart_rate : a.baseline_hr,
        currentBp: latestReading ? `${latestReading.systolic_bp}/${latestReading.diastolic_bp}` : `${a.baseline_sys}/${a.baseline_dia}`,
        currentSpo2: latestReading ? latestReading.spo2 : a.baseline_spo2,
        currentTemp: latestReading ? latestReading.body_temp : a.baseline_temp,
        currentResp: latestReading ? latestReading.respiratory_rate : a.baseline_resp,
        currentStress: latestReading ? latestReading.stress_score : 35,
        currentSleep: a.baseline_sleep,
        dailyRadiationMsv: latestRad ? latestRad.daily_exposure_msv : 0.45,
        cumulativeRadiationMsv: latestRad ? latestRad.cumulative_exposure_msv : 28.4
      };
    });

    // Calculate Crew Averages
    const avgHr = Math.round(crewWithVitals.reduce((acc, c) => acc + c.currentHr, 0) / crewWithVitals.length);
    const avgSpo2 = Number((crewWithVitals.reduce((acc, c) => acc + c.currentSpo2, 0) / crewWithVitals.length).toFixed(1));
    const avgSleep = Number((crewWithVitals.reduce((acc, c) => acc + c.currentSleep, 0) / crewWithVitals.length).toFixed(1));
    const avgDailyRad = Number((crewWithVitals.reduce((acc, c) => acc + c.dailyRadiationMsv, 0) / crewWithVitals.length).toFixed(2));
    const totalCumRad = Number((crewWithVitals.reduce((acc, c) => acc + c.cumulativeRadiationMsv, 0) / crewWithVitals.length).toFixed(1));

    // Overall Status
    const criticalCount = crewWithVitals.filter(c => c.status === 'critical').length;
    const elevatedCount = crewWithVitals.filter(c => c.status === 'elevated').length;
    const nominalCount = crewWithVitals.filter(c => c.status === 'nominal').length;

    let overallCrewStatus: 'nominal' | 'elevated' | 'critical' = 'nominal';
    if (criticalCount > 0) overallCrewStatus = 'critical';
    else if (elevatedCount > 0) overallCrewStatus = 'elevated';

    return NextResponse.json({
      success: true,
      mission: {
        id: mission.id,
        code: mission.code,
        name: mission.name,
        destination: mission.destination,
        launchDate: mission.launch_date,
        returnDate: mission.return_date,
        dayNumber: mission.day_number,
        totalDays: mission.total_days,
        crewSize: mission.crew_size,
        status: mission.status,
        distanceFromEarthKm: mission.distance_km,
        commDelaySeconds: mission.comm_delay_sec
      },
      summary: {
        totalMonitored: crewWithVitals.length,
        overallCrewStatus,
        criticalCount,
        elevatedCount,
        nominalCount,
        activeAlertsCount: activeAlerts.length,
        averageHeartRate: avgHr,
        averageSpo2: avgSpo2,
        averageSleepHours: avgSleep,
        averageDailyRadiationMsv: avgDailyRad,
        averageCumulativeRadiationMsv: totalCumRad,
        crewWellnessScore: Math.round(100 - (criticalCount * 25 + elevatedCount * 12))
      },
      crew: crewWithVitals,
      recentAlerts: activeAlerts.slice(0, 5).map(a => ({
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
      }))
    });
  } catch (error: any) {
    console.error('Error fetching mission telemetry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
