import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { Toaster } from "@/components/ui/Toaster";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "HACKSYRA — Discover. Build. Compete.",
    template: "%s | HACKSYRA",
  },
  description:
    "Discover global hackathons, collaborate with talented builders, bring your ideas to life, and compete for opportunities that move innovation forward. An Innovation Hacks Product.",
  keywords: [
    "hackathon",
    "hackathons",
    "India hackathons",
    "developer competitions",
    "coding challenges",
    "innovation",
    "builders",
    "tech events",
    "startup competitions",
    "AI hackathons",
  ],
  authors: [{ name: "Innovation Hacks", url: "https://hacksyra.com" }],
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
    url: "https://hacksyra.com",
    title: "HACKSYRA — Discover. Build. Compete.",
    description: "A Global Platform for Hackathons & Builders. An Innovation Hacks Product.",
    siteName: "HACKSYRA",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "HACKSYRA" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HACKSYRA — Discover. Build. Compete.",
    description: "A Global Platform for Hackathons & Builders.",
    images: ["/og-image.png"],
    creator: "@hacksyra",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#090D1A" },
    { media: "(prefers-color-scheme: light)", color: "#F7F9FC" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
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
