import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PWAInstallPrompt from "@/components/public/PWAInstallPrompt";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <PWAInstallPrompt />
    </>
  );
}
