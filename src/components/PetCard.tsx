"use client";

import { differenceInYears, differenceInMonths } from "date-fns";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Chip } from "@/components/ui/Chip";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import type { PetApiResponse } from "@/services/pets.service";

// Funerary plan is a single brand — if the pet has one, it's Pet Fenix.
const FUNERAL_PLAN_NAME = "Pet Fenix";

/**
 * Per-pet health data layered on top of the API shape. `status` is derived on
 * the pets page from the under-treatment list (healthy | treatment). FIV/FeLV
 * flags and vaccine rollups are intentionally out of scope for now.
 */
export interface PetHealth {
  status?: "healthy" | "treatment";
}

export type PetCardPet = PetApiResponse & PetHealth;

interface PetCardProps {
  pet: PetCardPet;
  onEdit: (pet: PetApiResponse) => void;
  selected?: boolean;
}

// Status chip config — pink filled heart for healthy, orange for treatment.
const STATUS = {
  healthy: {
    icon: icons.favorite,
    labelKey: "status.healthy",
    chip: "bg-pink-bg text-pink-fg",
    iconCls: "fill-pink text-pink",
  },
  treatment: {
    icon: icons.medical_services,
    labelKey: "status.treatment",
    chip: "bg-orange-bg text-orange-fg",
    iconCls: "",
  },
} as const;

export default function PetCard({ pet, onEdit, selected }: PetCardProps) {
  const router = useRouter();
  const t = useTranslations("petCard");

  const ageLabel = (dob: string) => {
    const birth = new Date(dob);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    return years === 0
      ? `${months}${t("monthShort")}`
      : `${years}${t("yearShort")} ${months}${t("monthShort")}`;
  };

  const speciesKey =
    pet.type?.toUpperCase() === "CAT"
      ? "cat"
      : pet.type?.toUpperCase() === "DOG"
      ? "dog"
      : "other";
  const isMale = pet.gender?.toUpperCase() === "MALE";

  const PawIcon = icons.pets;
  const EditIcon = icons.edit;
  const SexIcon = isMale ? icons.male : icons.female;

  const statusCfg = pet.status ? STATUS[pet.status] : null;
  const StatusIcon = statusCfg?.icon;
  const showPlans = pet.hasPetPlan || pet.hasFuneraryPlan;

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button")) return;
    router.push(`/pets/${pet.id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className={cn(
        "group cursor-pointer overflow-hidden rounded-card bg-surface shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-card-hover",
        selected && "ring-2 ring-mint"
      )}
    >
      {/* photo */}
      <div className="relative h-[168px] bg-tint">
        {pet.image ? (
          <Image
            src={pet.image}
            alt={pet.name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PawIcon className="h-12 w-12 text-faint" strokeWidth={1.75} />
          </div>
        )}

        {/* edit FAB — mint, solid */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(pet);
          }}
          aria-label={t("editPet")}
          className="absolute right-2.5 top-2.5 flex h-[34px] w-[34px] items-center justify-center rounded-full bg-mint text-white shadow-md transition-colors hover:bg-leaf"
        >
          <EditIcon className="h-[17px] w-[17px]" strokeWidth={2.5} />
        </button>
      </div>

      {/* body */}
      <div className="px-[15px] pb-4 pt-3.5">
        {/* name + status chip */}
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="truncate font-display text-[19px] font-extrabold text-ink">
            {pet.name}
          </h3>
          {statusCfg && StatusIcon && (
            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1 rounded-chip px-2.5 py-1 text-[11px] font-extrabold",
                statusCfg.chip
              )}
            >
              <StatusIcon
                className={cn("h-3.5 w-3.5", statusCfg.iconCls)}
                strokeWidth={2.5}
              />
              {t(statusCfg.labelKey)}
            </span>
          )}
        </div>

        {/* meta chips */}
        <div className="flex flex-wrap gap-1.5">
          <Chip tone="meta" icon={PawIcon}>
            {t(`species.${speciesKey}`)}
          </Chip>
          <Chip tone="meta" icon={SexIcon}>
            {t(`sex.${isMale ? "male" : "female"}`)}
          </Chip>
          <Chip tone="meta" icon={icons.monitor_weight}>
            {pet.weight} kg
          </Chip>
          <Chip tone="meta" icon={icons.cake}>
            {ageLabel(pet.dob)}
          </Chip>
        </div>

        {/* plans row — labeled chips sized to their text (like the status chips) */}
        {showPlans && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-hair pt-[11px]">
            {pet.hasPetPlan && (
              <PlanChip
                icon={icons.health_and_safety}
                label={pet.petPlanName || t("petPlan")}
                tone="planHealth"
              />
            )}
            {pet.hasFuneraryPlan && (
              <PlanChip
                icon={icons.local_florist}
                label={FUNERAL_PLAN_NAME}
                tone="planFun"
              />
            )}
          </div>
        )}
      </div>
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
        "inline-flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 text-[11px] font-extrabold",
        cls
      )}
    >
      <Icon className="h-[15px] w-[15px]" strokeWidth={2.5} />
      {label}
    </span>
  );
}
