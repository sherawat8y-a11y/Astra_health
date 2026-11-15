export type HealthStatus = 'nominal' | 'elevated' | 'critical';
export type AlertSeverity = 'green' | 'amber' | 'red';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type UserRole = 'flight_surgeon' | 'biomedical_engineer' | 'astronaut';
export type SimulationScenario = 'nominal' | 'cv_drift' | 'solar_flare' | 'circadian_crisis';

export interface Astronaut {
  id: string;
  code: string;
  name: string;
  rank: string;
  role: string;
  age: number;
  gender: string;
  bloodType: string;
  missionId: string;
  avatarUrl: string;
  baselineHr: number;
  baselineSys: number;
  baselineDia: number;
  baselineSpo2: number;
  baselineTemp: number;
  baselineResp: number;
  baselineSleep: number;
  status: HealthStatus;
  missionDay: number;
}

export interface Mission {
  id: string;
  code: string;
  name: string;
  destination: string;
  launchDate: string;
  returnDate: string;
  dayNumber: number;
  totalDays: number;
  crewSize: number;
  status: 'active' | 'completed' | 'planned';
  distanceFromEarthKm: number;
  commDelaySeconds: number;
}

export interface HealthReading {
  id?: number;
  astronautId: string;
  timestamp: string;
  heartRate: number;
  systolicBp: number;
  diastolicBp: number;
  spo2: number;
  bodyTemp: number;
  respiratoryRate: number;
  stressScore: number;
  moodScore: number;
  exerciseMinutes: number;
  isSynthetic: boolean;
}

export interface RadiationRecord {
  id?: number;
  astronautId: string;
  timestamp: string;
  dailyExposureMsv: number;
  cumulativeExposureMsv: number;
  dosimeterLocation: string;
  speIndex: number;
  gcrIndex: number;
  status: 'normal' | 'elevated' | 'critical';
}

export interface SleepRecord {
  id?: number;
  astronautId: string;
  date: string;
  durationHours: number;
  deepSleepPct: number;
  remSleepPct: number;
  lightSleepPct: number;
  efficiencyPct: number;
  latencyMinutes: number;
  disruptionsCount: number;
}

export interface WellnessRecord {
  id?: number;
  astronautId: string;
  timestamp: string;
  moodValence: number;
  energyLevel: number;
  teamCohesion: number;
  cognitivePvtMs: number;
  subjectiveFatigue: number;
  notes?: string;
}

export interface BoneMuscleRecord {
  id?: number;
  astronautId: string;
  recordedDate: string;
  bmdTScoreSpine: number;
  bmdTScoreFemur: number;
  gripStrengthKg: number;
  aredCompliancePct: number;
  calciumIntakeMg: number;
  vitaminDIu: number;
}

export interface HealthAlert {
  id: string;
  astronautId: string;
  astronautName?: string;
  title: string;
  severity: AlertSeverity;
  parameter: string;
  observedValue: string | number;
  baselineValue: string | number;
  reason: string;
  timestamp: string;
  recommendedAction: string;
  status: AlertStatus;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolutionNotes?: string;
  explanationDetails?: {
    deviationScore: number;
    contributingFactors: string[];
    affectedSystems: string[];
    riskScore: number;
  };
}

export interface ResearchDataset {
  id: string;
  accession: string;
  title: string;
  organism: string;
  payload: string;
  mission: string;
  category: 'Cardiovascular' | 'Radiation' | 'Musculoskeletal' | 'Immune' | 'Behavioral' | 'Neuro-ocular';
  description: string;
  doi: string;
  url: string;
  samplesCount: number;
  year: number;
  tags: string[];
}

export interface AuditLog {
  id?: number;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

export interface ThresholdSettings {
  heartRateMin: number;
  heartRateMax: number;
  spo2Min: number;
  bodyTempMax: number;
  respiratoryRateMax: number;
  dailyRadiationMaxMsv: number;
  cumulativeRadiationMaxMsv: number;
  minSleepDurationHours: number;
  stressScoreMax: number;
}

export interface HrpRiskEvidence {
  riskId: string;
  name: string;
  discipline: string;
  concern: string;
  countermeasures: string[];
  roadmapUrl: string;
}

export const HRP_RISK_MAP: HrpRiskEvidence[] = [
  {
    riskId: 'HRP-RAD-01',
    name: 'Risk of Radiation Carcinogenesis and Acute Radiation Syndromes',
    discipline: 'Space Radiation',
    concern: 'Exposure to galactic cosmic radiation (GCR) and solar particle events (SPE) damages DNA, impairs hematopoiesis, and elevates lifetime excess risk of cancer.',
    countermeasures: ['Polyethylene and water-wall shielding in crew quarters', 'Real-time active personal dosimeters', 'Pharmaceutical antioxidants and radioprotectants'],
    roadmapUrl: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=103'
  },
  {
    riskId: 'HRP-CARD-02',
    name: 'Risk of Adverse Health Events Due to Altered Gravity and Fluid Shifts',
    discipline: 'Cardiovascular & Fluid Dynamics',
    concern: 'Cephalad fluid redistribution causes central venous pressure elevation, loss of plasma volume, baroreflex resetting, and post-flight orthostatic intolerance.',
    countermeasures: ['Daily 2.5-hour resistance & cycle ergometry (ARED & T2)', 'Lower Body Negative Pressure (LBNP) suits', 'Fluid & electrolyte loading prior to re-entry'],
    roadmapUrl: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=105'
  },
  {
    riskId: 'HRP-BONE-03',
    name: 'Risk of Early-Onset Osteoporosis and Muscle Atrophy',
    discipline: 'Musculoskeletal',
    concern: 'Unloading of mechanical stress leads to 1.0-1.5% bone mineral density loss per month in weight-bearing bones and preferential atrophy of postural slow-twitch muscle fibers.',
    countermeasures: ['High-load axial resistive exercise via ARED', 'Bisphosphonates and recombinant PTH therapies', 'Optimized dietary calcium and 2000 IU Vitamin D supplementation'],
    roadmapUrl: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=101'
  },
  {
    riskId: 'HRP-BEH-04',
    name: 'Risk of Adverse Cognitive and Behavioral Conditions and Psychiatric Disorders',
    discipline: 'Behavioral Health & Performance (BHP)',
    concern: 'Confinement, isolation, sensory monotony, and circadian desynchrony cause sleep deficiency, cognitive lapse rate elevation, and interpersonal friction.',
    countermeasures: ['Circadian dynamic LED lighting (blue-enriched alerting, red-depleted sleep)', 'Regular private psychological conferences (PPC)', 'Autonomous stress-management and virtual reality nature immersion'],
    roadmapUrl: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=108'
  },
  {
    riskId: 'HRP-SANS-05',
    name: 'Risk of Spaceflight-Associated Neuro-ocular Syndrome (SANS)',
    discipline: 'Neuro-vestibular & Ophthalmic',
    concern: 'Microgravity-induced cephalad venous engorgement impairs optic sheath CSF reabsorption, causing optic disc edema, globe flattening, and hyperopic hyperopia.',
    countermeasures: ['Periodic Optical Coherence Tomography (OCT) monitoring', 'Venous constriction collars (Chibis / thigh cuffs)', 'LBNP gravity-replacement countermeasures'],
    roadmapUrl: 'https://humanresearchroadmap.nasa.gov/risks/risk.aspx?i=110'
  }
];
