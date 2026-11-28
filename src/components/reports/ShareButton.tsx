"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { Share2, Copy, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getShareLink,
  createShareLink,
  revokeShareLink,
} from "@/services/reports.service";

export default function ShareButton({ petId }: { petId: string }) {
  const { data: session } = useSession();
  const t = useTranslations("reports");
  const [token, setToken] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session?.user?.token) return;
    getShareLink(session.user.token, petId)
      .then((r) => setToken(r.share?.token ?? null))
      .catch(() => {});
  }, [session, petId]);

  // Close the popover on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = token ? `${origin}/report/${token}` : "";

  const generate = async () => {
    if (!session?.user?.token) return;
    setLoading(true);
    try {
      const share = await createShareLink(session.user.token, petId);
      setToken(share.token);
    } catch {
      toast.error(t("errorGeneric"), { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const revoke = async () => {
    if (!session?.user?.token) return;
    setLoading(true);
    try {
      await revokeShareLink(session.user.token, petId);
      setToken(null);
      toast.success(t("linkRevoked"), { position: "top-right", autoClose: 3000 });
    } catch {
      toast.error(t("errorGeneric"), { position: "top-right", autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative" ref={containerRef}>
      <Button variant="outline" onClick={() => setOpen((o) => !o)}>
        <Share2 className="h-4 w-4" />
        {t("share")}
        {token && (
          <span
            className="ml-1 h-2 w-2 rounded-full bg-mint"
            aria-hidden="true"
          />
        )}
      </Button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-card border border-hair bg-surface p-4 shadow-card">
          <div className="mb-2 flex items-start justify-between gap-2">
            <p className="text-sm font-bold text-ink">{t("shareTitle")}</p>
            <button
              onClick={() => setOpen(false)}
              aria-label={t("cancel")}
              className="-mr-1 -mt-1 flex-shrink-0 cursor-pointer rounded-ctrl p-1 text-muted hover:bg-tint hover:text-ink"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mb-3 text-xs text-muted">{t("shareDescription")}</p>
          {token ? (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold text-leaf">
                <span className="h-2 w-2 rounded-full bg-mint" />
                {t("linkActive")}
              </div>
              <div className="flex items-center gap-2">
                <input
                  readOnly
                  value={url}
                  className="w-full truncate rounded-ctrl border border-hair bg-panel p-2 text-xs text-ink"
                />
                <button
                  onClick={copy}
                  title={t("copyLink")}
                  className="flex-shrink-0 cursor-pointer rounded-ctrl border border-hair p-2 text-deep hover:bg-tint"
                >
                  {copied ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>
              <button
                onClick={revoke}
                disabled={loading}
                className="w-full cursor-pointer rounded-ctrl border border-hair px-3 py-2 text-sm font-bold text-coral-fg transition-colors hover:bg-coral-bg disabled:opacity-50"
              >
                {t("revoke")}
              </button>
            </div>
          ) : (
            <Button onClick={generate} disabled={loading} className="w-full">
              {t("generateLink")}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
