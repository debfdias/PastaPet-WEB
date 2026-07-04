export interface Exam {
  id: string;
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl?: string;
  resultSummary: string;
  examDate?: string;
  createdAt?: string;
}

export interface ExamFormData {
  title: string;
  cause: string;
  administeredBy: string;
  fileUrl: string;
  resultSummary: string;
  examDate: string;
}








