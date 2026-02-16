"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TimeEntry } from "@/types";
import { timeService } from "@/services/time-service";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";
import { format } from "date-fns";

interface EditSessionDialogProps {
    entry: TimeEntry;
    onSuccess: () => void;
}

export function EditSessionDialog({ entry, onSuccess }: EditSessionDialogProps) {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);

    // Helper to safely format dates for datetime-local input
    const safelyFormat = (dateStr: string | null | undefined) => {
        if (!dateStr) return "";
        try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return "";
            return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch (e) {
            console.error("Error formatting date:", dateStr, e);
            return "";
        }
    };

    const [startTime, setStartTime] = useState(safelyFormat(entry.startTime));
    const [endTime, setEndTime] = useState(safelyFormat(entry.endTime));

    const handleSave = async () => {
        if (!user || user.role !== 'admin') return;

        try {
            const updates: Partial<TimeEntry> = {};
            const newStart = new Date(startTime).toISOString();
            const newEnd = endTime ? new Date(endTime).toISOString() : null;

            if (newStart !== entry.startTime) updates.startTime = newStart;
            if (newEnd !== entry.endTime) updates.endTime = newEnd;

            if (Object.keys(updates).length > 0) {
                await timeService.updateEntry(user.id, entry.id, updates);
                toast.success("Session updated (Audit Logged)");
                onSuccess();
                setOpen(false);
            } else {
                setOpen(false);
            }
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Edit</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Session</DialogTitle>
                    <DialogDescription>
                        Make changes to this time entry. All actions are logged.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="start" className="text-right">Start</Label>
                        <Input id="start" type="datetime-local" className="col-span-3" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="end" className="text-right">End</Label>
                        <Input id="end" type="datetime-local" className="col-span-3" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                    </div>
                </div>
                <DialogFooter>
                    <Button type="submit" onClick={handleSave}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
