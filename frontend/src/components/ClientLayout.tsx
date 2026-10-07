"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

import { Suspense } from "react";

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHostRoute = pathname?.startsWith("/host") || pathname?.startsWith("/become-a-host");

  return (
    <>
      {!isHostRoute && (
        <Suspense fallback={<div className="h-20 bg-white border-b" />}>
          <Header />
        </Suspense>
      )}
      <main className={!isHostRoute ? "min-h-screen" : "h-screen overflow-y-auto"}>
        {children}
      </main>
      {!isHostRoute && <Footer />}
    </>
  );
}
