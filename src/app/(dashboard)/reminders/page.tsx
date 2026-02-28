"use client";

import ReminderSettings from "@/components/account/reminder-settings";

export default function RemindersPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold">Daily Reminders</h1>
            <ReminderSettings />
        </div>
    );
}
