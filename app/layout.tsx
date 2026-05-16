import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const BASE_URL = "https://vektorasm.me";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Vyzor — Attack Surface Management",
    template: "%s | Vyzor",
  },
  description:
    "Vyzor continuously discovers every exposed asset, fingerprints vulnerabilities, and prioritises what to fix first — before attackers find it.",
  keywords: [
    "attack surface management",
    "ASM",
    "vulnerability scanning",
    "subdomain discovery",
    "cybersecurity platform",
    "CISO tools",
    "penetration testing",
    "CVE monitoring",
  ],
  authors: [{ name: "Vyzor" }],
  creator: "Vyzor",
  publisher: "Vyzor",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: BASE_URL,
    siteName: "Vyzor",
    title: "Vyzor — Attack Surface Management",
    description:
      "Continuously map and monitor your entire attack surface. Find vulnerabilities before attackers do.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Vyzor — Attack Surface Management",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vyzor — Attack Surface Management",
    description:
      "Continuously map and monitor your entire attack surface. Find vulnerabilities before attackers do.",
    images: ["/og-image.png"],
    creator: "@vyzorsec",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="h-full">
        <body className="min-h-full flex flex-col">
          {children}
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
