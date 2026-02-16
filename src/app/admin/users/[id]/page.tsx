"use client";

import { useEffect, useState } from "react";
import { getAdminUserHistory } from "../../actions";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { formatToLocalTime, formatToLocalDate, calculateDuration } from "@/lib/date-utils";

interface Props {
    params: { id: string };
}

export default function AdminUserPage({ params }: Props) {
    const { id } = params;
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [userEmail, setUserEmail] = useState("");
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

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <h1 className="text-2xl font-bold">User History</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Time Logs for <span className="text-primary">{userEmail || "..."}</span></CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Check In</TableHead>
                                <TableHead>Check Out</TableHead>
                                <TableHead>Duration</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {entries.length === 0 ? (
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
                </CardContent>
            </Card>
        </div>
    );
}
