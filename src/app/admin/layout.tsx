"use client";

import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";

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
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    );
}
