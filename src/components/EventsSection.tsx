"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR, enUS } from "date-fns/locale";
import { useTranslations, useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { History, Plus, Bath, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import {
  getEventsByPet,
  type Event,
  type EventsResponse,
} from "@/services/events.service";

interface EventsSectionProps {
  petId: string;
  onAddClick: () => void;
  parseDateString: (dateString: string) => Date;
}

// Icon + colors per event type.
const TYPE: Record<string, { icon: LucideIcon; fill: string; ring: string; text: string }> = {
  normal: { icon: icons.calendar_month, fill: "bg-sky-bg text-sky-fg", ring: "ring-sky", text: "text-sky-fg" },
  medical: { icon: icons.medical_services, fill: "bg-grape-bg text-grape-fg", ring: "ring-grape", text: "text-grape-fg" },
  grooming: { icon: Bath, fill: "bg-success-bg text-success-fg", ring: "ring-mint", text: "text-success-fg" },
  training: { icon: GraduationCap, fill: "bg-amber-bg text-amber-fg", ring: "ring-amber", text: "text-amber-fg" },
};

export default function EventsSection({
  petId,
  onAddClick,
  parseDateString,
}: EventsSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations("petDetails.events");
  const locale = useLocale();
  const dateLocale = locale === "en" ? enUS : ptBR;
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    EventsResponse["pagination"] | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchEvents = async (page: number = 1) => {
    if (!session?.user?.token) return;
    setLoading(true);
    try {
      const data = await getEventsByPet(session.user.token, petId, page, 5);
      setEvents(data.events);
      setPagination(data.pagination);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch events:", error);
      if (isInitialLoad) setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) fetchEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, session?.user?.token]);

  useEffect(() => {
    const handleRefresh = () => fetchEvents(currentPage);
    window.addEventListener("refresh-events", handleRefresh);
    return () => window.removeEventListener("refresh-events", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-deep">
            <History className="h-5 w-5" strokeWidth={2.5} />
          </span>
          <h2 className="text-2xl font-display font-extrabold text-ink">
            {t("title")}
          </h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-btn border border-mint bg-transparent px-3 py-1.5 text-sm font-extrabold text-mint transition-colors hover:bg-tint"
        >
          {t("add")}
          <Plus className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </div>

      {isInitialLoad && loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="#0E7A4A" />
          <span className="text-muted">{t("loading")}</span>
        </div>
      ) : events?.length === 0 && !loading ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-center text-muted">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div
            className={cn(
              "flex-1",
              loading && !isInitialLoad && "opacity-60 pointer-events-none"
            )}
          >
            {events.map((event, i) => {
              const cfg = TYPE[event.type] ?? TYPE.normal;
              const Icon = cfg.icon;
              const last = i === events.length - 1;
              return (
                <div key={event.id} className="flex gap-3">
                  <div className="flex w-11 flex-col items-center">
                    <span
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-offset-2 ring-offset-surface",
                        cfg.fill,
                        cfg.ring
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.5} />
                    </span>
                    {!last && <span className="my-1 w-0.5 flex-1 bg-hair" />}
                  </div>
                  <div className="min-w-0 pb-5">
                    <p
                      className={cn(
                        "text-[11px] font-extrabold uppercase tracking-wide",
                        cfg.text
                      )}
                    >
                      {format(parseDateString(event.eventDate), "d MMM yyyy", {
                        locale: dateLocale,
                      }).toUpperCase()}
                    </p>
                    <p className="font-bold text-ink">{event.title}</p>
                  </div>
                </div>
              );
            })}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div
              className={cn(
                "mt-auto pt-2",
                loading && "opacity-50 pointer-events-none"
              )}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
