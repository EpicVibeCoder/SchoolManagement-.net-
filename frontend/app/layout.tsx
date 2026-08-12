import type { Metadata } from "next";
import { Source_Sans_3, Source_Serif_4 } from "next/font/google";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";
import QueryProvider from "@/components/QueryProvider";

const sourceSerif = Source_Serif_4({
      variable: "--font-source-serif",
      subsets: ["latin"],
      weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
      variable: "--font-source-sans",
      subsets: ["latin"],
      weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
      title: "School Management",
      description: "School Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
      return (
            <html lang="en" className={`h-full antialiased ${sourceSerif.variable} ${sourceSans.variable}`}>
                  <body className="min-h-full flex flex-col">
                        <AuthProvider>
                              <QueryProvider>{children}</QueryProvider>
                        </AuthProvider>
                  </body>
            </html>
      );
}
