'use server';

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
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

    const { data: { user }, error } = await supabaseClient.auth.getUser();

    if (error || !user) {
        throw new Error('Unauthorized');
    }

    return user;
}

export async function updateProfileName(newName: string) {
    try {
        const user = await getAuthenticatedUser();
        const adminClient = getSupabaseAdmin();

        const { error } = await adminClient
            .from('profiles')
            .update({ name: newName })
            .eq('id', user.id);

        if (error) throw error;

        revalidatePath('/');
        return { success: true };
    } catch (error: any) {
        console.error("Update profile error:", error);
        return { success: false, error: error.message };
    }
}

export async function deleteAccount() {
    try {
        const user = await getAuthenticatedUser();
        const adminClient = getSupabaseAdmin();

        // 1. Delete user from auth (this should cascade to profiles and time_entries if FKs are set to CASCADE)
        // If not, we'd need to manually delete them. 
        // Based on common Supabase setups with RLS and FKs, we'll try the delete.
        const { error } = await adminClient.auth.admin.deleteUser(user.id);

        if (error) throw error;

        return { success: true };
    } catch (error: any) {
        console.error("Delete account error:", error);
        return { success: false, error: error.message };
    }
}
