import { useTranslations } from "next-intl";
import { MdAssignment } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import { ImLab } from "react-icons/im";
import { FaFilePdf } from "react-icons/fa6";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Exam {
  id: string;
  petId: string;
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl?: string;
  resultSummary: string;
  treatmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ExamSectionProps {
  exams: Exam[];
  onAddClick: () => void;
  onEditClick?: (exam: Exam) => void;
}

export default function ExamSection({
  exams,
  onAddClick,
  onEditClick,
}: ExamSectionProps) {
  const t = useTranslations("petDetails.exams");

  return (
    <div className="bg-pet-card rounded-lg p-6">
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
      <div className="space-y-2">
        {exams.map((exam) => {
          const examDate = exam.createdAt || exam.updatedAt;
          return (
            <div
              key={exam.id}
              onClick={() => onEditClick?.(exam)}
              className="p-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer flex items-center justify-between gap-3"
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
                      {format(new Date(examDate), "PP", { locale: ptBR })}
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
        {exams.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("noRecords")}
          </p>
        )}
      </div>
    </div>
  );
}
