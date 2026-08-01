import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "./provider/tanstackQueryProvider";
import { LayoutScript } from "./script/layout.script";
import BottomNav from "@/components/dashboard/BottomNav";
import Header from "@/components/dashboard/Header";
import Footer from "@/components/dashboard/Footer";
import ServiceWorkerRegistration from "@/components/dashboard/ServiceWorkerRegistration";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "Nexus Storefront",
  description: "Premium E-Commerce Experience",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nexus",
  },
};

const outfit = Outfit({
  variable: "--font-outfitt",
  subsets: ["latin"]
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${inter.variable}  h-full antialiased ${outfit.variable}`}
    >
      <head>
        <script type="application/json-ld" dangerouslySetInnerHTML={{
          __html: JSON.stringify(LayoutScript)
        }}/>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark-theme');
              } else {
                document.documentElement.classList.remove('dark-theme');
              }
            } catch (_) {}
          `
        }} />
      </head>
      <body className="min-h-full flex flex-col relative bg-[#f8f9fc]">
        <Layout>
          <div className="w-full lg:max-w-full max-w-2xl mx-auto px-5 lg:px-10 sticky top-0 z-[100] bg-[#f8f9fc]/80 backdrop-blur-xl border-b border-transparent transition-all py-1">
            <Header />
          </div>
          {children}
          <Footer />
          <BottomNav />
          <Toaster position="top-center" richColors theme="light" />
          <ServiceWorkerRegistration />
        </Layout>
      </body>
    </html>
    
  );
}
