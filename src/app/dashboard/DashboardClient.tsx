"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { startOfDay } from "date-fns";
import { useTranslations } from "next-intl";

import DashboardHero from "@/components/DashboardHero";
import QuickActions from "@/components/QuickActions";
import PetsUnderTreatment from "@/components/PetsUnderTreatment";
import UpcomingReminders from "@/components/UpcomingReminders";
import LastEvents from "@/components/LastEvents";
import PetModal from "@/components/PetModal";
import EventModal from "@/components/EventModal";
import ReminderModal from "@/components/ReminderModal";

import { getPetsClient, type PetApiResponse } from "@/services/pets.service";
import { getReminders } from "@/services/reminders.service";
import type { Reminder } from "@/types/reminder";
import type { ActiveTreatmentsResponse } from "@/services/treatments.service";

type Pet = PetApiResponse;

interface DashboardClientProps {
  session: {
    user: {
      id: string;
      email: string;
      fullName: string;
      token: string;
    };
  };
  initialPets: Pet[];
  initialTreatmentPets: ActiveTreatmentsResponse;
}

export default function DashboardClient({
  session,
  initialPets,
  initialTreatmentPets,
}: DashboardClientProps) {
  const router = useRouter();
  const petsT = useTranslations("pets");
  const token = session.user.token;

  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);

  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [remindersLoading, setRemindersLoading] = useState(true);
  const [treatmentIds, setTreatmentIds] = useState<Set<string>>(
    new Set(initialTreatmentPets.pets.map((p) => p.id))
  );

  const refreshReminders = useCallback(async () => {
    if (!token) return;
    setRemindersLoading(true);
    try {
      // The API returns reminders from the start of the current month onward,
      // ascending — so near-future ones can land on later pages. Page through
      // all of them (like the calendar does) so nothing upcoming is missed.
      const pageSize = 50;
      const first = await getReminders(token, 1, pageSize);
      const all = [...first.reminders];
      const totalPages = first.pagination?.totalPages ?? 1;
      for (let p = 2; p <= totalPages; p++) {
        const data = await getReminders(token, p, pageSize);
        all.push(...data.reminders);
      }
      setReminders(all);
    } catch (e) {
      console.error("Failed to fetch reminders:", e);
    } finally {
      setRemindersLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshReminders();
    // Full set of under-treatment pet ids → drives per-tile status + donut.
    getPetsClient(token, { underTreatment: true })
      .then((pets) => setTreatmentIds(new Set(pets.map((p) => p.id))))
      .catch((e) => console.error("Failed to fetch treatment pets:", e));
  }, [token, refreshReminders]);

  // Derived counts for the hero.
  const totalPets = initialPets.length;
  const treatmentCount = treatmentIds.size || initialTreatmentPets.totalCount;
  const healthyCount = Math.max(0, totalPets - treatmentCount);
  const today = startOfDay(new Date()).getTime();
  const attentionCount = reminders.filter(
    (r) =>
      !r.isCompleted &&
      startOfDay(new Date(r.reminderDate)).getTime() <= today
  ).length;

  const handleAddPet = () => setIsPetModalOpen(true);

  return (
    <div className="py-8 space-y-8">
      <DashboardHero
        userName={session.user?.fullName || session.user?.email}
        petCount={totalPets}
        treatmentCount={treatmentCount}
        healthyCount={healthyCount}
        attentionCount={attentionCount}
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <QuickActions
          onAddPet={handleAddPet}
          onAddEvent={() => setIsEventModalOpen(true)}
          onAddReminder={() => setIsReminderModalOpen(true)}
        />
        <PetsUnderTreatment
          pets={initialTreatmentPets.pets}
          totalCount={initialTreatmentPets.totalCount}
        />
        <UpcomingReminders
          reminders={reminders}
          token={token}
          loading={remindersLoading}
          onChange={refreshReminders}
          daysAhead={1}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <LastEvents token={token} />
        </div>
      </div>

      <PetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onSuccess={() => {
          router.refresh();
          toast.success(petsT("success.petAdded"));
        }}
      />

      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        pets={initialPets}
        onSuccess={() => router.refresh()}
      />

      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        pets={initialPets}
        onSuccess={() => {
          refreshReminders();
          router.refresh();
        }}
      />
    </div>
  );
}
