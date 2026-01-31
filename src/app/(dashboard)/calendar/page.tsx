"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { timeService } from "@/services/time-service";
import { TimeEntry } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { formatToLocalTime, calculateDuration } from "@/lib/date-utils";
import { isSameDay, parseISO } from "date-fns";

export default function CalendarPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [date, setDate] = useState<Date | undefined>(new Date());

    useEffect(() => {
        if (!user) return;
        timeService.getUserEntries(user.id).then(setEntries);
    }, [user]);

    // Aggregate entries by day
    const dailyWork = entries.reduce((acc, entry) => {
        const day = parseISO(entry.startTime).toDateString();
        if (!acc[day]) acc[day] = [];
        acc[day].push(entry);
        return acc;
    }, {} as Record<string, TimeEntry[]>);

    const selectedDayEntries = date && dailyWork[date.toDateString()] ? dailyWork[date.toDateString()] : [];

    // Calculate day total
    let dayTotalMs = 0;
    selectedDayEntries.forEach(e => {
        const start = new Date(e.startTime).getTime();
        const end = e.endTime ? new Date(e.endTime).getTime() : Date.now();
        dayTotalMs += (end - start);
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
                            className="rounded-md border"
                            modifiers={{
                                worked: (date) => !!dailyWork[date.toDateString()]
                            }}
                            modifiersClassNames={{
                                worked: "bg-blue-100 text-blue-900 font-bold"
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
                                            <span className="font-medium">{formatToLocalTime(entry.startTime)}</span>
                                            <span className="mx-2 text-gray-400">→</span>
                                            <span className="font-medium">{entry.endTime ? formatToLocalTime(entry.endTime) : "Active"}</span>
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
