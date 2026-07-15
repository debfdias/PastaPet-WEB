"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { differenceInMonths, differenceInDays } from "date-fns";
import EventModal from "@/components/EventModal";
import VaccineModal from "@/components/VaccineModal";
import ExamModal from "@/components/ExamModal";
import TreatmentModal from "@/components/TreatmentModal";
import PetModal from "@/components/PetModal";
import PetInfo from "@/components/PetInfo";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import EventsSection from "@/components/EventsSection";
import VaccineSection from "@/components/VaccineSection";
import ExamSection from "@/components/ExamSection";
import ActiveTreatment from "@/components/ActiveTreatment";
import UpcomingReminders from "@/components/UpcomingReminders";
import { PetGender, PetType } from "@/types/pet";
import { getPetByIdClient, type PetApiResponse } from "@/services/pets.service";
import {
  getTreatmentsByPet,
  type Treatment,
} from "@/services/treatments.service";
import { getRemindersByPetId } from "@/services/reminders.service";
import type { Reminder } from "@/types/reminder";

// interface Event {
//   id: string;
//   title: string;
//   type: string;
//   eventDate: string;
//   petId: string;
//   userId: string;
// }

// interface VaccineType {
//   id: string;
//   name: string;
//   diseaseCovered: string[];
//   isCore: boolean;
//   boosterRequired: boolean;
//   boosterIntervalMonths?: number;
//   totalRequiredDoses?: number;
// }

// interface Vaccine {
//   id: string;
//   petId: string;
//   vaccineType: VaccineType;
//   vaccineTypeId: string;
//   administrationDate: string;
//   nextDueDate?: string;
//   validUntil?: string;
//   lotNumber?: string;
//   administeredBy?: string;
//   notes?: string;
// }

// interface Medication {
//   id: string;
//   treatmentId: string;
//   name: string;
//   dosage: string;
//   frequency: string;
//   notes: string;
//   startDate: string;
//   endDate: string;
// }

// interface Treatment {
//   id: string;
//   petId: string;
//   cause: string;
//   description: string;
//   startDate: string;
//   endDate: string;
//   medications: Medication[];
//   exams: Exam[];
// }

interface Exam {
  id: string;
  petId: string;
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl?: string;
  resultSummary: string;
  treatmentId?: string;
  examDate?: string;
  createdAt?: string;
}

type Pet = PetApiResponse & {
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  funeraryPlanStartDate?: string | null;
};

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
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [treatmentsLoading, setTreatmentsLoading] = useState(true);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);

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
      const data = await getPetByIdClient(
        session.user.token,
        params.id as string
      );
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

  const fetchTreatments = useCallback(async () => {
    if (!session?.user?.token) return;
    setTreatmentsLoading(true);
    try {
      const data = await getTreatmentsByPet(
        session.user.token,
        params.id as string,
        1,
        50
      );
      setTreatments(data.treatments);
    } catch (error) {
      console.error("Failed to fetch treatments:", error);
    } finally {
      setTreatmentsLoading(false);
    }
  }, [session?.user?.token, params.id]);

  const fetchReminders = useCallback(async () => {
    if (!session?.user?.token) return;
    setRemindersLoading(true);
    try {
      const token = session.user.token;
      const petId = params.id as string;
      const pageSize = 50;
      const first = await getRemindersByPetId(token, petId, 1, pageSize);
      const all = [...first.reminders];
      const totalPages = first.pagination?.totalPages ?? 1;
      for (let p = 2; p <= totalPages; p++) {
        const d = await getRemindersByPetId(token, petId, p, pageSize);
        all.push(...d.reminders);
      }
      setReminders(all);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
    } finally {
      setRemindersLoading(false);
    }
  }, [session?.user?.token, params.id]);

  useEffect(() => {
    if (status === "loading") return;
    fetchPetDetails();
    fetchTreatments();
    fetchReminders();
    // Depend on the memoized fetchers (keyed on the stable token), NOT the
    // `session` object — next-auth swaps its reference on window focus, which
    // would otherwise refetch everything and flash the loading states.
  }, [status, fetchPetDetails, fetchTreatments, fetchReminders]);

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

  const handlePetEdit = () => {
    setIsPetModalOpen(true);
  };

  const handlePetModalClose = () => {
    setIsPetModalOpen(false);
  };

  const handlePetSuccess = () => {
    fetchPetDetails();
    toast.success(t("pets.success.petUpdated"));
  };

  const now = new Date();
  const activeTreatments = treatments.filter((tr) => {
    const s = parseDateString(tr.startDate);
    const e = tr.endDate ? parseDateString(tr.endDate) : null;
    return s <= now && (!e || e >= now);
  });

  return (
    <div className="py-8">
      <div className="space-y-8">
        {/* Row 1: hero + reminders */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <PetInfo
            pet={{ ...pet, image: pet.image || "" }}
            onEdit={handlePetEdit}
            translateType={translateType}
            translateGender={translateGender}
            parseDateString={parseDateString}
            getFuneraryPlanStatus={getFuneraryPlanStatus}
            activeTreatmentCauses={activeTreatments.map((tr) => tr.cause)}
          />
          <UpcomingReminders
            reminders={reminders}
            token={session.user.token}
            loading={remindersLoading}
            onChange={fetchReminders}
            checkAll
            pageSize={6}
          />
        </div>

        {/* Row 2: active treatment */}
        <ActiveTreatment
          treatments={activeTreatments}
          loading={treatmentsLoading}
          parseDateString={parseDateString}
          onAdd={() => setIsTreatmentModalOpen(true)}
        />

        {/* Row 3: vaccines + exams */}
        <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2">
          <VaccineSection
            petId={pet.id}
            onAddClick={() => setIsVaccineModalOpen(true)}
            parseDateString={parseDateString}
          />
          <ExamSection
            petId={pet.id}
            onAddClick={() => {
              setSelectedExam(null);
              setIsExamModalOpen(true);
            }}
            onEditClick={(exam) => {
              setSelectedExam(exam);
              setIsExamModalOpen(true);
            }}
          />
        </div>

        {/* Row 4: events timeline */}
        <EventsSection
          petId={pet.id}
          onAddClick={() => setIsModalOpen(true)}
          parseDateString={parseDateString}
        />
      </div>

      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        petId={pet.id}
        onSuccess={() => {
          // Trigger refetch in EventsSection
          window.dispatchEvent(new CustomEvent("refresh-events"));
        }}
      />

      <VaccineModal
        isOpen={isVaccineModalOpen}
        onClose={() => setIsVaccineModalOpen(false)}
        petId={pet.id}
        onSuccess={() => {
          // Trigger refetch in VaccineSection
          window.dispatchEvent(new CustomEvent("refresh-vaccines"));
        }}
      />

      <ExamModal
        isOpen={isExamModalOpen}
        onClose={() => {
          setIsExamModalOpen(false);
          setSelectedExam(null);
        }}
        petId={pet.id}
        onSuccess={() => {
          // Trigger refetch in ExamSection
          window.dispatchEvent(new CustomEvent("refresh-exams"));
        }}
        exam={selectedExam}
      />

      <TreatmentModal
        isOpen={isTreatmentModalOpen}
        onClose={() => setIsTreatmentModalOpen(false)}
        petId={pet.id}
        onSuccess={() => fetchTreatments()}
      />

      <PetModal
        isOpen={isPetModalOpen}
        onClose={handlePetModalClose}
        pet={{
          id: pet.id,
          name: pet.name,
          dob: pet.dob,
          weight: pet.weight,
          type: pet.type as PetType,
          breed: pet.breed,
          gender: pet.gender as PetGender,
          image: pet.image,
          hasPetPlan: pet.hasPetPlan,
          hasFuneraryPlan: pet.hasFuneraryPlan,
          petPlanName: pet.petPlanName || undefined,
        }}
        onSuccess={handlePetSuccess}
      />
    </div>
  );
}
