export enum PetType {
  DOG = "DOG",
  CAT = "CAT",
  OTHER = "OTHER",
}

export enum PetGender {
  FEMALE = "FEMALE",
  MALE = "MALE",
}

// Result of the FIV/FeLV combo test (cats only). NOT_TESTED = no test on record.
export enum FivFelvStatus {
  NOT_TESTED = "NOT_TESTED",
  NEGATIVE = "NEGATIVE",
  POSITIVE = "POSITIVE",
}

export interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: PetType;
  breed: string;
  gender: PetGender;
  image?: string;
  hasPetPlan: boolean;
  hasFuneraryPlan: boolean;
  petPlanName?: string;
  fivStatus?: FivFelvStatus;
  felvStatus?: FivFelvStatus;
}

export interface PetFormData {
  name: string;
  dob: string;
  weight: number;
  type: PetType;
  breed: string;
  gender: PetGender;
  image?: string;
  hasPetPlan: boolean;
  hasFuneraryPlan: boolean;
  petPlanName?: string;
  fivStatus: FivFelvStatus;
  felvStatus: FivFelvStatus;
}







