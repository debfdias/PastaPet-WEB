"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Activity, Scale, Printer } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import ReportView from "@/components/reports/ReportView";
import ShareButton from "@/components/reports/ShareButton";
import SymptomModal from "@/components/SymptomModal";
import WeightModal from "@/components/WeightModal";
import { getPetReport } from "@/services/reports.service";
import { PetReport } from "@/types/report";

export default function PetReportPage() {
  const { petId } = useParams<{ petId: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [report, setReport] = useState<PetReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [symptomOpen, setSymptomOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);

  const load = useCallback(async () => {
    if (!session?.user?.token) return;
    setLoading(true);
    try {
      const data = await getPetReport(session.user.token, petId);
      setReport(data);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [session, petId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ClipLoader size={40} color="#0E7A4A" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center text-muted">{t("notFound")}</div>
    );
  }

  const actions = (
    <>
      <ShareButton petId={petId} />
      <Button variant="outline" onClick={() => window.print()}>
        <Printer className="h-4 w-4" />
        {t("downloadPdf")}
      </Button>
    </>
  );

  return (
    <div className="mx-auto max-w-5xl py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 print:hidden">
        <button
          onClick={() => router.push("/reports")}
          className="inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("backToReports")}
        </button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setSymptomOpen(true)}>
            <Activity className="h-4 w-4" />
            {t("addSymptom")}
          </Button>
          <Button variant="outline" onClick={() => setWeightOpen(true)}>
            <Scale className="h-4 w-4" />
            {t("addWeight")}
          </Button>
        </div>
      </div>

      <ReportView report={report} actions={actions} />

      <SymptomModal
        isOpen={symptomOpen}
        onClose={() => setSymptomOpen(false)}
        petId={petId}
        onSuccess={load}
      />
      <WeightModal
        isOpen={weightOpen}
        onClose={() => setWeightOpen(false)}
        petId={petId}
        onSuccess={load}
      />
    </div>
  );
}
