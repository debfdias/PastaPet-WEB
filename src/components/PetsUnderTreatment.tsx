"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdArrowForward } from "react-icons/md";
import { ImAidKit } from "react-icons/im";
import { avatarColor } from "@/lib/avatarColor";
import { cn } from "@/lib/utils";
import type { PetUnderTreatment } from "@/services/treatments.service";

interface PetsUnderTreatmentProps {
  pets: PetUnderTreatment[];
  totalCount: number;
}

export default function PetsUnderTreatment({
  pets,
  totalCount,
}: PetsUnderTreatmentProps) {
  const t = useTranslations("dashboard");

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-bg text-sky-fg">
            <ImAidKit className="text-2xl" />
          </span>
          <h2 className="whitespace-nowrap text-2xl font-display font-extrabold text-ink">
            {t("underTreatment.title")}
          </h2>
          {totalCount > 0 && (
            <span className="flex h-6 min-w-6 shrink-0 items-center justify-center rounded-full bg-panel px-2 text-sm font-extrabold text-muted">
              {totalCount}
            </span>
          )}
        </div>
        <Link
          href="/pets?underTreatment=true"
          aria-label={t("viewAll")}
          className="flex shrink-0 items-center gap-1 whitespace-nowrap text-sm font-extrabold text-deep transition-all hover:gap-2"
        >
          <span className="hidden md:inline">{t("viewAll")}</span>
          <MdArrowForward />
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-center text-muted">{t("underTreatment.empty")}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="flex items-center gap-3 rounded-2xl bg-panel p-2.5 transition-all hover:bg-tint"
            >
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl">
                {pet.image ? (
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                ) : (
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center font-display text-lg font-extrabold text-white",
                      avatarColor(pet.id)
                    )}
                  >
                    {pet.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-extrabold text-ink">{pet.name}</h3>
                <p className="truncate text-xs text-muted">{pet.cause}</p>
              </div>
              <span className="flex-shrink-0 rounded-chip bg-sky-bg px-2.5 py-1 text-xs font-extrabold text-sky-fg">
                {t("underTreatment.activeCount", {
                  count: pet.activeTreatmentCount,
                })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
