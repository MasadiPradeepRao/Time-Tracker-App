"use client";

import { motion } from "framer-motion";
import { ShieldCheck, User, Users, BarChart2, FileText, Bell, LogOut, Search } from "lucide-react";

const employees = [
    { name: "John Doe", email: "john@example.com", role: "EMPLOYEE", hours: "0h 0m" },
    { name: "Jane Smith", email: "jane@example.com", role: "ADMIN", hours: "4h 23m" },
    { name: "Robert Wilson", email: "robert@example.com", role: "EMPLOYEE", hours: "2h 38m" },
    { name: "Alice Brown", email: "alice@example.com", role: "EMPLOYEE", hours: "19h 22m" },
];

export function AdminMockup() {
    return (
        <div className="w-full bg-[#f8fafc] rounded-xl overflow-hidden shadow-lg border border-gray-200 flex h-[400px]">
            {/* Sidebar Mockup */}
            <div className="w-16 md:w-48 bg-[#0f172a] text-white flex flex-col p-4 border-r border-gray-800 shrink-0">
                <div className="flex items-center gap-2 mb-8 overflow-hidden">
                    <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center shrink-0">
                        <ShieldCheck size={16} className="text-white" />
                    </div>
                    <span className="font-bold text-sm hidden md:block">Hourlog</span>
                </div>

                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3 p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                        <Users size={18} />
                        <span className="text-xs font-medium hidden md:block">Employees</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 text-gray-400 hover:text-white rounded-lg">
                        <BarChart2 size={18} />
                        <span className="text-xs font-medium hidden md:block">Admin Dashboard</span>
                    </div>
                    <div className="flex items-center gap-3 p-2 text-gray-400 hover:text-white rounded-lg">
                        <FileText size={18} />
                        <span className="text-xs font-medium hidden md:block">Reports</span>
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
                <div className="flex justify-between items-center mb-2 text-gray-900">
                    <h4 className="font-bold">Employees</h4>
                    <div className="flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer">
                            <Search size={10} />
                        </div>
                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 cursor-pointer">
                            <Bell size={10} />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex-1 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/30">
                        <h5 className="text-[10px] font-bold text-gray-900">All Employees</h5>
                    </div>

                    <table className="w-full text-left text-[9px]">
                        <thead>
                            <tr className="border-b border-gray-50 text-gray-400 font-medium">
                                <th className="p-3">Name</th>
                                <th className="p-3 hidden sm:table-cell">Email</th>
                                <th className="p-3">Role</th>
                                <th className="p-3">Total Works</th>
                                <th className="p-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {employees.map((emp, i) => (
                                <tr key={i} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-3 font-semibold text-gray-900">{emp.name}</td>
                                    <td className="p-3 text-gray-500 hidden sm:table-cell">{emp.email}</td>
                                    <td className="p-3">
                                        <span className={cn(
                                            "px-1.5 py-0.5 rounded text-[8px] font-bold",
                                            emp.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'
                                        )}>
                                            {emp.role}
                                        </span>
                                    </td>
                                    <td className="p-3 text-gray-600">{emp.hours}</td>
                                    <td className="p-3 text-right">
                                        <button className="px-2 py-1 rounded border border-gray-100 bg-white text-gray-400 hover:text-blue-600 transition-colors">
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}
