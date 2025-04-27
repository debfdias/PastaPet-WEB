"use client";

import Link from "next/link";
import { User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { ThemeButtons } from "./ui/ThemeButtons";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("header");

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="pb-16">
      <header className="fixed top-0 z-50 w-full border-b-2 border-text-primary/10 bg-header font-semibold">
        <div className="px-20 w-full flex h-15 items-center justify-between">
          <div className="flex items-center space-x-16 text-xl">
            <Link
              href="/pets"
              className={`flex items-center rounded-md transition-all duration-200 dark:hover:text-avocado-500 relative`}
            >
              <span
                className={
                  pathname === "/pets"
                    ? "dark:text-avocado-500 text-text-primary font-semibold"
                    : ""
                }
              >
                {t("pets")}
              </span>
              {pathname === "/pets" && (
                <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-18 h-1 bg-text-primary dark:bg-avocado-500 rounded-t-md" />
              )}
            </Link>
            <Link
              href="/reports"
              className={`flex items-center rounded-md transition-all duration-200 dark:hover:text-avocado-500 relative`}
            >
              <span
                className={
                  pathname === "/reports"
                    ? "dark:text-avocado-500 text-text-primary"
                    : ""
                }
              >
                {t("reports")}
              </span>
              {pathname === "/reports" && (
                <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-24 h-1 bg-text-primary dark:bg-avocado-500 rounded-t-md" />
              )}
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeButtons />
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-text-primary/20 transition-colors duration-200 cursor-pointer dark:hover:text-avocado-500"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">{t("profile")}</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-text-primary/20  dark:hover:text-red-400 hover:text-red-600 transition-colors duration-200 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t("logout")}</span>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
