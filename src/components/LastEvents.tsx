"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import * as Accordion from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";
import classNames from "clsx";
import { format } from "date-fns";
import Pagination from "./Pagination";
import { ClipLoader } from "react-spinners";
import { MdEventNote } from "react-icons/md";

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
        `${process.env.NEXT_PUBLIC_API_URL}/events?page=${page}&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch events");
      }

      const data: EventsResponse = await response.json();
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
    fetchEvents(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Helper function to parse date strings and avoid timezone issues
  const parseDateString = (dateString: string): Date => {
    // Handle formats like "2025-12-12 00:00:00" or "2025-12-12T00:00:00"
    // Extract just the date part (YYYY-MM-DD) and create a local date
    const dateOnly = dateString.split(" ")[0].split("T")[0];
    const [year, month, day] = dateOnly.split("-").map(Number);
    // Create date in local timezone (month is 0-indexed in JS Date)
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
    <div className="bg-pet-card rounded-lg border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200">
      <Accordion.Root
        type="single"
        collapsible
        defaultValue="last-events"
        className="w-full"
      >
        <Accordion.Item value="last-events" className="overflow-hidden">
          <div className="p-8">
            <Accordion.Header className="AccordionHeader ">
              <Accordion.Trigger
                className={classNames(
                  "AccordionTrigger w-full flex items-center justify-between p-6 hover:bg-pet-card/80 transition-colors",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-avocado-500"
                )}
              >
                <div className="flex items-center gap-3">
                  <MdEventNote className="text-3xl text-avocado-500" />
                  <h3 className="text-2xl font-bold">{t("title")}</h3>
                </div>
                <ChevronDown
                  className="AccordionChevron w-5 h-5 transition-transform duration-300 flex-shrink-0"
                  aria-hidden
                />
              </Accordion.Trigger>
            </Accordion.Header>
          </div>

          <Accordion.Content
            className={classNames(
              "AccordionContent overflow-hidden",
              "data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
            )}
          >
            <div className="px-6 pb-6 relative">
              {isInitialLoad && loading ? (
                <div className="text-center py-8">{t("loading")}</div>
              ) : events.length === 0 && !loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {t("noEvents")}
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto relative">
                    <div
                      className={classNames(
                        loading &&
                          !isInitialLoad &&
                          "blur-sm opacity-60 pointer-events-none"
                      )}
                    >
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2 border-gray-300 dark:border-gray-600">
                            <th className="text-left p-3 font-semibold">
                              {t("table.title")}
                            </th>
                            <th className="text-left p-3 font-semibold">
                              {t("table.date")}
                            </th>
                            <th className="text-left p-3 font-semibold">
                              {t("table.type")}
                            </th>
                            <th className="text-left p-3 font-semibold">
                              {t("table.pet")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {events.map((event) => (
                            <tr
                              key={event.id}
                              onClick={() =>
                                router.push(`/pets/${event.petId}`)
                              }
                              className="border-b border-gray-200 dark:border-gray-700 hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 transition-colors cursor-pointer"
                            >
                              <td className="p-3">{event.title}</td>
                              <td className="p-3">
                                {format(parseDateString(event.eventDate), "PP")}
                              </td>
                              <td className="p-3">
                                <span className="px-2 py-1 rounded-md bg-avocado-500/20 text-avocado-800 dark:text-avocado-300 text-sm">
                                  {formatEventType(event.type)}
                                </span>
                              </td>
                              <td className="p-3">{event.pet.name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {loading && !isInitialLoad && (
                      <div className="absolute inset-0 flex items-center justify-center bg-pet-card/40 z-10 pointer-events-none">
                        <ClipLoader size={40} color="hsl(148 91% 45%)" />
                      </div>
                    )}
                  </div>
                  {pagination && pagination.totalPages > 1 && (
                    <div
                      className={classNames(
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
                </>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </div>
  );
}
