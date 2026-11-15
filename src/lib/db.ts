// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { 
  Astronaut, 
  Mission, 
  HealthReading, 
  RadiationRecord, 
  SleepRecord, 
  WellnessRecord, 
  BoneMuscleRecord, 
  HealthAlert, 
  ResearchDataset, 
  AuditLog, 
  ThresholdSettings 
} from './types';

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(process.cwd(), 'astra_health.db');

if (process.env.DATABASE_PATH) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

let _db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!_db) {
    _db = new DatabaseSync(DB_PATH);
    initSchema(_db);
    seedDataIfNeeded(_db);
  }
  return _db;
}

function initSchema(db: DatabaseSync) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS astronauts (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      rank TEXT NOT NULL,
      role TEXT NOT NULL,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      blood_type TEXT NOT NULL,
      mission_id TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      baseline_hr REAL NOT NULL,
      baseline_sys REAL NOT NULL,
      baseline_dia REAL NOT NULL,
      baseline_spo2 REAL NOT NULL,
      baseline_temp REAL NOT NULL,
      baseline_resp REAL NOT NULL,
      baseline_sleep REAL NOT NULL,
      status TEXT NOT NULL,
      mission_day INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS missions (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE,
      name TEXT NOT NULL,
      destination TEXT NOT NULL,
      launch_date TEXT NOT NULL,
      return_date TEXT NOT NULL,
      day_number INTEGER NOT NULL,
      total_days INTEGER NOT NULL,
      crew_size INTEGER NOT NULL,
      status TEXT NOT NULL,
      distance_km REAL NOT NULL,
      comm_delay_sec REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_readings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronaut_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      heart_rate REAL NOT NULL,
      systolic_bp REAL NOT NULL,
      diastolic_bp REAL NOT NULL,
      spo2 REAL NOT NULL,
      body_temp REAL NOT NULL,
      respiratory_rate REAL NOT NULL,
      stress_score REAL NOT NULL,
      mood_score REAL NOT NULL,
      exercise_minutes REAL NOT NULL,
      is_synthetic INTEGER DEFAULT 1,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS radiation_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronaut_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      daily_exposure_msv REAL NOT NULL,
      cumulative_exposure_msv REAL NOT NULL,
      dosimeter_location TEXT NOT NULL,
      spe_index REAL NOT NULL,
      gcr_index REAL NOT NULL,
      status TEXT NOT NULL,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS sleep_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronaut_id TEXT NOT NULL,
      date TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      deep_sleep_pct REAL NOT NULL,
      rem_sleep_pct REAL NOT NULL,
      light_sleep_pct REAL NOT NULL,
      efficiency_pct REAL NOT NULL,
      latency_minutes REAL NOT NULL,
      disruptions_count INTEGER NOT NULL,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS wellness_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronaut_id TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      mood_valence REAL NOT NULL,
      energy_level REAL NOT NULL,
      team_cohesion REAL NOT NULL,
      cognitive_pvt_ms REAL NOT NULL,
      subjective_fatigue REAL NOT NULL,
      notes TEXT,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS bone_muscle_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      astronaut_id TEXT NOT NULL,
      recorded_date TEXT NOT NULL,
      bmd_t_score_spine REAL NOT NULL,
      bmd_t_score_femur REAL NOT NULL,
      grip_strength_kg REAL NOT NULL,
      ared_compliance_pct REAL NOT NULL,
      calcium_intake_mg REAL NOT NULL,
      vitamin_d_iu REAL NOT NULL,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS health_alerts (
      id TEXT PRIMARY KEY,
      astronaut_id TEXT NOT NULL,
      title TEXT NOT NULL,
      severity TEXT NOT NULL,
      parameter TEXT NOT NULL,
      observed_value TEXT NOT NULL,
      baseline_value TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      recommended_action TEXT NOT NULL,
      status TEXT NOT NULL,
      acknowledged_by TEXT,
      acknowledged_at TEXT,
      resolution_notes TEXT,
      explanation_json TEXT,
      FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
    );

    CREATE TABLE IF NOT EXISTS research_datasets (
      id TEXT PRIMARY KEY,
      accession TEXT UNIQUE,
      title TEXT NOT NULL,
      organism TEXT NOT NULL,
      payload TEXT NOT NULL,
      mission TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      doi TEXT NOT NULL,
      url TEXT NOT NULL,
      samples_count INTEGER NOT NULL,
      year INTEGER NOT NULL,
      tags_json TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      actor TEXT NOT NULL,
      action TEXT NOT NULL,
      details TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
}

function seedDataIfNeeded(db: DatabaseSync) {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM astronauts').get() as { count: number };
  if (countRow && countRow.count > 0) {
    return; // Already seeded
  }

  // 1. Mission Seed
  const insertMission = db.prepare(`
    INSERT INTO missions (id, code, name, destination, launch_date, return_date, day_number, total_days, crew_size, status, distance_km, comm_delay_sec)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMission.run(
    'MIS-ART-04',
    'ARTEMIS-IV',
    'Artemis IV Deep-Space Gateway Expedition',
    'Lunar Near-Rectilinear Halo Orbit (NRHO)',
    '2026-06-25',
    '2027-06-25',
    142,
    365,
    4,
    'active',
    384400,
    1.28
  );

  // 2. Astronauts Seed
  const astronautsData: Astronaut[] = [
    {
      id: 'AST-0421',
      code: 'EVA-01',
      name: 'Dr. Elena Vance',
      rank: 'Commander',
      role: 'Mission Commander & Astrobiologist',
      age: 42,
      gender: 'Female',
      bloodType: 'A+',
      missionId: 'MIS-ART-04',
      avatarUrl: '/avatars/elena_vance.jpg',
      baselineHr: 62,
      baselineSys: 116,
      baselineDia: 74,
      baselineSpo2: 98.8,
      baselineTemp: 36.6,
      baselineResp: 14,
      baselineSleep: 7.8,
      status: 'elevated', // experiencing cardiovascular drift
      missionDay: 142
    },
    {
      id: 'AST-0422',
      code: 'MHA-02',
      name: 'Col. Marcus Hayes',
      rank: 'Pilot',
      role: 'Lead Pilot & Mechanical Systems Specialist',
      age: 45,
      gender: 'Male',
      bloodType: 'O+',
      missionId: 'MIS-ART-04',
      avatarUrl: '/avatars/marcus_hayes.jpg',
      baselineHr: 58,
      baselineSys: 118,
      baselineDia: 76,
      baselineSpo2: 99.1,
      baselineTemp: 36.5,
      baselineResp: 13,
      baselineSleep: 7.4,
      status: 'nominal',
      missionDay: 142
    },
    {
      id: 'AST-0423',
      code: 'KSA-03',
      name: 'Dr. Kenji Sato',
      rank: 'Mission Specialist',
      role: 'Chief Medical Officer & Neuroscientist',
      age: 38,
      gender: 'Male',
      bloodType: 'B+',
      missionId: 'MIS-ART-04',
      avatarUrl: '/avatars/kenji_sato.jpg',
      baselineHr: 64,
      baselineSys: 114,
      baselineDia: 72,
      baselineSpo2: 98.6,
      baselineTemp: 36.7,
      baselineResp: 15,
      baselineSleep: 8.0,
      status: 'nominal',
      missionDay: 142
    },
    {
      id: 'AST-0424',
      code: 'SLI-04',
      name: 'Dr. Sarah Lindqvist',
      rank: 'Flight Engineer',
      role: 'Radiation Physicist & Systems Engineer',
      age: 36,
      gender: 'Female',
      bloodType: 'AB+',
      missionId: 'MIS-ART-04',
      avatarUrl: '/avatars/sarah_lindqvist.jpg',
      baselineHr: 65,
      baselineSys: 115,
      baselineDia: 73,
      baselineSpo2: 98.9,
      baselineTemp: 36.6,
      baselineResp: 14,
      baselineSleep: 7.6,
      status: 'critical', // high radiation exposure during EVA flare
      missionDay: 142
    }
  ];

  const insertAstro = db.prepare(`
    INSERT INTO astronauts (
      id, code, name, rank, role, age, gender, blood_type, mission_id, avatar_url,
      baseline_hr, baseline_sys, baseline_dia, baseline_spo2, baseline_temp, baseline_resp, baseline_sleep, status, mission_day
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const a of astronautsData) {
    insertAstro.run(
      a.id, a.code, a.name, a.rank, a.role, a.age, a.gender, a.bloodType, a.missionId, a.avatarUrl,
      a.baselineHr, a.baselineSys, a.baselineDia, a.baselineSpo2, a.baselineTemp, a.baselineResp, a.baselineSleep, a.status, a.missionDay
    );
  }

  // 3. Historical Telemetry Generator (30 days of daily readings + last 24 hours high-resolution readings)
  const insertReading = db.prepare(`
    INSERT INTO health_readings (
      astronaut_id, timestamp, heart_rate, systolic_bp, diastolic_bp, spo2, body_temp, respiratory_rate, stress_score, mood_score, exercise_minutes, is_synthetic
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertRadiation = db.prepare(`
    INSERT INTO radiation_records (
      astronaut_id, timestamp, daily_exposure_msv, cumulative_exposure_msv, dosimeter_location, spe_index, gcr_index, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertSleep = db.prepare(`
    INSERT INTO sleep_records (
      astronaut_id, date, duration_hours, deep_sleep_pct, rem_sleep_pct, light_sleep_pct, efficiency_pct, latency_minutes, disruptions_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertWellness = db.prepare(`
    INSERT INTO wellness_records (
      astronaut_id, timestamp, mood_valence, energy_level, team_cohesion, cognitive_pvt_ms, subjective_fatigue, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertBoneMuscle = db.prepare(`
    INSERT INTO bone_muscle_records (
      astronaut_id, recorded_date, bmd_t_score_spine, bmd_t_score_femur, grip_strength_kg, ared_compliance_pct, calcium_intake_mg, vitamin_d_iu
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date();

  for (const a of astronautsData) {
    let cumRadiation = 24.5 + Math.random() * 4.0;

    // Generate past 30 days
    for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
      const dayDate = new Date(now.getTime() - dayOffset * 24 * 60 * 60 * 1000);
      const dateStr = dayDate.toISOString().split('T')[0];

      // Simulated condition variations:
      // Elena has gradual HR drift upward over the last 7 days
      let hrDrift = 0;
      if (a.id === 'AST-0421' && dayOffset < 8) {
        hrDrift = (8 - dayOffset) * 2.2; // drifts up to +17 BPM
      }

      // Sarah had a radiation flare on day 2 and day 1 ago
      let dailyRad = 0.42 + (Math.sin(dayOffset) * 0.08);
      let radStatus: 'normal' | 'elevated' | 'critical' = 'normal';
      if (a.id === 'AST-0424' && dayOffset <= 2) {
        dailyRad = 2.85 + (2 - dayOffset) * 0.6; // SPE flare event
        radStatus = 'critical';
      }
      cumRadiation += dailyRad;

      const hr = Math.round(a.baselineHr + hrDrift + (Math.random() * 6 - 3));
      const sys = Math.round(a.baselineSys + (a.id === 'AST-0421' && dayOffset < 8 ? 8 : 0) + (Math.random() * 6 - 3));
      const dia = Math.round(a.baselineDia + (Math.random() * 4 - 2));
      const spo2 = Number((a.baselineSpo2 + (Math.random() * 0.6 - 0.3)).toFixed(1));
      const temp = Number((a.baselineTemp + (a.id === 'AST-0421' && dayOffset < 4 ? 0.4 : 0) + (Math.random() * 0.2 - 0.1)).toFixed(2));
      const resp = Math.round(a.baselineResp + (a.id === 'AST-0421' && dayOffset < 8 ? 2 : 0) + (Math.random() * 2 - 1));
      const stress = Math.min(100, Math.max(10, Math.round(35 + (a.id === 'AST-0421' && dayOffset < 8 ? 32 : 0) + (a.id === 'AST-0424' && dayOffset <= 2 ? 40 : 0) + (Math.random() * 12 - 6))));
      const mood = Math.max(2, Math.min(10, Math.round(8.5 - (stress > 60 ? 3.0 : 0) + (Math.random() * 1.5 - 0.7))));
      const exercise = Math.round(a.id === 'AST-0422' ? 140 + Math.random() * 20 : 120 + Math.random() * 15);

      insertReading.run(
        a.id,
        new Date(dayDate.setHours(12, 0, 0)).toISOString(),
        hr,
        sys,
        dia,
        spo2,
        temp,
        resp,
        stress,
        mood,
        exercise,
        1
      );

      insertRadiation.run(
        a.id,
        dateStr,
        Number(dailyRad.toFixed(2)),
        Number(cumRadiation.toFixed(2)),
        'Torso Pocket Dosimeter (TPD-03)',
        a.id === 'AST-0424' && dayOffset <= 2 ? 8.4 : 1.2,
        2.1,
        radStatus
      );

      const sleepDuration = Number((a.baselineSleep + (a.id === 'AST-0421' && dayOffset < 5 ? -1.8 : 0) + (Math.random() * 0.8 - 0.4)).toFixed(1));
      const efficiency = Math.round(88 - (sleepDuration < 6.5 ? 18 : 0) + Math.random() * 6);
      insertSleep.run(
        a.id,
        dateStr,
        sleepDuration,
        22.5,
        24.0,
        53.5,
        efficiency,
        18 + (sleepDuration < 6.5 ? 25 : 0),
        sleepDuration < 6.5 ? 4 : 1
      );

      insertWellness.run(
        a.id,
        dateStr,
        mood,
        mood > 6 ? 8.2 : 5.4,
        8.8,
        215 + (stress > 60 ? 85 : 0) + Math.round(Math.random() * 20), // PVT ms
        stress > 60 ? 5.2 : 2.4, // Samn-Perelli
        dayOffset === 1 && a.id === 'AST-0421' ? 'Subject reports mild headache, microgravity fluid sensation in upper facial tissue.' : null
      );
    }

    // Bone & Muscle Monthly Logs (past 4 months)
    for (let m = 4; m >= 0; m--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - m, 15).toISOString().split('T')[0];
      const lossFactor = (4 - m) * 0.08;
      insertBoneMuscle.run(
        a.id,
        monthDate,
        Number((-0.4 - lossFactor).toFixed(2)), // T-score spine
        Number((-0.5 - lossFactor * 1.1).toFixed(2)), // T-score femur
        Number((48.5 - lossFactor * 1.8 + Math.random() * 2).toFixed(1)),
        Number((94 - m * 1.5 + Math.random() * 4).toFixed(0)), // ARED %
        1200 + Math.round(Math.random() * 150),
        2000
      );
    }
  }

  // 4. Alerts Seed
  const insertAlert = db.prepare(`
    INSERT INTO health_alerts (
      id, astronaut_id, title, severity, parameter, observed_value, baseline_value, reason, timestamp, recommended_action, status, acknowledged_by, acknowledged_at, resolution_notes, explanation_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const alertsSeed: HealthAlert[] = [
    {
      id: 'ALT-2026-001',
      astronautId: 'AST-0424',
      title: 'Solar Flare Cumulative Dosimetry Warning',
      severity: 'red',
      parameter: 'Radiation Exposure Rate',
      observedValue: '3.45 mSv/24h',
      baselineValue: '0.45 mSv/24h',
      reason: 'Exterior secondary proton dosimeter spike during scheduled EVA maintenance corridor. Corresponds with NOAA S2 Solar Radiation Storm alert.',
      timestamp: new Date(now.getTime() - 2 * 3600 * 1000).toISOString(),
      recommendedAction: 'Immediate transit to Gateway Water-Shielded Crew Sleeping Quarter. Administer prophylactic antioxidant protocol and initiate 12-hour chromosome aberration blood assay.',
      status: 'active',
      explanationDetails: {
        deviationScore: 6.8,
        contributingFactors: ['Coronal Mass Ejection (CME) shockwave', 'EVA hatch proximity', 'Dosimeter high-energy LET peak'],
        affectedSystems: ['Hematopoietic system', 'Cellular DNA repair', 'Acute radiation defense'],
        riskScore: 89
      }
    },
    {
      id: 'ALT-2026-002',
      astronautId: 'AST-0421',
      title: 'Persistent Cardiovascular Drift & Fluid Redistribution',
      severity: 'amber',
      parameter: 'Resting Heart Rate & Mean Arterial Pressure',
      observedValue: '84 BPM (+22 BPM baseline)',
      baselineValue: '62 BPM',
      reason: 'Statistical Z-score (+3.1) sustained over 72 consecutive hours. Accompanied by mild elevation in tympanic temperature (37.1°C) and reduced HRV.',
      timestamp: new Date(now.getTime() - 6 * 3600 * 1000).toISOString(),
      recommendedAction: 'Increase fluid & electrolyte loading by 500 mL prior to cycle ergometer protocol. Perform lower body negative pressure (LBNP) diagnostic session and review hematocrit.',
      status: 'active',
      explanationDetails: {
        deviationScore: 3.1,
        contributingFactors: ['Cephalad fluid shift', 'Central venous pressure adaptation', 'Autonomic sympathetic tone elevation'],
        affectedSystems: ['Cardiovascular', 'Thermoregulatory', 'Orthostatic tolerance'],
        riskScore: 64
      }
    },
    {
      id: 'ALT-2026-003',
      astronautId: 'AST-0421',
      title: 'Circadian Phase Disruption & Acute Sleep Fragmentation',
      severity: 'amber',
      parameter: 'Sleep Duration & Efficiency',
      observedValue: '4.8 hrs / 68% efficiency',
      baselineValue: '7.8 hrs / 91% efficiency',
      reason: '3 consecutive nights below minimum restorative threshold (<5.5 hrs). PVT cognitive reaction time slowed by 92 ms from baseline.',
      timestamp: new Date(now.getTime() - 14 * 3600 * 1000).toISOString(),
      recommendedAction: 'Advance Solid-State Lighting module into melatonin-promoting blue-depleted spectrum (480nm notched) 90 minutes prior to scheduled sleep cycle. Defer non-critical robotic arm commanding.',
      status: 'acknowledged',
      acknowledgedBy: 'Dr. Kenji Sato (Flight Surgeon on-orbit)',
      acknowledgedAt: new Date(now.getTime() - 10 * 3600 * 1000).toISOString(),
      explanationDetails: {
        deviationScore: 2.7,
        contributingFactors: ['Acoustic noise in Node 2', 'Elevated mission taskload', 'Circadian pacemaker misalignment'],
        affectedSystems: ['Central nervous system', 'Cognitive vigilance', 'Neuro-behavioral'],
        riskScore: 58
      }
    },
    {
      id: 'ALT-2026-004',
      astronautId: 'AST-0422',
      title: 'ARED High-Resistance Exercise Load Target Reached',
      severity: 'green',
      parameter: 'Musculoskeletal Compliance',
      observedValue: '100% (145 mins)',
      baselineValue: '120 mins required',
      reason: 'Col. Hayes completed 100% of prescribed eccentric squat and deadlift regimen. No muscular strain detected by surface EMG telemetry.',
      timestamp: new Date(now.getTime() - 24 * 3600 * 1000).toISOString(),
      recommendedAction: 'Continue current countermeasure regime. Schedule routine quarterly peripheral quantitative computed tomography (pQCT) proxy ultrasound scan.',
      status: 'resolved',
      acknowledgedBy: 'Flight BME Houston',
      acknowledgedAt: new Date(now.getTime() - 22 * 3600 * 1000).toISOString(),
      resolutionNotes: 'Verified nominal muscle compliance. Countermeasure goals met.',
      explanationDetails: {
        deviationScore: 0.1,
        contributingFactors: ['High athletic baseline', 'Consistent nutrition compliance'],
        affectedSystems: ['Musculoskeletal', 'Bone mineral density'],
        riskScore: 5
      }
    }
  ];

  for (const al of alertsSeed) {
    insertAlert.run(
      al.id,
      al.astronautId,
      al.title,
      al.severity,
      al.parameter,
      String(al.observedValue),
      String(al.baselineValue),
      al.reason,
      al.timestamp,
      al.recommendedAction,
      al.status,
      al.acknowledgedBy || null,
      al.acknowledgedAt || null,
      al.resolutionNotes || null,
      al.explanationDetails ? JSON.stringify(al.explanationDetails) : null
    );
  }

  // 5. NASA Open Science Data Repository (OSDR) Authentic Research Datasets
  const insertDataset = db.prepare(`
    INSERT INTO research_datasets (
      id, accession, title, organism, payload, mission, category, description, doi, url, samples_count, year, tags_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const datasetsSeed: ResearchDataset[] = [
    {
      id: 'DS-OSDR-001',
      accession: 'OSD-379',
      title: 'NASA Twins Study: Multi-Omics and Physiological Changes in Long-Duration Spaceflight',
      organism: 'Homo sapiens',
      payload: 'Human Whole Blood, Saliva, Urine, Stool',
      mission: 'One-Year Mission (ISS Expeditions 43-46)',
      category: 'Cardiovascular',
      description: 'Comprehensive longitudinal biochemical, genomic, physiologic, and cognitive analysis of identical twin astronauts (Scott Kelly on ISS vs. Mark Kelly on Earth). Identified spaceflight-associated telomere elongation, DNA damage response, mitochondrial stress, and post-flight carotid artery stiffness.',
      doi: '10.1126/science.aau8650',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-379',
      samplesCount: 317,
      year: 2019,
      tags: ['Twins Study', 'Genomics', 'Cardiovascular', 'Telomeres', 'Epigenetics']
    },
    {
      id: 'DS-OSDR-002',
      accession: 'OSD-544',
      title: 'Immune System Dysregulation and Latent Herpesvirus Reactivation During Long-Duration Spaceflight',
      organism: 'Homo sapiens',
      payload: 'Plasma, Saliva, PBMC',
      mission: 'International Space Station (ISS 6-Month Flights)',
      category: 'Immune',
      description: 'Quantification of Epstein-Barr virus (EBV), Varicella-Zoster virus (VZV), and Cytomegalovirus (CMV) shedding in astronaut saliva, paired with cytokine profiling. Demonstrated persistent T-cell function suppression and subclinical viral reactivation caused by microgravity and cosmic radiation stressors.',
      doi: '10.3389/fmicb.2019.00016',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-544',
      samplesCount: 184,
      year: 2021,
      tags: ['Immunity', 'Virology', 'Cytokines', 'Herpesviruses', 'Microgravity']
    },
    {
      id: 'DS-OSDR-003',
      accession: 'OSD-352',
      title: 'Vascular Aging, Endothelial Remodeling, and Insulin Resistance in Long-Duration Spaceflight',
      organism: 'Homo sapiens',
      payload: 'Ultrasound Doppler, Blood Biomarkers',
      mission: 'ISS Expeditions 36-58 (Cardio Ox / Vascular)',
      category: 'Cardiovascular',
      description: 'Investigation of increased carotid artery intima-media thickness (cIMT), biomarkers of oxidative stress, and circulating inflammatory markers during 6-month space missions. Results demonstrate accelerated vascular remodeling equivalent to 10-20 years of aging on Earth.',
      doi: '10.1152/japplphysiol.00448.2018',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-352',
      samplesCount: 92,
      year: 2020,
      tags: ['Vascular Aging', 'Carotid Artery', 'Endothelium', 'Oxidative Stress']
    },
    {
      id: 'DS-OSDR-004',
      accession: 'OSD-590',
      title: 'Spaceflight-Associated Neuro-Ocular Syndrome (SANS) and Cephalad Fluid Dynamics',
      organism: 'Homo sapiens',
      payload: 'Optical Coherence Tomography (OCT), MRI, Ultrasound',
      mission: 'NASA Human Research Program (HRP SANS Corridor)',
      category: 'Neuro-ocular',
      description: 'Evaluation of optic disc edema, globe flattening, choroidal folds, and hyperopic refractive error shifts caused by microgravity-induced cephalad fluid redistribution and altered cerebral venous hemodynamics.',
      doi: '10.1001/jamaophthalmol.2020.2426',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-590',
      samplesCount: 64,
      year: 2022,
      tags: ['SANS', 'Optic Nerve', 'Intracranial Pressure', 'Vision', 'Ocular']
    },
    {
      id: 'DS-OSDR-005',
      accession: 'OSD-665',
      title: 'Trabecular Bone Microarchitecture Degradation and Biomarkers of Resorption During Extended Space Missions',
      organism: 'Homo sapiens',
      payload: 'HR-pQCT Scans, Serum CTX, Osteocalcin',
      mission: 'ISS Long-Duration Crew Missions',
      category: 'Musculoskeletal',
      description: 'High-resolution peripheral quantitative computed tomography (HR-pQCT) of tibia and radius before and after spaceflight. Showed 1.0-1.5% bone mineral density loss per month in weight-bearing bones despite intensive ARED resistance countermeasure routines.',
      doi: '10.1038/s41598-022-14008-9',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-665',
      samplesCount: 88,
      year: 2023,
      tags: ['Bone Density', 'Osteopenia', 'ARED Countermeasure', 'Calcium Resorption']
    },
    {
      id: 'DS-OSDR-006',
      accession: 'OSD-422',
      title: 'Actigraphic Sleep Deficiency, Circadian Disruption, and Hypnotic Drug Utilization in Astronauts',
      organism: 'Homo sapiens',
      payload: 'Wrist Actigraphy, Sleep Logs, PVT Vigilance',
      mission: 'Space Shuttle & ISS Missions (10-Day to 180-Day Flights)',
      category: 'Behavioral',
      description: 'Over 4,000 days of sleep monitoring across 85 astronauts. Revealed astronauts average only 5.96 hours of sleep in flight (versus 6.7 hours pre-flight), with frequent sleep fragmentation and widespread reliance on sleep-promoting pharmaceuticals.',
      doi: '10.1016/S1474-4422(14)70122-X',
      url: 'https://osdr.nasa.gov/bio/repo/data/studies/OSD-422',
      samplesCount: 420,
      year: 2018,
      tags: ['Circadian Rhythm', 'Sleep Deficiency', 'PVT', 'Fatigue', 'Behavioral Health']
    }
  ];

  for (const ds of datasetsSeed) {
    insertDataset.run(
      ds.id,
      ds.accession,
      ds.title,
      ds.organism,
      ds.payload,
      ds.mission,
      ds.category,
      ds.description,
      ds.doi,
      ds.url,
      ds.samplesCount,
      ds.year,
      JSON.stringify(ds.tags)
    );
  }

  // 6. Audit Logs Seed
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (timestamp, actor, action, details)
    VALUES (?, ?, ?, ?)
  `);

  insertAudit.run(new Date(now.getTime() - 25 * 3600 * 1000).toISOString(), 'Flight BME Houston', 'SYSTEM_INIT', 'ASTRA HEALTH telemetry core online for Artemis IV Gateway.');
  insertAudit.run(new Date(now.getTime() - 10 * 3600 * 1000).toISOString(), 'Dr. Kenji Sato', 'ALERT_ACKNOWLEDGE', 'Acknowledged circadian disruption alert ALT-2026-003 for CDR Vance.');
  insertAudit.run(new Date(now.getTime() - 2 * 3600 * 1000).toISOString(), 'System Anomaly Detector', 'ALERT_GENERATED', 'Generated critical radiation alert ALT-2026-001 for Dr. Sarah Lindqvist.');

  // 7. Initial Settings
  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
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
  insertSetting.run('thresholds', JSON.stringify(defaultThresholds));
  insertSetting.run('demo_mode', 'true');
  insertSetting.run('simulation_speed', 'normal');
}
