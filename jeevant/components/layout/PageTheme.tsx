"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isPageTheme, themeForPath } from "@/lib/theme/themes";

export default function PageTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const forced = new URLSearchParams(window.location.search).get("theme");
    const theme = isPageTheme(forced) ? forced : themeForPath(pathname || "/");
    document.documentElement.dataset.pageTheme = theme;
  }, [pathname]);

  return null;
}
