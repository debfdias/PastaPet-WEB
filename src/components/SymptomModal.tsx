"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { CgCloseR } from "react-icons/cg";
import { Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createSymptom } from "@/services/symptoms.service";
import { SYMPTOM_TYPES, SymptomType, Severity } from "@/types/report";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  petId: string;
  onSuccess: () => void;
}

const SEVERITIES: Severity[] = ["LOW", "MEDIUM", "HIGH"];
const fieldClass =
  "w-full p-3 border border-hair rounded-ctrl bg-panel text-ink focus:outline-none focus:border-mint";

export default function SymptomModal({
  isOpen,
  onClose,
  petId,
  onSuccess,
}: Props) {
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [type, setType] = useState<SymptomType>("VOMITING");
  const [severity, setSeverity] = useState<Severity>("MEDIUM");
  const [observedAt, setObservedAt] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token) return;
    setSubmitting(true);
    try {
      await createSymptom(session.user.token, {
        petId,
        type,
        severity,
        notes: notes || undefined,
        observedAt: new Date(observedAt).toISOString(),
      });
      toast.success(t("symptomAdded"), { position: "top-right", autoClose: 3000 });
      onSuccess();
      onClose();
      setType("VOMITING");
      setSeverity("MEDIUM");
      setNotes("");
      setObservedAt(new Date().toISOString().slice(0, 10));
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
            <Activity className="h-5 w-5" />
            {t("addSymptom")}
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
              {t("symptomType")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as SymptomType)}
              className={fieldClass}
            >
              {SYMPTOM_TYPES.map((s) => (
                <option key={s} value={s}>
                  {t(`symptomTypes.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("severityLabel")}
            </label>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              className={fieldClass}
            >
              {SEVERITIES.map((s) => (
                <option key={s} value={s}>
                  {t(`severity.${s}`)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("observedAt")}
            </label>
            <input
              type="date"
              value={observedAt}
              onChange={(e) => setObservedAt(e.target.value)}
              className={fieldClass}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-bold text-ink">
              {t("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
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
