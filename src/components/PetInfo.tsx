"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdHealthAndSafety } from "react-icons/md";
import { GiTombstone } from "react-icons/gi";
import { LuPencil, LuCalendar } from "react-icons/lu";
import { IoWarningOutline } from "react-icons/io5";
import { FaCheck, FaExternalLinkAlt } from "react-icons/fa";

interface Pet {
  id: string;
  name: string;
  dob: string;
  weight: number;
  type: string;
  breed: string;
  gender: string;
  image: string;
  hasPetPlan: boolean;
  petPlanName?: string | null;
  hasFuneraryPlan: boolean;
  funeraryPlanStartDate?: string | null;
}

interface PetInfoProps {
  pet: Pet;
  onEdit: () => void;
  translateType: (type: string) => string;
  translateGender: (gender: string) => string;
  parseDateString: (dateString: string) => Date;
  getFuneraryPlanStatus: (startDate: string | null | undefined) => {
    eligible: boolean;
    monthsPassed?: number;
    monthsRemaining?: number;
    daysRemaining?: number;
  } | null;
}

export default function PetInfo({
  pet,
  onEdit,
  translateType,
  translateGender,
  parseDateString,
  getFuneraryPlanStatus,
}: PetInfoProps) {
  const t = useTranslations();

  return (
    <div className="bg-pet-card rounded-lg p-6 relative">
      <button
        onClick={onEdit}
        className="absolute top-4 right-4 text-avocado-800 rounded-full bg-avocado-500 hover:bg-avocado-300 p-2 cursor-pointer"
        aria-label="Editar pet"
      >
        <LuPencil className="w-4 h-4" />
      </button>
      <h2 className="text-2xl font-bold mb-4">{t("petDetails.title")}</h2>
      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <div className="w-32 h-32 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={pet.image}
              alt={pet.name}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-2xl font-bold">{pet.name}</h3>
            <p className="text-gray-600 dark:text-gray-300">
              {t("petDetails.info.type")}: {translateType(pet.type)}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {t("petDetails.info.breed")}: {pet.breed}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              {t("petDetails.info.gender")}: {translateGender(pet.gender)}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("petDetails.info.dateOfBirth")}
            </p>
            <p>{format(parseDateString(pet.dob), "PPP", { locale: ptBR })}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t("petDetails.info.weight")}
            </p>
            <p>{pet.weight} kg</p>
          </div>
        </div>
        {(pet.hasPetPlan || pet.hasFuneraryPlan) && (
          <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
            <h4 className="font-semibold mb-3 text-gray-800 dark:text-gray-200">
              {t("petDetails.info.health")}
            </h4>
            <div className="space-y-3">
              {pet.hasPetPlan && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-400 dark:bg-blue-500 flex items-center justify-center flex-shrink-0">
                      <MdHealthAndSafety className="text-white text-md" />
                    </div>
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {pet.petPlanName || t("petDetails.info.planActive")}
                    </span>
                  </div>
                  {(() => {
                    const planName = (pet.petPlanName || "").toLowerCase();
                    let planUrl = "";
                    if (planName.includes("pet love")) {
                      planUrl = "https://plano-de-saude.petlove.com.br";
                    } else if (planName.includes("pet plus")) {
                      planUrl = "https://sistemapetplus.com.br/";
                    }
                    if (planUrl) {
                      return (
                        <a
                          href={planUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-100 dark:bg-blue-700/20 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                        >
                          <span className="text-xs font-medium">
                            {t("petDetails.info.petHealthPlan")}
                          </span>
                          <FaExternalLinkAlt className="text-xs" />
                        </a>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
              {pet.hasFuneraryPlan && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-500 flex items-center justify-center flex-shrink-0">
                        <GiTombstone className="text-white text-md" />
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        Pet Fenix
                      </span>
                    </div>
                    {pet.funeraryPlanStartDate &&
                      (() => {
                        const status = getFuneraryPlanStatus(
                          pet.funeraryPlanStartDate
                        );
                        if (!status) return null;
                        if (status.eligible) {
                          return (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                              <FaCheck className="text-xs" />
                              <span className="text-xs font-medium">
                                {t("petDetails.info.available")}
                              </span>
                            </div>
                          );
                        } else {
                          const monthsRemaining =
                            status.monthsRemaining !== undefined &&
                            status.monthsRemaining > 0
                              ? status.monthsRemaining
                              : status.daysRemaining !== undefined
                              ? Math.ceil(status.daysRemaining / 30)
                              : 0;
                          const monthText =
                            monthsRemaining === 1
                              ? t("petDetails.info.month")
                              : t("petDetails.info.months");
                          return (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                              <IoWarningOutline className="text-xs" />
                              <span className="text-xs font-medium">
                                {t("petDetails.info.inGracePeriod")}{" "}
                                {monthsRemaining} {monthText}
                              </span>
                            </div>
                          );
                        }
                      })()}
                  </div>
                  {pet.funeraryPlanStartDate && (
                    <div className="flex items-center gap-2 ml-3">
                      <LuCalendar className="text-sm text-gray-500 dark:text-gray-400" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {t("petDetails.info.adhesion")}:{" "}
                        {format(
                          parseDateString(pet.funeraryPlanStartDate),
                          "dd/MM/yy"
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
