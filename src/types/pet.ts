export enum PetType {
  DOG = "DOG",
  CAT = "CAT",
  OTHER = "OTHER",
}

export enum PetGender {
  FEMALE = "FEMALE",
  MALE = "MALE",
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
}

