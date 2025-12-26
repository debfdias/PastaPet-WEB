import { httpClient } from "@/lib/httpClient";

export interface VaccineType {
  id: string;
  name: string;
  diseaseCovered: string[];
  isCore: boolean;
  boosterRequired: boolean;
  boosterIntervalMonths?: number;
  totalRequiredDoses?: number;
}

export interface Vaccine {
  id: string;
  petId: string;
  vaccineType: VaccineType;
  vaccineTypeId: string;
  administrationDate: string;
  nextDueDate?: string;
  validUntil?: string;
  lotNumber?: string;
  administeredBy?: string;
  notes?: string;
  isBooster?: boolean;
}

export interface VaccinesPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface VaccinesResponse {
  vaccineRecords: Vaccine[];
  pagination: VaccinesPagination;
}

/**
 * Get vaccines for a specific pet with pagination
 */
export async function getVaccinesByPet(
  token: string,
  petId: string,
  page: number = 1,
  limit: number = 4
): Promise<VaccinesResponse> {
  return httpClient.get<VaccinesResponse>(token, `/vaccines/pet/${petId}`, {
    queryParams: { page, limit },
  });
}

/**
 * Get all vaccine types
 */
export async function getVaccineTypes(token: string): Promise<VaccineType[]> {
  return httpClient.get<VaccineType[]>(token, "/vaccines/types");
}

/**
 * Create a new vaccine record
 */
export async function createVaccine(
  token: string,
  data: {
    petId: string;
    vaccineTypeId: string;
    administrationDate: string;
    nextDueDate: string;
    validUntil: string;
    lotNumber: string;
    administeredBy: string;
    notes: string;
    booster: boolean;
  }
): Promise<Vaccine> {
  return httpClient.post<Vaccine>(token, "/vaccines", data);
}
