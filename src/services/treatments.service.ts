import { httpClient } from "@/lib/httpClient";

export interface Medication {
  id?: string;
  treatmentId?: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string;
}

export interface Treatment {
  id: string;
  petId: string;
  cause: string;
  description: string;
  startDate: string;
  endDate: string;
  medications: Medication[];
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TreatmentsResponse {
  treatments: Treatment[];
  pagination: Pagination;
}

/**
 * Get treatments for a specific pet with pagination
 */
export async function getTreatmentsByPet(
  token: string,
  petId: string,
  page: number = 1,
  limit: number = 4
): Promise<TreatmentsResponse> {
  return httpClient.get<TreatmentsResponse>(token, `/treatments/pet/${petId}`, {
    queryParams: { page, limit },
  });
}

/**
 * Create a new treatment
 */
export async function createTreatment(
  token: string,
  data: {
    petId: string;
    cause: string;
    description: string;
    startDate: string;
    endDate: string;
    medications: Medication[];
  }
): Promise<Treatment> {
  return httpClient.post<Treatment>(token, "/treatments", data);
}
