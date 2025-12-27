"use client";

import { useState, useEffect, useMemo } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useTranslations } from "next-intl";
import { ClipLoader } from "react-spinners";
import Pagination from "./Pagination";
import ReminderTooltip from "./ReminderTooltip";
import classNames from "clsx";
import {
  MdNotifications,
  MdVaccines,
  MdLocalHospital,
  MdScience,
  MdMedicalServices,
  MdMedication,
  MdLabel,
  MdViewList,
  MdCalendarMonth,
  MdChevronLeft,
  MdChevronRight,
} from "react-icons/md";
import {
  getReminders,
  getRemindersByPetId,
  completeReminder,
  uncompleteReminder,
} from "@/services/reminders.service";
import {
  Reminder,
  ReminderType,
  ReminderPriority,
  RemindersPagination,
} from "@/types/reminder";

interface RemindersSectionProps {
  token: string;
  petId?: string; // Optional: if provided, fetch reminders for this pet only
}

interface TypeTagProps {
  type: ReminderType;
  t: (key: string) => string;
}

const TypeTag = ({ type, t }: TypeTagProps) => {
  const config = {
    [ReminderType.VACCINE_BOOSTER]: {
      icon: <MdVaccines size={12} />,
      label: t("types.vaccine"),
      className:
        "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-500/30 dark:text-blue-200 dark:border-blue-400",
    },
    [ReminderType.VET_APPOINTMENT]: {
      icon: <MdLocalHospital size={12} />,
      label: t("types.vet"),
      className:
        "bg-purple-50 text-purple-700 border-purple-300 dark:bg-purple-500/30 dark:text-purple-200 dark:border-purple-400",
    },
    [ReminderType.EXAM]: {
      icon: <MdScience size={12} />,
      label: t("types.exam"),
      className:
        "bg-cyan-50 text-cyan-700 border-cyan-300 dark:bg-cyan-500/30 dark:text-cyan-200 dark:border-cyan-400",
    },
    [ReminderType.TREATMENT_FOLLOWUP]: {
      icon: <MdMedicalServices size={12} />,
      label: t("types.treatment"),
      className:
        "bg-orange-50 text-orange-700 border-orange-300 dark:bg-orange-500/30 dark:text-orange-200 dark:border-orange-400",
    },
    [ReminderType.MEDICATION]: {
      icon: <MdMedication size={12} />,
      label: t("types.medication"),
      className:
        "bg-pink-50 text-pink-700 border-pink-300 dark:bg-pink-500/30 dark:text-pink-200 dark:border-pink-400",
    },
    [ReminderType.CUSTOM]: {
      icon: <MdLabel size={12} />,
      label: t("types.custom"),
      className:
        "bg-gray-50 text-gray-700 border-gray-300 dark:bg-gray-600/40 dark:text-gray-200 dark:border-gray-500",
    },
  };

  const { icon, label, className } =
    config[type] || config[ReminderType.CUSTOM];

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${className}`}
    >
      {icon}
      {label}
    </span>
  );
};

interface PriorityTagProps {
  priority: ReminderPriority;
  t: (key: string) => string;
}

const PriorityTag = ({ priority, t }: PriorityTagProps) => {
  const config = {
    [ReminderPriority.HIGH]: {
      label: t("priorities.high"),
      className:
        "bg-red-50 text-red-700 border-red-300 dark:bg-red-500/30 dark:text-red-200 dark:border-red-400",
    },
    [ReminderPriority.MEDIUM]: {
      label: t("priorities.medium"),
      className:
        "bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-500/30 dark:text-yellow-200 dark:border-yellow-400",
    },
    [ReminderPriority.LOW]: {
      label: t("priorities.low"),
      className:
        "bg-green-50 text-green-700 border-green-300 dark:bg-green-500/30 dark:text-green-200 dark:border-green-400",
    },
  };

  const { label, className } =
    config[priority] || config[ReminderPriority.MEDIUM];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${className}`}
    >
      {label}
    </span>
  );
};

const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

type DisplayMode = "list" | "calendar";

export default function RemindersSection({
  token,
  petId,
}: RemindersSectionProps) {
  const t = useTranslations("dashboard.reminders");
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
  const [pagination, setPagination] = useState<RemindersPagination | null>(
    null
  );
  const [displayMode, setDisplayMode] = useState<DisplayMode>("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [hasFetchedAllReminders, setHasFetchedAllReminders] = useState(false);
  const [hasFetchedListReminders, setHasFetchedListReminders] = useState(false);
  const [fetchedPages, setFetchedPages] = useState<Set<number>>(new Set());

  const fetchReminders = async (page: number = 1) => {
    setLoading(true);
    try {
      const data = petId
        ? await getRemindersByPetId(token, petId, page, 5)
        : await getReminders(token, page, 10);
      setReminders(data.reminders);
      setPagination(data.pagination);
      setIsInitialLoad(false);
    } catch (error) {
      console.error("Failed to fetch reminders:", error);
      if (isInitialLoad) {
        setReminders([]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Group reminders by date (YYYY-MM-DD)
  const remindersByDate = useMemo(() => {
    const grouped: Record<string, Reminder[]> = {};
    reminders.forEach((reminder) => {
      const dateKey = format(
        parseDateString(reminder.reminderDate),
        "yyyy-MM-dd"
      );
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(reminder);
    });
    return grouped;
  }, [reminders]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleToggleReminder = async (
    reminderId: string,
    e: React.SyntheticEvent
  ) => {
    e.stopPropagation(); // Prevent row click

    const reminder = reminders.find((r) => r.id === reminderId);
    if (!reminder) return;

    const isCompleting = !reminder.isCompleted;
    setCompletingIds((prev) => new Set(prev).add(reminderId));

    // Optimistic update
    setReminders((prev) =>
      prev.map((r) =>
        r.id === reminderId
          ? {
              ...r,
              isCompleted: isCompleting,
              completedAt: isCompleting ? new Date().toISOString() : null,
            }
          : r
      )
    );

    try {
      // API call - optimistic update already applied
      if (isCompleting) {
        await completeReminder(token, reminderId);
      } else {
        await uncompleteReminder(token, reminderId);
      }
      // No need to refresh - optimistic update is already in place
    } catch (error) {
      console.error(
        `Failed to ${isCompleting ? "complete" : "uncomplete"} reminder:`,
        error
      );
      // Revert optimistic update on error
      setReminders((prev) =>
        prev.map((r) =>
          r.id === reminderId
            ? {
                ...r,
                isCompleted: !isCompleting,
                completedAt: reminder.completedAt,
              }
            : r
        )
      );
    } finally {
      setCompletingIds((prev) => {
        const next = new Set(prev);
        next.delete(reminderId);
        return next;
      });
    }
  };

  useEffect(() => {
    if (displayMode === "list") {
      // Only fetch for list mode if we haven't already fetched for list mode
      // or if page/token/petId changed
      if (!hasFetchedListReminders || currentPage !== 1) {
        fetchReminders(currentPage);
        if (currentPage === 1) {
          setHasFetchedListReminders(true);
        }
      }
    } else {
      // For calendar mode, fetch first 20 reminders initially
      if (!hasFetchedAllReminders) {
        const loadReminders = async () => {
          setLoading(true);
          try {
            const data = petId
              ? await getRemindersByPetId(token, petId, 1, 20)
              : await getReminders(token, 1, 20);

            setReminders(data.reminders);
            setHasFetchedAllReminders(true);
            setFetchedPages(new Set([1]));
            setIsInitialLoad(false);
          } catch (error) {
            console.error("Failed to fetch reminders for calendar:", error);
            setReminders([]);
          } finally {
            setLoading(false);
          }
        };
        loadReminders();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, token, petId, displayMode]);

  // Reset fetch flags when token or petId changes
  useEffect(() => {
    setHasFetchedAllReminders(false);
    setHasFetchedListReminders(false);
    setFetchedPages(new Set());
  }, [token, petId]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      if (displayMode === "list") {
        fetchReminders(currentPage);
      } else {
        // Reload reminders for calendar (first 20)
        const loadReminders = async () => {
          setLoading(true);
          try {
            const data = petId
              ? await getRemindersByPetId(token, petId, 1, 20)
              : await getReminders(token, 1, 20);

            setReminders(data.reminders);
            setHasFetchedAllReminders(true);
          } catch (error) {
            console.error("Failed to fetch reminders for calendar:", error);
          } finally {
            setLoading(false);
          }
        };
        loadReminders();
      }
    };
    window.addEventListener("refresh-reminders", handleRefresh);
    return () => window.removeEventListener("refresh-reminders", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId, displayMode]);

  // Calendar helpers
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week for the month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = getDay(monthStart);

  // Create array of days including empty cells for alignment
  const calendarDays: (Date | null)[] = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add all days of the month
  daysInMonth.forEach((day) => {
    calendarDays.push(day);
  });

  // Helper to get icon and color for reminder type
  const getReminderTypeIcon = (type: ReminderType) => {
    const config = {
      [ReminderType.VACCINE_BOOSTER]: {
        icon: <MdVaccines size={14} />,
        className: "bg-blue-500/30 text-blue-700 dark:text-blue-400",
      },
      [ReminderType.VET_APPOINTMENT]: {
        icon: <MdLocalHospital size={14} />,
        className: "bg-purple-500/30 text-purple-700 dark:text-purple-400",
      },
      [ReminderType.EXAM]: {
        icon: <MdScience size={14} />,
        className: "bg-cyan-500/30 text-cyan-700 dark:text-cyan-400",
      },
      [ReminderType.TREATMENT_FOLLOWUP]: {
        icon: <MdMedicalServices size={14} />,
        className: "bg-orange-500/30 text-orange-700 dark:text-orange-400",
      },
      [ReminderType.MEDICATION]: {
        icon: <MdMedication size={14} />,
        className: "bg-pink-500/30 text-pink-700 dark:text-pink-400",
      },
      [ReminderType.CUSTOM]: {
        icon: <MdLabel size={14} />,
        className: "bg-gray-500/30 text-gray-700 dark:text-gray-400",
      },
    };

    const { icon, className } = config[type] || config[ReminderType.CUSTOM];
    return { icon, className };
  };

  const handleDayClick = (day: Date) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayReminders = remindersByDate[dateKey] || [];

    if (dayReminders.length > 0) {
      setSelectedDate(day);
      // Center the tooltip in the calendar component
      setTooltipPosition({
        x: 50, // 50% of parent width
        y: 50, // 50% of parent height
      });
    }
  };

  // Check if we have reminders for the current month being viewed
  const hasRemindersForMonth = useMemo(() => {
    if (reminders.length === 0) return false;
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return reminders.some((reminder) => {
      const reminderDate = parseDateString(reminder.reminderDate);
      return reminderDate >= monthStart && reminderDate <= monthEnd;
    });
  }, [reminders, currentMonth]);

  // Fetch more reminders when navigating to a month that doesn't have data
  useEffect(() => {
    if (
      displayMode === "calendar" &&
      hasFetchedAllReminders &&
      !hasRemindersForMonth &&
      reminders.length > 0
    ) {
      const loadMoreReminders = async () => {
        try {
          // Calculate next page to fetch
          const nextPage = Math.floor(reminders.length / 20) + 1;

          // Limit to prevent fetching too many pages
          if (nextPage > 10) return; // Max 10 pages (200 reminders)

          // Don't fetch if we've already fetched this page
          if (fetchedPages.has(nextPage)) return;

          const data = petId
            ? await getRemindersByPetId(token, petId, nextPage, 20)
            : await getReminders(token, nextPage, 20);

          // Append new reminders to existing ones, filtering out duplicates by ID
          setReminders((prev) => {
            const existingIds = new Set(prev.map((r) => r.id));
            const newReminders = data.reminders.filter(
              (r) => !existingIds.has(r.id)
            );
            return [...prev, ...newReminders];
          });

          // Mark this page as fetched
          setFetchedPages((prev) => new Set([...prev, nextPage]));
        } catch (error) {
          console.error("Failed to fetch more reminders:", error);
        }
      };
      loadMoreReminders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth, displayMode, hasFetchedAllReminders, hasRemindersForMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const selectedDateReminders = selectedDate
    ? remindersByDate[format(selectedDate, "yyyy-MM-dd")] || []
    : [];

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200 relative md:h-auto">
      {/* Dark backdrop overlay when tooltip is open */}
      {selectedDate && (
        <div
          className="absolute inset-0 bg-black/70 dark:bg-black/80 rounded-lg z-40 cursor-pointer"
          onClick={() => {
            setSelectedDate(null);
            setTooltipPosition(null);
          }}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MdNotifications className="text-3xl text-avocado-500" />
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          {displayMode === "list" &&
            pagination &&
            pagination.totalCount > 0 && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                ({pagination.totalCount})
              </span>
            )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDisplayMode("calendar")}
            className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
              displayMode === "calendar"
                ? "bg-avocado-500 text-gray-800 border-avocado-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title={t("displayMode.calendar")}
          >
            <MdCalendarMonth className="w-5 h-5" />
          </button>
          <button
            onClick={() => setDisplayMode("list")}
            className={`px-3 py-1.5 rounded-md border transition-colors cursor-pointer ${
              displayMode === "list"
                ? "bg-avocado-500 text-gray-800 border-avocado-500"
                : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
            title={t("displayMode.list")}
          >
            <MdViewList className="w-5 h-5" />
          </button>
        </div>
      </div>

      {displayMode === "list" ? (
        <>
          {isInitialLoad && loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <ClipLoader size={20} color="hsl(148 91% 45%)" />
              <span>{t("loading")}</span>
            </div>
          ) : reminders.length === 0 && !loading ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {t("noReminders")}
            </p>
          ) : (
            <>
              <div className="relative">
                <div
                  className={classNames(
                    loading &&
                      !isInitialLoad &&
                      "blur-sm opacity-60 pointer-events-none"
                  )}
                >
                  <div className="space-y-1.5">
                    {reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`px-3 py-2 bg-gray-100/50 dark:bg-gray-600/20 border rounded-lg hover:bg-avocado-500/10 dark:hover:bg-avocado-500/20 hover:border-avocado-500/50 transition-all cursor-pointer ${
                          reminder.isCompleted
                            ? "border-gray-200 dark:border-gray-700 opacity-60"
                            : "border-gray-300 dark:border-gray-600"
                        }`}
                      >
                        <h3
                          className={`font-medium text-base text-gray-800 dark:text-gray-200 truncate ${
                            reminder.isCompleted ? "line-through" : ""
                          }`}
                        >
                          {reminder.title}
                        </h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {reminder.pet && (
                              <>
                                <span className="font-medium text-gray-600 dark:text-gray-300">
                                  {reminder.pet.name}
                                </span>
                                <span>•</span>
                              </>
                            )}
                            <span>
                              {format(
                                parseDateString(reminder.reminderDate),
                                "dd/MM/yy HH:mm"
                              )}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <TypeTag type={reminder.reminderType} t={t} />
                            <PriorityTag priority={reminder.priority} t={t} />
                            <input
                              type="checkbox"
                              checked={reminder.isCompleted}
                              onChange={(e) => {
                                e.stopPropagation();
                                if (!completingIds.has(reminder.id)) {
                                  handleToggleReminder(reminder.id, e);
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              disabled={completingIds.has(reminder.id)}
                              className="w-4 h-4 rounded border-gray-300 text-avocado-500 focus:ring-avocado-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
        </>
      ) : (
        <>
          {isInitialLoad && loading ? (
            <div className="flex items-center justify-center gap-2 py-8">
              <ClipLoader size={20} color="hsl(148 91% 45%)" />
              <span>{t("loading")}</span>
            </div>
          ) : (
            <div className="relative">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <MdChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-lg font-semibold">
                  {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
                </h3>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                >
                  <MdChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400 p-2"
                    >
                      {day}
                    </div>
                  )
                )}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return (
                      <div
                        key={`empty-${index}`}
                        className="aspect-square md:h-16"
                      />
                    );
                  }

                  const dateKey = format(day, "yyyy-MM-dd");
                  const dayReminders = remindersByDate[dateKey] || [];
                  const isToday = isSameDay(day, new Date());
                  const hasReminders = dayReminders.length > 0;

                  return (
                    <div key={dateKey} className="relative">
                      <button
                        onClick={() => handleDayClick(day)}
                        className={classNames(
                          "w-full aspect-square md:h-16 rounded-xl border transition-all relative cursor-pointer flex flex-col items-center justify-center",
                          isToday
                            ? "bg-avocado-500/20 border-avocado-500 font-semibold"
                            : "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700",
                          hasReminders && "ring-2 ring-avocado-500/50"
                        )}
                      >
                        {hasReminders ? (
                          <>
                            {/* Icons in center - overlapping */}
                            <div className="flex items-center justify-center relative mb-0.5 h-6 md:h-8">
                              {dayReminders.slice(0, 3).map((reminder, idx) => {
                                const { icon, className } = getReminderTypeIcon(
                                  reminder.reminderType
                                );
                                return (
                                  <div
                                    key={reminder.id}
                                    className={classNames(
                                      "flex items-center justify-center w-5 h-5 md:w-6 md:h-6 rounded-full border-1 border-white dark:border-gray-800",
                                      className
                                    )}
                                    style={{
                                      marginLeft: idx > 0 ? "-8px" : "0",
                                      zIndex: 10 + idx,
                                    }}
                                    title={reminder.title}
                                  >
                                    {icon}
                                  </div>
                                );
                              })}
                              {dayReminders.length > 3 && (
                                <div
                                  className="flex items-center justify-center w-5 h-5 md:w-8 md:h-8 rounded-full bg-gray-500/30 text-gray-700 dark:text-gray-400 text-[10px] md:text-xs font-semibold border-2 border-white dark:border-gray-800"
                                  style={{
                                    marginLeft: "-8px",
                                    zIndex: 40,
                                  }}
                                >
                                  +{dayReminders.length - 3}
                                </div>
                              )}
                            </div>
                            {/* Day number below */}
                            <div className="text-[10px] md:text-xs font-medium mt-0">
                              {format(day, "d")}
                            </div>
                          </>
                        ) : (
                          <div className="text-xs md:text-sm font-medium">
                            {format(day, "d")}
                          </div>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Tooltip - Centered */}
              {selectedDate &&
                tooltipPosition &&
                selectedDateReminders.length > 0 && (
                  <ReminderTooltip
                    selectedDate={selectedDate}
                    reminders={selectedDateReminders}
                    onClose={() => {
                      setSelectedDate(null);
                      setTooltipPosition(null);
                    }}
                    onToggleReminder={handleToggleReminder}
                    completingIds={completingIds}
                  />
                )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
