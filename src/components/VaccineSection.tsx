"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { MdVaccines } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { TbVaccine } from "react-icons/tb";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import {
  getVaccinesByPet,
  type Vaccine,
  type VaccinesResponse,
} from "@/services/vaccines.service";

interface VaccineSectionProps {
  petId: string;
  onAddClick: () => void;
  parseDateString: (dateString: string) => Date;
}

export default function VaccineSection({
  petId,
  onAddClick,
  parseDateString,
}: VaccineSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations("petDetails.vaccines");
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    VaccinesResponse["pagination"] | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchVaccines = async (page: number = 1) => {
    if (!session?.user?.token) return;

    setLoading(true);
    try {
      const data = await getVaccinesByPet(session.user.token, petId, page, 4);
      setVaccines(data.vaccineRecords);
      setPagination(data.pagination);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch vaccines:", error);
      if (isInitialLoad) {
        setVaccines([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchVaccines(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, session?.user?.token]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchVaccines(currentPage);
    };
    window.addEventListener("refresh-vaccines", handleRefresh);
    return () => window.removeEventListener("refresh-vaccines", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 md:h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <TbVaccine className="text-2xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdVaccines size={16} />
        </button>
      </div>
      {isInitialLoad && loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="hsl(148 91% 45%)" />
          <span>{t("loading") || "Loading..."}</span>
        </div>
      ) : vaccines?.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t("noRecords")}
        </p>
      ) : (
        <div className="flex flex-col flex-1 md:min-h-[345px] min-h-0">
          <div className="relative flex-1 min-h-0">
            <div
              className={
                loading && !isInitialLoad
                  ? "blur-sm opacity-60 pointer-events-none"
                  : ""
              }
            >
              {vaccines?.map((record) => {
                const nextDueDate = record.nextDueDate
                  ? parseDateString(record.nextDueDate)
                  : null;
                const needsBooster =
                  record.vaccineType.boosterRequired && nextDueDate;

                return (
                  <div
                    key={record.id}
                    className="mt-2 bg-gray-100/50 dark:bg-gray-600/20 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
                  >
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                      {record.vaccineType.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {record.administeredBy && (
                          <>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              {record.administeredBy}
                            </p>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              •
                            </span>
                          </>
                        )}
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {format(
                            parseDateString(record.administrationDate),
                            "dd/MM/yy",
                            {
                              locale: ptBR,
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 -mt-1.5">
                        {record.vaccineType.isCore && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-700">
                            Obrigatória
                          </span>
                        )}
                        {needsBooster && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-700">
                            Reforço:{" "}
                            {format(nextDueDate, "dd/MM/yy", {
                              locale: ptBR,
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
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
