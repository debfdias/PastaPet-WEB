"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Instagram, MessageCircle, Mail } from "lucide-react";

export function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="border-t-[1px] border-text-primary/10 bg-transparent mt-auto py-8">
      <div className="container mx-auto px-4 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Social Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("social.title")}</h3>
            <div className="flex flex-col space-y-2">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-avocado-500 transition-colors"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-avocado-500 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discord</span>
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-3">{t("contact.title")}</h3>
            <a
              href="mailto:pastapetweb@gmail.com"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-avocado-500 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>pastapetweb@gmail.com</span>
            </a>
          </div>

          {/* Cantinho da Saudade */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              {t("cantinho.title")}
            </h3>
            <Link
              href="/inactive"
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-avocado-500 transition-colors"
            >
              <span>{t("cantinho.link")}</span>
            </Link>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              {t("cantinho.description")}
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-4 border-t border-text-primary/10 text-center text-xs text-gray-600 dark:text-gray-400">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
        </div>
      </div>
    </footer>
  );
}
