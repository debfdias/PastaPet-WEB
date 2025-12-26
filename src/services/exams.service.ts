import { httpClient } from "@/lib/httpClient";

export interface Exam {
  id: string;
  petId: string;
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl?: string;
  resultSummary: string;
  treatmentId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ExamsResponse {
  exams: Exam[];
  pagination: Pagination;
}

/**
 * Get exams for a specific pet with pagination
 */
export async function getExamsByPet(
  token: string,
  petId: string,
  page: number = 1,
  limit: number = 4
): Promise<ExamsResponse> {
  return httpClient.get<ExamsResponse>(token, `/exams/pet/${petId}`, {
    queryParams: { page, limit },
  });
}

/**
 * Create a new exam
 */
export async function createExam(
  token: string,
  data: {
    petId: string;
    title: string;
    cause: string;
    administeredBy: string;
    fileUrl: string;
    resultSummary: string;
  }
): Promise<Exam> {
  return httpClient.post<Exam>(token, "/exams", data);
}

/**
 * Update an existing exam
 */
export async function updateExam(
  token: string,
  examId: string,
  data: {
    title: string;
    cause: string;
    administeredBy?: string;
    fileUrl?: string;
    resultSummary?: string;
  }
): Promise<Exam> {
  return httpClient.put<Exam>(token, `/exams/${examId}`, data);
}
