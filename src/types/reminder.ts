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

export interface ReminderPet {
  id: string;
  name: string;
}

export interface Reminder {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  priority: ReminderPriority;
  reminderType: ReminderType;
  isCompleted: boolean;
  completedAt?: string | null;
  viewedAt?: string | null;
  relatedRecordId?: string | null;
  relatedRecordType?: string | null;
  medicationId?: string | null;
  userId: string;
  petId: string;
  pet?: ReminderPet;
  createdAt: string;
  updatedAt: string;
}

export interface RemindersPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface RemindersResponse {
  reminders: Reminder[];
  pagination: RemindersPagination;
}
