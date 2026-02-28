'use server';

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { AuditLog } from "@/types";

export async function getUserAuditLogsAction() {
    try {
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

        const adminClient = getSupabaseAdmin();

        // Fetch logs with join using admin client (bypasses RLS for the join)
        // But we explicitly filter by target_user_id for security
        const { data, error } = await adminClient
            .from('audit_logs')
            .select(`
                *,
                admin:profiles!admin_id(name)
            `)
            .eq('target_user_id', user.id)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedLogs: AuditLog[] = (data || []).map(log => ({
            id: log.id,
            adminId: log.admin_id,
            targetUserId: log.target_user_id,
            targetEntryId: log.target_entry_id,
            action: log.action,
            changes: log.changes,
            timestamp: log.created_at,
            adminName: log.admin?.name || 'Unknown Admin'
        }));

        return { data: mappedLogs, error: null };

    } catch (error: any) {
        console.error("User audit logs fetch error:", error);
        return { data: null, error: error.message };
    }
}
