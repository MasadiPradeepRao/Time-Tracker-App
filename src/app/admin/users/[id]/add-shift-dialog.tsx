"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";
import { addManualTimeEntryAction } from "../../actions";
import { toast } from "sonner";
import { fromZonedTime } from "date-fns-tz";

interface AddShiftDialogProps {
    userId: string;
    timezone: string;
    onSuccess: () => void;
}

export function AddShiftDialog({ userId, timezone, onSuccess }: AddShiftDialogProps) {
    const [open, setOpen] = useState(false);
    // Initialize date with today's date in target timezone or current system date
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("17:00");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Convert local date/time to UTC ISO string using the provided timezone
            // Note: fromZonedTime handles the DST and offset correctly
            const startUtc = fromZonedTime(`${date} ${startTime}:00`, timezone).toISOString();
            const endUtc = fromZonedTime(`${date} ${endTime}:00`, timezone).toISOString();

            if (new Date(startUtc) >= new Date(endUtc)) {
                throw new Error("End time must be after start time");
            }

            const { error } = await addManualTimeEntryAction(userId, startUtc, endUtc);

            if (error) throw new Error(error);

            toast.success("Shift added successfully");
            setOpen(false);
            onSuccess();
        } catch (err: any) {
            toast.error(err.message || "Failed to add shift");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Add Missed Shift
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Manual Shift</DialogTitle>
                    <DialogDescription>
                        Manually enter shift timings for an employee if they missed their check-in.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="date" className="text-right">
                            Date
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startTime" className="text-right">
                            Start Time
                        </Label>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endTime" className="text-right">
                            End Time
                        </Label>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading ? "Saving..." : "Save Shift"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
