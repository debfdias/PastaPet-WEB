import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { getPets } from "@/services/pets.service";
import { getActiveTreatments } from "@/services/treatments.service";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch dashboard data on the server with caching so it isn't refetched on
  // every visit. Get first 6 pets for the My Pets preview and a 2-pet preview of
  // those under treatment (the full list lives on /pets?underTreatment=true).
  const [pets, activeTreatments] = await Promise.all([
    getPets(session.user.token, {
      limit: 6,
      revalidate: 86400, // 1 day in seconds
      tags: ["pets"],
    }),
    getActiveTreatments(session.user.token, {
      limit: 2,
      revalidate: 86400,
      tags: ["treatments"],
    }),
  ]);

  return (
    <DashboardClient
      session={session}
      initialPets={pets}
      initialTreatmentPets={activeTreatments}
    />
  );
}
