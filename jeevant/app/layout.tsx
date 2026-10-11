import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });
const serif = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Jeevant Mudgil",
  description: "AI systems, game tools, and full-stack products. The public repositories are the proof.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} ${serif.variable} bg-shell-bg text-shell-text antialiased selection:bg-[var(--stage-signal)] selection:text-[var(--stage-ink)]`}>
        {children}
      </body>
    </html>
  );
}