export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string;
}

export interface TreatmentFormData {
  cause: string;
  description: string;
  startDate: string;
  endDate: string;
  medications: Medication[];
}



