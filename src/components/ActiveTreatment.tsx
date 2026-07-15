"use client";

import { format, differenceInCalendarDays } from "date-fns";
import { useTranslations } from "next-intl";
import { ClipLoader } from "react-spinners";
import { Plus } from "lucide-react";
import { MdMedication } from "react-icons/md";
import { Button } from "@/components/ui/button";
import { icons } from "@/lib/icons";
import type { Treatment } from "@/services/treatments.service";

interface ActiveTreatmentProps {
  treatments: Treatment[];
  loading?: boolean;
  parseDateString: (s: string) => Date;
  onAdd?: () => void;
}

export default function ActiveTreatment({
  treatments,
  loading = false,
  parseDateString,
  onAdd,
}: ActiveTreatmentProps) {
  const t = useTranslations("petDetails.treatments");

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-card bg-surface p-6 pl-8 shadow-card">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-sky" />
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="#0E7A4A" />
          <span className="text-muted">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (treatments.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-card bg-surface p-6 pl-8 shadow-card">
        <div className="absolute left-0 top-0 h-full w-1.5 bg-hair" />
        <div className="flex flex-col items-center justify-center gap-4 py-8">
          <p className="text-center text-muted">{t("noActive")}</p>
          {onAdd && <Button onClick={onAdd}>{t("addButton")}</Button>}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {treatments.map((treatment) => (
        <TreatmentCard
          key={treatment.id}
          treatment={treatment}
          parseDateString={parseDateString}
        />
      ))}
      {onAdd && (
        <Button onClick={onAdd} className="w-full">
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          {t("addButton")}
        </Button>
      )}
    </div>
  );
}

function TreatmentCard({
  treatment,
  parseDateString,
}: {
  treatment: Treatment;
  parseDateString: (s: string) => Date;
}) {
  const t = useTranslations("petDetails.treatments");
  const MedkitIcon = icons.medical_services;
  const CalendarIcon = icons.calendar_month;

  const start = parseDateString(treatment.startDate);
  const end = treatment.endDate ? parseDateString(treatment.endDate) : null;
  const elapsed = Math.max(1, differenceInCalendarDays(new Date(), start) + 1);
  const total = end
    ? Math.max(1, differenceInCalendarDays(end, start) + 1)
    : null;
  const progress = total ? Math.min(1, Math.max(0, elapsed / total)) : null;

  return (
    <div className="relative overflow-hidden rounded-card bg-surface p-6 pl-8 shadow-card">
      <div className="absolute left-0 top-0 h-full w-1.5 bg-sky" />

      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-bg text-sky-fg">
            <MedkitIcon className="text-2xl" />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wide text-sky-fg">
              {t("activeLabel")}
            </p>
            <h2 className="font-display text-2xl font-extrabold text-ink">
              {treatment.cause}
            </h2>
          </div>
        </div>
        <span className="shrink-0 rounded-chip bg-sky-bg px-3 py-1 text-sm font-extrabold text-sky-fg">
          {t("day")} {elapsed}
          {total ? ` / ${total}` : ""}
        </span>
      </div>

      {/* date range */}
      <div className="mb-3 flex items-center gap-2 text-sm text-muted">
        <CalendarIcon className="h-4 w-4" strokeWidth={2.5} />
        <span>
          {format(start, "dd/MM/yyyy")}
          {end ? ` → ${format(end, "dd/MM/yyyy")}` : ""}
        </span>
      </div>

      {/* progress bar */}
      <div className="mb-5 h-2.5 w-full overflow-hidden rounded-full bg-panel">
        {progress != null ? (
          <div
            className="h-full rounded-full bg-sky"
            style={{ width: `${progress * 100}%` }}
          />
        ) : (
          <div className="h-full w-full bg-sky/25" />
        )}
      </div>

      {/* medications */}
      <div className="space-y-2">
        {treatment.medications.map((med, i) => (
          <div
            key={med.id ?? i}
            className="flex items-center gap-3 rounded-2xl border border-transparent bg-panel p-3 transition-all hover:border-mint hover:bg-tint"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-sky-fg/30 bg-sky-bg text-sky-fg">
              <MdMedication className="text-lg" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-extrabold text-ink">
                {med.name}
                {med.dosage ? ` — ${med.dosage}` : ""}
              </p>
              {med.notes && (
                <p className="truncate text-xs text-muted">{med.notes}</p>
              )}
            </div>
            {med.frequency && (
              <span className="shrink-0 text-sm font-bold text-muted">
                {med.frequency}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
