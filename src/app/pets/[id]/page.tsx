"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { format, differenceInMonths, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import EventModal from "@/components/EventModal";
import VaccineModal from "@/components/VaccineModal";
import ExamModal from "@/components/ExamModal";
import TreatmentModal from "@/components/TreatmentModal";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdCheckCircle, MdPauseCircle } from "react-icons/md";
import EventsSection from "@/components/EventsSection";
import VaccineSection from "@/components/VaccineSection";
import ExamSection from "@/components/ExamSection";
import TreatmentSection from "@/components/TreatmentSection";

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
  hasPetPlan: boolean;
  petPlanName?: string | null;
  hasFuneraryPlan: boolean;
  funeraryPlanStartDate?: string | null;
  events: Event[];
  VaccineRecord: Vaccine[];
  Treatment: Treatment[];
  Exam: Exam[];
}

export default function PetDetailsPage() {
  const t = useTranslations();
  const petModalT = useTranslations("petModal");
  const { data: session, status } = useSession();
  const params = useParams();
  const [pet, setPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);

  const translateType = (type: string) => {
    const typeMap: Record<string, string> = {
      DOG: petModalT("form.dog"),
      CAT: petModalT("form.cat"),
      OTHER: petModalT("form.other"),
    };
    return typeMap[type] || type;
  };

  const translateGender = (gender: string) => {
    const genderMap: Record<string, string> = {
      FEMALE: petModalT("form.female"),
      MALE: petModalT("form.male"),
    };
    return genderMap[gender] || gender;
  };

  const getFuneraryPlanStatus = (startDate: string | null | undefined) => {
    if (!startDate) return null;
    const start = new Date(startDate);
    const now = new Date();
    const monthsPassed = differenceInMonths(now, start);

    // Calculate the eligibility date (6 months from start)
    const eligibilityDate = new Date(start);
    eligibilityDate.setMonth(eligibilityDate.getMonth() + 6);

    const daysRemaining = differenceInDays(eligibilityDate, now);
    const monthsRemaining = Math.floor(daysRemaining / 30);

    if (monthsPassed >= 6 || daysRemaining <= 0) {
      return { eligible: true, monthsPassed };
    } else {
      return {
        eligible: false,
        monthsRemaining: monthsRemaining > 0 ? monthsRemaining : 0,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      };
    }
  };

  // Helper function to parse date strings and avoid timezone issues
  const parseDateString = (dateString: string): Date => {
    // Handle formats like "2025-12-12 00:00:00" or "2025-12-12T00:00:00"
    // Extract just the date part (YYYY-MM-DD) and create a local date
    const dateOnly = dateString.split(" ")[0].split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    // Create date in local timezone (month is 0-indexed in JS Date)
    return new Date(year, month - 1, day);
  };

  const fetchPetDetails = useCallback(async () => {
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
  }, [session?.user?.token, params.id, t]);

  useEffect(() => {
    if (status === "loading") return;
    fetchPetDetails();
  }, [session, status, fetchPetDetails]);

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
        <div className="bg-pet-card rounded-lg shadow-md p-6">
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
                <p className="text-gray-600 dark:text-gray-300">
                  {t("petDetails.info.type")}: {translateType(pet.type)}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("petDetails.info.breed")}: {pet.breed}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  {t("petDetails.info.gender")}: {translateGender(pet.gender)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("petDetails.info.dateOfBirth")}
                </p>
                <p>{format(new Date(pet.dob), "PPP", { locale: ptBR })}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("petDetails.info.weight")}
                </p>
                <p>{pet.weight} kg</p>
              </div>
            </div>
            {(pet.hasPetPlan || pet.hasFuneraryPlan) && (
              <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
                  Planos
                </h4>
                <div className="space-y-3">
                  {pet.hasPetPlan && (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          {petModalT("form.hasPetPlan")}
                        </p>
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-base font-medium text-gray-800 dark:text-gray-200">
                          {pet.petPlanName || t("petDetails.info.planActive")}
                        </p>
                      </div>
                    </div>
                  )}
                  {pet.hasFuneraryPlan && (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-base font-semibold text-gray-800 dark:text-gray-200">
                          {petModalT("form.hasFuneraryPlan")}
                        </p>
                        {pet.funeraryPlanStartDate && (
                          <p className="text-base text-gray-700 dark:text-gray-300 mt-1">
                            {t("petDetails.info.planStartDate")}:{" "}
                            {format(
                              new Date(pet.funeraryPlanStartDate),
                              "PPP",
                              {
                                locale: ptBR,
                              }
                            )}
                          </p>
                        )}
                      </div>
                      <div className="flex-1 text-right">
                        {pet.funeraryPlanStartDate && (
                          <div className="flex items-center justify-end gap-2">
                            {(() => {
                              const status = getFuneraryPlanStatus(
                                pet.funeraryPlanStartDate
                              );
                              if (!status) return null;
                              if (status.eligible) {
                                return (
                                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                    <MdCheckCircle size={24} />
                                  </div>
                                );
                              } else {
                                return (
                                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <MdPauseCircle size={24} />
                                    <span className="text-base font-semibold text-gray-800 dark:text-gray-200">
                                      {status.monthsRemaining !== undefined &&
                                      status.monthsRemaining > 0
                                        ? `${status.monthsRemaining} ${
                                            status.monthsRemaining === 1
                                              ? "mês"
                                              : "meses"
                                          } restantes`
                                        : status.daysRemaining !== undefined
                                        ? `${status.daysRemaining} ${
                                            status.daysRemaining === 1
                                              ? "dia"
                                              : "dias"
                                          } restantes`
                                        : ""}
                                    </span>
                                  </div>
                                );
                              }
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <EventsSection
          events={pet.events}
          onAddClick={() => setIsModalOpen(true)}
          parseDateString={parseDateString}
        />

        <VaccineSection
          vaccines={pet.VaccineRecord || []}
          onAddClick={() => setIsVaccineModalOpen(true)}
        />

        <ExamSection
          exams={pet.Exam || []}
          onAddClick={() => setIsExamModalOpen(true)}
        />

        <TreatmentSection
          treatments={pet.Treatment || []}
          onAddClick={() => setIsTreatmentModalOpen(true)}
        />
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
