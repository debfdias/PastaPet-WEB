import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";

interface Pet {
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

async function getPets(token: string): Promise<Pet[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/pets`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      // Next.js fetch caching options
      // Pet data doesn't change frequently, so we cache for 1 day
      // router.refresh() will bypass cache and fetch fresh data when needed
      next: {
        // Revalidate every 24 hours (86400 seconds)
        // Adjust to 259200 for 3 days if preferred
        revalidate: 86400, // 1 day in seconds
        // Cache tags for manual revalidation via server actions
        tags: ["pets"],
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return data.slice(0, 6); // Show only first 6 pets as preview
  } catch (error) {
    console.error("Failed to fetch pets:", error);
    return [];
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch pets on the server with caching
  const pets = await getPets(session.user.token);

  return <DashboardClient session={session} initialPets={pets} />;
}
