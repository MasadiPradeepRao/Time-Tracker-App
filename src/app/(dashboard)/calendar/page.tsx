"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { timeService } from "@/services/time-service";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { formatToLocalTime, calculateDuration, getLocalDayKey } from "@/lib/date-utils";
import { format } from "date-fns";

export default function CalendarPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [month, setMonth] = useState<Date>(new Date());

    useEffect(() => {
        if (!user) return;
        const timezone = user.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
        timeService.getMonthEntries(user.id, month, timezone).then(setEntries);
    }, [user, month]);

    // Aggregate entries by day
    const timezone = user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
    const dailyWork = entries.reduce((acc, entry) => {
        const dayKey = getLocalDayKey(entry.startTime, timezone);
        if (!acc[dayKey]) acc[dayKey] = [];
        acc[dayKey].push(entry);
        return acc;
    }, {} as Record<string, TimeEntry[]>);


    const selectedDateKey = date ? format(date, 'yyyy-MM-dd') : null;
    const selectedDayEntries = selectedDateKey ? (dailyWork[selectedDateKey] || []) : [];

    // Calculate day total (Closed sessions only)
    let dayTotalMs = 0;
    selectedDayEntries.forEach(e => {
        if (e.endTime) {
            const start = new Date(e.startTime).getTime();
            const end = new Date(e.endTime).getTime();
            dayTotalMs += (end - start);
        }
    });
    const hours = Math.floor(dayTotalMs / (1000 * 60 * 60));
    const minutes = Math.floor((dayTotalMs % (1000 * 60 * 60)) / (1000 * 60));

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">My Calendar</h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="w-fit">
                    <CardContent className="p-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={month}
                            onMonthChange={setMonth}
                            className="rounded-md border"
                            modifiers={{
                                hasWork: (day) => {
                                    const key = format(day, 'yyyy-MM-dd');
                                    return !!dailyWork[key];
                                }
                            }}
                            modifiersClassNames={{
                                hasWork: "relative after:content-[''] after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full"
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>{date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="text-lg font-semibold text-primary">
                            Total Hours: {hours}h {minutes}m
                        </div>

                        <div className="space-y-2">
                            {selectedDayEntries.length === 0 ? (
                                <p className="text-gray-500 italic">No time logs for this day.</p>
                            ) : (
                                selectedDayEntries.map(entry => (
                                    <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                                        <div>
                                            <span className="font-medium">{formatToLocalTime(entry.startTime, timezone)}</span>
                                            <span className="mx-2 text-gray-400">→</span>
                                            <span className="font-medium">{entry.endTime ? formatToLocalTime(entry.endTime, timezone) : "Active"}</span>
                                        </div>
                                        <div className="text-sm font-mono text-gray-600">
                                            {calculateDuration(entry.startTime, entry.endTime)}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
