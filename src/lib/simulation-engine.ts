import { getDb } from './db';
import { Astronaut, HealthReading, HealthAlert } from './types';
import { HealthIntelligenceEngine } from './intelligence-engine';

export type SimulationScenario = 'nominal' | 'cv_drift' | 'solar_flare' | 'circadian_crisis';

export class TelemetrySimulationEngine {
  private intelligenceEngine: HealthIntelligenceEngine;

  constructor() {
    this.intelligenceEngine = new HealthIntelligenceEngine();
  }

  /**
   * Generates continuous ECG waveform data points (P, Q, R, S, T waves) for real-time visualization.
   * Returns an array of normalized y-coordinates (-1.0 to 1.0) along a timeline.
   */
  public generateEcgWaveform(heartRate: number, pointCount: number = 80): number[] {
    const points: number[] = [];
    const cycleLength = Math.max(20, Math.round((60 / heartRate) * 40));

    for (let i = 0; i < pointCount; i++) {
      const phase = (i % cycleLength) / cycleLength;
      let y = 0;

      // P wave (0.1 - 0.2)
      if (phase >= 0.1 && phase < 0.2) {
        y = 0.15 * Math.sin(((phase - 0.1) / 0.1) * Math.PI);
      }
      // PR segment baseline (0.2 - 0.28)
      else if (phase >= 0.2 && phase < 0.28) {
        y = 0;
      }
      // Q wave (0.28 - 0.32)
      else if (phase >= 0.28 && phase < 0.32) {
        y = -0.15 * Math.sin(((phase - 0.28) / 0.04) * Math.PI);
      }
      // R wave - high sharp peak (0.32 - 0.38)
      else if (phase >= 0.32 && phase < 0.38) {
        y = 0.95 * Math.sin(((phase - 0.32) / 0.06) * Math.PI);
      }
      // S wave - dip below baseline (0.38 - 0.42)
      else if (phase >= 0.38 && phase < 0.42) {
        y = -0.35 * Math.sin(((phase - 0.38) / 0.04) * Math.PI);
      }
      // ST segment (0.42 - 0.52)
      else if (phase >= 0.42 && phase < 0.52) {
        y = 0.02;
      }
      // T wave (0.52 - 0.70)
      else if (phase >= 0.52 && phase < 0.70) {
        y = 0.25 * Math.sin(((phase - 0.52) / 0.18) * Math.PI);
      }
      // TP baseline
      else {
        y = 0;
      }

      // Add slight physiological micro-jitter
      const noise = (Math.random() - 0.5) * 0.04;
      points.push(Number((y + noise).toFixed(3)));
    }

    return points;
  }

  /**
   * Generates a step update for all astronauts and optionally commits new readings
   * and triggers intelligence engine evaluation.
   */
  public stepSimulation(scenario?: SimulationScenario): { 
    updatedReadings: HealthReading[]; 
    newAlerts: HealthAlert[];
  } {
    const db = getDb();
    const astronauts = db.prepare('SELECT * FROM astronauts').all() as unknown as Astronaut[];
    const updatedReadings: HealthReading[] = [];
    const newAlerts: HealthAlert[] = [];
    const nowIso = new Date().toISOString();

    const insertReading = db.prepare(`
      INSERT INTO health_readings (
        astronaut_id, timestamp, heart_rate, systolic_bp, diastolic_bp, spo2, body_temp, respiratory_rate, stress_score, mood_score, exercise_minutes, is_synthetic
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
    `);

    const insertAlert = db.prepare(`
      INSERT INTO health_alerts (
        id, astronaut_id, title, severity, parameter, observed_value, baseline_value, reason, timestamp, recommended_action, status, explanation_json
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)
    `);

    const updateStatus = db.prepare('UPDATE astronauts SET status = ? WHERE id = ?');

    for (const a of astronauts) {
      const anyA = a as any;
      const baseHr = anyA.baseline_hr ?? a.baselineHr ?? 65;
      const baseSys = anyA.baseline_sys ?? a.baselineSys ?? 115;
      const baseDia = anyA.baseline_dia ?? a.baselineDia ?? 75;
      const baseSpo2 = anyA.baseline_spo2 ?? a.baselineSpo2 ?? 98.8;
      const baseTemp = anyA.baseline_temp ?? a.baselineTemp ?? 36.6;
      const baseResp = anyA.baseline_resp ?? a.baselineResp ?? 14;

      let hr = baseHr;
      let sys = baseSys;
      let dia = baseDia;
      let spo2 = baseSpo2;
      let temp = baseTemp;
      let resp = baseResp;
      let stress = 35;
      let mood = 8.0;
      let dailyRad = 0.45;

      // Handle Scenarios
      if (scenario === 'cv_drift' && a.id === 'AST-0421') {
        hr += 24;
        sys += 14;
        dia += 8;
        temp += 0.5;
        resp += 3;
        stress = 78;
        mood = 5.2;
      } else if (scenario === 'solar_flare' && a.id === 'AST-0424') {
        dailyRad = 3.65;
        stress = 85;
        mood = 4.8;
      } else if (scenario === 'circadian_crisis' && a.id === 'AST-0423') {
        stress = 74;
        mood = 4.9;
        hr += 10;
      } else {
        // Natural physiological variation
        hr += Math.round((Math.random() - 0.5) * 4);
        sys += Math.round((Math.random() - 0.5) * 4);
        dia += Math.round((Math.random() - 0.5) * 3);
        spo2 += Number(((Math.random() - 0.5) * 0.4).toFixed(1));
        temp += Number(((Math.random() - 0.5) * 0.15).toFixed(2));
        resp += Math.round((Math.random() - 0.5) * 2);
        stress += Math.round((Math.random() - 0.5) * 6);
        mood += Number(((Math.random() - 0.5) * 0.5).toFixed(1));
      }

      // Bound values cleanly
      spo2 = Math.min(100, Math.max(90, Number(spo2.toFixed(1))));
      temp = Number(temp.toFixed(2));
      stress = Math.min(100, Math.max(10, stress));
      mood = Math.min(10, Math.max(1, Number(mood.toFixed(1))));

      const reading: HealthReading = {
        astronautId: a.id,
        timestamp: nowIso,
        heartRate: hr,
        systolicBp: sys,
        diastolicBp: dia,
        spo2,
        bodyTemp: temp,
        respiratoryRate: resp,
        stressScore: stress,
        moodScore: mood,
        exerciseMinutes: 120,
        isSynthetic: true
      };

      insertReading.run(
        reading.astronautId,
        reading.timestamp,
        reading.heartRate,
        reading.systolicBp,
        reading.diastolicBp,
        reading.spo2,
        reading.bodyTemp,
        reading.respiratoryRate,
        reading.stressScore,
        reading.moodScore,
        reading.exerciseMinutes
      );

      updatedReadings.push(reading);

      // Run AI Evaluation
      const evalResult = this.intelligenceEngine.evaluateTelemetry(a, reading, [], dailyRad);
      
      // Update astronaut status in DB
      const currentStatus = evalResult.severity === 'red' ? 'critical' : evalResult.severity === 'amber' ? 'elevated' : 'nominal';
      updateStatus.run(currentStatus, a.id);

      // Check if new alert should be registered
      if (evalResult.alertNeeded && evalResult.alertData) {
        // Prevent spamming exact duplicate active alerts within 1 hour
        const existingAlert = db.prepare(`
          SELECT id FROM health_alerts 
          WHERE astronaut_id = ? AND parameter = ? AND status = 'active'
        `).get(a.id, evalResult.alertData.parameter) as { id: string } | undefined;

        if (!existingAlert) {
          const alertId = this.intelligenceEngine.generateAlertId();
          const newAlert: HealthAlert = {
            id: alertId,
            astronautId: a.id,
            astronautName: a.name,
            title: evalResult.alertData.title!,
            severity: evalResult.severity,
            parameter: evalResult.alertData.parameter!,
            observedValue: evalResult.alertData.observedValue!,
            baselineValue: evalResult.alertData.baselineValue!,
            reason: evalResult.alertData.reason!,
            timestamp: nowIso,
            recommendedAction: evalResult.alertData.recommendedAction!,
            status: 'active',
            explanationDetails: {
              deviationScore: evalResult.deviationScore,
              contributingFactors: evalResult.contributingFactors,
              affectedSystems: evalResult.affectedSystems,
              riskScore: evalResult.riskScore
            }
          };

          insertAlert.run(
            newAlert.id,
            newAlert.astronautId,
            newAlert.title,
            newAlert.severity,
            newAlert.parameter,
            String(newAlert.observedValue),
            String(newAlert.baselineValue),
            newAlert.reason,
            newAlert.timestamp,
            newAlert.recommendedAction,
            JSON.stringify(newAlert.explanationDetails)
          );

          newAlerts.push(newAlert);
        }
      }
    }

    return { updatedReadings, newAlerts };
  }
}
