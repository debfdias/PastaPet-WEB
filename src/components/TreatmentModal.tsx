"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Stethoscope, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  notes: string;
  startDate: string;
  endDate: string;
}

interface TreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export default function TreatmentModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: TreatmentModalProps) {
  const t = useTranslations();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    cause: "",
    description: "",
    startDate: "",
    endDate: "",
  });
  const [medications, setMedications] = useState<Medication[]>([]);

  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData({
        cause: "",
        description: "",
        startDate: "",
        endDate: "",
      });
      setMedications([]);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/treatments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.token}`,
          },
          body: JSON.stringify({
            petId,
            ...formData,
            medications,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("treatmentModal.errors.failedToCreate"));
      }

      toast.success(t("treatmentModal.success.treatmentAdded"), {
        position: "top-right",
        autoClose: 3000,
      });
      onSuccess();
      onClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("treatmentModal.errors.anErrorOccurred");
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

  const handleAddMedication = () => {
    setMedications((prev) => [
      ...prev,
      {
        name: "",
        dosage: "",
        frequency: "",
        notes: "",
        startDate: formData.startDate,
        endDate: formData.endDate,
      },
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    setMedications((prev) =>
      prev.map((med, i) => (i === index ? { ...med, [field]: value } : med))
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-pet-card rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              {t("treatmentModal.title")}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("treatmentModal.form.cause.label")} *
              </label>
              <input
                type="text"
                name="cause"
                value={formData.cause}
                onChange={handleChange}
                required
                placeholder={t("treatmentModal.form.cause.placeholder")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("treatmentModal.form.description.label")} *
              </label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                placeholder={t("treatmentModal.form.description.placeholder")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("treatmentModal.form.startDate")} *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("treatmentModal.form.endDate")} *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {t("treatmentModal.medications.title")}
              </h3>
              <button
                type="button"
                onClick={handleAddMedication}
                className="flex items-center gap-2 px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t("treatmentModal.medications.addButton")}
              </button>
            </div>

            {medications.map((medication, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-md font-medium">
                    {t("treatmentModal.medications.medication")} {index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveMedication(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("treatmentModal.medications.form.name")} *
                    </label>
                    <input
                      type="text"
                      value={medication.name}
                      onChange={(e) =>
                        handleMedicationChange(index, "name", e.target.value)
                      }
                      required
                      className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("treatmentModal.medications.form.dosage")} *
                    </label>
                    <input
                      type="text"
                      value={medication.dosage}
                      onChange={(e) =>
                        handleMedicationChange(index, "dosage", e.target.value)
                      }
                      required
                      className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("treatmentModal.medications.form.frequency")} *
                    </label>
                    <input
                      type="text"
                      value={medication.frequency}
                      onChange={(e) =>
                        handleMedicationChange(
                          index,
                          "frequency",
                          e.target.value
                        )
                      }
                      required
                      className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      {t("treatmentModal.medications.form.notes")}
                    </label>
                    <input
                      type="text"
                      value={medication.notes}
                      onChange={(e) =>
                        handleMedicationChange(index, "notes", e.target.value)
                      }
                      className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              {t("treatmentModal.buttons.cancel")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {loading
                ? t("treatmentModal.buttons.saving")
                : t("treatmentModal.buttons.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
