"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import PetCard from "@/components/PetCard";
import PetModal from "@/components/PetModal";
import PetFilters from "@/components/PetFilters";
import { MdPets } from "react-icons/md";
import { useTranslations } from "next-intl";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  gender: string;
  image?: string;
}

interface Filters {
  name: string;
  type: string;
}

export default function PetsPage() {
  const { data: session, status } = useSession();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();
  const [filters, setFilters] = useState<Filters>({ name: "", type: "" });
  const t = useTranslations("pets");

  const fetchPets = useCallback(async () => {
    if (!session?.user?.token) {
      setError(t("errors.authenticationRequired"));
      setLoading(false);
      return;
    }

    try {
      const queryParams = new URLSearchParams();
      if (filters.name) queryParams.append("name", filters.name);
      if (filters.type) queryParams.append("type", filters.type);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pets?${queryParams.toString()}`,
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
      setError(
        err instanceof Error ? err.message : t("errors.anErrorOccurred")
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.token, filters, t]);

  useEffect(() => {
    if (status === "loading") return;
    fetchPets();
  }, [session, status, fetchPets]);

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleEdit = (pet: Pet) => {
    setSelectedPet(pet);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedPet(undefined);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedPet(undefined);
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <button
          onClick={handleAdd}
          className="bg-avocado-500 hover:bg-avocado-300 text-gray-800 px-4 py-2 rounded-lg transition-colors cursor-pointer font-medium flex items-center"
        >
          <div>Add Pet</div>
          <MdPets className="ml-2" />
        </button>
      </div>

      <PetFilters onFilterChange={handleFilterChange} />

      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl text-gray-600 mb-4">
            You don&apos;t have any pets yet
          </p>
          <button
            onClick={handleAdd}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Add a Pet
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pets.map((pet) => (
            <PetCard key={pet.id} pet={pet} onEdit={handleEdit} />
          ))}
        </div>
      )}

      <PetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pet={selectedPet}
        onSuccess={fetchPets}
      />
    </div>
  );
}
