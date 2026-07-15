"use client";

import Link from "next/link";
import Image from "next/image";
import { differenceInYears, differenceInMonths } from "date-fns";
import { useTranslations } from "next-intl";
import { MdArrowForward } from "react-icons/md";
import { Chip } from "@/components/ui/Chip";
import { icons } from "@/lib/icons";
import { avatarColor } from "@/lib/avatarColor";
import { cn } from "@/lib/utils";
import type { PetApiResponse } from "@/services/pets.service";

interface MyPetsSectionProps {
  pets: PetApiResponse[];
  totalCount: number;
  treatmentIds: Set<string>;
  onAddPet: () => void;
}

export default function MyPetsSection({
  pets,
  totalCount,
  treatmentIds,
  onAddPet,
}: MyPetsSectionProps) {
  const t = useTranslations("dashboard");
  const pc = useTranslations("petCard");
  const petsT = useTranslations("pets");
  const PawIcon = icons.pets;

  const speciesKey = (type: string) =>
    type?.toUpperCase() === "CAT"
      ? "cat"
      : type?.toUpperCase() === "DOG"
      ? "dog"
      : "other";

  const ageLabel = (dob: string) => {
    const birth = new Date(dob);
    const years = differenceInYears(new Date(), birth);
    const months = differenceInMonths(new Date(), birth) % 12;
    return years > 0
      ? `${years}${pc("yearShort")}`
      : `${months}${pc("monthShort")}`;
  };

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-deep">
            <PawIcon className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h2 className="text-2xl font-display font-extrabold text-ink">
            {t("myPets.title")}
          </h2>
          {totalCount > 0 && (
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-tint px-2 text-sm font-extrabold text-deep">
              {totalCount}
            </span>
          )}
        </div>
        <Link
          href="/pets"
          className="flex items-center gap-1 font-extrabold text-deep transition-all hover:gap-2"
        >
          {t("viewAll")}
          <MdArrowForward />
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center py-8">
          <p className="mb-4 text-muted">{t("noPets")}</p>
          <button
            onClick={onAddPet}
            className="cursor-pointer rounded-btn bg-deep px-4 py-2 font-extrabold text-white transition-colors hover:bg-forest"
          >
            {petsT("addPet")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {pets.slice(0, 4).map((pet) => {
            const isTreatment = treatmentIds.has(pet.id);
            return (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="flex flex-col items-center gap-2 rounded-2xl bg-panel p-3 text-center transition-all hover:-translate-y-0.5 hover:bg-tint"
              >
                <div className="relative h-16 w-16 overflow-hidden rounded-2xl">
                  {pet.image ? (
                    <Image
                      src={pet.image}
                      alt={pet.name}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div
                      className={cn(
                        "flex h-full w-full items-center justify-center font-display text-2xl font-extrabold text-white",
                        avatarColor(pet.id)
                      )}
                    >
                      {pet.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-extrabold text-ink">{pet.name}</p>
                  <p className="text-xs text-muted">
                    {pc(`species.${speciesKey(pet.type)}`)} · {ageLabel(pet.dob)}
                  </p>
                </div>
                {isTreatment ? (
                  <Chip tone="treatment" icon={icons.medical_services}>
                    {pc("status.treatment")}
                  </Chip>
                ) : (
                  <Chip tone="healthy" icon={icons.favorite}>
                    {pc("status.healthy")}
                  </Chip>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
