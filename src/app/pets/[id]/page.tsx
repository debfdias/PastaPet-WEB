"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventModal from "@/components/EventModal";
import VaccineModal from "@/components/VaccineModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTranslations } from "next-intl";

interface Event {
  id: string;
  title: string;
  type: string;
  eventDate: string;
  petId: string;
  userId: string;
}

interface VaccineType {
  id: string;
  name: string;
  diseaseCovered: string[];
  isCore: boolean;
  boosterRequired: boolean;
  boosterIntervalMonths?: number;
  totalRequiredDoses?: number;
}

interface Vaccine {
  id: string;
  petId: string;
  vaccineType: VaccineType;
  vaccineTypeId: string;
  administrationDate: string;
  nextDueDate?: string;
  validUntil?: string;
  lotNumber?: string;
  administeredBy?: string;
  notes?: string;
}

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  gender: string;
  image: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  events: Event[];
  VaccineRecord: Vaccine[];
}

export default function PetDetailsPage() {
  const t = useTranslations();
  const { data: session, status } = useSession();
  const params = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);

  const fetchPetDetails = async () => {
    if (!session?.user?.token) {
      setError(t("pets.errors.authenticationRequired"));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pets/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error(t("pets.errors.failedToFetch"));
      }
      const data = await response.json();
      setPet(data);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : t("pets.errors.anErrorOccurred")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "loading") return;
    fetchPetDetails();
  }, [session, status, params.id]);

  if (status === "loading" || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        {t("common.loading")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">
          {t("common.error", { error })}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">{t("pets.signInRequired")}</div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Pet not found
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">{t("petDetails.title")}</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Image
                src={pet.image}
                alt={pet.name}
                width={128}
                height={128}
                className="object-cover rounded-full"
              />
              <div>
                <h3 className="text-2xl font-bold">{pet.name}</h3>
                <p className="text-gray-600">
                  {t("petDetails.info.type")}: {pet.type}
                </p>
                <p className="text-gray-600">
                  {t("petDetails.info.breed")}: {pet.breed}
                </p>
                <p className="text-gray-600">
                  {t("petDetails.info.gender")}: {pet.gender}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">
                  {t("petDetails.info.dateOfBirth")}
                </p>
                <p>{format(new Date(pet.dob), "PPP", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">
                  {t("petDetails.info.weight")}
                </p>
                <p>{pet.weight} kg</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {t("petDetails.events.title")}
            </h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t("petDetails.events.addButton")}
            </button>
          </div>
          <div className="space-y-4">
            {pet.events.map((event) => (
              <div
                key={event.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(event.eventDate), "PPP", { locale: ptBR })}
                </p>
              </div>
            ))}
            {pet.events.length === 0 && (
              <p className="text-gray-500 text-center">
                {t("petDetails.events.noEvents")}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {t("petDetails.vaccines.title")}
            </h2>
            <button
              onClick={() => setIsVaccineModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t("petDetails.vaccines.addButton")}
            </button>
          </div>
          <div className="space-y-4">
            {pet.VaccineRecord?.map((record) => (
              <div
                key={record.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">{record.vaccineType.name}</h3>
                <p className="text-sm text-gray-500">
                  {format(new Date(record.administrationDate), "PPP", {
                    locale: ptBR,
                  })}
                </p>
              </div>
            ))}
            {pet.VaccineRecord.length === 0 && (
              <p className="text-gray-500 text-center">
                {t("petDetails.vaccines.noRecords")}
              </p>
            )}
          </div>
        </div>
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={pet.id}
        onSuccess={fetchPetDetails}
      />

      <VaccineModal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        petId={pet.id}
        onSuccess={fetchPetDetails}
      />
    </div>
  );
}
