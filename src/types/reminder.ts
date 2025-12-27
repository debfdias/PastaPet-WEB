export enum ReminderPriority {
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum ReminderType {
  VACCINE_BOOSTER = "VACCINE_BOOSTER",
  VET_APPOINTMENT = "VET_APPOINTMENT",
  EXAM = "EXAM",
  TREATMENT_FOLLOWUP = "TREATMENT_FOLLOWUP",
  MEDICATION = "MEDICATION",
  CUSTOM = "CUSTOM",
}

export interface ReminderFormData {
  title: string;
  description?: string;
  reminderDate: string;
  priority: ReminderPriority;
  reminderType: ReminderType;
  selectedPetId?: string;
}

