"use client";

import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { MobileSidebar } from "@/components/mobile-sidebar";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login');
        }
    }, [user, authLoading, router]);

    if (authLoading || !user) {
        return null;
    }

    return (
        <div className="h-full relative bg-gray-100 min-h-screen">
            <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>
            <main className="md:pl-64 min-h-screen">
                <div className="flex items-center justify-between p-4 md:hidden border-b bg-white">
                    <div className="flex items-center gap-3">
                        <MobileSidebar />
                        <span className="font-bold text-lg">TimeTracker</span>
                    </div>
                    <span className="text-xs text-gray-500 pr-1">Welcome, {user.name}</span>
                </div>
                <div className="p-4 md:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
