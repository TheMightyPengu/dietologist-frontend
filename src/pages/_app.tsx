import type { AppProps } from "next/app";
import { useEffect, useState } from "react";

import "@/styles/tailwind.css";
import "@/styles/globals.css";
import "@/styles/leafburst.scss";
import "@/styles/rich-text-editor.scss";
import "@/styles/rich-content.scss";

import RootLayout from "@/layout/RootLayout";
import { WebsiteThemeApi } from "@/api/WebsiteThemeController";
import { applyTheme, DEFAULT_THEME } from "@/lib/Websitetheme";

export default function MyApp({
  Component,
  pageProps,
}: AppProps) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadTheme = async () => {
      try {
        const theme = await WebsiteThemeApi.get();

        if (mounted) {
          applyTheme(theme);
        }
      } catch (error) {
        console.error("Could not load website theme:", error);

        if (mounted) {
          applyTheme(DEFAULT_THEME);
        }
      } finally {
        if (mounted) {
          setThemeLoaded(true);
        }
      }
    };

    void loadTheme();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <RootLayout>
      <Component
        {...pageProps}
        themeLoaded={themeLoaded}
      />
    </RootLayout>
  );
}