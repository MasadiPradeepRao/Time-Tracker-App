import { TimeEntry } from '@/types';
import { auditService } from './audit-service';

// Mock DB
let MOCK_ENTRIES: TimeEntry[] = [];

const ENTRIES_KEY = 'time_entries';

export const timeService = {
    // Sync helper
    _sync: () => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(ENTRIES_KEY);
            if (stored) MOCK_ENTRIES = JSON.parse(stored);
        }
    },
    _save: () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(ENTRIES_KEY, JSON.stringify(MOCK_ENTRIES));
        }
    },

    // EMPLOYEE ACTIONS

    checkIn: async (userId: string): Promise<TimeEntry> => {
        timeService._sync();
        // Validate: No open session
        const active = MOCK_ENTRIES.find(e => e.userId === userId && e.endTime === null);
        if (active) throw new Error("You are already checked in.");

        const newEntry: TimeEntry = {
            id: 'entry_' + Date.now(),
            userId,
            startTime: new Date().toISOString(), // UTC
            endTime: null
        };

        MOCK_ENTRIES.push(newEntry);
        timeService._save();
        return newEntry;
    },

    checkOut: async (userId: string): Promise<TimeEntry> => {
        timeService._sync();
        const activeIndex = MOCK_ENTRIES.findIndex(e => e.userId === userId && e.endTime === null);
        if (activeIndex === -1) throw new Error("No active session found.");

        const entry = MOCK_ENTRIES[activeIndex];
        entry.endTime = new Date().toISOString(); // UTC

        MOCK_ENTRIES[activeIndex] = entry;
        timeService._save();
        return entry;
    },

    getCurrentSession: async (userId: string): Promise<TimeEntry | null> => {
        timeService._sync();
        return MOCK_ENTRIES.find(e => e.userId === userId && e.endTime === null) || null;
    },

    getUserEntries: async (userId: string): Promise<TimeEntry[]> => {
        timeService._sync();
        return MOCK_ENTRIES.filter(e => e.userId === userId).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    },

    // ADMIN ACTIONS

    getAllEntries: async (): Promise<TimeEntry[]> => {
        timeService._sync();
        return MOCK_ENTRIES;
    },

    // Admin update with Audit and Immutability check (User cant do this, only admin)
    updateEntry: async (adminId: string, entryId: string, updates: Partial<TimeEntry>) => {
        timeService._sync();
        const index = MOCK_ENTRIES.findIndex(e => e.id === entryId);
        if (index === -1) throw new Error("Entry not found");

        const oldEntry = { ...MOCK_ENTRIES[index] };
        const newEntry = { ...oldEntry, ...updates };

        // Detect changes for audit
        const changes = [];
        if (updates.startTime && updates.startTime !== oldEntry.startTime) {
            changes.push({ field: 'startTime', before: oldEntry.startTime, after: updates.startTime });
        }
        if (updates.endTime && updates.endTime !== oldEntry.endTime) {
            changes.push({ field: 'endTime', before: oldEntry.endTime, after: updates.endTime });
        }

        if (changes.length > 0) {
            await auditService.logChange(adminId, entryId, 'UPDATE', changes);
            MOCK_ENTRIES[index] = newEntry;
            timeService._save();
        }

        return newEntry;
    }
};
