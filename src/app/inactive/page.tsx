"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PetCard from "@/components/PetCard";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

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

export default function InactivePetsPage() {
  const { data: session, status } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslations("inactivePets");

  const fetchInactivePets = useCallback(async () => {
    if (!session?.user?.token) {
      setError(t("errors.authenticationRequired"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pets/inactive`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(t("errors.failedToFetch"));
      }
      const data = await response.json();
      setPets(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.anErrorOccurred");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.token, t]);

  useEffect(() => {
    if (status === "loading") return;
    fetchInactivePets();
  }, [session, status, fetchInactivePets]);

  const handleEdit = (pet: Pet) => {
    // Inactive pets might not be editable, but keeping the interface consistent
    console.log("Edit inactive pet:", pet);
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t("loading")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-500">{t("error", { error })}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{t("signInRequired")}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      {pets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl mb-2">{t("noPets.message")}</p>
          <p className="text-gray-600 dark:text-gray-400">
            {t("noPets.description")}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
