"use client";

import Link from "next/link";
import { User, LogOut, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { ThemeButtons } from "./ui/ThemeButtons";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";

interface HeaderProps {
  hideOnHome?: boolean;
}

export function Header({ hideOnHome = false }: HeaderProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const t = useTranslations("header");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (!session || (hideOnHome && pathname === "/")) {
    return null;
  }

  const NavLinks = ({ isMobile = false }) => (
    <>
      <Link
        href="/dashboard"
        className={`flex items-center rounded-md transition-all duration-200 dark:hover:text-avocado-500 relative ${
          isMobile ? "text-2xl" : ""
        }`}
      >
        <span
          className={
            pathname === "/dashboard"
              ? "dark:text-avocado-500 text-text-primary font-semibold"
              : ""
          }
        >
          {t("home")}
        </span>
        {pathname === "/dashboard" && !isMobile && (
          <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-16 h-1 bg-text-primary dark:bg-avocado-500 rounded-t-md md:block hidden" />
        )}
      </Link>
      <Link
        href="/pets"
        className={`flex items-center rounded-md transition-all duration-200 dark:hover:text-avocado-500 relative ${
          isMobile ? "text-2xl" : ""
        }`}
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
        {pathname === "/pets" && !isMobile && (
          <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-18 h-1 bg-text-primary dark:bg-avocado-500 rounded-t-md md:block hidden" />
        )}
      </Link>
      <Link
        href="/reports"
        className={`flex items-center rounded-md transition-all duration-200 dark:hover:text-avocado-500 relative ${
          isMobile ? "text-2xl" : ""
        }`}
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
        {pathname === "/reports" && !isMobile && (
          <div className="absolute -bottom-[18px] left-1/2 -translate-x-1/2 w-24 h-1 bg-text-primary dark:bg-avocado-500 rounded-t-md md:block hidden" />
        )}
      </Link>
    </>
  );

  return (
    <div className="pb-16">
      <header className="fixed top-0 z-50 w-full border-b-2 border-text-primary/10 bg-header font-semibold">
        <div className="px-2 md:px-20 w-full flex h-15 items-center justify-between">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-text-primary/20 transition-colors duration-200 cursor-pointer dark:hover:text-avocado-500 md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-16 text-xl">
            <NavLinks />
          </div>

          {/* Right Side Buttons */}
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
              className="rounded-full hover:bg-text-primary/20 dark:hover:text-red-400 hover:text-red-600 transition-colors duration-200 cursor-pointer"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">{t("logout")}</span>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <>
            {/* Overlay */}
            <div
              className="md:hidden fixed inset-0 bg-black/80 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <div className="md:hidden fixed inset-y-0 left-0 w-64 max-w-sm bg-header z-50 transform transition-transform duration-300 ease-in-out">
              <nav className="h-full flex flex-col py-6 px-6">
                <div className="flex justify-end mb-8">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="rounded-full hover:bg-text-primary/20 transition-colors duration-200 cursor-pointer dark:hover:text-avocado-500"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
                <div className="space-y-8">
                  <NavLinks isMobile />
                </div>
              </nav>
            </div>
          </>
        )}
      </header>
    </div>
  );
}
