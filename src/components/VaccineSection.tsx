import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { MdVaccines } from "react-icons/md";
import { FaPlus } from "react-icons/fa";

interface VaccineType {
  id: string;
  name: string;
  diseaseCovered: string[];
  isCore: boolean;
  boosterRequired: boolean;
  boosterIntervalMonths?: number;
  totalRequiredDoses?: number;
}

interface Vaccine {
  id: string;
  petId: string;
  vaccineType: VaccineType;
  vaccineTypeId: string;
  administrationDate: string;
  nextDueDate?: string;
  validUntil?: string;
  lotNumber?: string;
  administeredBy?: string;
  notes?: string;
}

interface VaccineSectionProps {
  vaccines: Vaccine[];
  onAddClick: () => void;
  parseDateString: (dateString: string) => Date;
}

export default function VaccineSection({
  vaccines,
  onAddClick,
  parseDateString,
}: VaccineSectionProps) {
  const t = useTranslations("petDetails.vaccines");

  return (
    <div className="bg-pet-card rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdVaccines size={16} />
        </button>
      </div>
      <div className="space-y-3">
        {vaccines.map((record) => (
          <div
            key={record.id}
            className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
          >
            <h3 className="font-semibold text-gray-800 dark:text-gray-200">
              {record.vaccineType.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {format(parseDateString(record.administrationDate), "PPP", {
                locale: ptBR,
              })}
            </p>
          </div>
        ))}
        {vaccines.length === 0 && (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            {t("noRecords")}
          </p>
        )}
      </div>
    </div>
  );
}
