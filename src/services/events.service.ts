import { httpClient } from "@/lib/httpClient";
import { EventType } from "@/types/event";

export interface Event {
  id: string;
  title: string;
  type: string;
  eventDate: string;
  petId: string;
  userId: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventsResponse {
  events: Event[];
  pagination: Pagination;
}

/**
 * Get events for a specific pet with pagination
 */
export async function getEventsByPet(
  token: string,
  petId: string,
  page: number = 1,
  limit: number = 5
): Promise<EventsResponse> {
  return httpClient.get<EventsResponse>(token, `/events/pet/${petId}`, {
    queryParams: { page, limit },
  });
}

/**
 * Get all events with pagination
 */
export async function getEvents(
  token: string,
  page: number = 1,
  limit: number = 10
): Promise<EventsResponse> {
  return httpClient.get<EventsResponse>(token, "/events", {
    queryParams: { page, limit },
  });
}

/**
 * Create a new event
 */
export async function createEvent(
  token: string,
  data: {
    title: string;
    type: EventType;
    petId: string;
    eventDate: string;
  }
): Promise<Event> {
  return httpClient.post<Event>(token, "/events", {
    title: data.title,
    type: data.type,
    petId: data.petId,
    eventDate: new Date(data.eventDate).toISOString(),
  });
}
