"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { timeService } from "@/services/time-service";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { formatToLocalTime, calculateDuration, getLocalDayKey } from "@/lib/date-utils";
import { format } from "date-fns";

export function CalendarWidget() {
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

    // Calculate monthly total
    const monthlyTotalMs = entries.reduce((acc, e) => {
        if (!e.endTime) return acc;
        return acc + (new Date(e.endTime).getTime() - new Date(e.startTime).getTime());
    }, 0);
    const mHours = Math.floor(monthlyTotalMs / (1000 * 60 * 60));
    const mMinutes = Math.floor((monthlyTotalMs % (1000 * 60 * 60)) / (1000 * 60));

    // Calculate day total (Closed sessions only) for the selected date
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

    // Update selected date when month changes to avoid confusion
    useEffect(() => {
        setDate(month);
    }, [month]);

    // If no user, don't render anything (or spinner)
    if (!user) return null;

    return (
        <Card className="flex flex-col h-full">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle>My Calendar</CardTitle>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                        Month: {mHours}h {mMinutes}m
                    </span>
                </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto space-y-4">
                <div className="flex justify-center">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        month={month}
                        onMonthChange={setMonth}
                        className="rounded-md border shadow-sm"
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
                </div>

                <div className="space-y-3">
                    <div className="text-sm font-semibold text-primary border-b pb-1 flex justify-between">
                        <span>{date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : "Select a date"}</span>
                        <span>{hours}h {minutes}m</span>
                    </div>

                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                        {selectedDayEntries.length === 0 ? (
                            <p className="text-xs text-gray-500 italic text-center py-2">No logs.</p>
                        ) : (
                            selectedDayEntries.map(entry => (
                                <div key={entry.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border text-xs">
                                    <div className="flex flex-col">
                                        <span className="font-medium">{formatToLocalTime(entry.startTime, timezone)}</span>
                                        <span className="text-gray-400 text-[10px]">to</span>
                                        <span className="font-medium">{entry.endTime ? formatToLocalTime(entry.endTime, timezone) : "Active"}</span>
                                    </div>
                                    <div className="font-mono text-gray-600">
                                        {calculateDuration(entry.startTime, entry.endTime)}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
