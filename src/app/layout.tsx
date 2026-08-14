import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = "https://velos.onrender.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VELOS — Trade Management Platform",
    template: "%s · VELOS",
  },
  description:
    "International trade CRM with multi-tenancy, compliance, and document automation. Powered by VELOS.",
  applicationName: "VELOS",
  keywords: [
    "VELOS",
    "trade CRM",
    "trade ERP",
    "commodity trading",
    "multi-tenant",
    "trade finance",
    "document automation",
    "compliance",
  ],
  authors: [{ name: "VELOS" }],
  creator: "VELOS",
  publisher: "VELOS",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", sizes: "180x180" }],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "VELOS",
    title: "VELOS — Trade Management Platform",
    description:
      "International trade CRM with multi-tenancy, compliance, and document automation.",
  },
  twitter: {
    card: "summary",
    title: "VELOS — Trade Management Platform",
    description:
      "International trade CRM with multi-tenancy, compliance, and document automation.",
  },
};

export const viewport: Viewport = {
  themeColor: "#B45309",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Providers>
            {children}
            <Toaster richColors position="top-right" />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
