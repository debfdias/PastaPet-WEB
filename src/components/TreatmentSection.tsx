"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { MdLocalHospital } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { ImAidKit } from "react-icons/im";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import {
  getTreatmentsByPet,
  type Treatment,
  type TreatmentsResponse,
} from "@/services/treatments.service";

interface TreatmentSectionProps {
  petId: string;
  onAddClick: () => void;
  parseDateString: (dateString: string) => Date;
}

export default function TreatmentSection({
  petId,
  onAddClick,
  parseDateString,
}: TreatmentSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations("petDetails.treatments");
  const [treatments, setTreatments] = useState<Treatment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    TreatmentsResponse["pagination"] | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchTreatments = async (page: number = 1) => {
    if (!session?.user?.token) return;

    setLoading(true);
    try {
      const data = await getTreatmentsByPet(session.user.token, petId, page, 4);
      setTreatments(data.treatments);
      setPagination(data.pagination);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch treatments:", error);
      if (isInitialLoad) {
        setTreatments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchTreatments(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, session?.user?.token]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchTreatments(currentPage);
    };
    window.addEventListener("refresh-treatments", handleRefresh);
    return () =>
      window.removeEventListener("refresh-treatments", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 md:h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ImAidKit className="text-2xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdLocalHospital size={16} />
        </button>
      </div>
      {isInitialLoad && loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="hsl(148 91% 45%)" />
          <span>{t("loading") || "Loading..."}</span>
        </div>
      ) : treatments?.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t("noRecords")}
        </p>
      ) : (
        <div className="flex flex-col flex-1 md:min-h-[250px] min-h-0">
          <div className="space-y-3 relative flex-1 min-h-0">
            <div
              className={
                loading && !isInitialLoad
                  ? "blur-sm opacity-60 pointer-events-none"
                  : ""
              }
            >
              {treatments?.map((treatment) => (
                <div
                  key={treatment.id}
                  className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {treatment.cause}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {treatment.description}
                  </p>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {format(parseDateString(treatment.startDate), "PPP", {
                        locale: ptBR,
                      })}{" "}
                      -{" "}
                      {format(parseDateString(treatment.endDate), "PPP", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                  {treatment.medications.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                        {t("medications")}:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400">
                        {treatment.medications?.map((med) => (
                          <li key={med.id}>
                            {med.name} - {med.dosage} ({med.frequency})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 flex items-center justify-center bg-pet-card/40 z-10 pointer-events-none">
                <ClipLoader size={40} color="hsl(148 91% 45%)" />
              </div>
            )}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div
              className={`mt-auto pt-4 ${
                loading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          {(!pagination || pagination.totalPages <= 1) && (
            <div className="mt-auto"></div>
          )}
        </div>
      )}
    </div>
  );
}
