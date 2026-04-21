"use client";

import { useEffect, useState, use } from "react";
import { getAdminUserHistory } from "../../actions";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileDown } from "lucide-react";
import { formatToLocalTime, formatToLocalDate, calculateDuration } from "@/lib/date-utils";
import { AddShiftDialog } from "./add-shift-dialog";
import { downloadPDF } from "@/lib/export-utils";

interface Props {
    params: Promise<{ id: string }>;
}

export default function AdminUserPage({ params }: Props) {
    const { id } = use(params);
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [userEmail, setUserEmail] = useState("");
    const [userName, setUserName] = useState("");
    const [userTimezone, setUserTimezone] = useState("");
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const { data, error } = await getAdminUserHistory(id);

                if (error || !data) {
                    console.error("Failed to load user history:", error);
                    return;
                }

                const { profile, entries: rawEntries } = data;

                if (profile) {
                    setUserEmail(profile.email);
                    setUserName(profile.name || "");
                    setUserTimezone(profile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone);
                }

                const mapped: TimeEntry[] = (rawEntries || []).map((r: any) => ({
                    id: r.id,
                    userId: r.user_id,
                    startTime: r.start_time,
                    endTime: r.end_time
                }));

                setEntries(mapped);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    const handleExportPDF = () => {
        if (!entries || entries.length === 0) return;
        const timezone = userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const sortedEntries = [...entries].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

        const rows = sortedEntries.map(e => ({
            "Date": formatToLocalDate(e.startTime, timezone),
            "Check In": formatToLocalTime(e.startTime, timezone),
            "Check Out": e.endTime ? formatToLocalTime(e.endTime, timezone) : "Active",
            "Duration": calculateDuration(e.startTime, e.endTime)
        }));

        const totalMs = sortedEntries.reduce((acc, entry) => {
            if (!entry.endTime) return acc;
            return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
        }, 0);
        const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
        const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

        const safeUserName = (userName || userEmail || 'user').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        downloadPDF(
            `shift_timings_${safeUserName}.pdf`,
            `Shift Timings - ${userName || userEmail}`,
            rows,
            `${totalHours}h ${totalMinutes}m`
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <h1 className="text-2xl font-bold">User History</h1>
                </div>
                <div className="flex items-center space-x-2 gap-2">
                    {!loading && (
                        <AddShiftDialog
                            userId={id}
                            timezone={userTimezone || Intl.DateTimeFormat().resolvedOptions().timeZone}
                            onSuccess={() => {
                                // Re-fetch data
                                const loadData = async () => {
                                    setLoading(true);
                                    try {
                                        const { data, error } = await getAdminUserHistory(id);
                                        if (data) {
                                            const { entries: rawEntries } = data;
                                            const mapped: TimeEntry[] = (rawEntries || []).map((r: any) => ({
                                                id: r.id,
                                                userId: r.user_id,
                                                startTime: r.start_time,
                                                endTime: r.end_time
                                            }));
                                            setEntries(mapped);
                                        }
                                    } catch (err) {
                                        console.error(err);
                                    } finally {
                                        setLoading(false);
                                    }
                                };
                                loadData();
                            }}
                        />
                    )}
                    {entries.length > 0 && (
                        <Button variant="outline" onClick={handleExportPDF} className="flex items-center space-x-2">
                            <FileDown className="h-4 w-4" />
                            <span>Export PDF</span>
                        </Button>
                    )}
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Time Logs for <span className="text-primary">{userName || userEmail || "..."}</span></CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table className="min-w-[600px]">
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="min-w-[120px]">Date</TableHead>
                                    <TableHead className="min-w-[120px]">Check In</TableHead>
                                    <TableHead className="min-w-[120px]">Check Out</TableHead>
                                    <TableHead className="min-w-[100px]">Duration</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center h-24">Loading logs...</TableCell>
                                    </TableRow>
                                ) : entries.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                            No entries found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    entries.map(e => (
                                        <TableRow key={e.id}>
                                            <TableCell>{formatToLocalDate(e.startTime, userTimezone)}</TableCell>
                                            <TableCell>{formatToLocalTime(e.startTime, userTimezone)}</TableCell>
                                            <TableCell>{e.endTime ? formatToLocalTime(e.endTime, userTimezone) : <span className="text-green-600 font-medium">Active</span>}</TableCell>
                                            <TableCell className="font-mono text-sm">{calculateDuration(e.startTime, e.endTime)}</TableCell>
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
