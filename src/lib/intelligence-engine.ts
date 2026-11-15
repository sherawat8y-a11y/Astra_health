import { Astronaut, HealthReading, HealthAlert, AlertSeverity, ThresholdSettings } from './types';

export interface AnomalyEvaluationResult {
  severity: AlertSeverity;
  alertNeeded: boolean;
  alertData?: Partial<HealthAlert>;
  deviationScore: number;
  contributingFactors: string[];
  affectedSystems: string[];
  riskScore: number;
  explanationText: string;
  recommendedAction: string;
}

export class HealthIntelligenceEngine {
  private thresholds: ThresholdSettings;

  constructor(thresholds?: Partial<ThresholdSettings>) {
    this.thresholds = {
      heartRateMin: 45,
      heartRateMax: 100,
      spo2Min: 95.0,
      bodyTempMax: 37.5,
      respiratoryRateMax: 20,
      dailyRadiationMaxMsv: 1.5,
      cumulativeRadiationMaxMsv: 50.0,
      minSleepDurationHours: 6.0,
      stressScoreMax: 70,
      ...thresholds
    };
  }

  /**
   * Evaluates the latest telemetry readings against an astronaut's baseline
   * using multi-variate statistical anomaly detection and rule-based space physiology models.
   */
  public evaluateTelemetry(
    astronaut: Astronaut, 
    latestReading: HealthReading, 
    recentReadings: HealthReading[] = [],
    latestRadiationDailyMsv: number = 0.45
  ): AnomalyEvaluationResult {
    const contributingFactors: string[] = [];
    const affectedSystems: string[] = [];
    let riskScore = 10; // Nominal base score
    let severity: AlertSeverity = 'green';
    let title = 'Telemetry Nominal';
    let parameter = 'All Systems';
    const anyA = astronaut as any;
    const baseHr = anyA.baseline_hr ?? astronaut.baselineHr ?? 65;
    const baseSpo2 = anyA.baseline_spo2 ?? astronaut.baselineSpo2 ?? 98.8;
    const baseTemp = anyA.baseline_temp ?? astronaut.baselineTemp ?? 36.6;
    const baseResp = anyA.baseline_resp ?? astronaut.baselineResp ?? 14;

    let observedValue = `${latestReading.heartRate} BPM, ${latestReading.spo2}% SpO2`;
    let baselineValue = `${baseHr} BPM, ${baseSpo2}% SpO2`;
    let reason = 'All physiological telemetry channels remain within nominal spaceflight baseline confidence intervals.';
    let recommendedAction = 'Maintain scheduled mission flight activity and daily 2.5-hour countermeasure regimen.';

    // 1. Single-variable Deviations (Z-score heuristic)
    const hrDelta = latestReading.heartRate - baseHr;
    const hrZScore = hrDelta / 6.0; // standard deviation estimate ~6 bpm

    const spo2Delta = baseSpo2 - latestReading.spo2;
    const tempDelta = latestReading.bodyTemp - baseTemp;
    const respDelta = latestReading.respiratoryRate - baseResp;

    // 2. High Radiation Protocol (Critical Red Check)
    if (latestRadiationDailyMsv >= this.thresholds.dailyRadiationMaxMsv * 1.8) {
      severity = 'red';
      riskScore = 92;
      title = 'Solar Particle Event / Dosimetry Threshold Exceeded';
      parameter = 'Daily Radiation Rate';
      observedValue = `${latestRadiationDailyMsv.toFixed(2)} mSv/day`;
      baselineValue = `< ${this.thresholds.dailyRadiationMaxMsv} mSv/day limit`;
      reason = `Observed dosimeter rate of ${latestRadiationDailyMsv.toFixed(2)} mSv exceeds safety operational ceiling by ${((latestRadiationDailyMsv / this.thresholds.dailyRadiationMaxMsv - 1) * 100).toFixed(0)}%. Highly elevated space radiation field detected.`;
      contributingFactors.push('Solar Particle Event (SPE) proton flux', 'High Linear Energy Transfer (LET) particle density');
      affectedSystems.push('Hematopoietic', 'Cellular DNA Integrity', 'Acute Radiation Defense');
      recommendedAction = 'Immediate shelter inside water-wall storm haven. Prepare prophylactic antioxidant medical package and notify Houston Flight Surgeon.';
      
      return {
        severity,
        alertNeeded: true,
        deviationScore: Number(Math.abs(latestRadiationDailyMsv / this.thresholds.dailyRadiationMaxMsv).toFixed(2)),
        contributingFactors,
        affectedSystems,
        riskScore,
        explanationText: reason,
        recommendedAction,
        alertData: {
          title,
          severity,
          parameter,
          observedValue,
          baselineValue,
          reason,
          recommendedAction
        }
      };
    }

    // 3. Multi-variate Cardiovascular Drift Evaluation
    // In microgravity, upward HR shift + elevated body temp (space fever) + reduced HRV/elevated stress
    if (hrDelta >= 18 && tempDelta >= 0.3) {
      severity = 'amber';
      riskScore = 72;
      title = 'Cardiovascular Deconditioning & Space Fever Pattern';
      parameter = 'Resting HR & Core Temperature';
      observedValue = `${latestReading.heartRate} BPM / ${latestReading.bodyTemp}°C`;
      baselineValue = `${astronaut.baselineHr} BPM / ${astronaut.baselineTemp}°C`;
      reason = `Heart rate is elevated by +${hrDelta} BPM above resting baseline combined with a core body temperature rise of +${tempDelta.toFixed(1)}°C. Pattern matches microgravity thermoregulatory and autonomic impairment.`;
      contributingFactors.push('Cephalad fluid redistribution', 'Impaired radiant heat dissipation in microgravity', 'Elevated sympathetic tone');
      affectedSystems.push('Cardiovascular', 'Thermoregulation', 'Autonomic Nervous System');
      recommendedAction = 'Hydration loading with 500 mL electrolyte solution. Review cabin ventilation airspeed. Prescribe 30-minute Lower Body Negative Pressure (LBNP) diagnostic protocol.';
    } else if (latestReading.spo2 < this.thresholds.spo2Min) {
      // Hypoxia check
      severity = latestReading.spo2 < 93 ? 'red' : 'amber';
      riskScore = latestReading.spo2 < 93 ? 88 : 65;
      title = 'Sub-optimal Oxygen Saturation (SpO2)';
      parameter = 'Oxygen Saturation';
      observedValue = `${latestReading.spo2}%`;
      baselineValue = `${astronaut.baselineSpo2}%`;
      reason = `Arterial oxygen saturation has fallen to ${latestReading.spo2}%, which is below the spaceflight safety threshold of ${this.thresholds.spo2Min}%.`;
      contributingFactors.push('Microgravity ventilation-perfusion mismatch', 'Cabin pO2 partial pressure variation', 'Respiratory airway resistance');
      affectedSystems.push('Respiratory', 'Pulmonary Perfusion');
      recommendedAction = 'Verify ECLSS cabin oxygen partial pressure. Conduct spirometry check and auscultation via digital acoustic stethoscope.';
    } else if (latestReading.heartRate > this.thresholds.heartRateMax) {
      // Acute Tachycardia
      severity = 'amber';
      riskScore = 60;
      title = 'Resting Tachycardia Exceeding Flight Threshold';
      parameter = 'Heart Rate';
      observedValue = `${latestReading.heartRate} BPM`;
      baselineValue = `${astronaut.baselineHr} BPM (Max: ${this.thresholds.heartRateMax})`;
      reason = `Observed heart rate of ${latestReading.heartRate} BPM exceeds maximum nominal resting threshold (${this.thresholds.heartRateMax} BPM).`;
      contributingFactors.push('Elevated physical or cognitive strain', 'Catecholamine surge', 'Early fluid depletion');
      affectedSystems.push('Cardiovascular');
      recommendedAction = 'Rest period for 30 minutes in neutral posture harness. Retest 12-lead ECG rhythm strip.';
    } else if (latestReading.stressScore > this.thresholds.stressScoreMax && latestReading.moodScore < 5) {
      // Acute Psychological / Confinement Stress
      severity = 'amber';
      riskScore = 55;
      title = 'Elevated Confinement Stress & Cognitive Fatigue';
      parameter = 'Autonomic Stress Index';
      observedValue = `Stress: ${latestReading.stressScore}/100, Mood: ${latestReading.moodScore}/10`;
      baselineValue = `Stress < 40/100, Mood > 7/10`;
      reason = `Stress index exceeds allowable operational ceiling (${latestReading.stressScore} > ${this.thresholds.stressScoreMax}) correlated with subjective mood score depression.`;
      contributingFactors.push('High mission task saturation', 'Confinement and isolation', 'Acoustic fatigue');
      affectedSystems.push('Neuro-behavioral', 'Autonomic Nervous System');
      recommendedAction = 'Activate scheduled quiet time in Crew Quarters. Offer autonomous virtual reality naturalistic relaxation protocol and schedule private psychological conference (PPC).';
    }

    // 4. Trend Analysis across recent historical readings (if at least 3 points available)
    if (recentReadings.length >= 3 && severity === 'green') {
      const recentHrs = recentReadings.slice(-5).map(r => r.heartRate);
      const isTrendingUp = recentHrs.every((val, i, arr) => i === 0 || val >= arr[i - 1]);
      if (isTrendingUp && recentHrs[recentHrs.length - 1] - recentHrs[0] >= 12) {
        severity = 'amber';
        riskScore = 58;
        title = 'Upward Cardiovascular Drift Trend Detected';
        parameter = '72-Hour HR Trajectory';
        observedValue = `Trending +${recentHrs[recentHrs.length - 1] - recentHrs[0]} BPM`;
        baselineValue = `Stable at ${astronaut.baselineHr} BPM`;
        reason = `Continuous upward drift observed across ${recentHrs.length} consecutive measurement epochs. Statistical linear slope indicates early adaptation strain.`;
        contributingFactors.push('Cumulative mission fatigue', 'Subclinical dehydration', 'Circadian phase delay');
        affectedSystems.push('Cardiovascular', 'Autonomic');
        recommendedAction = 'Review fluid intake logs and schedule baseline echocardiogram check.';
      }
    }

    const alertNeeded = severity !== 'green';
    const deviationScore = Number(Math.max(Math.abs(hrZScore), Math.abs(spo2Delta), tempDelta * 2).toFixed(2));

    return {
      severity,
      alertNeeded,
      deviationScore,
      contributingFactors,
      affectedSystems,
      riskScore,
      explanationText: reason,
      recommendedAction,
      alertData: alertNeeded ? {
        title,
        severity,
        parameter,
        observedValue,
        baselineValue,
        reason,
        recommendedAction
      } : undefined
    };
  }

  /**
   * Generates a unique alert ID
   */
  public generateAlertId(): string {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    return `ALT-${new Date().getFullYear()}-${randomSuffix}`;
  }
}
