import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { Header } from "@/components/Header";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pasta Pet",
  description: "O histórico médico do seu pet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased text-gray-700 dark:text-gray-300`}
      >
        <ThemeProvider enableSystem={true} defaultTheme="system">
          <AuthProvider>
            <Header />
            <main className="px-4 md:px-12">{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
