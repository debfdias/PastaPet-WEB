"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Printer, PawPrint } from "lucide-react";
import { ClipLoader } from "react-spinners";
import { Button } from "@/components/ui/button";
import ReportView from "@/components/reports/ReportView";
import { getPublicReport } from "@/services/reports.service";
import { printReport } from "@/lib/printReport";
import { PetReport } from "@/types/report";

export default function PublicReportPage() {
  const { token } = useParams<{ token: string }>();
  const t = useTranslations("reports");
  const [report, setReport] = useState<PetReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPublicReport(token)
      .then(setReport)
      .catch(() => setReport(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <ClipLoader size={40} color="#0E7A4A" />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="py-20 text-center text-muted">{t("notFoundPublic")}</div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-8">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <span className="flex items-center gap-2 font-display text-lg font-extrabold text-ink">
          <PawPrint className="h-5 w-5 text-deep" />
          Pasta Pet
        </span>
        <Button variant="outline" onClick={() => printReport(report.pet.name)}>
          <Printer className="h-4 w-4" />
          {t("downloadPdf")}
        </Button>
      </div>

      <ReportView report={report} footerNote={t("sharedReportFooter")} />
    </div>
  );
}
