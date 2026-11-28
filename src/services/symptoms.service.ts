import { httpClient } from "@/lib/httpClient";
import { Symptom, Severity, SymptomType } from "@/types/report";

export interface SymptomsResponse {
  symptoms: Symptom[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export async function getSymptomsByPet(
  token: string,
  petId: string,
  page = 1,
  limit = 10
): Promise<SymptomsResponse> {
  return httpClient.get<SymptomsResponse>(token, `/symptoms/pet/${petId}`, {
    queryParams: { page, limit },
  });
}

export async function createSymptom(
  token: string,
  data: {
    petId: string;
    type: SymptomType;
    severity: Severity;
    notes?: string;
    observedAt?: string;
  }
): Promise<Symptom> {
  return httpClient.post<Symptom>(token, "/symptoms", data);
}

export async function deleteSymptom(token: string, id: string): Promise<void> {
  await httpClient.delete(token, `/symptoms/${id}`);
}
