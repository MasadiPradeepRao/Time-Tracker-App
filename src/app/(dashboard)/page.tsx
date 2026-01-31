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

export default function DashboardPage() {
    const { user } = useAuth();
    const [currentSession, setCurrentSession] = useState<TimeEntry | null>(null);
    const [duration, setDuration] = useState<string>("0h 0m 0s");
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        if (!user) return;
        try {
            const session = await timeService.getCurrentSession(user.id);
            setCurrentSession(session);
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
        if (!currentSession) {
            setDuration("0h 0m 0s");
            return;
        }

        const interval = setInterval(() => {
            const start = new Date(currentSession.startTime);
            const now = new Date(); // Local machine time for display calc
            const d = intervalToDuration({ start, end: now });
            setDuration(`${d.hours || 0}h ${d.minutes || 0}m ${d.seconds || 0}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [currentSession]);

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
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="text-sm text-muted-foreground">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
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

                        <div className="text-sm text-gray-500">
                            {currentSession
                                ? `Started at ${formatToLocalTime(currentSession.startTime)}`
                                : "You are currently not working."}
                        </div>
                    </CardContent>
                </Card>

                {/* Info Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Stats</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-100 p-2 rounded-full text-blue-600"><Clock size={20} /></div>
                                <div>
                                    <div className="text-sm text-gray-500">Scheduled</div>
                                    <div className="font-semibold">9:00 AM - 5:00 PM</div>
                                </div>
                            </div>
                            {/* Placeholders for monthly stats later */}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
