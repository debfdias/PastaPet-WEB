import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { MdAssignment } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

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

interface ExamSectionProps {
  exams: Exam[];
  onAddClick: () => void;
}

export default function ExamSection({
  exams,
  onAddClick,
}: ExamSectionProps) {
  const t = useTranslations("petDetails.exams");

  return (
    <div className="bg-pet-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdAssignment size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {exams.map((exam) => (
          <div
            key={exam.id}
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {exam.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {exam.cause}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {t("administeredBy")}: {exam.administeredBy}
            </p>
            {exam.fileUrl && (
              <a
                href={exam.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-avocado-600 dark:text-avocado-400 hover:text-avocado-700 dark:hover:text-avocado-300 text-sm mt-2 inline-block"
              >
                {t("viewFile")}
              </a>
            )}
          </div>
        ))}
        {exams.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("noRecords")}
          </p>
        )}
      </div>
    </div>
  );
}

