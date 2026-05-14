import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vanguard — Attack Surface Management for Enterprise",
  description:
    "Continuously map and monitor your entire attack surface. Subdomain discovery, port scanning, and vulnerability detection — all in one platform.",
  keywords: "attack surface management, ASM, vulnerability scanning, cybersecurity, CISO",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
