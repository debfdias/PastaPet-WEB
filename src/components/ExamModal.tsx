"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Microscope } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

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
  const [formData, setFormData] = useState({
    title: "",
    cause: "",
    administeredBy: "",
    fileUrl: "",
    resultSummary: "",
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
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/exams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          petId,
          ...formData,
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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-pet-card rounded-lg p-6 w-full max-w-2xl">
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("examModal.form.fileUrl.label")}
              </label>
              <input
                type="url"
                name="fileUrl"
                value={formData.fileUrl}
                onChange={handleChange}
                placeholder={t("examModal.form.fileUrl.placeholder")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("examModal.form.resultSummary.label")} *
            </label>
            <textarea
              name="resultSummary"
              value={formData.resultSummary}
              onChange={handleChange}
              required
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
