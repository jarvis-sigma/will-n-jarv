import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "will n jarv — jarvis.party",
  description: "Premium DJ sets, modern booking, and live song requests.",
};

import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}>
        <ThemeProvider>
          <Header />
          <main className="pt-16">{children}</main>
          <Footer />
          <Toaster richColors theme="dark" position="bottom-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}
