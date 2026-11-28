"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PawPrint, FileBarChart, ChevronRight } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { getPetsClient, PetApiResponse } from "@/services/pets.service";

export default function ReportsPage() {
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [pets, setPets] = useState<PetApiResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session?.user?.token) return;
    getPetsClient(session.user.token)
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [session]);

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-6 flex items-center gap-2">
        <FileBarChart className="h-6 w-6 text-deep" />
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {t("title")}
          </h1>
          <p className="text-sm text-muted">{t("subtitle")}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <ClipLoader size={40} color="#0E7A4A" />
        </div>
      ) : pets.length === 0 ? (
        <p className="py-20 text-center text-muted">{t("noPets")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <Link
              key={pet.id}
              href={`/reports/${pet.id}`}
              className="flex items-center gap-3 rounded-card border border-hair bg-surface p-4 transition-colors hover:bg-tint"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-tile bg-panel">
                {pet.image ? (
                  <Image
                    src={pet.image}
                    alt={pet.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <PawPrint className="h-6 w-6 text-faint" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-ink">{pet.name}</p>
                <p className="truncate text-xs text-muted">{pet.breed}</p>
              </div>
              <ChevronRight className="h-5 w-5 flex-shrink-0 text-faint" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
