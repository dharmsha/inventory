import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "./context/AuthContext";  // ✅ AuthProvider import kiya

// Font setup
const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "StockPro - Smart Inventory & Installation Management System",
    template: "%s | StockPro IMS",
  },
  description: "Complete inventory tracking, installation management, supplier coordination, and real-time stock alerts.",
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
        {/* ✅ AuthProvider - Sab kuch iske andar wrap karo */}
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            {/* Navbar - Auth status access kar payega */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow pt-16 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {/* Page transitions */}
              <div className="animate-in fade-in duration-500">
                {children}
              </div>
            </main>

            {/* Footer */}
            <Footer />
          </div>

          {/* Notification System */}
          <div id="notifications-root"></div>
        </AuthProvider>
      </body>
    </html>
  );
}