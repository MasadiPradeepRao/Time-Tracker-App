"use client";

import { motion } from "framer-motion";
import { Play, Calendar, Clock, BarChart2, User, LogOut, ChevronLeft, ChevronRight } from "lucide-react";

export function EmployeeMockup() {
    return (
        <div className="w-full bg-[#f8fafc] rounded-xl overflow-hidden shadow-lg border border-gray-200 flex h-[400px]">
            {/* Sidebar Mockup */}
            <div className="w-16 md:w-48 bg-[#0f172a] text-white flex flex-col p-4 border-r border-gray-800 shrink-0">
                <div className="flex items-center gap-2 mb-8 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                        <Clock size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm hidden md:block">Hourlog</span>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                        <BarChart2 size={18} />
                        <span className="text-xs font-medium hidden md:block">Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 text-gray-400 hover:text-white rounded-lg">
                        <Clock size={18} />
                        <span className="text-xs font-medium hidden md:block">Monthly Summary</span>
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <div className="flex items-center gap-3 p-2 text-gray-400">
                        <User size={18} />
                        <span className="text-xs font-medium hidden md:block">My Account</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 text-red-400">
                        <LogOut size={18} />
                        <span className="text-xs font-medium hidden md:block">Sign Out</span>
                    </div>
                </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 p-4 md:p-6 overflow-hidden flex flex-col gap-4">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="font-bold text-gray-900">Dashboard</h4>
                    <span className="text-[10px] text-gray-400">Sunday, Feb 22, 2026</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1">
                    {/* Status Card */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-6 flex flex-col items-center justify-center shadow-sm">
                        <p className="text-xs font-semibold text-gray-400 mb-8 self-start">Current Status</p>
                        <div className="text-4xl font-bold text-gray-900 tracking-[0.2em] mb-8">--:--:--</div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-10 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-green-100"
                        >
                            <Play size={18} fill="currentColor" />
                            Check In
                        </motion.button>
                        <p className="text-[10px] text-gray-400 mt-6">Worked today: 00:00</p>
                    </div>

                    {/* Mini Calendar Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hidden md:flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-[10px] font-bold text-gray-900">My Calendar</span>
                            <span className="text-[8px] bg-gray-50 text-gray-400 px-1.5 py-0.5 rounded">Month: 2h 38m</span>
                        </div>

                        <div className="flex items-center justify-between mb-2">
                            <ChevronLeft size={10} className="text-gray-300" />
                            <span className="text-[9px] font-bold">February 2026</span>
                            <ChevronRight size={10} className="text-gray-300" />
                        </div>

                        <div className="grid grid-cols-7 gap-1 text-[8px] mb-1">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                <div key={d} className="text-center text-gray-400 py-1">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1 text-[8px]">
                            {Array.from({ length: 28 }).map((_, i) => (
                                <div key={i} className={cn(
                                    "w-full aspect-square flex items-center justify-center rounded-sm",
                                    i === 21 ? "bg-black text-white" : "text-gray-600"
                                )}>
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
