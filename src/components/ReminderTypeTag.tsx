"use client";

import {
  MdVaccines,
  MdLocalHospital,
  MdScience,
  MdMedicalServices,
  MdMedication,
  MdLabel,
} from "react-icons/md";
import { ReminderType } from "@/types/reminder";
import { useTranslations } from "next-intl";

interface ReminderTypeTagProps {
  type: ReminderType;
}

export default function ReminderTypeTag({ type }: ReminderTypeTagProps) {
  const t = useTranslations("dashboard.reminders");

  const config = {
    [ReminderType.VACCINE_BOOSTER]: {
      icon: <MdVaccines size={12} />,
      label: t("types.vaccine"),
      className:
        "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/30 dark:text-blue-200 dark:border-blue-400",
    },
    [ReminderType.VET_APPOINTMENT]: {
      icon: <MdLocalHospital size={12} />,
      label: t("types.vet"),
      className:
        "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/30 dark:text-purple-200 dark:border-purple-400",
    },
    [ReminderType.EXAM]: {
      icon: <MdScience size={12} />,
      label: t("types.exam"),
      className:
        "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/30 dark:text-cyan-200 dark:border-cyan-400",
    },
    [ReminderType.TREATMENT_FOLLOWUP]: {
      icon: <MdMedicalServices size={12} />,
      label: t("types.treatment"),
      className:
        "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-500/30 dark:text-orange-200 dark:border-orange-400",
    },
    [ReminderType.MEDICATION]: {
      icon: <MdMedication size={12} />,
      label: t("types.medication"),
      className:
        "bg-pink-50 text-pink-700 border-pink-300 dark:bg-pink-500/30 dark:text-pink-200 dark:border-pink-400",
    },
    [ReminderType.CUSTOM]: {
      icon: <MdLabel size={12} />,
      label: t("types.custom"),
      className:
        "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-600/40 dark:text-gray-200 dark:border-gray-600",
    },
  };

  const { icon, label, className } =
    config[type] || config[ReminderType.CUSTOM];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
}





