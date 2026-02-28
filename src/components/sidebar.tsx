"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { LayoutDashboard, Calendar, Users, FileText, LogOut, BarChart, ShieldCheck, User, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Logo } from "@/components/logo";

export function SidebarContent() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [mounted, setMounted] = useState(false);

    // Hydration fix
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const links = [
        {
            label: "Employees",
            href: "/admin",
            icon: ShieldCheck,
            roles: ['admin'],
        },
        {
            label: user?.role === 'admin' ? "Admin Dashboard" : "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
            roles: ['employee', 'admin'],
        },
        {
            label: "My Calendar",
            href: "/calendar",
            icon: Calendar,
            roles: ['employee', 'admin'],
        },
        {
            label: "Reminders",
            href: "/reminders",
            icon: Bell,
            roles: ['employee', 'admin'],
        },
        {
            label: "Monthly Summary",
            href: "/summary",
            icon: BarChart,
            roles: ['employee', 'admin'],
        },
        {
            label: "On Duty",
            href: "/admin/users",
            icon: Users,
            roles: ['admin'],
        },
        {
            label: "Reports",
            href: "/admin/reports",
            icon: FileText,
            roles: ['admin'],
        },
    ];

    return (
        <div className="h-full bg-gray-900 text-white flex flex-col p-4">
            <div className="mb-8">
                <Link href="/">
                    <Logo textSize="text-2xl" iconSize={28} className="cursor-pointer hover:opacity-80 transition-opacity" />
                </Link>
                <p className="text-xs text-gray-400">Welcome, {user?.name}</p>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    const userRole = user?.role;
                    if (!userRole || !link.roles.includes(userRole)) return null;

                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center space-x-3 px-3 py-2 rounded-md transition-colors",
                                isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                            )}
                        >
                            <link.icon size={20} />
                            <span>{link.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="pt-4 border-t border-gray-800 space-y-2">
                <Link href="/account">
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:text-white hover:bg-gray-800">
                        <User size={20} className="mr-2" />
                        My Account
                    </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800" onClick={logout}>
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <div className="hidden md:flex h-full w-64 flex-col fixed inset-y-0 z-50">
            <SidebarContent />
        </div>
    );
}
