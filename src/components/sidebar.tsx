"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { LayoutDashboard, Calendar, Users, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();

    const links = [
        {
            label: "Dashboard",
            href: "/",
            icon: LayoutDashboard,
            roles: ['employee', 'admin'],
        },
        {
            label: "My Calendar",
            href: "/calendar",
            icon: Calendar,
            roles: ['employee'],
        },
        {
            label: "Employees",
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
        <div className="h-full w-64 bg-gray-900 text-white flex flex-col p-4">
            <div className="mb-8">
                <h1 className="text-xl font-bold">TimeTracker</h1>
                <p className="text-xs text-gray-400">Welcome, {user?.name}</p>
            </div>

            <nav className="flex-1 space-y-2">
                {links.map((link) => {
                    if (user && !link.roles.includes(user.role)) return null;

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

            <div className="pt-4 border-t border-gray-800">
                <Button variant="ghost" className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-gray-800" onClick={logout}>
                    <LogOut size={20} className="mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
}
