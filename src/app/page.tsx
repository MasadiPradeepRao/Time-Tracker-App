"use client";

import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Navbar } from "@/components/landing/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { CalendarSection } from "@/components/landing/calendar-section";
import { Footer } from "@/components/landing/footer";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-16 h-16 bg-blue-600 rounded-full blur-xl"
        />
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900"
      >
        <Navbar />
        <main>
          <HeroSection />
          <div id="features">
            <FeaturesSection />
          </div>
          <DashboardPreview />
          <CalendarSection />
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
}
