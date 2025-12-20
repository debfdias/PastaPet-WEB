"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import { 
  MdPets, 
  MdEvent, 
  MdArrowForward, 
  MdBarChart, 
  MdPerson,
  MdHealthAndSafety,
  MdList
} from "react-icons/md";
import PetModal from "@/components/PetModal";
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

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations("dashboard");
  const petsT = useTranslations("pets");
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);

  const fetchPets = useCallback(async () => {
    if (!session?.user?.token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/pets`,
        {
          headers: {
            Authorization: `Bearer ${session.user.token}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setPets(data.slice(0, 6)); // Show only first 6 pets as preview
      }
    } catch (err) {
      console.error("Failed to fetch pets:", err);
    } finally {
      setLoading(false);
    }
  }, [session?.user?.token]);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    fetchPets();
  }, [session, status, fetchPets, router]);

  const handleAddPet = () => {
    setIsPetModalOpen(true);
  };

  const handlePetSuccess = () => {
    fetchPets();
    toast.success(petsT("success.petAdded"));
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{petsT("loading")}</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">{petsT("signInRequired")}</div>
      </div>
    );
  }

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
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">{t("quickActions.title")}</h2>
        <div className="flex flex-wrap gap-4">
          {/* Add Pet */}
          <button
            onClick={handleAddPet}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdPets className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.addPet")}</span>
          </button>

          {/* Add Event */}
          <button
            onClick={() => router.push("/pets")}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdEvent className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.addEvent")}</span>
          </button>

          {/* View All Pets */}
          <button
            onClick={() => router.push("/pets")}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdList className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.viewAllPets")}</span>
          </button>

          {/* View Reports */}
          <button
            onClick={() => router.push("/reports")}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdBarChart className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.viewReports")}</span>
          </button>

          {/* View Profile */}
          <button
            onClick={() => router.push("/profile")}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdPerson className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.viewProfile")}</span>
          </button>

          {/* Health Summary */}
          <button
            onClick={() => router.push("/reports")}
            className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-20 h-20"
          >
            <MdHealthAndSafety className="text-6xl text-text-primary dark:text-avocado-500" />
            <span className="text-xs font-semibold text-center leading-tight">{t("quickActions.healthSummary")}</span>
          </button>
        </div>
      </div>

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

          {loading ? (
            <div className="text-center py-8">{petsT("loading")}</div>
          ) : pets.length === 0 ? (
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
              {pets.map((pet, index) => (
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

      {/* Pet Modal */}
      <PetModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onSuccess={handlePetSuccess}
      />
    </div>
  );
}
