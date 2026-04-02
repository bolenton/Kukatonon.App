import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "Kukatonon - Liberian Civil War Victims Memorial",
    template: "%s | Kukatonon",
  },
  description:
    "A National Act of Memory, Healing, and Collective Responsibility. Honor the victims of the Liberian Civil War through shared stories.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("http")
      ? process.env.NEXT_PUBLIC_APP_URL
      : `https://${process.env.NEXT_PUBLIC_APP_URL || "kukatonon.app"}`
  ),
  openGraph: {
    type: "website",
    siteName: "Kukatonon",
    title: "Kukatonon - Liberian Civil War Victims Memorial",
    description:
      "A National Act of Memory, Healing, and Collective Responsibility.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#b8860b" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
