import { httpClient } from "@/lib/httpClient";
import {
  ReminderPriority,
  ReminderType,
  RemindersResponse,
} from "@/types/reminder";

export interface CreateReminderData {
  title: string;
  description?: string;
  reminderDate: string;
  priority: ReminderPriority;
  reminderType: ReminderType;
  petId: string;
}

export interface ReminderApiResponse {
  id: string;
  title: string;
  description?: string;
  reminderDate: string;
  priority: ReminderPriority;
  reminderType: ReminderType;
  petId: string;
  userId: string;
}

/**
 * Get reminders with pagination
 */
export async function getReminders(
  token: string,
  page: number = 1,
  limit: number = 5
): Promise<RemindersResponse> {
  return httpClient.get<RemindersResponse>(token, "/reminders", {
    queryParams: { page, limit },
  });
}

/**
 * Create a new reminder
 */
export async function createReminder(
  token: string,
  data: CreateReminderData
): Promise<ReminderApiResponse> {
  return httpClient.post<ReminderApiResponse>(token, "/reminders", data);
}

/**
 * Mark a reminder as completed
 */
export async function completeReminder(
  token: string,
  reminderId: string
): Promise<ReminderApiResponse> {
  return httpClient.patch<ReminderApiResponse>(
    token,
    `/reminders/${reminderId}/complete`
  );
}

/**
 * Mark a reminder as not completed (uncomplete)
 */
export async function uncompleteReminder(
  token: string,
  reminderId: string
): Promise<ReminderApiResponse> {
  return httpClient.patch<ReminderApiResponse>(
    token,
    `/reminders/${reminderId}/incomplete`
  );
}
