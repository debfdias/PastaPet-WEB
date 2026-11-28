import { httpClient } from "@/lib/httpClient";
import { PetReport, ReportShare } from "@/types/report";

// In-memory cache so navigating back to a report (e.g. after opening an exam
// file) shows it instantly instead of re-fetching with a loading spinner.
const reportCache = new Map<string, PetReport>();

export function getCachedReport(petId: string): PetReport | undefined {
  return reportCache.get(petId);
}

export async function getPetReport(
  token: string,
  petId: string
): Promise<PetReport> {
  const report = await httpClient.get<PetReport>(
    token,
    `/reports/pet/${petId}`
  );
  reportCache.set(petId, report);
  return report;
}

export async function getShareLink(
  token: string,
  petId: string
): Promise<{ share: ReportShare | null }> {
  return httpClient.get<{ share: ReportShare | null }>(
    token,
    `/reports/pet/${petId}/share`
  );
}

export async function createShareLink(
  token: string,
  petId: string
): Promise<ReportShare> {
  return httpClient.post<ReportShare>(token, `/reports/pet/${petId}/share`);
}

export async function revokeShareLink(
  token: string,
  petId: string
): Promise<void> {
  await httpClient.delete(token, `/reports/pet/${petId}/share`);
}

/**
 * Public report — no authentication. Fetched directly (not via httpClient,
 * which always attaches a bearer token).
 */
export async function getPublicReport(shareToken: string): Promise<PetReport> {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  const res = await fetch(`${base}/reports/public/${shareToken}`);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}
