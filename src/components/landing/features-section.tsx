"use client";

import { motion } from "framer-motion";
import { Clock, BarChart3, Users, Edit3, ShieldCheck, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
    {
        title: "Instant Clock-In",
        description: "One-click time tracking for employees. Simple, fast, and foolproof.",
        icon: Clock,
        color: "bg-blue-500",
        lightColor: "bg-blue-50",
    },
    {
        title: "Monthly Analytics",
        description: "Comprehensive reports on working hours, overtime, and trends.",
        icon: BarChart3,
        color: "bg-purple-500",
        lightColor: "bg-purple-50",
    },
    {
        title: "Real-time Status",
        description: "See who's currently on duty at a glance. Perfect for managers.",
        icon: Users,
        color: "bg-emerald-500",
        lightColor: "bg-emerald-50",
    },
    {
        title: "Flexible Edits",
        description: "Admins can easily correct time logs with a full version history.",
        icon: Edit3,
        color: "bg-amber-500",
        lightColor: "bg-amber-50",
    },
    {
        title: "Security & Audits",
        description: "Every change is logged. Immutable audit trails for compliance.",
        icon: ShieldCheck,
        color: "bg-red-500",
        lightColor: "bg-red-50",
    },
    {
        title: "Visual Calendar",
        description: "Beautiful calendar view for personal schedule and team overview.",
        icon: Calendar,
        color: "bg-indigo-500",
        lightColor: "bg-indigo-50",
    }
];

export function FeaturesSection() {
    return (
        <section className="py-24 bg-white relative">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">Powerful tools for modern teams</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Everything you need to manage your workforce efficiently, all in one place.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="p-8 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group"
                        >
                            <div className={cn("w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", feature.lightColor)}>
                                <feature.icon className={cn("w-7 h-7", feature.color.replace('bg-', 'text-'))} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                            <p className="text-gray-600 leading-relaxed">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
