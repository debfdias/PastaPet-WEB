"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  MdPets,
  MdEvent,
  MdBarChart,
  MdPerson,
  MdHealthAndSafety,
  MdList,
  MdNotifications,
} from "react-icons/md";
import { IconType } from "react-icons";

interface QuickAction {
  id: string;
  icon: IconType;
  labelKey: string;
  onClick: () => void;
}

interface QuickActionsProps {
  onAddPet: () => void;
  onAddEvent: () => void;
  onAddReminder: () => void;
}

export default function QuickActions({
  onAddPet,
  onAddEvent,
  onAddReminder,
}: QuickActionsProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.quickActions");

  const actions: QuickAction[] = [
    {
      id: "add-pet",
      icon: MdPets,
      labelKey: "addPet",
      onClick: onAddPet,
    },
    {
      id: "add-event",
      icon: MdEvent,
      labelKey: "addEvent",
      onClick: onAddEvent,
    },
    {
      id: "add-reminder",
      icon: MdNotifications,
      labelKey: "addReminder",
      onClick: onAddReminder,
    },
    {
      id: "view-pets",
      icon: MdList,
      labelKey: "viewAllPets",
      onClick: () => router.push("/pets"),
    },
    {
      id: "view-reports",
      icon: MdBarChart,
      labelKey: "viewReports",
      onClick: () => router.push("/reports"),
    },
    {
      id: "view-profile",
      icon: MdPerson,
      labelKey: "viewProfile",
      onClick: () => router.push("/profile"),
    },
    {
      id: "health-summary",
      icon: MdHealthAndSafety,
      labelKey: "healthSummary",
      onClick: () => router.push("/reports"),
    },
  ];

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">{t("title")}</h2>
      <div className="grid grid-cols-4 sm:grid-cols-6 md:flex md:flex-wrap gap-2 sm:gap-4">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="flex flex-col items-center justify-center gap-1 bg-pet-card border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 text-gray-800 dark:text-gray-200 p-2 rounded-lg transition-all cursor-pointer font-medium hover:scale-105 aspect-square w-full sm:w-20 sm:h-20"
            >
              <Icon className="text-4xl sm:text-6xl text-text-primary dark:text-avocado-500" />
              <span className="text-[10px] sm:text-xs font-semibold text-center leading-tight">
                {t(action.labelKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

