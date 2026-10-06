import type { Metadata } from "next";
import { UserProvider } from "@/contexts/UserContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Airbnb Clone",
  description: "Full-Stack Airbnb Clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
