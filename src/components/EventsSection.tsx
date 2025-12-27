"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { MdEvent, MdEventNote } from "react-icons/md";
import { FaPlus } from "react-icons/fa";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
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

export default function EventsSection({
  petId,
  onAddClick,
  parseDateString,
}: EventsSectionProps) {
  const { data: session } = useSession();
  const t = useTranslations("petDetails.events");
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
      if (isInitialLoad) {
        setEvents([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.token) {
      fetchEvents(currentPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, session?.user?.token]);

  useEffect(() => {
    const handleRefresh = () => {
      fetchEvents(currentPage);
    };
    window.addEventListener("refresh-events", handleRefresh);
    return () => window.removeEventListener("refresh-events", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 md:h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <MdEventNote className="text-2xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
        </div>
        <button
          onClick={onAddClick}
          className="flex items-center justify-center gap-1 px-3 py-3 rounded-lg bg-avocado-500 hover:bg-avocado-300 text-gray-800 transition-colors cursor-pointer"
        >
          <FaPlus size={12} />
          <MdEvent size={16} />
        </button>
      </div>
      {isInitialLoad && loading ? (
        <div className="flex items-center justify-center gap-2 py-8">
          <ClipLoader size={20} color="hsl(148 91% 45%)" />
          <span>{t("loading") || "Loading..."}</span>
        </div>
      ) : events?.length === 0 && !loading ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-4">
          {t("noEvents")}
        </p>
      ) : (
        <div className="flex flex-col flex-1 md:min-h-[400px] min-h-0">
          <div className="space-y-2 relative flex-1 min-h-0">
            <div
              className={
                loading && !isInitialLoad
                  ? "blur-sm opacity-60 pointer-events-none"
                  : ""
              }
            >
              {events?.map((event) => (
                <div
                  key={event.id}
                  className="px-3 py-2 mt-2 bg-gray-100/50 dark:bg-gray-600/20 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer"
                >
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                    {event.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {format(parseDateString(event.eventDate), "PPP", {
                      locale: ptBR,
                    })}
                  </p>
                </div>
              ))}
            </div>
            {loading && !isInitialLoad && (
              <div className="absolute inset-0 flex items-center justify-center bg-pet-card/40 z-10 pointer-events-none">
                <ClipLoader size={40} color="hsl(148 91% 45%)" />
              </div>
            )}
          </div>
          {pagination && pagination.totalPages > 1 && (
            <div
              className={`mt-auto pt-4 ${
                loading ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          )}
          {(!pagination || pagination.totalPages <= 1) && (
            <div className="mt-auto"></div>
          )}
        </div>
      )}
    </div>
  );
}
