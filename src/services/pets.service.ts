import { Pet, PetType, PetGender } from "@/types/pet";
import { httpClient } from "@/lib/httpClient";

/**
 * API response type where type and gender are strings (not enums)
 * This matches what the API returns
 */
export interface PetApiResponse {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  gender: string;
  image?: string;
  hasPetPlan: boolean;
  hasFuneraryPlan: boolean;
  petPlanName?: string;
}

/**
 * Options for fetching pets (used in client components)
 */
export interface GetPetsOptions {
  name?: string;
  type?: string;
  orderByAge?: string;
}

/**
 * Options for server-side fetching (includes Next.js cache options)
 */
export interface GetPetsServerOptions extends GetPetsOptions {
  limit?: number;
  revalidate?: number;
  tags?: string[];
}

/**
 * Get pets from API (Server Component version)
 * Supports Next.js caching and revalidation
 */
export async function getPets(
  token: string,
  options?: GetPetsServerOptions
): Promise<PetApiResponse[]> {
  try {
    const { limit, revalidate, tags, ...queryParams } = options || {};

    const data = await httpClient.get<PetApiResponse[]>(token, "/pets", {
      queryParams: queryParams as Record<
        string,
        string | number | boolean | undefined
      >,
      next: {
        revalidate: revalidate ?? 86400, // Default: 1 day
        tags: tags ?? ["pets"],
      },
    });

    // Apply limit if specified (e.g., for dashboard preview)
    if (limit) {
      return data.slice(0, limit);
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return [];
  }
}

/**
 * Get pets from API (Client Component version)
 * No caching, throws errors for client-side error handling
 */
export async function getPetsClient(
  token: string,
  options?: GetPetsOptions
): Promise<PetApiResponse[]> {
  return httpClient.get<PetApiResponse[]>(token, "/pets", {
    queryParams: options as Record<
      string,
      string | number | boolean | undefined
    >,
  });
}

/**
 * Get a single pet by ID
 */
export async function getPetById(
  token: string,
  petId: string
): Promise<PetApiResponse | null> {
  try {
    return await httpClient.get<PetApiResponse>(token, `/pets/${petId}`, {
      next: {
        revalidate: 3600, // Revalidate every hour
        tags: ["pets", `pet-${petId}`],
      },
    });
  } catch (error) {
    console.error("Failed to fetch pet:", error);
    return null;
  }
}

/**
 * Get inactive pets from API (Client Component version)
 * No caching, throws errors for client-side error handling
 */
export async function getInactivePets(
  token: string
): Promise<PetApiResponse[]> {
  return httpClient.get<PetApiResponse[]>(token, "/pets/inactive");
}

/**
 * Get a single pet by ID (Client Component version)
 * No caching, throws errors for client-side error handling
 */
export async function getPetByIdClient(
  token: string,
  petId: string
): Promise<PetApiResponse> {
  return httpClient.get<PetApiResponse>(token, `/pets/${petId}`);
}

/**
 * Create a new pet
 */
export async function createPet(
  token: string,
  data: {
    name: string;
    dob: string;
    weight: number;
    type: string;
    breed: string;
    gender: string;
    image?: string;
    hasPetPlan: boolean;
    hasFuneraryPlan: boolean;
    petPlanName?: string;
  }
): Promise<PetApiResponse> {
  return httpClient.post<PetApiResponse>(token, "/pets", data);
}

/**
 * Update an existing pet
 */
export async function updatePet(
  token: string,
  petId: string,
  data: {
    name: string;
    dob: string;
    weight: number;
    type: string;
    breed: string;
    gender: string;
    image?: string;
    hasPetPlan: boolean;
    hasFuneraryPlan: boolean;
    petPlanName?: string;
  }
): Promise<PetApiResponse> {
  return httpClient.put<PetApiResponse>(token, `/pets/${petId}`, data);
}

/**
 * Convert API response Pet to typed Pet (with enums)
 * Useful when you need to work with the enum types in components
 */
export function convertPetApiResponseToPet(apiPet: PetApiResponse): Pet {
  return {
    ...apiPet,
    type: apiPet.type as PetType,
    gender: apiPet.gender as PetGender,
  };
}
