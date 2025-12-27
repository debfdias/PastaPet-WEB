"use client";

import { format } from "date-fns";
import { Reminder } from "@/types/reminder";
import TypeTag from "./ReminderTypeTag";
import PriorityTag from "./ReminderPriorityTag";

interface ReminderTooltipProps {
  selectedDate: Date;
  reminders: Reminder[];
  onClose: () => void;
  onToggleReminder: (reminderId: string, e: React.SyntheticEvent) => void;
  completingIds: Set<string>;
}

const parseDateString = (dateString: string): Date => {
  return new Date(dateString);
};

export default function ReminderTooltip({
  selectedDate,
  reminders,
  onClose,
  onToggleReminder,
  completingIds,
}: ReminderTooltipProps) {
  return (
    <div
      className="absolute z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-2xl p-4 w-80"
      style={{
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <h4 className="font-semibold text-sm">
          {format(selectedDate, "dd/MM/yyyy")}
        </h4>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 cursor-pointer"
        >
          ×
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {reminders.map((reminder) => (
          <div
            key={reminder.id}
            className={`p-2 rounded border border-gray-300 dark:border-gray-600 ${
              reminder.isCompleted
                ? "bg-gray-100 dark:bg-gray-700 opacity-60"
                : "bg-gray-50 dark:bg-gray-900"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h5
                  className={`font-medium text-sm break-words ${
                    reminder.isCompleted ? "line-through" : ""
                  }`}
                >
                  {reminder.title}
                </h5>
                {reminder.pet && (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {reminder.pet.name}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  {format(parseDateString(reminder.reminderDate), "HH:mm")}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TypeTag type={reminder.reminderType} />
                  <PriorityTag priority={reminder.priority} />
                </div>
              </div>
              <input
                type="checkbox"
                checked={reminder.isCompleted}
                onChange={(e) => {
                  e.stopPropagation();
                  if (!completingIds.has(reminder.id)) {
                    onToggleReminder(reminder.id, e);
                  }
                }}
                onClick={(e) => e.stopPropagation()}
                disabled={completingIds.has(reminder.id)}
                className="w-4 h-4 rounded border-gray-300 text-avocado-500 focus:ring-avocado-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
