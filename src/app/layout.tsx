import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MetaWurks — All-in-One AI Hub for Business",
  description: "AI-powered workflow orchestration. GPT-5, Claude, Gemini, DeepSeek, Grok and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased h-full`}>
      <body className="h-full bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
