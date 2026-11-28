export type SymptomType =
  | "VOMITING"
  | "DIARRHEA"
  | "APPETITE_LOSS"
  | "LETHARGY"
  | "COUGHING"
  | "SNEEZING"
  | "ITCHING"
  | "LIMPING"
  | "SEIZURE"
  | "OTHER";

export type Severity = "LOW" | "MEDIUM" | "HIGH";

export const SYMPTOM_TYPES: SymptomType[] = [
  "VOMITING",
  "DIARRHEA",
  "APPETITE_LOSS",
  "LETHARGY",
  "COUGHING",
  "SNEEZING",
  "ITCHING",
  "LIMPING",
  "SEIZURE",
  "OTHER",
];

export interface Symptom {
  id: string;
  petId: string;
  type: SymptomType;
  severity: Severity;
  notes?: string | null;
  observedAt: string;
  createdAt?: string;
}

export interface WeightEntry {
  id: string;
  petId: string;
  weight: number;
  measuredAt: string;
  note?: string | null;
}

export interface ReportShare {
  id: string;
  petId: string;
  token: string;
  enabled: boolean;
  expiresAt?: string | null;
  createdAt: string;
}

export interface ReportPet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  gender: string;
  image?: string | null;
  active: boolean;
  hasPetPlan: boolean;
  petPlanName?: string | null;
  fivStatus: string;
  felvStatus: string;
  createdAt: string;
}

export interface ReportMedication {
  id: string;
  name: string;
  dosage?: string | null;
  frequency?: string | null;
  notes?: string | null;
  startDate: string;
  endDate?: string | null;
}

export interface ReportTreatment {
  id: string;
  cause: string;
  description?: string | null;
  startDate: string;
  endDate?: string | null;
  medications: ReportMedication[];
}

export interface ReportExam {
  id: string;
  title: string;
  cause: string;
  administeredBy?: string | null;
  fileUrls: string[];
  resultSummary?: string | null;
  examDate: string;
}

export interface ReportVaccine {
  id: string;
  administrationDate: string;
  nextDueDate?: string | null;
  validUntil?: string | null;
  administeredBy?: string | null;
  notes?: string | null;
  booster: boolean;
  vaccineType: {
    id: string;
    name: string;
    diseaseCovered: string[];
    isCore: boolean;
  };
}

export interface ReportNote {
  id: string;
  title: string;
  description: string;
  severity: Severity;
  createdAt: string;
}

export interface ReportEvent {
  id: string;
  title: string;
  type: string;
  eventDate: string;
}

export interface PetReport {
  pet: ReportPet;
  weightEntries: WeightEntry[];
  symptoms: Symptom[];
  events: ReportEvent[];
  treatments: ReportTreatment[];
  exams: ReportExam[];
  vaccines: ReportVaccine[];
  notes: ReportNote[];
}
