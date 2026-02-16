import { supabase } from '@/lib/supabase';
import { TimeEntry } from '@/types';

function mapEntry(row: any): TimeEntry {
    return {
        id: row.id,
        userId: row.user_id,
        startTime: row.start_time,
        endTime: row.end_time,
    };
}

export const timeService = {
    checkIn: async (userId: string): Promise<TimeEntry> => {
        // 1. Check if already checked in
        const { data: active } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .is('end_time', null)
            .maybeSingle();

        if (active) {
            throw new Error("Already checked in");
        }

        // 2. Check in
        const { data, error } = await supabase
            .from('time_entries')
            .insert({
                user_id: userId,
                start_time: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        return mapEntry(data);
    },

    checkOut: async (userId: string): Promise<TimeEntry> => {
        // 1. Find active session
        const { data: active } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .is('end_time', null)
            .maybeSingle();

        if (!active) {
            throw new Error("No active session found");
        }

        // 2. Check out
        const { data, error } = await supabase
            .from('time_entries')
            .update({ end_time: new Date().toISOString() })
            .eq('id', active.id)
            .select()
            .single();

        if (error) throw error;
        return mapEntry(data);
    },

    getCurrentSession: async (userId: string): Promise<TimeEntry | null> => {
        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .is('end_time', null)
            .maybeSingle();

        return data ? mapEntry(data) : null;
    },

    getTodayEntries: async (userId: string, timezone: string): Promise<TimeEntry[]> => {
        // Use helper to get UTC range for "Local Today"
        // This ensures if it's 11pm Local, we look for entries within that Local day, 
        // regardless of what UTC day it is.
        const { getStartOfDayInUTC, getEndOfDayInUTC } = await import('@/lib/date-utils');

        const start = getStartOfDayInUTC(new Date(), timezone);
        const end = getEndOfDayInUTC(new Date(), timezone);

        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true });

        return (data || []).map(mapEntry);
    },

    getMonthEntries: async (userId: string, monthDate: Date, timezone: string): Promise<TimeEntry[]> => {
        const { getStartOfMonthInUTC, getEndOfMonthInUTC } = await import('@/lib/date-utils');

        // Ensure we pass a date instance that is correctly situated in the month we want
        // The UI passes 'new Date()' or a navigated date.
        const start = getStartOfMonthInUTC(monthDate, timezone);
        const end = getEndOfMonthInUTC(monthDate, timezone);

        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .gte('start_time', start)
            .lte('start_time', end)
            .order('start_time', { ascending: true });

        return (data || []).map(mapEntry);
    },

    // Legacy method for compatibility if needed, using generic fetch
    getUserEntries: async (userId: string): Promise<TimeEntry[]> => {
        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        return (data || []).map(mapEntry);
    },

    // Admin: Get all entries across all users
    getAllEntries: async (): Promise<TimeEntry[]> => {
        const { data } = await supabase
            .from('time_entries')
            .select('*')
            .order('start_time', { ascending: false });

        return (data || []).map(mapEntry);
    },

    // Admin: Update an entry
    updateEntry: async (adminId: string, entryId: string, updates: Partial<TimeEntry>): Promise<TimeEntry> => {
        const dbUpdates: any = {};
        if (updates.startTime) dbUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;

        const { data, error } = await supabase
            .from('time_entries')
            .update(dbUpdates)
            .eq('id', entryId)
            .select()
            .single();

        if (error) throw error;
        return mapEntry(data);
    }
};
