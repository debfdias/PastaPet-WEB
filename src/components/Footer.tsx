"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Instagram, MessageCircle, Mail, PawPrint } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  const linkCls =
    "flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-mint";

  return (
    <footer className="mt-auto bg-ink pt-10 pb-24 text-white md:pb-10">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Social Links */}
          <div>
            <h3 className="mb-3 font-display text-base font-extrabold text-white">
              {t("social.title")}
            </h3>
            <div className="flex flex-col space-y-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                <Instagram className="h-4 w-4" />
                <span>Instagram</span>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className={linkCls}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Discord</span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-3 font-display text-base font-extrabold text-white">
              {t("contact.title")}
            </h3>
            <a href="mailto:pastapetweb@gmail.com" className={linkCls}>
              <Mail className="h-4 w-4" />
              <span>pastapetweb@gmail.com</span>
            </a>
          </div>

          {/* Cantinho da Saudade */}
          <div>
            <h3 className="mb-3 font-display text-base font-extrabold text-white">
              {t("cantinho.title")}
            </h3>
            <Link href="/inactive" className="flex items-center gap-2 text-sm font-bold text-mint transition-opacity hover:opacity-80">
              <PawPrint className="h-4 w-4" />
              <span>{t("cantinho.link")}</span>
            </Link>
            <p className="mt-2 text-xs text-white/50">
              {t("cantinho.description")}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t border-white/10 pt-4 text-center text-xs text-white/50">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
