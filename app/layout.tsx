import type { Metadata } from "next";
import { Bebas_Neue, Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { Toaster } from "sonner";
import "./globals.css";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vixingo — Your Vision, Our Execution",
  description:
    "AI Automation, Full-Stack Development, and AI Integration. We engineer systems that transform how businesses operate.",
  openGraph: {
    title: "Vixingo — Your Vision, Our Execution",
    description:
      "AI Automation, Full-Stack Development, and AI Integration.",
    url: "https://vixingo.com",
    siteName: "Vixingo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${bebasNeue.variable} ${syne.variable} ${dmSans.variable} ${jetBrainsMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "var(--bg-elevated)",
                color: "var(--text-primary)",
                border: "1px solid var(--bg-border)",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
