"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Bell } from "lucide-react";

export default function ReminderSettings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [reminderTime, setReminderTime] = useState("09:00");
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        async function fetchSettings() {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from("reminders")
                    .select("*")
                    .eq("user_id", user.id)
                    .single();

                if (data) {
                    setReminderTime(data.reminder_time.substring(0, 5));
                    setEnabled(data.enabled);
                }
            } catch (error) {
                console.error("Error fetching reminder settings:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setSaving(true);

        const timezone = "Europe/Stockholm";

        try {
            const { error } = await supabase
                .from("reminders")
                .upsert({
                    user_id: user.id,
                    reminder_time: reminderTime,
                    timezone,
                    enabled,
                }, { onConflict: 'user_id' });

            if (error) throw error;
            toast.success("Reminder settings saved");
        } catch (error: any) {
            toast.error(error.message || "Failed to save settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin" /></div>;

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle>Daily Reminders</CardTitle>
                </div>
                <CardDescription>Get notified to check in for your shift.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="notifications">Enable Notifications</Label>
                        <p className="text-sm text-gray-500">Receive a daily push notification.</p>
                    </div>
                    <Switch
                        id="notifications"
                        checked={enabled}
                        onCheckedChange={setEnabled}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="reminder-time">Reminder Time</Label>
                    <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-full sm:w-[200px]"
                    />
                    <p className="text-xs text-gray-500 italic">Fixed timezone: Europe/Stockholm</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Reminder Settings
                </Button>
            </CardFooter>
        </Card>
    );
}
