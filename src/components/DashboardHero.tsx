"use client";

import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { icons } from "@/lib/icons";

interface DashboardHeroProps {
  userName: string;
  petCount: number;
  treatmentCount: number;
  healthyCount: number;
  attentionCount: number;
}

export default function DashboardHero({
  userName,
  petCount,
  treatmentCount,
  healthyCount,
  attentionCount,
}: DashboardHeroProps) {
  const t = useTranslations("dashboard.hero");
  const td = useTranslations("dashboard");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : ptBR;

  const dateLabel = format(new Date(), t("datePattern"), {
    locale: dateLocale,
  });

  const subtitle =
    attentionCount > 0
      ? `${t("allGood")} — ${t("attention", { count: attentionCount })}`
      : `${t("allGood")} — ${t("nothingToday")}`;

  const CalendarIcon = icons.calendar_month;
  const PawIcon = icons.pets;
  const TreatmentIcon = icons.medical_services;

  // Donut ring geometry
  const r = 54;
  const circ = 2 * Math.PI * r;
  const progress = petCount > 0 ? healthyCount / petCount : 0;
  const offset = circ * (1 - progress);

  return (
    <div className="relative overflow-hidden rounded-card bg-deep p-6 text-white shadow-card md:p-8">
      {/* decorative circles (solid, low-opacity — no gradient) */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/5" />
      <div className="pointer-events-none absolute right-24 -bottom-10 h-40 w-40 rounded-full bg-white/5" />

      <div className="relative">
        {/* greeting + donut share the top row (donut never wraps below) */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-sm font-bold capitalize">
              <CalendarIcon className="h-4 w-4" strokeWidth={2.5} />
              {dateLabel}
            </span>
            <h1 className="font-display text-3xl font-extrabold md:text-4xl">
              {td("welcome")}, {userName}
            </h1>
            <p className="mt-1 text-white/80">{subtitle}</p>
          </div>

          {/* healthy donut */}
          <div className="relative h-24 w-24 shrink-0 md:h-36 md:w-36">
            <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="rgba(0,0,0,0.15)"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="12"
              />
              <circle
                cx="64"
                cy="64"
                r={r}
                fill="none"
                stroke="var(--color-mint)"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="font-display text-2xl font-extrabold leading-none">
                {healthyCount}
                <span className="text-base text-white/60">/{petCount}</span>
              </p>
              <p className="mt-1 text-xs text-white/70">{t("healthy")}</p>
            </div>
          </div>
        </div>

        {/* stat pills — full-width below */}
        <div className="mt-5 flex flex-wrap gap-3">
          <StatPill
            icon={<PawIcon className="h-5 w-5" strokeWidth={2.5} />}
            value={petCount}
            label={t("statPets")}
          />
          <StatPill
            icon={<TreatmentIcon className="h-5 w-5" strokeWidth={2.5} />}
            value={treatmentCount}
            label={t("statTreatment")}
          />
        </div>
      </div>
    </div>
  );
}

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-4 py-2.5">
      {icon}
      <span className="font-display text-lg font-extrabold">{value}</span>
      <span className="text-sm text-white/80">{label}</span>
    </span>
  );
}
