"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CgCloseR } from "react-icons/cg";
import { useTranslations } from "next-intl";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

type EventType = "normal" | "medical" | "grooming" | "training";

export default function EventModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: EventModalProps) {
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("normal");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("eventModal");

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) {
      setError(t("errors.authenticationRequired"));
      return;
    }

    setIsSubmitting(true);
    setError(null);

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
            title,
            type,
            petId,
            eventDate: new Date(date).toISOString(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(t("errors.failedToCreate"));
      }

      onSuccess();
      onClose();
      setTitle("");
      setType("normal");
      setDate(new Date().toISOString().split("T")[0]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("errors.anErrorOccurred")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-pet-card rounded-lg p-6 w-full max-w-xl"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                placeholder={t("form.eventTitlePlaceholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventType")}
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              >
                <option value="normal">{t("form.types.normal")}</option>
                <option value="medical">{t("form.types.medical")}</option>
                <option value="grooming">{t("form.types.grooming")}</option>
                <option value="training">{t("form.types.training")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {t("form.eventDate")}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

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
