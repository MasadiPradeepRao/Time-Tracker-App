import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth-provider";
import { Toaster } from "@/components/ui/sonner";
import { ServiceWorkerRegister } from "@/components/service-worker-register";
import OneSignalInit from "@/components/onesignal-init";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hourlog",
  description: "Hourlog - Employee Time Tracking Application",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegister />
          <OneSignalInit />
        </AuthProvider>
      </body>
    </html>
  );
}
