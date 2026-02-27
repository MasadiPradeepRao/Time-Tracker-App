"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EmployeeMockup } from "./employee-mockup";
import { InstallApp } from "@/components/install-app";

export function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
            {/* Background blobs for premium feel */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-100 rounded-full blur-[100px] opacity-50"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -90, 0],
                    }}
                    transition={{
                        duration: 25,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-100 rounded-full blur-[100px] opacity-40"
                />
            </div>

            <div className="container mx-auto px-4 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Master Your Time, <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                            Empower Your Team.
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
                        The all-in-one workforce management solution for companies of all sizes.
                        Perfect for small businesses, restaurants, institutes, and growing teams looking to
                        streamline tracking and boost productivity with Hourlog.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/signup">
                            <Button size="lg" className="h-14 px-8 text-lg bg-gray-900 hover:bg-gray-800 shadow-xl shadow-gray-200 group">
                                Start for Free
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                        <Link href="/login">
                            <Button variant="outline" size="lg" className="h-14 px-8 text-lg border-2">
                                Live Demo
                            </Button>
                        </Link>
                    </div>
                    <div className="mt-8 sm:hidden flex justify-center">
                        <InstallApp />
                    </div>
                </motion.div>

                {/* Floating elements/Mockup would go here */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mt-16 md:mt-24 relative max-w-5xl mx-auto"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden p-2">
                        <EmployeeMockup />
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
