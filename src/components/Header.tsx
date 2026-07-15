"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { icons } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { ThemeButtons } from "./ui/ThemeButtons";

interface HeaderProps {
  hideOnHome?: boolean;
}

const NAV = [
  { href: "/dashboard", key: "home", icon: icons.home },
  { href: "/pets", key: "pets", icon: icons.pets },
  { href: "/reports", key: "reports", icon: icons.monitoring },
] as const;

export function Header({ hideOnHome = false }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("header");

  if (!session || (hideOnHome && pathname === "/")) {
    return null;
  }

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => signOut({ redirect: true, callbackUrl: "/" });

  const initial = (session.user?.name || session.user?.email || "?")
    .charAt(0)
    .toUpperCase();

  const LogoutIcon = icons.logout;
  const PersonIcon = icons.person;

  return (
    <>
      {/* ---------- Desktop: floating pill header ---------- */}
      <header className="sticky top-0 z-40 hidden bg-canvas px-4 pb-2 pt-4 md:block md:px-12">
        <div className="flex items-center gap-4 rounded-[20px] bg-surface p-3 shadow-card">
          <Logo />

          <nav className="ml-2 flex gap-1 rounded-[14px] bg-panel p-[5px]">
            {NAV.map((n) => {
              const Icon = n.icon;
              const active = isActive(n.href);
              return (
                <Link
                  key={n.href}
                  href={n.href}
                  className={cn(
                    "flex items-center gap-2 rounded-[11px] px-4 py-2 text-sm font-extrabold transition-colors",
                    active
                      ? "bg-mint text-white"
                      : "text-muted hover:bg-tint hover:text-deep"
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />
                  {t(n.key)}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-1.5">
            <ThemeButtons />
            <Link
              href="/profile"
              aria-label={t("profile")}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 border-tint2 bg-tint font-extrabold text-deep transition-colors hover:bg-tint2",
                isActive("/profile") && "ring-2 ring-mint"
              )}
            >
              {initial}
            </Link>
            <button
              onClick={handleLogout}
              aria-label={t("logout")}
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-coral-bg hover:text-coral-fg"
            >
              <LogoutIcon className="h-5 w-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </header>

      {/* ---------- Mobile: slim top bar ---------- */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-hair bg-surface px-4 py-3 md:hidden">
        <Logo />
        <div className="flex items-center gap-1">
          <ThemeButtons />
          <button
            onClick={handleLogout}
            aria-label={t("logout")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-coral-bg hover:text-coral-fg"
          >
            <LogoutIcon className="h-5 w-5" strokeWidth={2.5} />
          </button>
        </div>
      </header>

      {/* ---------- Mobile: bottom tab bar ---------- */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-hair bg-surface px-2 pb-3 pt-2 shadow-[0_-6px_20px_rgba(14,110,70,0.06)] md:hidden">
        <Tab href="/dashboard" label={t("home")} icon={icons.home} active={isActive("/dashboard")} />
        <Tab href="/pets" label={t("pets")} icon={icons.pets} active={isActive("/pets")} />
        <Tab href="/reports" label={t("reports")} icon={icons.monitoring} active={isActive("/reports")} />
        <Tab href="/profile" label={t("profile")} icon={PersonIcon} active={isActive("/profile")} />
      </nav>
    </>
  );
}

function Logo() {
  const PawIcon = icons.pets;
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5">
      <span className="flex h-[38px] w-[38px] items-center justify-center rounded-[13px] bg-mint text-white">
        <PawIcon className="h-[22px] w-[22px]" strokeWidth={2.5} />
      </span>
      <span className="font-display text-[20px] font-extrabold text-ink">
        Pasta Pet
      </span>
    </Link>
  );
}

function Tab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: (typeof icons)[string];
  active: boolean;
}) {
  return (
    <Link href={href} className="flex flex-1 flex-col items-center gap-1">
      <span
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-[14px] transition-colors",
          active ? "bg-mint text-white" : "text-faint"
        )}
      >
        <Icon className="h-6 w-6" strokeWidth={active ? 2.75 : 2} />
      </span>
      <span
        className={cn(
          "whitespace-nowrap text-[13px] font-extrabold",
          active ? "text-deep" : "text-faint"
        )}
      >
        {label}
      </span>
    </Link>
  );
}
