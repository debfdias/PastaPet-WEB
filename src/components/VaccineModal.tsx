"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { Syringe } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import { Switch } from "radix-ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VaccineFormData } from "@/types/vaccine";
import {
  getVaccineTypes,
  createVaccine,
  type VaccineType,
} from "@/services/vaccines.service";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VaccineFormData>({
    defaultValues: {
      vaccineTypeId: "",
      administrationDate: "",
      nextDueDate: "",
      validUntil: "",
      lotNumber: "",
      administeredBy: "",
      notes: "",
      isBooster: false,
    },
  });

  const fetchVaccineTypes = async () => {
    if (!session?.user?.token) return;
    try {
      const data = await getVaccineTypes(session.user.token);
      setVaccineTypes(data);
    } catch (error) {
      console.error("Error fetching vaccine types:", error);
      toast.error(t("vaccineModal.errors.failedToFetch"), {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchVaccineTypes();
      reset({
        vaccineTypeId: "",
        administrationDate: "",
        nextDueDate: "",
        validUntil: "",
        lotNumber: "",
        administeredBy: "",
        notes: "",
        isBooster: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reset]);

  const onSubmit = async (data: VaccineFormData) => {
    if (!session?.user?.token) {
      return;
    }
    setIsSubmitting(true);

    try {
      // Get the current value from watch to ensure we have the latest state
      const currentIsBooster = watch("isBooster");

      // Transform isBooster to booster for API
      const payload = {
        petId,
        vaccineTypeId: data.vaccineTypeId,
        administrationDate: data.administrationDate,
        nextDueDate: data.nextDueDate,
        validUntil: data.validUntil,
        lotNumber: data.lotNumber,
        administeredBy: data.administeredBy,
        notes: data.notes,
        booster: currentIsBooster, // Use the watched value to ensure it's up to date
      };

      await createVaccine(session.user.token, payload);

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
          : t("vaccineModal.errors.anErrorOccurred");
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only close if clicking directly on the backdrop, not on modal content
    if (e.target === e.currentTarget) {
      // Check if click is inside a Radix Select portal (dropdown)
      const target = e.target as HTMLElement;
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

  return (
    <div
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60]"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-surface rounded-card p-6 w-full max-w-2xl max-h-[85vh] md:max-h-none overflow-y-auto md:overflow-visible"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-extrabold text-ink">
            <div className="flex items-center gap-2">
              <Syringe className="w-5 h-5" />
              {t("vaccineModal.title")}
            </div>
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-mint" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.vaccineType.label")} *
              </label>
              <Select
                value={watch("vaccineTypeId")}
                onValueChange={(value) =>
                  setValue("vaccineTypeId", value, {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t("vaccineModal.form.vaccineType.placeholder")}
                  />
                </SelectTrigger>
                <SelectContent
                  position="popper"
                  className="z-[100] max-h-48 overflow-y-auto"
                >
                  {vaccineTypes?.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vaccineTypeId && (
                <p className="text-coral-fg text-xs mt-1">
                  {errors.vaccineTypeId.message}
                </p>
              )}
              <input
                type="hidden"
                {...register("vaccineTypeId", {
                  required:
                    t("vaccineModal.form.vaccineType.label") + " is required",
                })}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.administrationDate")} *
              </label>
              <input
                type="date"
                {...register("administrationDate", {
                  required:
                    t("vaccineModal.form.administrationDate") + " is required",
                })}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
              {errors.administrationDate && (
                <p className="text-coral-fg text-xs mt-1">
                  {errors.administrationDate.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.nextDueDate")}
              </label>
              <input
                type="date"
                {...register("nextDueDate")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.validUntil")}
              </label>
              <input
                type="date"
                {...register("validUntil")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.lotNumber")}
              </label>
              <input
                type="text"
                {...register("lotNumber")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("vaccineModal.form.administeredBy.label")}
              </label>
              <input
                type="text"
                {...register("administeredBy")}
                placeholder={t("vaccineModal.form.administeredBy.placeholder")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">
                {t("vaccineModal.form.isBooster")}
              </label>
              <Switch.Root
                className="w-[42px] h-[25px] bg-hair rounded-full relative data-[state=checked]:bg-mint outline-none cursor-pointer"
                checked={watch("isBooster")}
                onCheckedChange={(checked: boolean) => {
                  setValue("isBooster", checked, {
                    shouldValidate: true,
                    shouldDirty: true,
                  });
                }}
              >
                <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full shadow-lg transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
              </Switch.Root>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-ink mb-1">
              {t("vaccineModal.form.notes")}
            </label>
            <textarea
              {...register("notes")}
              rows={3}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
            />
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("vaccineModal.buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? t("vaccineModal.buttons.saving")
                : t("vaccineModal.buttons.save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
