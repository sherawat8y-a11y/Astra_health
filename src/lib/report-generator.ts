import { jsPDF } from 'jspdf';
import { Astronaut, HealthReading, HealthAlert, RadiationRecord, SleepRecord, BoneMuscleRecord } from './types';

export interface ReportGenerationParams {
  astronaut: Astronaut;
  missionName: string;
  latestReading?: HealthReading;
  alerts: HealthAlert[];
  latestRadiation?: RadiationRecord;
  recentSleep?: SleepRecord[];
  boneMuscle?: BoneMuscleRecord;
}

export function generateAstronautHealthPdf(params: ReportGenerationParams): jsPDF {
  const { astronaut, missionName, latestReading, alerts, latestRadiation, recentSleep, boneMuscle } = params;
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(7, 11, 20); // Deep space background
  doc.rect(0, 0, pageWidth, 42, 'F');

  // Accent Line
  doc.setDrawColor(6, 182, 212); // Cyan accent
  doc.setLineWidth(1.5);
  doc.line(0, 42, pageWidth, 42);

  // Brand Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(6, 182, 212); // Cyan
  doc.text('ASTRA HEALTH', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text('MONITOR. PREDICT. PROTECT. EVERY HEARTBEAT BEYOND EARTH.', 14, 25);
  doc.text('DEEP-SPACE BIOMEDICAL INTELLIGENCE & TELEMETRY REPORT', 14, 32);

  // Watermark / Demo Badge
  doc.setFontSize(9);
  doc.setTextColor(245, 158, 11); // Amber
  doc.setFont('helvetica', 'bold');
  doc.text('DEMONSTRATION DATA — NOT FOR CLINICAL DIAGNOSTIC USE', 14, 38);

  y = 52;

  // Astronaut & Mission Dossier Block
  doc.setFillColor(241, 245, 249); // Slate 100
  doc.rect(14, y, pageWidth - 28, 28, 'F');
  doc.setDrawColor(203, 213, 225); // Slate 300
  doc.setLineWidth(0.5);
  doc.rect(14, y, pageWidth - 28, 28, 'D');

  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ASTRONAUT: ${astronaut.rank.toUpperCase()} ${astronaut.name.toUpperCase()} (${astronaut.code})`, 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Role: ${astronaut.role} | Age: ${astronaut.age} | Blood: ${astronaut.bloodType}`, 18, y + 15);
  doc.text(`Mission: ${missionName} | Mission Day: ${astronaut.missionDay} | Status: ${astronaut.status.toUpperCase()}`, 18, y + 21);

  const genDate = new Date().toUTCString();
  doc.text(`Report Generated: ${genDate}`, pageWidth - 90, y + 21);

  y += 36;

  // Section 1: Vital Signs & Cardiovascular Indices
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 116, 144); // Dark cyan
  doc.text('1. PHYSIOLOGICAL TELEMETRY & VITAL SIGNS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const hr = latestReading ? `${latestReading.heartRate} BPM (Baseline: ${astronaut.baselineHr})` : `${astronaut.baselineHr} BPM`;
  const bp = latestReading ? `${latestReading.systolicBp}/${latestReading.diastolicBp} mmHg (Baseline: ${astronaut.baselineSys}/${astronaut.baselineDia})` : `${astronaut.baselineSys}/${astronaut.baselineDia} mmHg`;
  const spo2 = latestReading ? `${latestReading.spo2}% (Baseline: ${astronaut.baselineSpo2}%)` : `${astronaut.baselineSpo2}%`;
  const temp = latestReading ? `${latestReading.bodyTemp}°C (Baseline: ${astronaut.baselineTemp}°C)` : `${astronaut.baselineTemp}°C`;
  const resp = latestReading ? `${latestReading.respiratoryRate} br/min (Baseline: ${astronaut.baselineResp})` : `${astronaut.baselineResp} br/min`;
  const stress = latestReading ? `${latestReading.stressScore}/100` : '35/100';

  doc.text(`• Heart Rate: ${hr}`, 18, y + 5);
  doc.text(`• Blood Pressure: ${bp}`, 18, y + 11);
  doc.text(`• SpO2 (Arterial O2): ${spo2}`, 18, y + 17);
  doc.text(`• Core Body Temperature: ${temp}`, 18, y + 23);
  doc.text(`• Respiratory Rate: ${resp}`, 110, y + 5);
  doc.text(`• Autonomic Stress Index: ${stress}`, 110, y + 11);
  doc.text(`• Daily Exercise Log: ${latestReading?.exerciseMinutes || 120} mins ARED/T2`, 110, y + 17);

  y += 34;

  // Section 2: Space Radiation & Environmental Dosimetry
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 116, 144);
  doc.text('2. SPACE RADIATION & DOSIMETRY ASSESSMENT', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const dailyRad = latestRadiation ? `${latestRadiation.dailyExposureMsv} mSv/24h` : '0.45 mSv/24h';
  const cumRad = latestRadiation ? `${latestRadiation.cumulativeExposureMsv} mSv` : '28.4 mSv';
  const pelPct = latestRadiation ? ((latestRadiation.cumulativeExposureMsv / 600) * 100).toFixed(2) : '4.73';

  doc.text(`• Daily Absorbed Dose: ${dailyRad} (Nominal quiet background: 0.40 - 0.50 mSv)`, 18, y + 5);
  doc.text(`• Cumulative Mission Dose: ${cumRad}`, 18, y + 11);
  doc.text(`• NASA Career Limit (PEL): ${pelPct}% of 600 mSv lifetime allowance`, 18, y + 17);
  doc.text(`• Active Dosimeter: Torso Pocket Dosimeter (TPD-03) | SPE Status: ${latestRadiation?.speIndex ? (latestRadiation.speIndex > 3 ? 'FLARE ACTIVE' : 'NOMINAL') : 'NOMINAL'}`, 18, y + 23);

  y += 34;

  // Section 3: Musculoskeletal & Bone Mineral Health
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 116, 144);
  doc.text('3. MUSCULOSKELETAL & BONE DENSITY (Periodic DXA / pQCT Logs)', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);

  const spineT = boneMuscle ? `${boneMuscle.bmdTScoreSpine} (Nominal: > -1.0)` : '-0.72';
  const femurT = boneMuscle ? `${boneMuscle.bmdTScoreFemur} (Nominal: > -1.0)` : '-0.81';
  const grip = boneMuscle ? `${boneMuscle.gripStrengthKg} kg` : '46.2 kg';
  const ared = boneMuscle ? `${boneMuscle.aredCompliancePct}%` : '95%';

  doc.text(`• Lumbar Spine BMD T-Score: ${spineT}`, 18, y + 5);
  doc.text(`• Femoral Neck BMD T-Score: ${femurT}`, 18, y + 11);
  doc.text(`• Isometric Grip Strength: ${grip}`, 110, y + 5);
  doc.text(`• Prescribed ARED Load Compliance: ${ared}`, 110, y + 11);
  doc.text(`*Note: Wearable sensors do not directly measure bone density; periodic ultrasound / DXA scans utilized.`, 18, y + 19);

  y += 28;

  // Section 4: AI Anomaly Detection & Clinical Alerts History
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(14, 116, 144);
  doc.text('4. DETECTED HEALTH ANOMALIES & CLINICAL DECISION SUPPORT', 14, y);
  y += 6;

  if (alerts.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('No active or unresolved health alerts. All monitored telemetry channels are nominal.', 18, y + 4);
    y += 12;
  } else {
    for (const a of alerts.slice(0, 3)) {
      doc.setFillColor(a.severity === 'red' ? 254 : 254, a.severity === 'red' ? 242 : 243, a.severity === 'red' ? 242 : 199);
      doc.rect(14, y, pageWidth - 28, 18, 'F');
      doc.setDrawColor(a.severity === 'red' ? 239 : 245, a.severity === 'red' ? 68 : 158, a.severity === 'red' ? 68 : 11);
      doc.setLineWidth(0.4);
      doc.rect(14, y, pageWidth - 28, 18, 'D');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(a.severity === 'red' ? 185 : 180, a.severity === 'red' ? 28 : 83, a.severity === 'red' ? 28 : 9);
      doc.text(`[${a.severity.toUpperCase()}] ${a.title} — Detected: ${a.observedValue} (Baseline: ${a.baselineValue})`, 18, y + 5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`Reason: ${a.reason.substring(0, 110)}...`, 18, y + 10);
      doc.text(`Action: ${a.recommendedAction.substring(0, 110)}...`, 18, y + 14);

      y += 22;
    }
  }

  // Footer & Medical Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('ASTRA HEALTH Platform — NASA Space Apps Challenge 2026 Prototype', 14, 285);
  doc.text('NASA Human Research Program (HRP) & OSDR Referenced Architecture', pageWidth - 105, 285);

  return doc;
}
