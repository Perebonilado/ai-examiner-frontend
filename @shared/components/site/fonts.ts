import { Lexend, Quicksand } from "next/font/google";

/** Home page type: Lexend for everything (built for reading ease), Quicksand for the
 *  rounded "Upload any file" caption and file tags on the hero card. */
export const lexend = Lexend({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-home",
  display: "swap",
});

export const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-home-round",
  display: "swap",
});
