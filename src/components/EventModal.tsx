"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EventFormData, EventType } from "@/types/event";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

export default function EventModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: EventModalProps) {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const t = useTranslations("eventModal");

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      title: "",
      type: EventType.NORMAL,
      eventDate: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        title: "",
        type: EventType.NORMAL,
        eventDate: new Date().toISOString().split("T")[0],
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: EventFormData) => {
    if (!session?.user?.token) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.user.token}`,
          },
          body: JSON.stringify({
            title: data.title,
            type: data.type,
            petId,
            eventDate: new Date(data.eventDate).toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("errors.failedToCreate"));
      }

      toast.success(t("success.eventAdded"), {
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
      className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-pet-card rounded-lg p-6 w-full max-w-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{t("title")}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 cursor-pointer"
          >
            <CgCloseR className="w-6 h-6 dark:hover:text-avocado-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventTitle")}
              </label>
              <input
                type="text"
                {...register("title", {
                  required: t("form.eventTitle") + " is required",
                })}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                placeholder={t("form.eventTitlePlaceholder")}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventType")}
              </label>
              <Select
                value={watch("type")}
                onValueChange={(value) =>
                  setValue("type", value as EventType, { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={EventType.NORMAL}>
                    {t("form.types.normal")}
                  </SelectItem>
                  <SelectItem value={EventType.MEDICAL}>
                    {t("form.types.medical")}
                  </SelectItem>
                  <SelectItem value={EventType.GROOMING}>
                    {t("form.types.grooming")}
                  </SelectItem>
                  <SelectItem value={EventType.TRAINING}>
                    {t("form.types.training")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventDate")}
              </label>
              <input
                type="date"
                {...register("eventDate", {
                  required: t("form.eventDate") + " is required",
                })}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              />
              {errors.eventDate && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.eventDate.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 cursor-pointer bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
            >
              <div className="">{t("buttons.cancel")}</div>
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {isSubmitting ? t("buttons.adding") : t("buttons.addEvent")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
