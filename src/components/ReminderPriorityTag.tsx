"use client";

import { ReminderPriority } from "@/types/reminder";
import { useTranslations } from "next-intl";

interface ReminderPriorityTagProps {
  priority: ReminderPriority;
}

export default function ReminderPriorityTag({
  priority,
}: ReminderPriorityTagProps) {
  const t = useTranslations("dashboard.reminders");

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
}

