"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { MdPets, MdArrowForward, MdBarChart } from "react-icons/md";
import PetModal from "@/components/PetModal";
import EventModal from "@/components/EventModal";
import ReminderModal from "@/components/ReminderModal";
import LastEvents from "@/components/LastEvents";
import RemindersSection from "@/components/RemindersSection";
import QuickActions from "@/components/QuickActions";
import { toast } from "react-toastify";
import { useState, useEffect } from "react";
import { getPetsClient } from "@/services/pets.service";

import type { PetApiResponse } from "@/services/pets.service";

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
}

export default function DashboardClient({
  session,
  initialPets,
}: DashboardClientProps) {
  const router = useRouter();
  const t = useTranslations("dashboard");
  const petsT = useTranslations("pets");
  const pets = initialPets;
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [allPets, setAllPets] = useState<Pet[]>(initialPets);

  const handleAddPet = () => {
    setIsPetModalOpen(true);
  };

  const handlePetSuccess = async () => {
    // Refresh the page to get updated data from server
    // The server component will re-fetch with the latest data
    router.refresh();
    toast.success(petsT("success.petAdded"));
  };

  // Fetch all pets when EventModal or ReminderModal opens
  useEffect(() => {
    if ((isEventModalOpen || isReminderModalOpen) && session.user?.token) {
      getPetsClient(session.user.token)
        .then((fetchedPets) => {
          setAllPets(fetchedPets);
        })
        .catch((error) => {
          console.error("Failed to fetch all pets:", error);
        });
    }
  }, [isEventModalOpen, isReminderModalOpen, session.user?.token]);

  return (
    <div className="min-h-screen py-8">
      {/* Welcome Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-2">
          {t("welcome")}, {session.user?.fullName || session.user?.email}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {t("subtitle")}
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions
        onAddPet={handleAddPet}
        onAddEvent={() => setIsEventModalOpen(true)}
        onAddReminder={() => setIsReminderModalOpen(true)}
      />

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* My Pets Card */}
        <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdPets className="text-3xl text-avocado-500" />
              <h2 className="text-2xl font-bold">{t("myPets.title")}</h2>
            </div>
            <Link
              href="/pets"
              className="flex items-center gap-1 text-avocado-500 hover:text-avocado-300 transition-colors font-medium"
            >
              {t("viewAll")}
              <MdArrowForward />
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("petsDescription")}
          </p>

          {pets?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {t("noPets")}
              </p>
              <button
                onClick={handleAddPet}
                className="bg-avocado-500 hover:bg-avocado-300 text-gray-800 px-4 py-2 rounded-lg transition-colors cursor-pointer font-medium"
              >
                {petsT("addPet")}
              </button>
            </div>
          ) : (
            <div className="flex items-center -space-x-3">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pets/${pet.id}`}
                  className="relative group z-0 hover:z-10 transition-all duration-200"
                  title={pet.name}
                >
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-pet-card dark:border-gray-700 group-hover:border-avocado-500 transition-all duration-200 group-hover:scale-110 shadow-md">
                    {pet.image ? (
                      <Image
                        src={pet.image}
                        alt={pet.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                        <MdPets className="text-2xl text-gray-400" />
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* My Reports Card */}
        <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MdBarChart className="text-3xl text-avocado-500" />
              <h2 className="text-2xl font-bold">{t("myReports.title")}</h2>
            </div>
            <Link
              href="/reports"
              className="flex items-center gap-1 text-avocado-500 hover:text-avocado-300 transition-colors font-medium"
            >
              {t("viewAll")}
              <MdArrowForward />
            </Link>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t("myReports.description")}
          </p>
          <div className="flex items-center justify-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400 text-center">
              Reports feature coming soon
            </p>
          </div>
        </div>
      </div>

      {/* Reminders & Events Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <RemindersSection token={session.user.token} />
        <LastEvents token={session.user.token} />
      </div>

      {/* Pet Modal */}
      <PetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onSuccess={handlePetSuccess}
      />

      {/* Event Modal */}
      <EventModal
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        pets={allPets}
        onSuccess={() => {
          router.refresh();
        }}
      />

      {/* Reminder Modal */}
      <ReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        pets={allPets}
        onSuccess={() => {
          router.refresh();
          window.dispatchEvent(new CustomEvent("refresh-reminders"));
        }}
      />
    </div>
  );
}
