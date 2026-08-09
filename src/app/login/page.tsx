"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { icons } from "@/lib/icons";
import { Button } from "@/components/ui/button";

const inputBase =
  "w-full rounded-ctrl border border-hair bg-panel py-3 pl-11 pr-4 text-ink placeholder:text-faint transition-colors focus:border-mint focus:outline-none focus:ring-4 focus:ring-mint/15";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const router = useRouter();
  const t = useTranslations("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setIsLoading(false);
      if (result.status === 401) {
        setError(t("errors.invalidCredentials"));
      } else {
        setError(t("errors.somethingWentWrong"));
      }
    } else {
      router.push("/dashboard");
    }
  };

  const PawIcon = icons.pets;

  const features = [
    { icon: icons.vaccines, label: t("brand.feature1") },
    { icon: icons.notifications, label: t("brand.feature2") },
    { icon: icons.favorite, label: t("brand.feature3") },
  ];

  return (
    <div className="fixed inset-0 z-50 grid grid-cols-1 overflow-y-auto bg-surface lg:grid-cols-2 lg:grid-rows-1">
      {/* ---------- Brand panel ---------- */}
      <div className="relative flex flex-col overflow-hidden bg-deep px-8 py-12 text-white lg:p-14">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/[0.06]" />

        <div className="relative flex flex-1 flex-col">
          {/* logo — centered on mobile, left-aligned on desktop */}
          <div className="flex flex-col items-center gap-3 lg:flex-row">
            <span className="flex h-14 w-14 items-center justify-center rounded-tile bg-mint text-white">
              <PawIcon className="h-8 w-8" strokeWidth={2.5} />
            </span>
            <span className="font-display text-2xl font-extrabold">
              Pasta Pet
            </span>
          </div>

          {/* mobile tagline */}
          <p className="mt-3 text-center text-white/80 lg:hidden">
            {t("brand.tagline")}
          </p>

          {/* desktop headline + features — centered vertically */}
          <div className="hidden flex-1 flex-col justify-center pt-14 lg:flex">
            <h1 className="font-display text-4xl font-extrabold leading-tight xl:text-5xl">
              {t("brand.headline")}
            </h1>
            <p className="mt-4 max-w-sm text-white/80">{t("brand.subtext")}</p>
            <ul className="mt-8 space-y-4">
              {features.map(({ icon: Icon, label }) => (
                <li key={label} className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-mint">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <span className="font-bold">{label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ---------- Form panel ---------- */}
      <div className="flex flex-col justify-center p-8 lg:p-14">
        <div className="mx-auto w-full max-w-md">
          <h2 className="text-center font-display text-3xl font-extrabold text-ink lg:text-left lg:text-4xl">
            {t("title")}
          </h2>
          <p className="mt-1 text-center text-muted lg:text-left">
            {t("subtitle")}
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            {/* email */}
            <div>
              <label
                htmlFor="email-address"
                className="mb-1.5 block text-sm font-bold text-ink"
              >
                {t("email.label")}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={inputBase}
                  placeholder={t("email.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* password */}
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-bold text-ink"
              >
                {t("password.label")}
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`${inputBase} pr-12`}
                  placeholder={t("password.placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  onMouseDown={(e) => e.preventDefault()}
                  aria-label={
                    showPassword ? t("password.hide") : t("password.show")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted transition-colors hover:text-ink focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-coral-fg">{error}</p>}

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-5 w-5 cursor-pointer rounded-md accent-mint"
                />
                {t("rememberMe")}
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-bold text-deep hover:underline"
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="h-12 w-full text-base"
            >
              {isLoading ? (
                <>
                  <ClipLoader size={20} color="#ffffff" />
                  <span>{t("loading")}</span>
                </>
              ) : (
                t("signIn")
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
