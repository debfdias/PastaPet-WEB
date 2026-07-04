"use server";

import { revalidateTag } from "next/cache";

/**
 * Invalidate the cached "treatments" data so server components that depend on it
 * (e.g. the dashboard's pets-under-treatment card, which fetches with
 * `tags: ["treatments"]`) refetch on the next render. Call this after a
 * treatment is created, updated, or deleted.
 */
export async function revalidateTreatments() {
  revalidateTag("treatments");
}
