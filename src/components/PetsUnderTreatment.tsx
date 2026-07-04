"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { MdPets, MdArrowForward } from "react-icons/md";
import { ImAidKit } from "react-icons/im";
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

  // The card previews up to `pets.length` (2 from the server); the rest are on
  // the filtered pets page.
  const hasMore = totalCount > pets.length;

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <ImAidKit className="text-3xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("underTreatment.title")}</h2>
          {totalCount > 0 && (
            <span className="flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-avocado-500/20 text-avocado-800 dark:text-avocado-300 text-sm font-semibold">
              {totalCount}
            </span>
          )}
        </div>
        {hasMore && (
          <Link
            href="/pets?underTreatment=true"
            className="flex items-center gap-1 text-avocado-500 hover:text-avocado-300 transition-colors font-medium"
          >
            {t("viewAll")}
            <MdArrowForward />
          </Link>
        )}
      </div>

      {pets.length === 0 ? (
        <div className="flex items-center justify-center flex-1 py-8">
          <p className="text-gray-500 dark:text-gray-400 text-center">
            {t("underTreatment.empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/pets/${pet.id}`}
              className="flex items-center gap-3 bg-gray-100/50 dark:bg-gray-600/20 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pet-card dark:border-gray-700 flex-shrink-0">
                {pet.image ? (
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                    <MdPets className="text-lg text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                  {pet.name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {pet.cause}
                </p>
              </div>
              <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded border bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-500/30 dark:text-orange-200 dark:border-orange-400">
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
