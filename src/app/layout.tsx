import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "HACKSYRA — Discover, Build & Host Hackathons",
    template: "%s | HACKSYRA",
  },
  description:
    "Discover global hackathons, form dream teams, ship projects, and host events in minutes. An Innovation Hacks product.",
  keywords: [
    "hackathon",
    "hackathons",
    "India hackathons",
    "developer competitions",
    "host hackathon",
    "builders",
    "Innovation Hacks",
  ],
  authors: [{ name: "Innovation Hacks", url: "https://innovationhacks.in" }],
  creator: "Innovation Hacks",
  publisher: "Innovation Hacks",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large" },
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "HACKSYRA",
    title: "HACKSYRA — Discover, Build & Host Hackathons",
    description: "Discover global hackathons, build in teams, and host events in minutes.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HACKSYRA — Discover, Build & Host Hackathons",
    description: "Discover global hackathons, build in teams, and host events in minutes.",
  },
  icons: {
    icon: "/logos/favicon-32x32.png",
    shortcut: "/favicon.ico",
    apple: "/logos/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1565D8",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased bg-white text-slate-900`}>
        <ThemeProvider>
          <AuthProvider>
            <QueryProvider>
              {children}
              <Toaster />
            </QueryProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
