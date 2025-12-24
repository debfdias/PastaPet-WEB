export interface VaccineType {
  id: string;
  name: string;
  diseaseCovered: string[];
  isCore: boolean;
  boosterRequired: boolean;
  boosterIntervalMonths?: number;
  totalRequiredDoses?: number;
}

export interface VaccineFormData {
  vaccineTypeId: string;
  administrationDate: string;
  nextDueDate: string;
  validUntil: string;
  lotNumber: string;
  administeredBy: string;
  notes: string;
  isBooster: boolean;
}

