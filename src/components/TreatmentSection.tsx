import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { MdLocalHospital } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

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

interface TreatmentSectionProps {
  treatments: Treatment[];
  onAddClick: () => void;
}

export default function TreatmentSection({
  treatments,
  onAddClick,
}: TreatmentSectionProps) {
  const t = useTranslations("petDetails.treatments");

  return (
    <div className="bg-pet-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdLocalHospital size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {treatments.map((treatment) => (
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
                {format(new Date(treatment.startDate), "PPP", {
                  locale: ptBR,
                })}{" "}
                -{" "}
                {format(new Date(treatment.endDate), "PPP", {
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
                  {treatment.medications.map((med) => (
                    <li key={med.id}>
                      {med.name} - {med.dosage} ({med.frequency})
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
        {treatments.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("noRecords")}
          </p>
        )}
      </div>
    </div>
  );
}


