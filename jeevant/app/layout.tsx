import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar"; 

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Jeevant // Personal OS",
  description: "Full Stack Engineer & AI Developer Portfolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${mono.variable} bg-black text-white antialiased selection:bg-blue-500/30 selection:text-blue-200`}>
        
        {/* MAIN CONTENT WRAPPER */}
        <main className="mb-32"> 
          {children}
        </main>

        {/* THE SYSTEM DOCK (Only Navigation) */}
        <Navbar />
        
      </body>
    </html>
  );
}