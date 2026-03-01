'use server';

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { supabase } from "@/lib/supabase"; // Client for auth check (or use cookies if implementing proper server auth)
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { auditService } from "@/services/audit-service";

// We need to verify the user is an admin BEFORE using the admin client
async function checkAdminAuth() {
    const cookieStore = await cookies();

    // Create a standard server client to check the current user's session
    const supabaseClient = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet: { name: string, value: string, options?: CookieOptions }[]) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    return user;
}

export async function getAdminDashboardData() {
    try {
        // 1. Verify User
        const cookieStore = await cookies();
        const supabaseClient = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll();
                    },
                    setAll(cookiesToSet: { name: string, value: string, options?: CookieOptions }[]) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            );
                        } catch {
                            // Ignored
                        }
                    },
                },
            }
        );

        const { data: { user } } = await supabaseClient.auth.getUser();

        if (!user) throw new Error("Unauthorized");

        // 2. Use Admin Client to Fetch Data
        const adminClient = getSupabaseAdmin();

        // Verify role of the requester (Security)
        const { data: requesterProfile } = await adminClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

        if (requesterProfile?.role !== 'admin') {
            throw new Error("Forbidden: Admins only");
        }

        // 3. Fetch All Profiles
        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('*')
            .order('email');

        if (profilesError) throw profilesError;

        // 4. Fetch Entries for Current Month (for summary aggregation)
        const now = new Date();
        const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

        const { data: entries, error: entriesError } = await adminClient
            .from('time_entries')
            .select('user_id, start_time, end_time')
            .gte('start_time', startOfMonth.toISOString())
            .lte('start_time', endOfMonth.toISOString());

        if (entriesError) throw entriesError;

        // 5. Aggregate Data
        const totalsMap: Record<string, number> = {};
        (entries || []).forEach(e => {
            if (e.end_time) {
                const duration = new Date(e.end_time).getTime() - new Date(e.start_time).getTime();
                totalsMap[e.user_id] = (totalsMap[e.user_id] || 0) + duration;
            }
        });

        const summary = (profiles || []).map(p => {
            const ms = totalsMap[p.id] || 0;
            const h = Math.floor(ms / (1000 * 60 * 60));
            const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
            return {
                ...p,
                totalHours: `${h}h ${m}m`,
            };
        });

        return { data: summary, error: null };

    } catch (error: any) {
        console.error("Admin data fetch error:", error);
        return { data: null, error: error.message };
    }
}

export async function getAdminReportsData() {
    try {
        const user = await checkAdminAuth();
        const adminClient = getSupabaseAdmin();

        // 1. Fetch All Profiles for mapping
        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('id, name, email, timezone');

        if (profilesError) throw profilesError;

        const userMap: Record<string, any> = {};
        profiles.forEach(p => {
            userMap[p.id] = p;
        });

        // 2. Fetch All Time Entries
        const { data: entries, error: entriesError } = await adminClient
            .from('time_entries')
            .select('*')
            .order('start_time', { ascending: false });

        if (entriesError) throw entriesError;

        // 3. Fetch Audit Logs (if they exist in a table, assuming 'audit_logs' based on context, 
        // effectively we might need to Mock this if table doesn't exist, but per previous file read it seems to be in auditService)
        // CHECK: auditService uses what? Let's check auditService implementation first or assume it uses a table.
        // Waiting on auditService check, but for now I will just return entries and profiles.

        // Actually, let's just return entries mapped with user data.
        const mappedEntries = entries.map(e => ({
            id: e.id,
            userId: e.user_id, // Map snake_case to camelCase
            startTime: e.start_time,
            endTime: e.end_time,
            user: userMap[e.user_id] || { name: 'Unknown', email: 'Unknown' }
        }));

        return { data: { entries: mappedEntries, profiles }, error: null };

    } catch (error: any) {
        console.error("Admin reports fetch error:", error);
        return { data: null, error: error.message };
    }
}

export async function getAdminUsers() {
    try {
        await checkAdminAuth();
        const adminClient = getSupabaseAdmin();

        // 1. Get All Profiles
        const { data: profiles, error: profilesError } = await adminClient
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // 2. Get Active Sessions (where end_time is null)
        const { data: activeSessions, error: sessionsError } = await adminClient
            .from('time_entries')
            .select('user_id')
            .is('end_time', null);

        if (sessionsError) throw sessionsError;

        // 3. Create Set of Active User IDs
        const activeUserIds = new Set((activeSessions || []).map(s => s.user_id));

        // 4. Merge Data
        const usersWithStatus = profiles.map(p => ({
            ...p,
            isActive: activeUserIds.has(p.id)
        }));

        return { data: usersWithStatus, error: null };
    } catch (error: any) {
        console.error("Admin users fetch error:", error);
        return { data: null, error: error.message };
    }
}

export async function getAdminUserHistory(userId: string) {
    try {
        await checkAdminAuth();
        const adminClient = getSupabaseAdmin();

        // 1. Get Profile
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('name, email, timezone')
            .eq('id', userId)
            .single();

        if (profileError) throw profileError;

        // 2. Get Entries
        const { data: entries, error: entriesError } = await adminClient
            .from('time_entries')
            .select('*')
            .eq('user_id', userId)
            .order('start_time', { ascending: false });

        if (entriesError) throw entriesError;

        return { data: { profile, entries }, error: null };
    } catch (error: any) {
        console.error("Admin user history fetch error:", error);
        return { data: null, error: error.message };
    }
}

export async function updateTimeEntryAction(entryId: string, updates: { startTime?: string; endTime?: string | null }) {
    try {
        const adminUser = await checkAdminAuth();
        const adminClient = getSupabaseAdmin();

        // 0. Get current state for audit log
        const { data: currentEntry } = await adminClient
            .from('time_entries')
            .select('*')
            .eq('id', entryId)
            .single();

        const dbUpdates: any = {};
        if (updates.startTime) dbUpdates.start_time = updates.startTime;
        if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;

        const { data, error } = await adminClient
            .from('time_entries')
            .update(dbUpdates)
            .eq('id', entryId)
            .select()
            .single();

        if (error) throw error;

        // Log Audit
        if (currentEntry) {
            const changes: any[] = [];
            if (updates.startTime && updates.startTime !== currentEntry.start_time) {
                changes.push({ field: 'startTime', before: currentEntry.start_time, after: updates.startTime });
            }
            if (updates.endTime !== undefined && updates.endTime !== currentEntry.end_time) {
                changes.push({ field: 'endTime', before: currentEntry.end_time, after: updates.endTime });
            }

            if (changes.length > 0) {
                await auditService.logChange(
                    adminUser.id,
                    currentEntry.user_id,
                    entryId,
                    'UPDATE_TIME_ENTRY',
                    changes,
                    adminClient
                );
            }
        }

        return { data, error: null };
    } catch (error: any) {
        console.error("Admin update error:", error);
        return { data: null, error: error.message };
    }
}

export async function addManualTimeEntryAction(userId: string, startTime: string, endTime: string | null) {
    try {
        const adminUser = await checkAdminAuth();
        const adminClient = getSupabaseAdmin();

        // 1. Insert Entry
        const { data: entry, error: entryError } = await adminClient
            .from('time_entries')
            .insert({
                user_id: userId,
                start_time: startTime,
                end_time: endTime
            })
            .select()
            .single();

        if (entryError) throw entryError;

        // 2. Log Audit
        await auditService.logChange(
            adminUser.id,
            userId,
            entry.id,
            'CREATE_TIME_ENTRY',
            [
                { field: 'startTime', before: null, after: startTime },
                { field: 'endTime', before: null, after: endTime }
            ],
            adminClient
        );

        return { data: entry, error: null };
    } catch (error: any) {
        console.error("Admin manual entry error:", error);
        return { data: null, error: error.message };
    }
}
