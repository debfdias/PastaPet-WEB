"use client";

import { useTranslations } from "next-intl";
import { MdPets, MdEvent, MdNotifications } from "react-icons/md";
import { ChevronRight } from "lucide-react";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: IconType;
  labelKey: string;
  descKey: string;
  chip: string;
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
  const t = useTranslations("dashboard.quickActions");

  const actions: QuickAction[] = [
    {
      id: "add-pet",
      icon: MdPets,
      labelKey: "addPet",
      descKey: "addPetDesc",
      chip: "bg-mint text-white",
      onClick: onAddPet,
    },
    {
      id: "add-event",
      icon: MdEvent,
      labelKey: "addEvent",
      descKey: "addEventDesc",
      chip: "bg-sky-bg text-sky-fg",
      onClick: onAddEvent,
    },
    {
      id: "add-reminder",
      icon: MdNotifications,
      labelKey: "addReminder",
      descKey: "addReminderDesc",
      chip: "bg-amber-bg text-amber-fg",
      onClick: onAddReminder,
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <h2 className="mb-4 text-2xl font-display font-extrabold text-ink">
        {t("title")}
      </h2>
      <div className="space-y-2">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className="group flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-panel p-3 text-left transition-all hover:bg-tint"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  action.chip
                )}
              >
                <Icon className="text-2xl" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-extrabold text-ink">{t(action.labelKey)}</p>
                <p className="truncate text-xs text-muted">
                  {t(action.descKey)}
                </p>
              </div>
              <ChevronRight
                className="h-5 w-5 shrink-0 text-faint transition-transform group-hover:translate-x-0.5"
                strokeWidth={2.5}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
