"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHostRoute = pathname?.startsWith("/host") || pathname?.startsWith("/become-a-host");

  return (
    <>
      {!isHostRoute && <Header />}
      <main className={!isHostRoute ? "min-h-screen" : "h-screen overflow-y-auto"}>
        {children}
      </main>
      {!isHostRoute && <Footer />}
    </>
  );
}
