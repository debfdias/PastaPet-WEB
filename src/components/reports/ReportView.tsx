"use client";

import { ReactNode } from "react";
import Image from "next/image";
import { format, parseISO, differenceInMonths } from "date-fns";
import { useTranslations } from "next-intl";
import {
  PawPrint,
  Syringe,
  Stethoscope,
  Pill,
  Activity,
  CalendarDays,
} from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { PetReport } from "@/types/report";
import {
  ChartCard,
  WeightChart,
  SymptomFrequencyChart,
  SymptomDistributionChart,
  EventTypeChart,
} from "./ReportCharts";

function fmt(date?: string | null) {
  if (!date) return "";
  try {
    return format(parseISO(date), "dd/MM/yyyy");
  } catch {
    return "";
  }
}

export default function ReportView({
  report,
  actions,
  footerNote,
}: {
  report: PetReport;
  actions?: ReactNode;
  footerNote?: string;
}) {
  const t = useTranslations("reports");
  const { pet, weightEntries, symptoms, events, treatments, exams, vaccines } =
    report;

  const symptomLabel = (type: string) => t(`symptomTypes.${type}`);
  const eventLabel = (type: string) => t(`eventTypes.${type}`);
  const activeTreatments = treatments.filter((tr) => !tr.endDate).length;

  const months = differenceInMonths(new Date(), parseISO(pet.dob));
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  const age =
    years > 0
      ? `${years} ${t("ageYears")}${
          remMonths > 0 ? ` ${remMonths} ${t("ageMonths")}` : ""
        }`
      : `${remMonths} ${t("ageMonths")}`;

  const stats = [
    { label: t("stats.treatments"), value: treatments.length },
    { label: t("stats.activeTreatments"), value: activeTreatments },
    { label: t("stats.exams"), value: exams.length },
    { label: t("stats.vaccines"), value: vaccines.length },
    { label: t("stats.symptoms"), value: symptoms.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-surface rounded-card border border-hair p-6 flex flex-col sm:flex-row gap-5">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-tile bg-panel">
          {pet.image ? (
            <Image
              src={pet.image}
              alt={pet.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <PawPrint className="h-10 w-10 text-faint" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {pet.name}
          </h1>
          <p className="text-sm text-muted">
            {t(`species.${pet.type}`)} · {pet.breed} ·{" "}
            {t(`gender.${pet.gender}`)}
          </p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            <span className="rounded-chip bg-panel px-2.5 py-1 text-ink">
              {t("age")}: {age}
            </span>
            <span className="rounded-chip bg-panel px-2.5 py-1 text-ink">
              {t("weight")}: {pet.weight} {t("charts.kg")}
            </span>
            {pet.type === "CAT" && (
              <>
                <span className="rounded-chip bg-sky-bg px-2.5 py-1 text-sky-fg">
                  FIV: {t(`fivFelv.${pet.fivStatus}`)}
                </span>
                <span className="rounded-chip bg-sky-bg px-2.5 py-1 text-sky-fg">
                  FeLV: {t(`fivFelv.${pet.felvStatus}`)}
                </span>
              </>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex flex-shrink-0 flex-row flex-wrap gap-2 sm:items-start sm:justify-end print:hidden">
            {actions}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-tile border border-hair bg-surface p-4 text-center"
          >
            <p className="font-display text-2xl font-extrabold text-deep">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title={t("charts.weightOverTime")}>
          <WeightChart
            entries={weightEntries}
            emptyLabel={t("charts.noWeightData")}
            unitLabel={t("charts.kg")}
          />
        </ChartCard>
        <ChartCard title={t("charts.symptomsOverTime")}>
          <SymptomFrequencyChart
            symptoms={symptoms}
            emptyLabel={t("charts.noSymptomData")}
          />
        </ChartCard>
        <ChartCard title={t("charts.symptomsByType")}>
          <SymptomDistributionChart
            symptoms={symptoms}
            labelFor={symptomLabel}
            emptyLabel={t("charts.noSymptomData")}
          />
        </ChartCard>
        <ChartCard title={t("charts.eventsByType")}>
          <EventTypeChart
            events={events}
            labelFor={eventLabel}
            emptyLabel={t("charts.noEventData")}
          />
        </ChartCard>
      </div>

      {/* Treatments */}
      <Section icon={<Pill className="h-4 w-4" />} title={t("sections.treatments")}>
        {treatments.length === 0 ? (
          <Empty label={t("sections.noTreatments")} />
        ) : (
          treatments.map((tr) => (
            <div key={tr.id} className="border-b border-hair py-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink">{tr.cause}</p>
                <span
                  className={`rounded-chip px-2 py-0.5 text-xs ${
                    tr.endDate
                      ? "bg-panel text-muted"
                      : "bg-success-bg text-success-fg"
                  }`}
                >
                  {tr.endDate ? t("sections.ended") : t("sections.ongoing")}
                </span>
              </div>
              {tr.description && (
                <p className="mt-1 text-sm text-muted">{tr.description}</p>
              )}
              <p className="mt-1 text-xs text-faint">
                {fmt(tr.startDate)}
                {tr.endDate ? ` — ${fmt(tr.endDate)}` : ""}
              </p>
              {tr.medications.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {tr.medications.map((m) => (
                    <li key={m.id} className="text-sm text-ink">
                      <span className="font-semibold">{m.name}</span>
                      {m.dosage ? ` · ${m.dosage}` : ""}
                      {m.frequency ? ` · ${m.frequency}` : ""}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </Section>

      {/* Exams */}
      <Section
        icon={<Stethoscope className="h-4 w-4" />}
        title={t("sections.exams")}
      >
        {exams.length === 0 ? (
          <Empty label={t("sections.noExams")} />
        ) : (
          exams.map((ex) => (
            <div key={ex.id} className="border-b border-hair py-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink">{ex.title}</p>
                <span className="text-xs text-faint">{fmt(ex.examDate)}</span>
              </div>
              <p className="text-sm text-muted">{ex.cause}</p>
              {ex.resultSummary && (
                <p className="mt-1 text-sm text-ink">{ex.resultSummary}</p>
              )}
              {ex.fileUrls.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {ex.fileUrls.map((url, i) => (
                    <a
                      key={`${url}-${i}`}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-deep hover:text-forest"
                    >
                      <FaFilePdf className="h-3.5 w-3.5" />
                      {t("sections.viewFile")}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Section>

      {/* Vaccines */}
      <Section
        icon={<Syringe className="h-4 w-4" />}
        title={t("sections.vaccines")}
      >
        {vaccines.length === 0 ? (
          <Empty label={t("sections.noVaccines")} />
        ) : (
          vaccines.map((v) => (
            <div key={v.id} className="border-b border-hair py-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink">{v.vaccineType.name}</p>
                <span className="text-xs text-faint">
                  {fmt(v.administrationDate)}
                </span>
              </div>
              {v.nextDueDate && (
                <p className="mt-1 text-xs text-amber-fg">
                  {t("sections.dueBy")}: {fmt(v.nextDueDate)}
                </p>
              )}
            </div>
          ))
        )}
      </Section>

      {/* Symptoms */}
      <Section
        icon={<Activity className="h-4 w-4" />}
        title={t("sections.symptoms")}
      >
        {symptoms.length === 0 ? (
          <Empty label={t("sections.noSymptoms")} />
        ) : (
          symptoms.map((s) => (
            <div key={s.id} className="border-b border-hair py-3 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-bold text-ink">{symptomLabel(s.type)}</p>
                <span className="text-xs text-faint">{fmt(s.observedAt)}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded-chip bg-panel px-2 py-0.5 text-xs text-muted">
                  {t(`severity.${s.severity}`)}
                </span>
                {s.notes && <p className="text-sm text-muted">{s.notes}</p>}
              </div>
            </div>
          ))
        )}
      </Section>

      {/* Events */}
      <Section
        icon={<CalendarDays className="h-4 w-4" />}
        title={t("sections.events")}
      >
        {events.length === 0 ? (
          <Empty label={t("sections.noEvents")} />
        ) : (
          events.map((ev) => (
            <div
              key={ev.id}
              className="flex items-center justify-between gap-2 border-b border-hair py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate font-bold text-ink">{ev.title}</p>
                <span className="mt-1 inline-block rounded-chip bg-panel px-2 py-0.5 text-xs text-muted">
                  {eventLabel(ev.type)}
                </span>
              </div>
              <span className="flex-shrink-0 text-xs text-faint">
                {fmt(ev.eventDate)}
              </span>
            </div>
          ))
        )}
      </Section>

      {footerNote && (
        <p className="pt-2 text-center text-xs text-faint">{footerNote}</p>
      )}
    </div>
  );
}

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-card border border-hair bg-surface p-5 break-inside-avoid">
      <h2 className="mb-2 flex items-center gap-2 font-display text-lg font-extrabold text-ink">
        {icon}
        {title}
      </h2>
      {children}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <p className="py-2 text-sm text-muted">{label}</p>;
}
