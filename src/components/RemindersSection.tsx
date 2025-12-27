"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { ClipLoader } from "react-spinners";
import Pagination from "./Pagination";
import classNames from "clsx";
import {
  MdNotifications,
  MdVaccines,
  MdLocalHospital,
  MdScience,
  MdMedicalServices,
  MdMedication,
  MdLabel,
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
    fetchReminders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, token, petId]);

  // Listen for refresh events
  useEffect(() => {
    const handleRefresh = () => {
      fetchReminders(currentPage);
    };
    window.addEventListener("refresh-reminders", handleRefresh);
    return () => window.removeEventListener("refresh-reminders", handleRefresh);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, petId]);

  return (
    <div className="bg-pet-card rounded-lg p-6 border-2 border-[#cbd1c2]/20 dark:border-pet-card/5 hover:border-avocado-500/50 hover:shadow-lg transition-all duration-200">
      <div className="flex items-center gap-3 mb-4">
        <MdNotifications className="text-3xl text-avocado-500" />
        <h2 className="text-2xl font-bold">{t("title")}</h2>
        {pagination && pagination.totalCount > 0 && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({pagination.totalCount})
          </span>
        )}
      </div>

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
    </div>
  );
}
