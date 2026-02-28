"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { auditService } from "@/services/audit-service";
import { AuditLog } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatToLocalTime } from "@/lib/date-utils";
import { Loader2 } from "lucide-react";

export default function AuditLogsPage() {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchLogs = async () => {
            try {
                const data = await auditService.getUserLogs(user.id);
                setLogs(data);
            } catch (err) {
                console.error("Failed to fetch audit logs:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLogs();
    }, [user]);

    if (!user) return null;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Audit Logs</h1>

            <Card>
                <CardHeader>
                    <CardTitle>History of Changes</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[150px]">Admin Name</TableHead>
                                    <TableHead className="min-w-[100px]">Action</TableHead>
                                    <TableHead className="min-w-[250px]">Changes (Before → After)</TableHead>
                                    <TableHead className="min-w-[150px]">Entry Date</TableHead>
                                    <TableHead className="min-w-[200px]">Timestamp</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32">
                                            <div className="flex items-center justify-center">
                                                <Loader2 className="mr-2 h-6 w-6 animate-spin text-primary" />
                                                <span>Loading audit logs...</span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : logs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center h-32 text-muted-foreground italic">
                                            No changes have been made to your time logs.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    logs.map((log) => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{log.adminName}</TableCell>
                                            <TableCell>
                                                <span className="px-2 py-1 rounded text-xs font-mono bg-gray-100 uppercase">
                                                    {log.action.replace(/_/g, ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1 text-xs">
                                                    {log.changes.map((c, i) => (
                                                        <div key={i} className="flex flex-col">
                                                            <span className="font-semibold text-gray-700 capitalize">{c.field}:</span>
                                                            <div className="flex items-center gap-1 overflow-hidden">
                                                                <span className="text-red-500 truncate max-w-[100px]" title={c.before || 'none'}>{c.before?.includes('T') ? formatToLocalTime(c.before) : (c.before || 'null')}</span>
                                                                <span>→</span>
                                                                <span className="text-green-600 truncate max-w-[100px]" title={c.after || 'none'}>{c.after?.includes('T') ? formatToLocalTime(c.after) : (c.after || 'null')}</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {/* Guessing the entry date from the first change if it's startTime, otherwise hard to know without saving it specifically in the log */}
                                                {log.changes.find(c => c.field === 'startTime')?.before
                                                    ? new Date(log.changes.find(c => c.field === 'startTime')!.before).toLocaleDateString()
                                                    : 'N/A'}
                                            </TableCell>
                                            <TableCell className="text-sm text-gray-500 font-mono">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
