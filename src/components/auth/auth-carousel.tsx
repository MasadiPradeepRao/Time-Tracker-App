"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

const IMAGES = [
    {
        url: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop",
        caption: "Focus on what matters"
    },
    {
        url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1974&auto=format&fit=crop",
        caption: "Stay connected with your team"
    },
    {
        url: "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop",
        caption: "Collaborate effectively"
    }
];

interface AuthCarouselProps {
    className?: string;
    isMobile?: boolean;
}

export function AuthCarousel({ className, isMobile }: AuthCarouselProps) {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % IMAGES.length);
        }, 7000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className={cn(
            "relative w-full h-full overflow-hidden",
            !isMobile && "rounded-[2.5rem]",
            className
        )}>
            <AnimatePresence>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: isMobile ? 0.15 : 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className="absolute inset-0"
                >
                    <img
                        src={IMAGES[index].url}
                        alt={IMAGES[index].caption}
                        className="w-full h-full object-cover filter grayscale"
                    />
                    {!isMobile && (
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    )}
                </motion.div>
            </AnimatePresence>

            {!isMobile && (
                <div className="absolute bottom-12 left-12 right-12 z-10">
                    <motion.p
                        key={`text-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                        className="text-white text-3xl font-bold tracking-tight"
                    >
                        {IMAGES[index].caption}
                    </motion.p>
                    <div className="flex gap-2 mt-4">
                        {IMAGES.map((_, i) => (
                            <div
                                key={i}
                                className={cn(
                                    "h-1 rounded-full transition-all duration-500",
                                    i === index ? "w-8 bg-white" : "w-2 bg-white/30"
                                )}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
