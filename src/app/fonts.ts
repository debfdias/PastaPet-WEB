// Fonts for the Mint Design System — load via next/font, then apply the CSS
// variables on <html> (see layout.tsx). @theme maps --font-display/-sans to these.
import { Baloo_2, Nunito } from "next/font/google";

// Display font — headings, pet names, big numbers.
export const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

// Body font — everything else.
export const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-nunito",
  display: "swap",
});
