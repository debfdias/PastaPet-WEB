"use client";

import { differenceInYears, differenceInMonths, format } from "date-fns";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ImageIcon } from "lucide-react";
import { FaExternalLinkAlt, FaCheck } from "react-icons/fa";
import { LuCalendar } from "react-icons/lu";
import { IoWarningOutline } from "react-icons/io5";
import { Chip } from "@/components/ui/Chip";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

const FUNERAL_PLAN_NAME = "Pet Fenix";

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
  activeTreatmentCauses?: string[];
}

export default function PetInfo({
  pet,
  onEdit,
  translateType,
  translateGender,
  parseDateString,
  getFuneraryPlanStatus,
  activeTreatmentCauses = [],
}: PetInfoProps) {
  const t = useTranslations();
  const pc = useTranslations("petCard");
  const tr = useTranslations("petDetails.treatments");

  const isMale = pet.gender?.toUpperCase() === "MALE";
  const EditIcon = icons.edit;
  const PawIcon = icons.pets;
  const SexIcon = isMale ? icons.male : icons.female;
  const MedkitIcon = icons.medical_services;

  const ageLabel = () => {
    const birth = new Date(pet.dob);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    return years > 0
      ? `${years}${pc("yearShort")} ${months}${pc("monthShort")}`
      : `${months}${pc("monthShort")}`;
  };

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      {/* photo */}
      <button
        onClick={onEdit}
        className="group relative mb-4 flex h-64 w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl"
      >
        {pet.image ? (
          <Image
            src={pet.image}
            alt={pet.name}
            fill
            sizes="(max-width: 768px) 100vw, 40vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-hair bg-panel text-muted">
            <ImageIcon className="h-8 w-8 text-faint" strokeWidth={1.75} />
            <p className="text-sm">
              {t("petDetails.title")} {pet.name}
            </p>
          </div>
        )}

        {/* status chip */}
        {activeTreatmentCauses.length > 0 && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-chip bg-orange-bg px-2.5 py-1 text-[11.5px] font-extrabold text-orange-fg shadow-sm">
            <MedkitIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
            {pc("status.treatment")}
          </span>
        )}

        {/* edit button */}
        <span
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-mint text-white shadow-md transition-colors group-hover:bg-leaf"
          aria-hidden
        >
          <EditIcon className="h-4 w-4" strokeWidth={2.5} />
        </span>
      </button>

      {/* name */}
      <h2 className="mb-3 font-display text-3xl font-extrabold text-ink">
        {pet.name}
      </h2>

      {/* meta chips */}
      <div className="mb-2 flex flex-wrap gap-1.5">
        <Chip tone="meta" icon={PawIcon}>
          {translateType(pet.type)}
        </Chip>
        <Chip tone="meta" icon={SexIcon}>
          {translateGender(pet.gender)}
        </Chip>
        <Chip tone="meta" icon={icons.monitor_weight}>
          {String(pet.weight).replace(".", ",")} kg
        </Chip>
        <Chip tone="meta" icon={icons.cake}>
          {ageLabel()}
        </Chip>
      </div>

      {/* health flags */}
      {activeTreatmentCauses.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {activeTreatmentCauses.map((cause, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1.5 rounded-chip bg-sky-bg px-[9px] py-1 text-[11px] font-extrabold text-sky-fg"
            >
              <MedkitIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
              {cause} · {tr("active")}
            </span>
          ))}
        </div>
      )}

      {/* plans — one per row: chip left, its detail right-aligned */}
      {(pet.hasPetPlan || pet.hasFuneraryPlan) && (
        <div className="mt-auto space-y-3 border-t border-hair pt-4">
          {pet.hasPetPlan && (
            <div className="flex items-center justify-between gap-2">
              <PlanChip
                icon={icons.health_and_safety}
                label={pet.petPlanName || pc("petPlan")}
                tone="planHealth"
              />
              {(() => {
                const planName = (pet.petPlanName || "").toLowerCase();
                let planUrl = "";
                if (planName.includes("pet love"))
                  planUrl = "https://plano-de-saude.petlove.com.br";
                else if (planName.includes("pet plus"))
                  planUrl = "https://sistemapetplus.com.br/";
                if (!planUrl) return null;
                return (
                  <a
                    href={planUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-plan-health-fg transition-opacity hover:opacity-80"
                  >
                    {t("petDetails.info.petHealthPlan")}
                    <FaExternalLinkAlt className="text-xs" />
                  </a>
                );
              })()}
            </div>
          )}

          {pet.hasFuneraryPlan && (
            <div className="flex items-center justify-between gap-2">
              <PlanChip
                icon={icons.local_florist}
                label={FUNERAL_PLAN_NAME}
                tone="planFun"
              />
              {pet.funeraryPlanStartDate && (
                <div className="flex flex-col items-end gap-1 text-right">
                  {(() => {
                    const status = getFuneraryPlanStatus(
                      pet.funeraryPlanStartDate
                    );
                    if (!status) return null;
                    if (status.eligible) {
                      return (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-success-fg/25 bg-success-bg px-2 py-0.5 text-xs font-bold text-success-fg">
                          <FaCheck className="text-[10px]" />
                          {t("petDetails.info.available")}
                        </span>
                      );
                    }
                    const monthsRemaining =
                      status.monthsRemaining && status.monthsRemaining > 0
                        ? status.monthsRemaining
                        : status.daysRemaining !== undefined
                        ? Math.ceil(status.daysRemaining / 30)
                        : 0;
                    const monthText =
                      monthsRemaining === 1
                        ? t("petDetails.info.month")
                        : t("petDetails.info.months");
                    return (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-coral-fg/25 bg-coral-bg px-2 py-0.5 text-xs font-bold text-coral-fg">
                        <IoWarningOutline className="text-[10px]" />
                        {t("petDetails.info.inGracePeriod")} {monthsRemaining}{" "}
                        {monthText}
                      </span>
                    );
                  })()}
                  <span className="flex items-center gap-1.5 text-xs text-muted">
                    <LuCalendar className="text-sm text-faint" />
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
      )}
    </div>
  );
}

function PlanChip({
  icon: Icon,
  label,
  tone,
}: {
  icon: (typeof icons)[string];
  label: string;
  tone: "planHealth" | "planFun";
}) {
  const cls =
    tone === "planHealth"
      ? "bg-plan-health-bg text-plan-health-fg"
      : "bg-plan-fun-bg text-plan-fun-fg";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-extrabold",
        cls
      )}
    >
      <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />
      {label}
    </span>
  );
}
