"use client";

import { motion } from "framer-motion";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export function CalendarSection() {
    return (
        <section id="calendar" className="py-24 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="bg-gray-50 p-6 rounded-[2.5rem] border border-gray-100 shadow-2xl relative"
                        >
                            {/* Fake Calendar UI */}
                            <div className="bg-white rounded-[2rem] p-8 shadow-inner overflow-hidden">
                                <div className="flex items-center justify-between mb-8">
                                    <h4 className="text-xl font-bold text-gray-900">October 2026</h4>
                                    <div className="flex gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">←</div>
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">→</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-7 gap-3 mb-4">
                                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                                        <div key={i} className="text-center text-xs font-bold text-gray-400 py-2">{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-3">
                                    {Array.from({ length: 31 }).map((_, i) => {
                                        const day = i + 1;
                                        const isToday = day === 22;
                                        const hasShift = [12, 13, 14, 15, 19, 20, 21, 22, 23, 26, 27, 28].includes(day);

                                        return (
                                            <div key={i} className="aspect-square flex flex-col items-center justify-center relative">
                                                {isToday && <div className="absolute inset-0 bg-blue-100 border-2 border-blue-500 rounded-xl" />}
                                                <span className={cn("relative z-10 text-sm font-medium", isToday ? "text-blue-600" : "text-gray-700")}>
                                                    {day}
                                                </span>
                                                {hasShift && !isToday && (
                                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Floating detail card */}
                            <motion.div
                                initial={{ opacity: 0, x: 20, y: 20 }}
                                whileInView={{ opacity: 1, x: 0, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -bottom-8 -right-8 bg-gray-900 text-white p-6 rounded-2xl shadow-2xl max-w-[200px]"
                            >
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-blue-400" />
                                    <span className="text-xs font-semibold text-blue-400 uppercase">Today's Shift</span>
                                </div>
                                <p className="text-lg font-bold">09:00 - 17:30</p>
                                <p className="text-gray-400 text-xs">8.5 Total Hours</p>
                            </motion.div>
                        </motion.div>
                    </div>

                    <div className="flex-1">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 tracking-tight">
                            Your time, visualized. <br />
                            <span className="text-blue-600">Every day counts.</span>
                        </h2>
                        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                            Never lose track of your working days again. Our intuitive calendar view
                            gives everyone a clear overview of their monthly achievements and upcoming shifts.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                    <CalendarIcon size={20} />
                                </div>
                                <p className="font-semibold text-gray-900">Integrated Shift Calendar</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
                                    <Clock size={20} />
                                </div>
                                <p className="font-semibold text-gray-900">Direct Punch Access</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

