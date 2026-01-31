"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@/types';
import { authService } from '@/services/auth-service';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string) => Promise<any>;
    verifyOtp: (email: string, code: string) => Promise<any>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    verifyOtp: async () => { },
    logout: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const init = async () => {
            const { data } = await authService.getSession();
            if (data?.session) {
                setUser(data.session.user);
            }
            setLoading(false);
        };
        init();
    }, []);

    // Protected Route Logic
    useEffect(() => {
        if (loading) return;
        const isLoginPage = pathname === '/login';

        if (!user && !isLoginPage) {
            router.push('/login');
        } else if (user && isLoginPage) {
            if (user.role === 'admin') router.push('/admin/users');
            else router.push('/');
        }
    }, [user, loading, pathname, router]);


    const login = async (email: string) => {
        return authService.signInWithOtp(email);
    };

    const verifyOtp = async (email: string, code: string) => {
        const { data, error } = await authService.verifyOtp(email, code);
        if (data?.user) {
            setUser(data.user);
        }
        return { data, error };
    };

    const logout = async () => {
        await authService.signOut();
        setUser(null);
        router.push('/login');
    };

    if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

    return (
        <AuthContext.Provider value={{ user, loading, login, verifyOtp, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
