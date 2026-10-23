import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import PWA from "@/components/layout/PWA";
import PageTheme from "@/components/layout/PageTheme";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

export const metadata: Metadata = {
  title: {
    default: "Jeevant OS",
    template: "%s · Jeevant OS",
  },
  description: "Personal operating system: assistant, voice, messaging, automations, and portfolio.",
  manifest: "/manifest.webmanifest",
  applicationName: "Jeevant OS",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Jeevant OS",
  },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-page-theme="tactical">
      <body className={`${inter.variable} ${mono.variable} ${serif.variable} bg-shell-bg text-shell-text antialiased selection:bg-[var(--stage-signal)] selection:text-[var(--stage-ink)]`}>
        <PageTheme />
        {children}
        <PWA />
      </body>
    </html>
  );
}