import { httpClient } from "@/lib/httpClient";
import { ReminderPriority, ReminderType } from "@/types/reminder";

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
 * Create a new reminder
 */
export async function createReminder(
  token: string,
  data: CreateReminderData
): Promise<ReminderApiResponse> {
  return httpClient.post<ReminderApiResponse>(token, "/reminders", data);
}

