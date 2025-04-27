"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const t = useTranslations("login");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      if (result.status === 401) {
        setError(t("errors.invalidCredentials"));
      } else {
        setError(t("errors.somethingWentWrong"));
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8">
        <div className={`p-8 rounded-lg shadow-md dark:bg-card bg-pet-card`}>
          <div>
            <h2 className={`text-center text-3xl font-extrabold mb-8`}>
              {t("title")}
            </h2>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="email-address"
                  className={`block text-sm font-medium mb-1`}
                >
                  {t("email.label")}
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md`}
                  placeholder={t("email.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className={`block text-sm font-medium mb-1`}
                >
                  {t("password.label")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none  focus:border-avocado-500 focus:z-10 sm:text-md`}
                  placeholder={t("password.placeholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div className="flex items-center justify-end">
              <Link
                href="/reset-password"
                className={`text-sm hover:dark:text-avocado-500`}
              >
                {t("forgotPassword")}
              </Link>
            </div>

            <button
              type="submit"
              className={`cursor-pointer w-full flex justify-center p-3 border border-transparent text-md font-medium rounded-lg text-gray-800 bg-avocado-500 hover:bg-green-300 focus:outline-none focus:ring-2 transition-colors duration-200`}
            >
              {t("signIn")}
            </button>
          </form>
        </div>

        <div className="text-center">
          <span className={`text-sm`}>{t("noAccount")} </span>
          <Link
            href="/signup"
            className={`text-sm font-medium hover:underline`}
          >
            {t("signUp")}
          </Link>
        </div>
      </div>
    </div>
  );
}
