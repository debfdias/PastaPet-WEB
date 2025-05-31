"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventModal from "@/components/EventModal";
import VaccineModal from "@/components/VaccineModal";
import ExamModal from "@/components/ExamModal";
import TreatmentModal from "@/components/TreatmentModal";
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

interface Medication {
  id: string;
  treatmentId: string;
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string;
}

interface Treatment {
  id: string;
  petId: string;
  cause: string;
  description: string;
  startDate: string;
  endDate: string;
  medications: Medication[];
  exams: Exam[];
}

interface Exam {
  id: string;
  petId: string;
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl?: string;
  resultSummary: string;
  treatmentId?: string;
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
  Treatment: Treatment[];
  Exam: Exam[];
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
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

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
      console.log(data);
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

        <div className="bg-white rounded-lg shadow-md p-6">
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

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {t("petDetails.exams.title")}
            </h2>
            <button
              onClick={() => setIsExamModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t("petDetails.exams.addButton")}
            </button>
          </div>
          <div className="space-y-4">
            {pet.Exam?.map((exam) => (
              <div
                key={exam.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">{exam.title}</h3>
                <p className="text-sm text-gray-600">{exam.cause}</p>
                <p className="text-sm text-gray-500">
                  {t("petDetails.exams.administeredBy")}: {exam.administeredBy}
                </p>
                {exam.fileUrl && (
                  <a
                    href={exam.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    {t("petDetails.exams.viewFile")}
                  </a>
                )}
              </div>
            ))}
            {pet.Exam.length === 0 && (
              <p className="text-gray-500 text-center">
                {t("petDetails.exams.noRecords")}
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">
              {t("petDetails.treatments.title")}
            </h2>
            <button
              onClick={() => setIsTreatmentModalOpen(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
            >
              {t("petDetails.treatments.addButton")}
            </button>
          </div>
          <div className="space-y-4">
            {pet.Treatment?.map((treatment) => (
              <div
                key={treatment.id}
                className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <h3 className="font-semibold">{treatment.cause}</h3>
                <p className="text-sm text-gray-600">{treatment.description}</p>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    {format(new Date(treatment.startDate), "PPP", {
                      locale: ptBR,
                    })}{" "}
                    -{" "}
                    {format(new Date(treatment.endDate), "PPP", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
                {treatment.medications.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">
                      {t("petDetails.treatments.medications")}:
                    </h4>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {treatment.medications.map((med) => (
                        <li key={med.id}>
                          {med.name} - {med.dosage} ({med.frequency})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {pet.Treatment.length === 0 && (
              <p className="text-gray-500 text-center">
                {t("petDetails.treatments.noRecords")}
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

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => setIsExamModalOpen(false)}
        petId={pet.id}
        onSuccess={fetchPetDetails}
      />

      <TreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        petId={pet.id}
        onSuccess={fetchPetDetails}
      />
    </div>
  );
}
