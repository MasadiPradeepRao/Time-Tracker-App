"use client";

import { Logo } from "@/components/logo";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t border-gray-100 py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
                    <div>
                        <Logo textSize="text-2xl" className="mb-4" />
                        <p className="text-gray-500 text-sm max-w-xs">
                            Empowering modern teams with transparent and efficient time tracking.
                            The future of workforce management is here.
                        </p>
                    </div>

                    <div className="flex gap-12">
                        <div>
                            <h5 className="font-bold text-gray-900 mb-4">Product</h5>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li><Link href="#features" className="hover:text-blue-600 transition-colors">Features</Link></li>
                                <li><Link href="#dashboards" className="hover:text-blue-600 transition-colors">Dashboards</Link></li>
                                <li><Link href="#calendar" className="hover:text-blue-600 transition-colors">Calendar</Link></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400 font-medium">
                    <p>© 2026 Hourlog Inc. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span>English (US)</span>
                        <span>Status: Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
