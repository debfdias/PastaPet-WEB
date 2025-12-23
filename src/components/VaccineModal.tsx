"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Syringe } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface VaccineType {
  id: string;
  name: string;
  diseaseCovered: string[];
  isCore: boolean;
  boosterRequired: boolean;
  boosterIntervalMonths?: number;
  totalRequiredDoses?: number;
}

interface VaccineModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export default function VaccineModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: VaccineModalProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [vaccineTypes, setVaccineTypes] = useState<VaccineType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState({
    vaccineTypeId: "",
    administrationDate: "",
    nextDueDate: "",
    validUntil: "",
    lotNumber: "",
    administeredBy: "",
    notes: "",
  });

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;

      // Check if click is outside modal
      if (modalRef.current && !modalRef.current.contains(target)) {
        // Check if click is inside a Radix Select portal (dropdown)
        // Radix Select renders the dropdown in a portal, check if target is inside any portal
        let element = target;
        while (element && element !== document.body) {
          // Check if element is inside a Radix Select content (has role="listbox" or is inside a portal)
          if (
            element.getAttribute("role") === "listbox" ||
            element.closest('[role="listbox"]') ||
            element.closest("[data-radix-portal]")
          ) {
            return; // Don't close if clicking inside Select dropdown
          }
          element = element.parentElement as HTMLElement;
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      fetchVaccineTypes();
      // Reset form data when modal opens
      setFormData({
        vaccineTypeId: "",
        administrationDate: "",
        nextDueDate: "",
        validUntil: "",
        lotNumber: "",
        administeredBy: "",
        notes: "",
      });
    }
  }, [isOpen]);

  const fetchVaccineTypes = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vaccines/types`,
        {
          headers: {
            Authorization: `Bearer ${session?.user?.token}`,
          },
        }
      );
      if (!response.ok) throw new Error(t("vaccineModal.errors.failedToFetch"));
      const data = await response.json();
      setVaccineTypes(data);
    } catch (error) {
      console.error("Error fetching vaccine types:", error);
      setError(t("vaccineModal.errors.failedToFetch"));
      toast.error(t("vaccineModal.errors.failedToFetch"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/vaccines`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token}`,
          },
          body: JSON.stringify({
            petId,
            ...formData,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("vaccineModal.errors.failedToCreate"));
      }

      toast.success(t("vaccineModal.success.vaccineAdded"), {
        position: "top-right",
        autoClose: 3000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("petModal.errors.anErrorOccurred");
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
      <div
        ref={modalRef}
        className="bg-pet-card rounded-lg p-6 w-full max-w-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              {t("vaccineModal.title")}
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
                {t("vaccineModal.form.vaccineType.label")} *
              </label>
              <Select
                value={formData.vaccineTypeId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, vaccineTypeId: value }))
                }
                required
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("vaccineModal.form.vaccineType.placeholder")}
                  />
                </SelectTrigger>
                <SelectContent>
                  {vaccineTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("vaccineModal.form.administrationDate")} *
              </label>
              <input
                type="date"
                name="administrationDate"
                value={formData.administrationDate}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("vaccineModal.form.nextDueDate")}
              </label>
              <input
                type="date"
                name="nextDueDate"
                value={formData.nextDueDate}
                onChange={handleChange}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("vaccineModal.form.validUntil")}
              </label>
              <input
                type="date"
                name="validUntil"
                value={formData.validUntil}
                onChange={handleChange}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("vaccineModal.form.lotNumber")}
              </label>
              <input
                type="text"
                name="lotNumber"
                value={formData.lotNumber}
                onChange={handleChange}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("vaccineModal.form.administeredBy.label")}
              </label>
              <input
                type="text"
                name="administeredBy"
                value={formData.administeredBy}
                onChange={handleChange}
                placeholder={t("vaccineModal.form.administeredBy.placeholder")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("vaccineModal.form.notes")}
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
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
              {t("vaccineModal.buttons.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {loading
                ? t("vaccineModal.buttons.saving")
                : t("vaccineModal.buttons.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
