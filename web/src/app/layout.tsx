import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Kukatonon - Liberian Civil War Victims Memorial",
    template: "%s | Kukatonon",
  },
  description:
    "A National Act of Memory, Healing, and Collective Responsibility. Honor the victims of the Liberian Civil War through shared stories.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://kukatonon.app"),
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
        {children}
      </body>
    </html>
  );
}
