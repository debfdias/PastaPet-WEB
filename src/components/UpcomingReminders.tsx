"use client";

import { useState } from "react";
import { format, isToday, isTomorrow, startOfDay, addDays } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { Clock } from "lucide-react";
import { ClipLoader } from "react-spinners";
import type { IconType } from "react-icons";
import {
  MdVaccines,
  MdLocalHospital,
  MdScience,
  MdMedicalServices,
  MdMedication,
  MdLabel,
} from "react-icons/md";
import Pagination from "./Pagination";
import { cn } from "@/lib/utils";
import { completeReminder, uncompleteReminder } from "@/services/reminders.service";
import { Reminder, ReminderType, ReminderPriority } from "@/types/reminder";

// Icon + soft fill + border(ring) color per reminder type.
const TYPE: Record<ReminderType, { icon: IconType; fill: string; ring: string }> = {
  [ReminderType.VACCINE_BOOSTER]: { icon: MdVaccines, fill: "bg-sky-bg text-sky-fg", ring: "ring-sky" },
  [ReminderType.VET_APPOINTMENT]: { icon: MdLocalHospital, fill: "bg-grape-bg text-grape-fg", ring: "ring-grape" },
  [ReminderType.EXAM]: { icon: MdScience, fill: "bg-success-bg text-success-fg", ring: "ring-mint" },
  [ReminderType.TREATMENT_FOLLOWUP]: { icon: MdMedicalServices, fill: "bg-orange-bg text-orange-fg", ring: "ring-orange" },
  [ReminderType.MEDICATION]: { icon: MdMedication, fill: "bg-pink-bg text-pink-fg", ring: "ring-pink" },
  [ReminderType.CUSTOM]: { icon: MdLabel, fill: "bg-panel text-muted", ring: "ring-hair" },
};

const PRIORITY: Record<ReminderPriority, string> = {
  [ReminderPriority.HIGH]: "bg-coral-bg text-coral-fg",
  [ReminderPriority.MEDIUM]: "bg-amber-bg text-amber-fg",
  [ReminderPriority.LOW]: "bg-success-bg text-success-fg",
};

const parseDay = (s: string): Date => {
  const [y, m, d] = s.split(/[T ]/)[0].split("-").map(Number);
  return new Date(y, m - 1, d);
};

interface UpcomingRemindersProps {
  reminders: Reminder[];
  token: string;
  loading?: boolean;
  onChange?: () => void;
  /** Days beyond today to include (1 = today+tomorrow). Omit for all upcoming. */
  daysAhead?: number;
  /** When set, paginate the list instead of scrolling. */
  pageSize?: number;
  /** Show the complete-checkbox on every item (default: only today/tomorrow). */
  checkAll?: boolean;
}

export default function UpcomingReminders({
  reminders,
  token,
  loading = false,
  onChange,
  daysAhead,
  pageSize,
  checkAll = false,
}: UpcomingRemindersProps) {
  const t = useTranslations("dashboard.upcoming");
  const rt = useTranslations("dashboard.reminders");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : ptBR;

  const [completing, setCompleting] = useState<Set<string>>(new Set());
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [page, setPage] = useState(1);

  const start = startOfDay(new Date());
  const end = daysAhead != null ? addDays(start, daysAhead + 1) : null;

  const items = reminders
    .map((r) => ({ r, day: parseDay(r.reminderDate) }))
    .filter(({ day }) => day >= start && (end == null || day < end))
    .sort((a, b) => a.day.getTime() - b.day.getTime());

  const count = items.filter(
    ({ r }) => !(overrides[r.id] ?? r.isCompleted)
  ).length;

  const paginate = pageSize != null;
  const totalPages = paginate ? Math.ceil(items.length / pageSize) : 1;
  const shown = paginate
    ? items.slice((page - 1) * pageSize, page * pageSize)
    : items;

  const dateLabel = (day: Date, raw: string) => {
    const time = format(new Date(raw), "HH:mm");
    if (isToday(day)) return `${t("today")} · ${time}`;
    if (isTomorrow(day)) return `${t("tomorrow")} · ${time}`;
    return format(day, "d MMM", { locale: dateLocale }).toUpperCase();
  };

  const handleToggle = async (r: Reminder) => {
    const next = !(overrides[r.id] ?? r.isCompleted);
    setCompleting((prev) => new Set(prev).add(r.id));
    setOverrides((prev) => ({ ...prev, [r.id]: next }));
    try {
      if (next) await completeReminder(token, r.id);
      else await uncompleteReminder(token, r.id);
      onChange?.();
    } catch (e) {
      console.error("Failed to toggle reminder:", e);
      setOverrides((prev) => ({ ...prev, [r.id]: !next }));
    } finally {
      setCompleting((prev) => {
        const nextSet = new Set(prev);
        nextSet.delete(r.id);
        return nextSet;
      });
    }
  };

  const renderItems = (arr: { r: Reminder; day: Date }[]) =>
    arr.map(({ r, day }, i) => {
      const type = TYPE[r.reminderType] ?? TYPE[ReminderType.CUSTOM];
      const Icon = type.icon;
      const last = i === arr.length - 1;
      const done = overrides[r.id] ?? r.isCompleted;
      const checkable = checkAll || isToday(day) || isTomorrow(day);
      return (
        <div key={r.id} className={cn("flex gap-3", done && "opacity-60")}>
          <div className="flex w-11 flex-col items-center">
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface",
                type.fill,
                type.ring
              )}
            >
              <Icon className="text-[15px]" />
            </span>
            {!last && <span className="my-1 w-0.5 flex-1 bg-hair" />}
          </div>
          <div className="flex flex-1 items-start justify-between gap-2 pb-5">
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold uppercase tracking-wide text-muted">
                {dateLabel(day, r.reminderDate)}
              </p>
              <p className={cn("text-sm font-bold text-ink", done && "line-through")}>
                {r.title}
              </p>
              {r.pet?.name && <p className="text-xs text-muted">{r.pet.name}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={cn(
                  "rounded-chip px-2 py-0.5 text-[11px] font-extrabold",
                  PRIORITY[r.priority] ?? PRIORITY[ReminderPriority.MEDIUM]
                )}
              >
                {rt(`priorities.${r.priority.toLowerCase()}`)}
              </span>
              {checkable && (
                <input
                  type="checkbox"
                  checked={done}
                  disabled={completing.has(r.id)}
                  onChange={() => handleToggle(r)}
                  onClick={(e) => e.stopPropagation()}
                  className="h-4 w-4 cursor-pointer rounded border-hair accent-mint focus:ring-mint disabled:opacity-50"
                />
              )}
            </div>
          </div>
        </div>
      );
    });

  return (
    <div className="flex flex-col rounded-card bg-surface p-6 shadow-card lg:h-full">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-deep">
          <Clock className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <h2 className="text-2xl font-display font-extrabold text-ink">
          {t("title")}
        </h2>
        {count > 0 && (
          <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-panel px-2 text-sm font-extrabold text-muted">
            {count}
          </span>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="#0E7A4A" />
          <span className="text-muted">{rt("loading")}</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-center text-muted">{t("empty")}</p>
        </div>
      ) : paginate ? (
        <div className="flex flex-1 flex-col">
          <div className="flex-1">{renderItems(shown)}</div>
          {totalPages > 1 && (
            <div className="mt-auto pt-2">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="relative min-h-0 flex-1 max-lg:h-[360px] max-lg:flex-none">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden pt-1">
            {renderItems(shown)}
          </div>
        </div>
      )}
    </div>
  );
}
