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

export interface PetUnderTreatment {
  id: string;
  name: string;
  image?: string | null;
  cause: string;
  activeTreatmentCount: number;
}

export interface ActiveTreatmentsResponse {
  pets: PetUnderTreatment[];
  totalCount: number;
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
 * Get the user's pets that are currently under treatment (ongoing/open-ended),
 * grouped by pet with a count of active treatments.
 *
 * Server Component version: uses Next.js caching so it is not refetched on every
 * dashboard visit (mirrors getPets). Falls back to an empty result on error.
 */
export async function getActiveTreatments(
  token: string,
  options?: { limit?: number; revalidate?: number; tags?: string[] }
): Promise<ActiveTreatmentsResponse> {
  try {
    return await httpClient.get<ActiveTreatmentsResponse>(
      token,
      "/treatments/active",
      {
        // Omit limit to fetch every pet under treatment (the dashboard slices
        // the preview client-side and shows the rest in a modal).
        queryParams: options?.limit ? { limit: options.limit } : {},
        next: {
          revalidate: options?.revalidate ?? 86400, // Default: 1 day
          tags: options?.tags ?? ["treatments"],
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch active treatments:", error);
    return { pets: [], totalCount: 0 };
  }
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
