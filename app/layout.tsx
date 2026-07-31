import { Geist, Geist_Mono, Inter, Outfit } from "next/font/google";
import type { Metadata } from "next";
import "./globals.css";
import Layout from "./provider/tanstackQueryProvider";
import { LayoutScript } from "./script/layout.script";
import PushSubscriber from "./PushSubscriber";

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
      </head>
      <body className="min-h-full flex flex-col">
        <Layout>
          <PushSubscriber />
          {children}
        </Layout>
      </body>
    </html>
    
  );
}
