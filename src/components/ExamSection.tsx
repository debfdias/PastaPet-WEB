"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { MdAssignment } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { ImLab } from "react-icons/im";
import { FaFilePdf } from "react-icons/fa6";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import {
  getExamsByPet,
  type Exam,
  type ExamsResponse,
} from "@/services/exams.service";

interface ExamSectionProps {
  petId: string;
  onAddClick: () => void;
  onEditClick?: (exam: Exam) => void;
}

export default function ExamSection({
  petId,
  onAddClick,
  onEditClick,
}: ExamSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations("petDetails.exams");
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    ExamsResponse["pagination"] | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchExams = async (page: number = 1) => {
    if (!session?.user?.token) return;

    setLoading(true);
    try {
      const data = await getExamsByPet(session.user.token, petId, page, 4);
      setExams(data.exams);
      setPagination(data.pagination);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      if (isInitialLoad) {
        setExams([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchExams(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, session?.user?.token]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchExams(currentPage);
    };
    window.addEventListener("refresh-exams", handleRefresh);
    return () => window.removeEventListener("refresh-exams", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 md:h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <ImLab className="text-xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>

        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdAssignment size={16} />
        </button>
      </div>
      {isInitialLoad && loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="hsl(148 91% 45%)" />
          <span>{t("loading") || "Loading..."}</span>
        </div>
      ) : exams?.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t("noRecords")}
        </p>
      ) : (
        <div className="flex flex-col flex-1 md:min-h-[345px] min-h-0">
          <div className="space-y-2 relative flex-1 min-h-0">
            <div
              className={
                loading && !isInitialLoad
                  ? "blur-sm opacity-60 pointer-events-none"
                  : ""
              }
            >
              {exams?.map((exam: Exam) => {
                const examDate = exam.createdAt || exam.updatedAt;
                return (
                  <div
                    key={exam.id}
                    onClick={() => onEditClick?.(exam)}
                    className="mt-2 bg-gray-100/50 dark:bg-gray-600/20 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {exam.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        {exam.administeredBy && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {exam.administeredBy} •
                          </p>
                        )}
                        {examDate && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(examDate), "dd/MM/yy", {
                              locale: ptBR,
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                    {exam.fileUrl && (
                      <a
                        href={exam.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex-shrink-0 text-avocado-600 dark:text-avocado-400 hover:text-avocado-700 dark:hover:text-avocado-300 transition-colors"
                        title={t("viewFile")}
                      >
                        <FaFilePdf className="w-5 h-5" />
                      </a>
                    )}
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
