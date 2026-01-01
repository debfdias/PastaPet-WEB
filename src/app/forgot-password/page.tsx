"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";

export default function ForgotPasswordPage() {
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password/forgot`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      if (!response.ok) {
        throw new Error("request-failed");
      }

      setHasSubmitted(true);
      toast.success(t("success"));
    } catch (err) {
      setError(t("error"));
      setHasSubmitted(true);
      toast.error(t("error"));
    } finally {
      setIsLoading(false);
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
                  className={`appearance-none bg-background-light/50 dark:bg-background-dark relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md`}
                  placeholder={t("email.placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            {hasSubmitted && (
              <div className="text-sm text-center text-gray-600 dark:text-gray-300">
                {t("success")}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`cursor-pointer w-full flex justify-center p-3 border border-transparent text-md font-medium rounded-lg text-avocado-800 bg-avocado-500 hover:bg-avocado-600 focus:outline-none focus:ring-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed items-center gap-2`}
            >
              {isLoading ? (
                <>
                  <ClipLoader size={20} color="#1F2937" />
                  <span>{t("loading")}</span>
                </>
              ) : (
                t("submit")
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/login" className="text-sm font-medium hover:underline">
            {t("backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
