import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Resumaizer - AI-Powered Resume Optimization",
  description: "Transform your resume with AI-powered insights. Get expert-level feedback, refined copy, and custom cover letters in minutes. Land more interviews at top companies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js" async></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js" async></script>
      </head>
      <body className={`${inter.className} bg-slate-900`}>
        {children}
      </body>
    </html>
  );
}
