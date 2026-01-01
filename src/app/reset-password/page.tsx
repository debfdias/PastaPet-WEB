"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Eye, EyeOff } from "lucide-react";

function ResetPasswordForm() {
  const t = useTranslations("resetPassword");
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isMissingParams = !token || !email;

  const validate = () => {
    if (password.length < 8) {
      setError(t("errors.minLength"));
      return false;
    }
    if (password !== confirmPassword) {
      setError(t("errors.mismatch"));
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validate()) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/password/reset`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            token,
            newPassword: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("reset-failed");
      }

      setSuccess(true);
      toast.success(t("success.message"));
    } catch (err) {
      console.log(err);
      setError(t("errors.resetFailed"));
      toast.error(t("errors.resetFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isMissingParams) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div
            className={`p-8 rounded-lg shadow-md dark:bg-card bg-pet-card text-center`}
          >
            <h2 className="text-2xl font-semibold mb-4 text-red-500">
              {t("invalidLink.title")}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("invalidLink.message")}
            </p>
            <Link
              href="/login"
              className="inline-block bg-avocado-500 text-white px-6 py-3 rounded-lg hover:bg-avocado-600 transition-colors duration-200 cursor-pointer"
            >
              {t("invalidLink.backToLogin")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div
            className={`p-8 rounded-lg shadow-md dark:bg-card bg-pet-card text-center`}
          >
            <h2 className="text-2xl font-semibold mb-4 text-green-600">
              {t("success.title")}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              {t("success.message")}
            </p>
            <button
              onClick={() => router.push("/login")}
              className="bg-avocado-500 text-white px-6 py-3 rounded-lg hover:bg-avocado-600 transition-colors duration-200 cursor-pointer w-full"
            >
              {t("success.goToLogin")}
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4 break-all">
              {email}
            </p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="new-password"
                  className={`block text-sm font-medium mb-1`}
                >
                  {t("newPassword.label")}
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className={`appearance-none bg-background-light/50 dark:bg-background-dark relative block w-full p-3 pr-10 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md`}
                    placeholder={t("newPassword.placeholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className={`block text-sm font-medium mb-1`}
                >
                  {t("confirmPassword.label")}
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    minLength={8}
                    className={`appearance-none bg-background-light/50 dark:bg-background-dark relative block w-full p-3 pr-10 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md`}
                    placeholder={t("confirmPassword.placeholder")}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div
              className={`p-8 rounded-lg shadow-md dark:bg-card bg-pet-card`}
            >
              <div className="flex items-center justify-center">
                <ClipLoader size={40} color="hsl(148 91% 45%)" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
