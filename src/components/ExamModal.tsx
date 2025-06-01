"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Microscope, Upload } from "lucide-react";
import { FaFilePdf } from "react-icons/fa6";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { uploadFile } from "@/lib/storage/client";
import Image from "next/image";

interface ExamModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export default function ExamModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: ExamModalProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    title: "",
    cause: "",
    administeredBy: "",
    fileUrl: "",
    resultSummary: "",
    selectedFileName: "",
  });

  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData({
        title: "",
        cause: "",
        administeredBy: "",
        fileUrl: "",
        resultSummary: "",
        selectedFileName: "",
      });
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  }, [isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const fileUrl = URL.createObjectURL(file);
      setSelectedFile(fileUrl);
      if (file.type.startsWith("image/")) {
        setPreviewUrl(fileUrl);
      } else {
        setPreviewUrl(null);
      }
      setFormData((prev) => ({ ...prev, selectedFileName: file.name }));
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let fileUrl = formData.fileUrl;

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

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          petId,
          ...formData,
          fileUrl,
        }),
      });

      if (!response.ok) {
        throw new Error(t("examModal.errors.failedToCreate"));
      }

      toast.success(t("examModal.success.examAdded"), {
        position: "top-right",
        autoClose: 3000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("examModal.errors.anErrorOccurred");
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-pet-card rounded-lg p-6 w-full max-w-3xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Microscope className="w-5 h-5" />
              {t("examModal.title")}
            </div>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-avocado-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left column - Form fields */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.title.label")} *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder={t("examModal.form.title.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.cause.label")} *
                </label>
                <input
                  type="text"
                  name="cause"
                  value={formData.cause}
                  onChange={handleChange}
                  required
                  placeholder={t("examModal.form.cause.placeholder")}
                  className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t("examModal.form.administeredBy.label")} *
                </label>
                <input
                  type="text"
                  name="administeredBy"
                  value={formData.administeredBy}
                  onChange={handleChange}
                  required
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
                <label className="flex flex-col items-center justify-center w-full h-full border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                  {previewUrl ? (
                    <Image
                      src={previewUrl}
                      alt="Exam file preview"
                      width={300}
                      height={200}
                      className="w-full h-full object-contain rounded-lg p-2"
                    />
                  ) : selectedFile ? (
                    <div className="flex flex-col items-center justify-center">
                      {formData.selectedFileName
                        ?.toLowerCase()
                        .endsWith(".pdf") ? (
                        <FaFilePdf className="w-12 h-12 mb-2 dark:text-gray-300 text-red-400" />
                      ) : (
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      )}
                      <p className="mb-2 text-sm text-gray-500 text-center px-2">
                        {formData.selectedFileName ||
                          t("examModal.form.fileSelected")}
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
              name="resultSummary"
              value={formData.resultSummary}
              onChange={handleChange}
              rows={3}
              placeholder={t("examModal.form.resultSummary.placeholder")}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
            />
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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
              disabled={loading}
              className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {loading
                ? t("examModal.buttons.saving")
                : t("examModal.buttons.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
