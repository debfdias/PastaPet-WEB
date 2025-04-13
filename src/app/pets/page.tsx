"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PetCard from "@/components/PetCard";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
}

export default function PetsPage() {
  const { data: session, status } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPets = async () => {
      if (status === "loading") return;

      if (!session?.user?.token) {
        setError("Authentication required");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("http://localhost:3000/api/pets", {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch pets");
        }
        const data = await response.json();
        setPets(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [session, status]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading pets...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Please sign in to view your pets</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">My Pets</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pets.map((pet) => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  );
}
