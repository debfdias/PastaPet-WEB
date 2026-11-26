"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Microscope, Upload, X } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { uploadFile } from "@/lib/storage/client";
import Image from "next/image";
import { Exam, ExamFormData } from "@/types/exam";
import { createExam, updateExam } from "@/services/exams.service";

// A single file attached to an exam. New files (just picked by the user) carry
// the raw `File` so we can upload it on submit; existing files only have a URL.
type ExamFileItem = {
  id: string;
  url: string; // blob: URL for new files, remote URL for existing ones
  name: string;
  isImage: boolean;
  isPdf: boolean;
  file?: File;
};

const stripQuery = (s: string) => s.split("?")[0].toLowerCase();
const isPdfSource = (s: string) => stripQuery(s).endsWith(".pdf");
const isImageSource = (s: string) =>
  /\.(png|jpe?g|gif|webp|heic|heif|bmp|svg)$/.test(stripQuery(s));

// Build a file item from a remote URL (editing an existing exam).
const itemFromUrl = (url: string): ExamFileItem => ({
  id: url,
  url,
  name: decodeURIComponent(url.split("/").pop() || "file"),
  isImage: isImageSource(url),
  isPdf: isPdfSource(url),
});

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
  const [files, setFiles] = useState<ExamFileItem[]>([]);
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
      resultSummary: "",
      examDate: "",
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
          resultSummary: exam.resultSummary || "",
          examDate: (exam.examDate || exam.createdAt || "").slice(0, 10),
        });
        setFiles((exam.fileUrls || []).map(itemFromUrl));
      } else {
        // Reset form data when creating new exam
        reset({
          title: "",
          cause: "",
          administeredBy: "",
          resultSummary: "",
          examDate: new Date().toISOString().slice(0, 10),
        });
        setFiles([]);
      }
    }
  }, [isOpen, exam, reset]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (selected && selected.length > 0) {
      const newItems: ExamFileItem[] = Array.from(selected).map((file) => {
        const url = URL.createObjectURL(file);
        return {
          id: url,
          url,
          name: file.name,
          isImage: file.type.startsWith("image/") || isImageSource(file.name),
          isPdf: file.type === "application/pdf" || isPdfSource(file.name),
          file,
        };
      });
      setFiles((prev) => [...prev, ...newItems]);
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const target = prev.find((item) => item.id === id);
      if (target?.file) {
        // Release the object URL we created for the local preview
        URL.revokeObjectURL(target.url);
      }
      return prev.filter((item) => item.id !== id);
    });
  };

  const onSubmit = async (data: ExamFormData) => {
    if (!session?.user?.token) {
      return;
    }
    setIsSubmitting(true);

    try {
      // Upload any newly added files; keep existing ones as-is. Order preserved.
      const fileUrls = await Promise.all(
        files.map(async (item) => {
          if (!item.file) return item.url;
          const { fileUrl, error } = await uploadFile({
            file: item.file,
            bucket: "pets-files",
          });
          if (error) throw new Error(error);
          return fileUrl;
        })
      );

      const isEditing = !!exam;

      if (isEditing) {
        await updateExam(session.user.token, exam.id, {
          title: data.title,
          cause: data.cause,
          ...(data.administeredBy && { administeredBy: data.administeredBy }),
          fileUrls,
          ...(data.resultSummary && { resultSummary: data.resultSummary }),
          ...(data.examDate && { examDate: data.examDate }),
        });
      } else {
        await createExam(session.user.token, {
          petId,
          title: data.title,
          cause: data.cause,
          administeredBy: data.administeredBy,
          fileUrls,
          resultSummary: data.resultSummary,
          ...(data.examDate && { examDate: data.examDate }),
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]">
      <div className="bg-surface rounded-card p-6 w-full max-w-3xl max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-extrabold text-ink">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              {exam ? t("examModal.editTitle") : t("examModal.title")}
            </div>
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-mint" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Form fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("examModal.form.title.label")} *
                </label>
                <input
                  type="text"
                  {...register("title", {
                    required: t("examModal.form.title.label") + " is required",
                  })}
                  placeholder={t("examModal.form.title.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
                />
                {errors.title && (
                  <p className="text-coral-fg text-xs mt-1">
                    {errors.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("examModal.form.cause.label")} *
                </label>
                <input
                  type="text"
                  {...register("cause", {
                    required: t("examModal.form.cause.label") + " is required",
                  })}
                  placeholder={t("examModal.form.cause.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
                />
                {errors.cause && (
                  <p className="text-coral-fg text-xs mt-1">
                    {errors.cause.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("examModal.form.administeredBy.label")}
                </label>
                <input
                  type="text"
                  {...register("administeredBy")}
                  placeholder={t("examModal.form.administeredBy.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("examModal.form.examDate.label")}
                </label>
                <input
                  type="date"
                  {...register("examDate")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
                />
              </div>
            </div>

            {/* Right column - File upload */}
            <div className="flex-1">
              <label className="block text-sm font-bold text-ink mb-1">
                {t("examModal.form.fileUrl.label")}
              </label>
              <div className="w-full min-h-[231px] border-2 border-hair border-dashed rounded-ctrl bg-panel p-3">
                {files.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {files.map((item) => (
                      <div
                        key={item.id}
                        className="relative aspect-square rounded-ctrl border border-hair bg-surface overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => removeFile(item.id)}
                          aria-label="Remove file"
                          title="Remove file"
                          className="absolute top-1 right-1 z-10 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex h-full w-full items-center justify-center"
                        >
                          {item.isImage ? (
                            <Image
                              src={item.url}
                              alt={item.name}
                              width={120}
                              height={120}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-2 text-center">
                              <FaFilePdf className="w-8 h-8 mb-1 text-coral" />
                              <span className="text-[10px] text-muted break-all line-clamp-2">
                                {item.name}
                              </span>
                            </div>
                          )}
                        </a>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex aspect-square flex-col items-center justify-center rounded-ctrl border-2 border-dashed border-hair text-muted hover:bg-tint transition-colors cursor-pointer"
                    >
                      <Upload className="w-6 h-6" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex min-h-[205px] w-full flex-col items-center justify-center rounded-ctrl hover:bg-tint transition-colors cursor-pointer"
                  >
                    <Upload className="w-8 h-8 mb-2 text-muted" />
                    <p className="mb-2 text-sm text-muted">
                      <span className="font-semibold">
                        {t("examModal.form.fileUrl.clickToUpload")}
                      </span>
                    </p>
                    <p className="text-xs text-muted">
                      {t("examModal.form.fileUrl.fileTypes")}
                    </p>
                  </button>
                )}
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept=".pdf,image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1">
              {t("examModal.form.resultSummary.label")}
            </label>
            <textarea
              {...register("resultSummary")}
              rows={3}
              placeholder={t("examModal.form.resultSummary.placeholder")}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("examModal.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("examModal.buttons.saving")
                : t("examModal.buttons.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
