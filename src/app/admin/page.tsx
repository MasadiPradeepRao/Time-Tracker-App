"use client";

import { useEffect, useState } from "react";
import { getAdminDashboardData } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type UserProfile = {
    id: string;
    email: string;
    name: string;
    role: string;
    created_at: string;
};

type UserSummary = UserProfile & {
    totalHours: string;
};

export default function AdminPage() {
    const [users, setUsers] = useState<UserSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const { data, error } = await getAdminDashboardData();
                if (error) {
                    console.error("Admin fetch error:", error);
                } else if (data) {
                    setUsers(data as UserSummary[]);
                }
            } catch (err) {
                console.error("Admin fetch error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Employees</h1>

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[130px]">Name</TableHead>
                                    <TableHead className="min-w-[180px]">Email</TableHead>
                                    <TableHead className="min-w-[80px]">Role</TableHead>
                                    <TableHead className="min-w-[160px]">Total Works ({format(new Date(), 'MMM yyyy')})</TableHead>
                                    <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((u) => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell className="max-w-[180px] truncate" title={u.email}>{u.email}</TableCell>
                                        <TableCell>
                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                {u.role.toUpperCase()}
                                            </span>
                                        </TableCell>
                                        <TableCell className="font-mono">{u.totalHours}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="outline" size="sm" onClick={() => router.push(`/admin/users/${u.id}`)}>
                                                View Details
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
