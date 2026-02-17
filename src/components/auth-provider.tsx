"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Role } from '@/types';
import { authService } from '@/services/auth-service';
import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile } from '@/app/auth/actions';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string, name: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    const loadUser = async () => {
        try {
            // Use Server Action to fetch profile (bypasses RLS)
            const { user: profileUser, error } = await getUserProfile();

            if (profileUser) {
                setUser(profileUser);
            } else {
                // If server action returns null but we have a session, maybe just set basic user?
                // But getUserProfile handles session check too.
                // Fallback to checking session if action failed completely?
                // Let's rely on the action.
                setUser(null);
            }
        } catch (error) {
            console.error("Auth load error:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            // Ignore token refresh events to prevent infinite loops if they fail silently
            if (event === 'TOKEN_REFRESHED') {
                // Optional: could re-trigger loadUser if needed, but session is usually up to date
                return;
            }

            if (session?.user) {
                await loadUser();
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);




    const login = async (email: string, password: string) => {
        setLoading(true);
        try {
            const result = await authService.signInWithPassword(email, password);
            if (result.data?.user) {
                // Removed ensureProfile call from here. loadUser via onAuthStateChange will handle it.
                // await loadUser(); // onAuthStateChange triggers this automatically
            }
            return result;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (email: string, password: string, name: string) => {
        return await authService.signUp(email, password, name);
    };

    const logout = async () => {
        await authService.signOut();
        setUser(null);
        router.push('/login');
    };

    // Do not block rendering here, let components handle loading state via useAuth()
    // if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
