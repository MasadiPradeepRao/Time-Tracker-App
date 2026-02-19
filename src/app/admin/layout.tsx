"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authLoading) {
            if (!user) {
                router.replace('/login');
            } else if (user.role !== 'admin') {
                router.replace('/dashboard');
            }
        }
    }, [user, authLoading, router]);

    if (authLoading || !user || user.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <Sidebar />
            {/* Mobile header */}
            <div className="flex items-center justify-between p-4 md:hidden border-b bg-white">
                <div className="flex items-center gap-3">
                    <MobileSidebar />
                    <span className="font-bold text-lg">TimeTracker</span>
                </div>
                <span className="text-xs text-gray-500 pr-1">Welcome, {user.name}</span>
            </div>
            <main className="md:ml-64 min-h-screen">
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
