"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { format } from "date-fns";
import { History, Scissors, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";

interface Pet {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  type: string;
  eventDate: string;
  petId: string;
  userId: string;
  pet: Pet;
}

interface EventsResponse {
  events: Event[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface LastEventsProps {
  token: string;
}

// Icon + soft tone per event type.
const TYPE: Record<string, { icon: LucideIcon; tone: string }> = {
  normal: { icon: icons.calendar_month, tone: "bg-sky-bg text-sky-fg" },
  medical: { icon: icons.medical_services, tone: "bg-grape-bg text-grape-fg" },
  grooming: { icon: Scissors, tone: "bg-success-bg text-success-fg" },
  training: { icon: GraduationCap, tone: "bg-amber-bg text-amber-fg" },
};

export default function LastEvents({ token }: LastEventsProps) {
  const router = useRouter();
  const t = useTranslations("dashboard.lastEvents");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<
    EventsResponse["pagination"] | null
  >(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const fetchEvents = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events?page=${page}&limit=6`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data: EventsResponse = await response.json();
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
    fetchEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => setCurrentPage(page);

  // Parse date strings, avoiding timezone shifts.
  const parseDateString = (dateString: string): Date => {
    const dateOnly = dateString.split(" ")[0].split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    return new Date(year, month - 1, day);
  };

  const formatEventType = (type: string) => {
    const typeMap: Record<string, string> = {
      normal: t("types.normal"),
      medical: t("types.medical"),
      grooming: t("types.grooming"),
      training: t("types.training"),
    };
    return typeMap[type] || type;
  };

  return (
    <div className="flex h-full flex-col rounded-card bg-surface p-6 shadow-card">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tint text-deep">
          <History className="h-5 w-5" strokeWidth={2.5} />
        </span>
        <h2 className="text-2xl font-display font-extrabold text-ink">
          {t("title")}
        </h2>
      </div>

      {isInitialLoad && loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="#0E7A4A" />
          <span className="text-muted">{t("loading")}</span>
        </div>
      ) : events?.length === 0 && !loading ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <p className="text-center text-muted">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col">
          <div className="relative flex-1">
            <div
              className={cn(
                "space-y-2",
                loading && !isInitialLoad && "blur-sm opacity-60 pointer-events-none"
              )}
            >
              {events.map((event) => {
                const cfg = TYPE[event.type] ?? TYPE.normal;
                const Icon = cfg.icon;
                return (
                  <div
                    key={event.id}
                    onClick={() => router.push(`/pets/${event.petId}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-2xl bg-panel p-3 transition-colors hover:bg-tint"
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                        cfg.tone
                      )}
                    >
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-extrabold text-ink">
                        {event.title}
                      </p>
                      <p className="truncate text-xs text-muted">
                        {event.pet.name} ·{" "}
                        {format(parseDateString(event.eventDate), "dd/MM")}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-chip px-2.5 py-1 text-xs font-extrabold",
                        cfg.tone
                      )}
                    >
                      {formatEventType(event.type)}
                    </span>
                  </div>
                );
              })}
            </div>
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 flex items-center justify-center bg-surface/60 pointer-events-none">
                <ClipLoader size={40} color="#0E7A4A" />
              </div>
            )}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div
              className={cn(
                "mt-auto pt-4",
                loading && "opacity-50 pointer-events-none"
              )}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
