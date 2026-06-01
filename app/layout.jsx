// SECTION: Root Layout Configuration
import { Inter } from "next/font/google";
import "./globals.css";
import Toast from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  title: "EventHub Kampus - Universitas Nurul Fikri",
  description: "Sistem Informasi Event & Kepanitiaan Universitas Nurul Fikri",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable}`}>
      <body className="bg-slate-50 text-slate-800 font-sans min-h-screen antialiased" suppressHydrationWarning>
        {children}
        <Toast />
      </body>
    </html>
  );
}
