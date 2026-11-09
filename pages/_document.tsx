import { Html, Head, Main, NextScript } from "next/document";
import { themeBootScript } from "@/contexts/ThemeContext";

export default function Document() {
  return (
    <Html lang="en" suppressHydrationWarning>
      <Head>
        {/* Applies the saved (or system) theme before the first paint: no light flash in dark mode. */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
