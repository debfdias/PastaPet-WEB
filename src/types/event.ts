export enum EventType {
  NORMAL = "normal",
  MEDICAL = "medical",
  GROOMING = "grooming",
  TRAINING = "training",
}

export interface EventFormData {
  title: string;
  type: EventType;
  eventDate: string;
}






