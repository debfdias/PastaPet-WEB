"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReminderFormData,
  ReminderPriority,
  ReminderType,
} from "@/types/reminder";
import { createReminder } from "@/services/reminders.service";
import type { PetApiResponse } from "@/services/pets.service";

interface ReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId?: string;
  pets?: PetApiResponse[];
  onSuccess: () => void;
}

export default function ReminderModal({
  isOpen,
  onClose,
  petId,
  pets,
  onSuccess,
}: ReminderModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("reminderModal");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ReminderFormData>({
    defaultValues: {
      title: "",
      description: "",
      reminderType: ReminderType.CUSTOM,
      priority: ReminderPriority.MEDIUM,
      reminderDate: new Date().toISOString().slice(0, 16),
      selectedPetId: petId || "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        description: "",
        reminderType: ReminderType.CUSTOM,
        priority: ReminderPriority.MEDIUM,
        reminderDate: new Date().toISOString().slice(0, 16),
        selectedPetId: petId || "",
      });
    }
  }, [isOpen, reset, petId]);

  const onSubmit = async (data: ReminderFormData) => {
    if (!session?.user?.token) {
      return;
    }

    const finalPetId = petId || data.selectedPetId;

    if (!finalPetId) {
      toast.error(t("errors.petRequired"), {
        position: "top-right",
        autoClose: 3000,
      });
      setIsSubmitting(false);
      return;
    }

    setIsSubmitting(true);

    try {
      await createReminder(session.user.token, {
        title: data.title,
        description: data.description,
        reminderType: data.reminderType,
        priority: data.priority,
        reminderDate: new Date(data.reminderDate).toISOString(),
        petId: finalPetId,
      });

      toast.success(t("success.reminderAdded"), {
        position: "top-right",
        autoClose: 3000,
      });
      onSuccess();
      onClose();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.anErrorOccurred");
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
    if (e.target === e.currentTarget) {
      const target = e.target as HTMLElement;
      let element = target;
      while (element && element !== document.body) {
        if (
          element.getAttribute("role") === "listbox" ||
          element.closest('[role="listbox"]') ||
          element.closest("[data-radix-portal]")
        ) {
          return;
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
        className="bg-surface rounded-card p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-display font-extrabold text-ink">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-ink cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-mint" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            {!petId && pets && pets.length > 0 && (
              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("form.selectPet")}
                </label>
                <Select
                  value={watch("selectedPetId") || undefined}
                  onValueChange={(value) =>
                    setValue("selectedPetId", value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t("form.selectPetPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="z-[100] max-h-48 overflow-y-auto"
                  >
                    {pets.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.selectedPetId && (
                  <p className="text-coral-fg text-xs mt-1">
                    {errors.selectedPetId.message}
                  </p>
                )}
                <input
                  type="hidden"
                  {...register("selectedPetId", {
                    required: !petId
                      ? t("form.selectPet") + " is required"
                      : false,
                  })}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("form.reminderTitle")}
              </label>
              <input
                type="text"
                {...register("title", {
                  required: t("form.reminderTitle") + " is required",
                })}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
                placeholder={t("form.reminderTitlePlaceholder")}
              />
              {errors.title && (
                <p className="text-coral-fg text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("form.description")}
              </label>
              <textarea
                {...register("description")}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint min-h-[80px]"
                placeholder={t("form.descriptionPlaceholder")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("form.reminderType")}
                </label>
                <Select
                  value={watch("reminderType")}
                  onValueChange={(value) =>
                    setValue("reminderType", value as ReminderType, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    <SelectItem value={ReminderType.VET_APPOINTMENT}>
                      {t("form.types.vetAppointment")}
                    </SelectItem>
                    <SelectItem value={ReminderType.VACCINE_BOOSTER}>
                      {t("form.types.vaccineBooster")}
                    </SelectItem>
                    <SelectItem value={ReminderType.EXAM}>
                      {t("form.types.exam")}
                    </SelectItem>
                    <SelectItem value={ReminderType.TREATMENT_FOLLOWUP}>
                      {t("form.types.treatmentFollowup")}
                    </SelectItem>
                    <SelectItem value={ReminderType.MEDICATION}>
                      {t("form.types.medication")}
                    </SelectItem>
                    <SelectItem value={ReminderType.CUSTOM}>
                      {t("form.types.custom")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-bold text-ink mb-1">
                  {t("form.priority")}
                </label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value) =>
                    setValue("priority", value as ReminderPriority, {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent position="popper" className="z-[100]">
                    <SelectItem value={ReminderPriority.HIGH}>
                      {t("form.priorities.high")}
                    </SelectItem>
                    <SelectItem value={ReminderPriority.MEDIUM}>
                      {t("form.priorities.medium")}
                    </SelectItem>
                    <SelectItem value={ReminderPriority.LOW}>
                      {t("form.priorities.low")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ink mb-1">
                {t("form.reminderDate")}
              </label>
              <input
                type="datetime-local"
                {...register("reminderDate", {
                  required: t("form.reminderDate") + " is required",
                })}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-hair border rounded-ctrl focus:outline-none focus:border-mint focus:z-10 sm:text-md bg-panel text-ink placeholder:text-faint"
              />
              {errors.reminderDate && (
                <p className="text-coral-fg text-xs mt-1">
                  {errors.reminderDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <Button type="button" variant="ghost" onClick={onClose}>
              {t("buttons.cancel")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("buttons.adding") : t("buttons.addReminder")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


