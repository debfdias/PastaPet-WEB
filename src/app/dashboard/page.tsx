import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import DashboardClient from "./DashboardClient";
import { getPets } from "@/services/pets.service";

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Fetch pets on the server with caching
  // Get first 6 pets for dashboard preview
  const pets = await getPets(session.user.token, {
    limit: 6,
    revalidate: 86400, // 1 day in seconds
    tags: ["pets"],
  });

  return <DashboardClient session={session} initialPets={pets} />;
}
