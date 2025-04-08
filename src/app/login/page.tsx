"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useTheme } from "@/components/ThemeProvider";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically handle the login logic
    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      router.push("/dashboard");
    }
  };

  const getThemeColors = () => {
    if (theme === "dark") {
      return {
        background: "bg-gray-900",
        text: "text-gray-50",
        inputBg: "bg-gray-800",
        inputBorder: "border-gray-700",
        inputPlaceholder: "placeholder-gray-400",
        buttonBg: "bg-primary-600",
        buttonHover: "hover:bg-primary-700",
        focusRing: "focus:ring-primary-500",
        focusOffset: "focus:ring-offset-gray-900",
      };
    }
    return {
      background: "bg-gray-50",
      text: "text-gray-900",
      inputBg: "bg-white",
      inputBorder: "border-gray-300",
      inputPlaceholder: "placeholder-gray-500",
      buttonBg: "bg-primary-500",
      buttonHover: "hover:bg-primary-600",
      focusRing: "focus:ring-primary-500",
      focusOffset: "focus:ring-offset-white",
    };
  };

  const colors = getThemeColors();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${colors.background} py-12 px-4 sm:px-6 lg:px-8`}
    >
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2
            className={`mt-6 text-center text-3xl font-extrabold ${colors.text}`}
          >
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${colors.inputBorder} ${colors.inputPlaceholder} ${colors.text} rounded-t-md focus:outline-none ${colors.focusRing} focus:border-primary-500 focus:z-10 sm:text-sm ${colors.inputBg}`}
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${colors.inputBorder} ${colors.inputPlaceholder} ${colors.text} rounded-b-md focus:outline-none ${colors.focusRing} focus:border-primary-500 focus:z-10 sm:text-sm ${colors.inputBg}`}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${colors.buttonBg} ${colors.buttonHover} focus:outline-none focus:ring-2 ${colors.focusRing} ${colors.focusOffset} transition-colors duration-200`}
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
