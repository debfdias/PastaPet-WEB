"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { PawPrint, ChevronRight, Search } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { getPetsClient, PetApiResponse } from "@/services/pets.service";

export default function ReportsPage() {
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [pets, setPets] = useState<PetApiResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!session?.user?.token) return;
    getPetsClient(session.user.token)
      .then(setPets)
      .catch(() => setPets([]))
      .finally(() => setLoading(false));
  }, [session]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return pets;
    return pets.filter((p) => p.name.toLowerCase().includes(q));
  }, [pets, query]);

  return (
    <div className="min-h-screen pt-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-ink">
          {t("title")}
        </h1>
      </div>

      <div className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-ctrl border border-hair bg-surface py-2.5 pl-10 pr-3 text-ink placeholder:text-faint focus:border-mint focus:outline-none"
        />
      </div>

      {loading ? (
        <div className="flex min-h-[40vh] items-center justify-center">
          <ClipLoader size={40} color="#0E7A4A" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-20 text-center text-muted">
          {query ? t("noMatches") : t("noPets")}
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((pet) => (
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
