"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import PetCard from "@/components/PetCard";
import PetModal from "@/components/PetModal";
import PetFilters from "@/components/PetFilters";
import { MdPets } from "react-icons/md";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  getPetsClient,
  type PetApiResponse,
  convertPetApiResponseToPet,
} from "@/services/pets.service";

interface Filters {
  name: string;
  type: string;
  orderByAge?: string;
  underTreatment: boolean;
}

function PetsPageContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [pets, setPets] = useState<PetApiResponse[]>([]);
  // Ids of pets currently under treatment → drives each card's health status.
  const [treatmentIds, setTreatmentIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPet, setSelectedPet] = useState<PetApiResponse | undefined>();
  const [filters, setFilters] = useState<Filters>({
    name: "",
    type: "",
    orderByAge: "",
    // Seed from the URL so the dashboard's "View All" lands here pre-filtered.
    underTreatment: searchParams.get("underTreatment") === "true",
  });
  const t = useTranslations("pets");

  const fetchPets = useCallback(async () => {
    if (!session?.user?.token) {
      setError(t("errors.authenticationRequired"));
      setLoading(false);
      return;
    }

    try {
      const token = session.user.token;
      // Fetch the visible list and (unless already filtered) the full set of
      // under-treatment pets in parallel, so we can mark each card's status.
      const [data, treatmentPets] = await Promise.all([
        getPetsClient(token, {
          ...(filters.name && { name: filters.name }),
          ...(filters.type && { type: filters.type }),
          ...(filters.orderByAge && { orderByAge: filters.orderByAge }),
          ...(filters.underTreatment && { underTreatment: true }),
        }),
        filters.underTreatment
          ? Promise.resolve(null)
          : getPetsClient(token, { underTreatment: true }),
      ]);
      setPets(data);
      setTreatmentIds(new Set((treatmentPets ?? data).map((p) => p.id)));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.anErrorOccurred");
      setError(errorMessage);
      toast.error(errorMessage);
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

  const handleEdit = (pet: PetApiResponse) => {
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

  const handleSuccess = () => {
    fetchPets();
    toast.success(
      selectedPet ? t("success.petUpdated") : t("success.petAdded")
    );
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
    <div className="min-h-screen pt-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display font-extrabold text-ink">
          {t("title")}
        </h1>
        <button
          onClick={handleAdd}
          className="bg-deep hover:bg-forest text-white px-4 py-2 rounded-btn transition-colors cursor-pointer font-extrabold flex items-center"
        >
          <div>{t("addPet")}</div>
          <MdPets className="ml-2" />
        </button>
      </div>

      <PetFilters
        onFilterChange={handleFilterChange}
        initialUnderTreatment={filters.underTreatment}
      />

      {pets?.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <p className="text-xl mb-4">{t("noPets.message")}</p>
          <button
            onClick={handleAdd}
            className="bg-deep hover:bg-forest text-white px-4 py-2 rounded-btn transition-colors cursor-pointer font-extrabold flex items-center"
          >
            <div>{t("noPets.addPet")}</div>
            <MdPets className="ml-2" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-[18px]">
          {pets.map((pet) => (
            <PetCard
              key={pet.id}
              pet={{
                ...pet,
                status: treatmentIds.has(pet.id) ? "treatment" : "healthy",
              }}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <PetModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        pet={selectedPet ? convertPetApiResponseToPet(selectedPet) : undefined}
        onSuccess={handleSuccess}
      />
    </div>
  );
}

export default function PetsPage() {
  return (
    <Suspense fallback={null}>
      <PetsPageContent />
    </Suspense>
  );
}
