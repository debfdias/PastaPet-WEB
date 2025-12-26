"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { toast } from "react-toastify";
import { updateUser } from "@/services/users.service";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const t = useTranslations("userProfile");

  const [fullName, setFullName] = useState(session?.user?.fullName || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.token || !session?.user?.id) {
      const errorMessage = t("errors.authenticationRequired");
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    if (password !== confirmPassword) {
      const errorMessage = t("errors.passwordMismatch");
      setError(errorMessage);
      toast.error(errorMessage);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await updateUser(
        session.user.token,
        session.user.id,
        {
          fullName,
          ...(password && { password }),
        }
      );

      // Update the session with new user data
      await updateSession({
        fullName,
      });

      toast.success(t("success.profileUpdated"), {
        position: "top-right",
        autoClose: 3000,
      });

      // Clear password fields after successful update
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : t("errors.anErrorOccurred");
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto p-6 bg-pet-card rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6">{t("title")}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("form.email")}
            </label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg bg-gray-100 dark:bg-gray-700 opacity-70 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("form.fullName")}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("form.newPassword")}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              placeholder={t("form.passwordPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              {t("form.confirmPassword")}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none relative block w-full p-3 dark:border-text-primary/20 border-gray-300 border rounded-lg focus:outline-none focus:border-avocado-500 focus:z-10 sm:text-md bg-gray-100 dark:bg-gray-700"
              placeholder={t("form.confirmPasswordPlaceholder")}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-avocado-500 text-avocado-800 rounded-lg hover:bg-avocado-300 disabled:opacity-50 cursor-pointer font-semibold transition-colors duration-200"
            >
              {isSubmitting
                ? t("buttons.updating")
                : t("buttons.updateProfile")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
