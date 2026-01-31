import { User } from '@/types';

// Mock Users
const MOCK_USERS: User[] = [
    { id: 'u1', email: 'admin@test.com', role: 'admin', name: 'Admin User' },
    { id: 'u2', email: 'employee@test.com', role: 'employee', name: 'John Doe' },
    { id: 'u3', email: 'emp2@test.com', role: 'employee', name: 'Jane Smith' },
];

const SESSION_KEY = 'time_tracking_session';

export const authService = {
    // Simulate sending OTP
    signInWithOtp: async (email: string): Promise<{ data: any; error: any }> => {
        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) return { data: null, error: { message: 'User not found' } };

        console.log(`[Mock Auth] OTP sent to ${email}. Use code 123456.`);
        return { data: { message: 'Check your email for the login link!' }, error: null };
    },

    // Simulate verifying OTP
    verifyOtp: async (email: string, token: string): Promise<{ data: { session: any; user: User } | null; error: any }> => {
        if (token !== '123456') return { data: null, error: { message: 'Invalid token' } };

        const user = MOCK_USERS.find((u) => u.email === email);
        if (!user) return { data: null, error: { message: 'User not found' } };

        const session = {
            user,
            access_token: 'mock_access_token_' + Date.now(),
        };

        // Client-side persistence (if running in browser)
        if (typeof window !== 'undefined') {
            localStorage.setItem(SESSION_KEY, JSON.stringify(session));
        }

        return { data: { session, user }, error: null };
    },

    // Get current session
    getSession: async (): Promise<{ data: { session: any } | null }> => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SESSION_KEY);
            if (stored) return { data: { session: JSON.parse(stored) } };
        }
        return { data: null };
    },

    signOut: async () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(SESSION_KEY);
        }
    },

    getUserByEmail: (email: string) => MOCK_USERS.find(u => u.email === email),

    getAllUsers: async () => {
        return MOCK_USERS;
    }
};
