import type { Metadata } from "next";
import { baloo, nunito } from "./fonts";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { AuthProvider } from "./providers/AuthProvider";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ThemeProvider } from "next-themes";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata: Metadata = {
  title: "Pasta Pet",
  description: "O histórico médico do seu pet.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const messages = await getMessages();

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${baloo.variable} ${nunito.variable}`}
    >
      <body className="antialiased text-ink flex flex-col min-h-screen">
        <Analytics />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider enableSystem={true} defaultTheme="system">
            <AuthProvider>
              <Header hideOnHome />
              <main className="px-4 md:px-12 flex-1">{children}</main>
              <Footer />
              <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
              />
            </AuthProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
