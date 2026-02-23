import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Font setup
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StockPro - Smart Inventory Management System",
    template: "%s | StockPro IMS",
  },
  description: "Advanced inventory tracking, supplier management, and real-time stock alerts.",
  // Inventory apps ko normally index nahi kiya jata (agar internal ho), 
  // par agar aap SaaS bana rahe ho toh ye SEO zaroori hai.
  robots: { index: false, follow: false }, 
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-slate-950 text-slate-200 antialiased`}>
        {/* Providers (Agar aapne ThemeRegistry/AuthProvider banaya hai toh yahan wrap karein) */}
        
        <div className="flex flex-col min-h-screen">
          {/* Navbar: Isme humne 'use client' wala logic pehle hi set kiya hai */}
          <Navbar />

          {/* Main Content Area */}
          {/* Padding top (pt-16) isliye taaki content fixed navbar ke niche na dabe */}
          <main className="flex-grow pt-16 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Wrapper for transitions and layout consistency */}
            <div className="animate-in fade-in duration-500">
              {children}
            </div>
          </main>

          {/* Footer: Standard system info */}
          <Footer />
        </div>

        {/* System Notification Hook (Optional: Toast notifications ke liye) */}
        <div id="notifications-root"></div>
      </body>
    </html>
  );
}