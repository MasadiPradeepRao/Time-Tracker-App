'use server';

import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { User, Role } from "@/types";

export async function getUserProfile(): Promise<{ user: User | null, error: string | null }> {
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

        const { data: { user: sessionUser }, error: authError } = await supabaseClient.auth.getUser();

        if (authError || !sessionUser) {
            return { user: null, error: 'Not authenticated' };
        }

        const adminClient = getSupabaseAdmin();

        // 1. Fetch Profile
        const { data: profile, error: profileError } = await adminClient
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

        // 2. Handle missing profile
        if (profileError && (profileError.code === 'PGRST116' || profileError.message.includes('JSON'))) {
            // Create default profile
            const newProfile = {
                id: sessionUser.id,
                email: sessionUser.email!,
                name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'User',
                // role: undefined, // NO ROLE INSERTION
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
            };

            const { error: insertError } = await adminClient
                .from('profiles')
                .insert(newProfile);

            if (insertError) {
                console.error("Failed to create profile:", insertError);
                // Fallback to basic user without role
                return {
                    user: {
                        ...newProfile,
                        role: undefined as any as Role
                    },
                    error: "Failed to create profile, using temporary session data"
                };
            }

            return {
                user: {
                    ...newProfile,
                    role: undefined as any as Role
                },
                error: null
            };
        } else if (profileError) {
            console.error("Profile fetch error:", profileError);
            return { user: null, error: "Failed to fetch profile" };
        }

        // 3. Return complete user
        return {
            user: {
                id: profile.id,
                email: profile.email,
                name: profile.name,
                role: profile.role as Role,
                timezone: profile.timezone,
            },
            error: null
        };

    } catch (error: any) {
        console.error("getUserProfile error:", error);
        return { user: null, error: error.message };
    }
}
