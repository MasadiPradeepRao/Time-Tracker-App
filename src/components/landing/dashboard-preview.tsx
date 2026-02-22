"use client";

import { motion } from "framer-motion";
import { ShieldCheck, User, CheckCircle2 } from "lucide-react";
import { AdminMockup } from "./admin-mockup";
import { EmployeeMockup } from "./employee-mockup";

export function DashboardPreview() {
    return (
        <section id="dashboards" className="py-24 bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">One platform, two experiences</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        Tailored interfaces for both administrators and employees.
                        Everything you need, exactly where you expect it.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Admin Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-blue-100 relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                            <ShieldCheck size={120} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                <ShieldCheck size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Admin Essentials</h3>
                                <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">For Managers</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {[
                                "Manage employee profiles and roles",
                                "Approve or edit time sheets",
                                "View real-time 'On Duty' team status",
                                "Access detailed monthly summaries",
                                "Full immutable audit logs"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-blue-500 mt-1 shrink-0" />
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <AdminMockup />
                    </motion.div>

                    {/* Employee Dashboard Card */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-purple-100 relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12">
                            <User size={120} />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white">
                                <User size={24} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Employee Workspace</h3>
                                <p className="text-purple-600 font-semibold text-sm uppercase tracking-wider">For Your Team</p>
                            </div>
                        </div>

                        <ul className="space-y-4 mb-10 flex-1">
                            {[
                                "Simple one-tap punch in/out",
                                "Real-time shift timer",
                                "Personal daily & monthly history",
                                "Track earnings and hours",
                                "Manage personal profile & account"
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 text-purple-500 mt-1 shrink-0" />
                                    <span className="text-gray-700">{item}</span>
                                </li>
                            ))}
                        </ul>

                        <EmployeeMockup />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
