"use client";

import { useTranslations } from "next-intl";
import {
  MdPets,
  MdEvent,
  MdNotifications,
  MdMedicalServices,
} from "react-icons/md";
import { ChevronRight } from "lucide-react";
import { IconType } from "react-icons";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  icon: IconType;
  short: string; // short label (mobile squares)
  title: string; // full title (desktop list)
  desc: string; // description (desktop list)
  color: string; // filled tile bg/text/border (mobile)
  chip: string; // soft icon chip (desktop)
  onClick: () => void;
}

interface QuickActionsProps {
  onAddPet: () => void;
  onAddTreatment: () => void;
  onAddEvent: () => void;
  onAddReminder: () => void;
}

export default function QuickActions({
  onAddPet,
  onAddTreatment,
  onAddEvent,
  onAddReminder,
}: QuickActionsProps) {
  const t = useTranslations("dashboard.quickActions");

  const actions: QuickAction[] = [
    {
      id: "pet",
      icon: MdPets,
      short: "pet",
      title: "addPet",
      desc: "addPetDesc",
      color: "bg-success-bg text-success-fg border-success-fg/40",
      chip: "bg-success-bg text-success-fg",
      onClick: onAddPet,
    },
    {
      id: "treatment",
      icon: MdMedicalServices,
      short: "treatment",
      title: "addTreatment",
      desc: "addTreatmentDesc",
      color: "bg-sky-bg text-sky-fg border-sky-fg/40",
      chip: "bg-sky-bg text-sky-fg",
      onClick: onAddTreatment,
    },
    {
      id: "event",
      icon: MdEvent,
      short: "event",
      title: "addEvent",
      desc: "addEventDesc",
      color: "bg-grape-bg text-grape-fg border-grape-fg/40",
      chip: "bg-grape-bg text-grape-fg",
      onClick: onAddEvent,
    },
    {
      id: "reminder",
      icon: MdNotifications,
      short: "reminder",
      title: "addReminder",
      desc: "addReminderDesc",
      color: "bg-amber-bg text-amber-fg border-amber-fg/40",
      chip: "bg-amber-bg text-amber-fg",
      onClick: onAddReminder,
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <h2 className="text-2xl font-display font-extrabold text-ink">
        {t("title")}
      </h2>
      <p className="mt-1 text-sm text-muted lg:hidden">{t("subtitle")}</p>

      {/* Mobile: colored square buttons */}
      <div className="mt-4 grid grid-cols-4 gap-2 lg:hidden">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              aria-label={t(action.title)}
              className={cn(
                "group flex aspect-square cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border p-2 transition-all hover:-translate-y-0.5 hover:shadow-card",
                action.color
              )}
            >
              <Icon className="text-3xl transition-transform group-hover:scale-110" />
              <span className="text-center text-[11px] font-extrabold leading-tight">
                {t(action.short)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Desktop: vertical list */}
      <div className="mt-4 hidden space-y-2 lg:block">
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
                <p className="font-extrabold text-ink">{t(action.title)}</p>
                <p className="truncate text-xs text-muted">{t(action.desc)}</p>
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
