import { httpClient } from "@/lib/httpClient";
import { WeightEntry } from "@/types/report";

export async function getWeightsByPet(
  token: string,
  petId: string
): Promise<{ weights: WeightEntry[] }> {
  return httpClient.get<{ weights: WeightEntry[] }>(
    token,
    `/weights/pet/${petId}`
  );
}

export async function createWeightEntry(
  token: string,
  data: { petId: string; weight: number; measuredAt?: string; note?: string }
): Promise<WeightEntry> {
  return httpClient.post<WeightEntry>(token, "/weights", data);
}

export async function deleteWeightEntry(
  token: string,
  id: string
): Promise<void> {
  await httpClient.delete(token, `/weights/${id}`);
}
