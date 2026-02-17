import { supabase } from '@/lib/supabase';
import { User } from '@/types';

export const authService = {
    // Self-Signup (Public)
    signUp: async (email: string, password: string, name: string) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        });

        return { data, error };
    },

    // Admin Invite User (Server-side API call)
    inviteUser: async (email: string, name: string) => {
        try {
            const response = await fetch('/api/invite-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name }),
            });
            const result = await response.json();

            if (!response.ok) {
                return { error: { message: result.error || 'Failed to send invite' } };
            }

            return { data: result.data, error: null };
        } catch (error: any) {
            return { error: { message: error.message || 'Network error' } };
        }
    },

    // Sign in with email and password
    signInWithPassword: async (email: string, password: string) => {
        return await supabase.auth.signInWithPassword({
            email,
            password,
        });
    },

    // Send password reset email
    resetPasswordForEmail: async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/set-password` : undefined,
        });
    },

    // Update password (used in reset flow and set-password flow)
    updatePassword: async (newPassword: string) => {
        return await supabase.auth.updateUser({
            password: newPassword,
        });
    },

    // Ensure profile exists with INSERT ONLY if non-existent
    ensureProfile: async (userId: string, email: string, name?: string) => {
        try {
            // 1. Quick check for existence
            const { data: existing } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', userId)
                .single();

            if (existing) return true;

            // 2. Only insert if missing
            const { error } = await supabase
                .from('profiles')
                .insert({
                    id: userId,
                    email: email,
                    name: name || email.split('@')[0],
                    // role: 'employee', // REMOVED: Never set role from client
                    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                });

            return !error;
        } catch (e) {
            return false;
        }
    },

    // Get current session
    getSession: async () => {
        return await supabase.auth.getSession();
    },

    // Get current user
    getUser: async () => {
        return await supabase.auth.getUser();
    },

    signOut: async () => {
        return await supabase.auth.signOut();
    },

    // Admin: Get all users
    getAllUsers: async (): Promise<User[]> => {
        const { data } = await supabase
            .from('profiles')
            .select('*');

        return (data || []).map(profile => ({
            id: profile.id,
            email: profile.email,
            name: profile.name || profile.email.split('@')[0],
            role: profile.role,
            timezone: profile.timezone
        }));
    }
};
