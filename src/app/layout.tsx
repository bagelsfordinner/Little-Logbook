import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth/AuthContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Little Logbook - Our Baby Journey",
  description: "A private space for family and friends to share in our pregnancy and baby journey through photos, stories, and memories.",
  openGraph: {
    title: "Little Logbook - Our Baby Journey",
    description: "A private space for family and friends to share in our pregnancy and baby journey",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
