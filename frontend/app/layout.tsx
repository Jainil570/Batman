import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";

const fiorello = localFont({
  src: "../public/fonts/Fiorello.otf",
  variable: "--font-fiorello",
});

const azonix = localFont({
  src: "../public/fonts/Azonix.otf",
  variable: "--font-azonix",
});

const tommy = localFont({
  src: "../public/fonts/Tommy.ttf",
  variable: "--font-tommy",
});

export const metadata: Metadata = {
  title: "Batman AI - Premium Exam Prep Assistant",
  description:
    "AI-powered exam preparation with RAG technology. Upload PDFs, ask questions, ace your exams.",
  keywords: ["AI", "exam prep", "study assistant", "RAG", "PDF chat"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${fiorello.variable} ${azonix.variable} ${tommy.variable} font-tommy antialiased bg-black text-white`}>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
