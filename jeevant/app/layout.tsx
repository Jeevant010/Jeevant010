import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Jeevant | Full Stack & AI Engineer",
  description: "Personal Portfolio and Operating System of Jeevant Mudgil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-slate-50 min-h-screen")}>
        {children}
      </body>
    </html>
  );
}