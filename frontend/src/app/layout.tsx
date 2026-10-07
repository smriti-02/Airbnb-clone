import type { Metadata } from "next";
import { UserProvider } from "@/contexts/UserContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import ClientLayout from "@/components/ClientLayout";
import { Toaster } from "react-hot-toast";
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
          <WishlistProvider>
            <Toaster position="bottom-right" />
            <ClientLayout>{children}</ClientLayout>
          </WishlistProvider>
        </UserProvider>
      </body>
    </html>
  );
}
