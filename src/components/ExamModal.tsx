"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Microscope, Upload } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { uploadFile } from "@/lib/storage/client";
import Image from "next/image";
import dynamic from "next/dynamic";
import { Exam, ExamFormData } from "@/types/exam";
import { createExam, updateExam } from "@/services/exams.service";

// Dynamically import react-pdf components only on client side
const Document = dynamic(
  async () => {
    const mod = await import("react-pdf");
    // Set up PDF.js worker for Next.js
    if (typeof window !== "undefined") {
      mod.pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${mod.pdfjs.version}/build/pdf.worker.min.mjs`;
    }
    return { default: mod.Document };
  },
  {
    ssr: false,
  }
);

const Page = dynamic(() => import("react-pdf").then((mod) => mod.Page), {
  ssr: false,
});

// Import CSS - these are safe in client components
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
  exam?: Exam | null;
}

export default function ExamModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
  exam,
}: ExamModalProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPdf, setIsPdf] = useState(false);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedFileName, setSelectedFileName] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExamFormData>({
    defaultValues: {
      title: "",
      cause: "",
      administeredBy: "",
      fileUrl: "",
      resultSummary: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (exam) {
        // Pre-fill form with exam data when editing
        reset({
          title: exam.title || "",
          cause: exam.cause || "",
          administeredBy: exam.administeredBy || "",
          fileUrl: exam.fileUrl || "",
          resultSummary: exam.resultSummary || "",
        });
        if (exam.fileUrl) {
          setPreviewUrl(exam.fileUrl);
          setIsPdf(
            exam.fileUrl.toLowerCase().endsWith(".pdf") ||
              exam.fileUrl.includes("application/pdf")
          );
        } else {
          setPreviewUrl(null);
          setIsPdf(false);
        }
        setSelectedFile(null);
        setSelectedFileName("");
        setPageNumber(1);
        setNumPages(null);
      } else {
        // Reset form data when creating new exam
        reset({
          title: "",
          cause: "",
          administeredBy: "",
          fileUrl: "",
          resultSummary: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        setSelectedFileName("");
        setIsPdf(false);
        setPageNumber(1);
        setNumPages(null);
      }
    }
  }, [isOpen, exam, reset]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setSelectedFile(fileUrl);
      const isPdfFile =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      setIsPdf(isPdfFile);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(fileUrl);
      } else if (isPdfFile) {
        setPreviewUrl(fileUrl);
      } else {
        setPreviewUrl(null);
      }
      setSelectedFileName(file.name);
      setPageNumber(1);
      setNumPages(null);
      e.target.value = "";
    }
  };

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onSubmit = async (data: ExamFormData) => {
    if (!session?.user?.token) {
      return;
    }
    setIsSubmitting(true);

    try {
      let fileUrl = data.fileUrl;

      if (selectedFile) {
        const file = await fetch(selectedFile)
          .then((r) => r.blob())
          .then((blob) => {
            const fileName = Math.random().toString(36).slice(2, 9);
            const mimeType = blob.type || "application/octet-stream";
            return new File([blob], `${fileName}.${mimeType.split("/")[1]}`, {
              type: mimeType,
            });
          });

        const { fileUrl: uploadedUrl, error } = await uploadFile({
          file,
          bucket: "pets-files",
        });

        if (error) {
          console.error(error);
          return;
        }
        fileUrl = uploadedUrl;
      }

      const isEditing = !!exam;

      if (isEditing) {
        await updateExam(session.user.token, exam.id, {
          title: data.title,
          cause: data.cause,
          ...(data.administeredBy && { administeredBy: data.administeredBy }),
          ...(fileUrl && { fileUrl }),
          ...(data.resultSummary && { resultSummary: data.resultSummary }),
        });
      } else {
        await createExam(session.user.token, {
          petId,
          title: data.title,
          cause: data.cause,
          administeredBy: data.administeredBy,
          fileUrl,
          resultSummary: data.resultSummary,
        });
      }

      toast.success(
        isEditing
          ? t("examModal.success.examUpdated")
          : t("examModal.success.examAdded"),
        {
          position: "top-right",
          autoClose: 3000,
        }
      );
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("examModal.errors.anErrorOccurred");
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-pet-card rounded-lg p-6 w-full max-w-3xl max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              {exam ? t("examModal.editTitle") : t("examModal.title")}
            </div>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-avocado-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Form fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.title.label")} *
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: t("examModal.form.title.label") + " is required",
                  })}
                  placeholder={t("examModal.form.title.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.cause.label")} *
                </label>
                <input
                  type="text"
                  {...register("cause", {
                    required: t("examModal.form.cause.label") + " is required",
                  })}
                  placeholder={t("examModal.form.cause.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
                {errors.cause && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.cause.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.administeredBy.label")}
                </label>
                <input
                  type="text"
                  {...register("administeredBy")}
                  placeholder={t("examModal.form.administeredBy.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>
            </div>

            {/* Right column - File upload */}
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">
                {t("examModal.form.fileUrl.label")}
              </label>
              <div className="flex items-center justify-center w-full h-[231px]">
                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 relative">
                  {previewUrl && isPdf ? (
                    <div className="w-full h-full overflow-auto p-2">
                      <Document
                        file={previewUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                          <div className="flex items-center justify-center h-full">
                            <p className="text-sm text-gray-500">
                              {t("common.loading")}
                            </p>
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center h-full">
                            <FaFilePdf className="w-12 h-12 mb-2 dark:text-gray-300 text-red-400" />
                            <p className="text-sm text-gray-500 text-center px-2">
                              {t("examModal.errors.failedToLoadPdf")}
                            </p>
                          </div>
                        }
                      >
                        <Page
                          pageNumber={pageNumber}
                          width={280}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </Document>
                      {numPages && numPages > 1 && (
                        <div className="flex items-center justify-center gap-2 mt-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPageNumber((prev) => Math.max(1, prev - 1));
                            }}
                            disabled={pageNumber <= 1}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 cursor-pointer"
                          >
                            Previous
                          </button>
                          <span className="text-xs text-gray-500">
                            {pageNumber} / {numPages}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPageNumber((prev) =>
                                Math.min(numPages, prev + 1)
                              );
                            }}
                            disabled={pageNumber >= numPages}
                            className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 cursor-pointer"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </div>
                  ) : previewUrl && !isPdf ? (
                    <Image
                      src={previewUrl}
                      alt="Exam file preview"
                      width={300}
                      height={200}
                      className="w-full h-full object-contain rounded-lg p-2"
                    />
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center justify-center">
                      {selectedFileName?.toLowerCase().endsWith(".pdf") ? (
                        <FaFilePdf className="w-12 h-12 mb-2 dark:text-gray-300 text-red-400" />
                      ) : (
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      )}
                      <p className="mb-2 text-sm text-gray-500 text-center px-2">
                        {selectedFileName || t("examModal.form.fileSelected")}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">
                          {t("examModal.form.fileUrl.clickToUpload")}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("examModal.form.fileUrl.fileTypes")}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("examModal.form.resultSummary.label")}
            </label>
            <textarea
              {...register("resultSummary")}
              rows={3}
              placeholder={t("examModal.form.resultSummary.placeholder")}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {t("examModal.buttons.cancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {isSubmitting
                ? t("examModal.buttons.saving")
                : t("examModal.buttons.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
