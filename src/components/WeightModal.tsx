"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { CgCloseR } from "react-icons/cg";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createWeightEntry } from "@/services/weights.service";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

const fieldClass =
  "w-full p-3 border border-hair rounded-ctrl bg-panel text-ink focus:outline-none focus:border-mint";

export default function WeightModal({ isOpen, onClose, petId, onSuccess }: Props) {
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [weight, setWeight] = useState("");
  const [measuredAt, setMeasuredAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    const parsed = Number(weight);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error(t("invalidWeight"), { position: "top-right", autoClose: 3000 });
      return;
    }
    setSubmitting(true);
    try {
      await createWeightEntry(session.user.token, {
        petId,
        weight: parsed,
        measuredAt: new Date(measuredAt).toISOString(),
        note: note || undefined,
      });
      toast.success(t("weightAdded"), { position: "top-right", autoClose: 3000 });
      onSuccess();
      onClose();
      setWeight("");
      setNote("");
      setMeasuredAt(new Date().toISOString().slice(0, 10));
    } catch {
      toast.error(t("errorGeneric"), { position: "top-right", autoClose: 3000 });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4">
      <div className="w-full max-w-md rounded-card bg-surface p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl font-extrabold text-ink">
            <Scale className="h-5 w-5" />
            {t("addWeight")}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-muted hover:text-ink"
          >
            <CgCloseR className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("weight")} ({t("charts.kg")})
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className={fieldClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("measuredAt")}
            </label>
            <input
              type="date"
              value={measuredAt}
              onChange={(e) => setMeasuredAt(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("notes")}
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={submitting}>
              {t("save")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
