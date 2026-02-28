"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { timeService } from "@/services/time-service";
import { TimeEntry } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatToLocalTime } from "@/lib/date-utils";
import { toast } from "sonner";
import { Clock, Play, Square } from "lucide-react";
import { intervalToDuration } from "date-fns";
import { CalendarWidget } from "@/components/dashboard/calendar-widget";

export default function DashboardPage() {
    const { user } = useAuth();
    const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);
    const [todayEntries, setTodayEntries] = useState<TimeEntry[]>([]);
    const [duration, setDuration] = useState<string>("0h 0m 0s");
    const [workedToday, setWorkedToday] = useState<string>("00:00");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            const [session, today] = await Promise.all([
                timeService.getCurrentSession(user.id),
                timeService.getTodayEntries(user.id)
            ]);
            setCurrentSession(session);
            setTodayEntries(today);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    // Timer logic
    useEffect(() => {
        const updateTimers = () => {
            const now = new Date();

            // 1. Current Session Duration
            if (currentSession) {
                const start = new Date(currentSession.startTime);
                const d = intervalToDuration({ start, end: now });
                setDuration(`${d.hours || 0}h ${d.minutes || 0}m ${d.seconds || 0}s`);
            } else {
                setDuration("0h 0m 0s");
            }

            // 2. Worked Today Duration
            let totalMs = 0;
            todayEntries.forEach(e => {
                const start = new Date(e.startTime).getTime();
                const end = e.endTime ? new Date(e.endTime).getTime() : now.getTime();
                totalMs += (end - start);
            });

            const totalSeconds = Math.max(0, Math.floor(totalMs / 1000));
            const wHours = Math.floor(totalSeconds / 3600);
            const wMinutes = Math.floor((totalSeconds % 3600) / 60);
            setWorkedToday(`${wHours.toString().padStart(2, '0')}:${wMinutes.toString().padStart(2, '0')}`);
        };

        updateTimers();

        if (currentSession) {
            const interval = setInterval(updateTimers, 1000);
            return () => clearInterval(interval);
        }
    }, [currentSession, todayEntries]);

    const handleCheckIn = async () => {
        if (!user) return;
        try {
            await timeService.checkIn(user.id);
            toast.success("Checked in successfully!");
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleCheckOut = async () => {
        if (!user) return;
        try {
            await timeService.checkOut(user.id);
            toast.success("Checked out successfully!");
            fetchData();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    if (!user) return null;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-1">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Dashboard</h1>
                    <div className="text-xs sm:text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </div>
                <p className="text-sm text-muted-foreground sm:hidden">Welcome back, <span className="font-semibold text-foreground">{user.name}</span></p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Status Card */}
                <Card className="col-span-2 shadow-sm border-2 border-primary/20 bg-gradient-to-br from-white to-gray-50">
                    <CardHeader>
                        <CardTitle>Current Status</CardTitle>
                        <CardDescription>Manage your daily attendance</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center space-y-6 py-4">
                        <div className="text-5xl font-mono font-semibold tracking-wider text-primary">
                            {currentSession ? duration : "--:--:--"}
                        </div>

                        <div className="flex items-center space-x-4">
                            {!currentSession ? (
                                <Button size="lg" className="w-48 h-16 text-lg space-x-2 bg-green-600 hover:bg-green-700" onClick={handleCheckIn}>
                                    <Play size={24} fill="currentColor" />
                                    <span>Check In</span>
                                </Button>
                            ) : (
                                <Button size="lg" variant="destructive" className="w-48 h-16 text-lg space-x-2" onClick={handleCheckOut}>
                                    <Square size={24} fill="currentColor" />
                                    <span>Check Out</span>
                                </Button>
                            )}
                        </div>

                        <div className="text-sm text-gray-500 flex flex-col items-center gap-1">
                            <div>
                                {currentSession
                                    ? `Started at ${formatToLocalTime(currentSession.startTime)}`
                                    : "You are currently not working."}
                            </div>
                            <div className="font-medium text-foreground">
                                Worked today: {workedToday}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Calendar Widget replacement for Quick Stats */}
                <CalendarWidget />
            </div>
        </div>
    );
}

