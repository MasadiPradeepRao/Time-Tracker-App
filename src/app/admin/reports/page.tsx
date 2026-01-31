"use client";

import { useEffect, useState } from "react";
import { TimeEntry, AuditLog } from "@/types";
import { timeService } from "@/services/time-service";
import { auditService } from "@/services/audit-service";
import { authService } from "@/services/auth-service";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatToLocalTime, calculateDuration, formatToLocalDate } from "@/lib/date-utils";
import { EditSessionDialog } from "@/components/admin/edit-session-dialog";

export default function AdminReportsPage() {
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [userMap, setUserMap] = useState<Record<string, string>>({});

    const refreshData = async () => {
        const [allEntries, allLogs, allUsers] = await Promise.all([
            timeService.getAllEntries(),
            auditService.getLogs(),
            authService.getAllUsers()
        ]);

        // Create User Map for Display
        const map: Record<string, string> = {};
        allUsers.forEach(u => map[u.id] = u.name);
        setUserMap(map);

        setEntries(allEntries.reverse()); // Newest first
        setLogs(allLogs);
    };

    useEffect(() => {
        refreshData();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Reports & Management</h1>

            <Tabs defaultValue="timesheets">
                <TabsList>
                    <TabsTrigger value="timesheets">All Timesheets</TabsTrigger>
                    <TabsTrigger value="audit">Audit Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="timesheets" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Global Timesheets</CardTitle>
                            <CardDescription>View and manage time entries for all employees.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Employee</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Start</TableHead>
                                        <TableHead>End</TableHead>
                                        <TableHead>Duration</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entries.map(entry => (
                                        <TableRow key={entry.id}>
                                            <TableCell className="font-medium">{userMap[entry.userId] || entry.userId}</TableCell>
                                            <TableCell>{formatToLocalDate(entry.startTime)}</TableCell>
                                            <TableCell>{formatToLocalTime(entry.startTime)}</TableCell>
                                            <TableCell>{entry.endTime ? formatToLocalTime(entry.endTime) : "Active"}</TableCell>
                                            <TableCell>{calculateDuration(entry.startTime, entry.endTime)}</TableCell>
                                            <TableCell>
                                                <EditSessionDialog entry={entry} onSuccess={refreshData} />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="audit" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>System Audit Logs</CardTitle>
                            <CardDescription>Immutable record of all administrative actions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Admin</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Target Entry</TableHead>
                                        <TableHead>Changes</TableHead>
                                        <TableHead>Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map(log => (
                                        <TableRow key={log.id}>
                                            <TableCell className="font-medium">{userMap[log.adminId] || log.adminId}</TableCell>
                                            <TableCell><span className="font-mono text-xs bg-slate-100 p-1 rounded">{log.action}</span></TableCell>
                                            <TableCell className="text-xs text-gray-500">{log.targetEntryId}</TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-1">
                                                    {log.changes.map((c, i) => (
                                                        <div key={i}>
                                                            <span className="font-semibold">{c.field}:</span> {typeof c.before === 'string' ? formatToLocalTime(c.before) : c.before} → {typeof c.after === 'string' ? formatToLocalTime(c.after) : c.after}
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-gray-500 text-sm">{new Date(log.timestamp).toLocaleString()}</TableCell>
                                        </TableRow>
                                    ))}
                                    {logs.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-gray-500">No audit logs found.</TableCell></TableRow>}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
