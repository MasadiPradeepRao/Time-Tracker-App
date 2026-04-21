"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { timeService } from "@/services/time-service";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format, addMonths, subMonths, isSameMonth } from "date-fns";
import { ChevronLeft, ChevronRight, BarChart, Download } from "lucide-react";
import { calculateDuration, formatToLocalDate, formatToLocalTime } from "@/lib/date-utils";
import { downloadCSV } from "@/lib/export-utils";

export default function SummaryPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [month, setMonth] = useState<Date>(new Date());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        timeService.getMonthEntries(user.id, month)
            .then((data) => {
                // Filter out active sessions for historical summary
                setEntries(data.filter(e => e.endTime));
            })
            .finally(() => setLoading(false));
    }, [user, month]);

    const handlePrevMonth = () => setMonth(prev => subMonths(prev, 1));
    const handleNextMonth = () => setMonth(prev => addMonths(prev, 1));

    // Calculations
    const totalMs = entries.reduce((acc, entry) => {
        if (!entry.endTime) return acc;
        return acc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
    }, 0);

    const totalHours = Math.floor(totalMs / (1000 * 60 * 60));
    const totalMinutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));

    // Daily breakdown
    const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dailyMap = entries.reduce((acc, entry) => {
        // Use helper to ensure grouping happens in fixed timezone
        const { getLocalDayKey } = require("@/lib/date-utils");
        const dateKey = getLocalDayKey(entry.startTime);

        if (!acc[dateKey]) acc[dateKey] = 0;
        if (entry.endTime) {
            acc[dateKey] += (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
        }
        return acc;
    }, {} as Record<string, number>);

    const handleExportCSV = () => {
        if (!entries || entries.length === 0) return;
        const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        const rows = entries.map(e => ({
            "Date": formatToLocalDate(e.startTime, timezone),
            "Check In": formatToLocalTime(e.startTime, timezone),
            "Check Out": e.endTime ? formatToLocalTime(e.endTime, timezone) : "Active",
            "Duration": calculateDuration(e.startTime, e.endTime)
        }));

        downloadCSV(`monthly_shift_timings_${format(month, 'yyyy_MM')}.csv`, rows);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl sm:text-3xl font-bold">Monthly Summary</h1>
                <div className="flex items-center space-x-2 bg-white p-2 rounded-lg border shadow-sm self-start sm:self-auto">
                    <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold w-28 text-center text-base">
                        {format(month, 'MMMM yyyy')}
                    </span>
                    <Button variant="ghost" size="icon" onClick={handleNextMonth} disabled={isSameMonth(month, new Date())}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                {entries.length > 0 && (
                    <Button variant="outline" onClick={handleExportCSV} className="self-start sm:self-auto flex items-center space-x-2">
                        <Download className="h-4 w-4" />
                        <span>Export CSV</span>
                    </Button>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Total Card */}
                <Card className="md:col-span-2 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Hours Worked
                        </CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {totalHours}h {totalMinutes}m
                        </div>
                        <p className="text-xs text-muted-foreground">
                            For {format(month, 'MMMM yyyy')}
                        </p>
                    </CardContent>
                </Card>

                {/* Daily Breakdown */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>Daily Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {Object.keys(dailyMap).length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No completed sessions found for this month.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {Object.entries(dailyMap).sort().reverse().map(([date, ms]) => {
                                    const h = Math.floor(ms / (1000 * 60 * 60));
                                    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
                                    return (
                                        <div key={date} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border-b last:border-0 transition-colors">
                                            <div className="font-medium">
                                                {format(new Date(date), 'EEE, MMM d, yyyy')}
                                            </div>
                                            <div className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                                {h}h {m}m
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
