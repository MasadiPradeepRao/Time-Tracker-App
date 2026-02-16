import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
        await supabase.auth.exchangeCodeForSession(code);
    }

    // Always redirect to set-password after session exchange
    // Note: Since this client doesn't manage cookies automatically, 
    // the client-side Supabase instance will need to detect the session.
    return NextResponse.redirect(new URL('/auth/set-password', request.url));
}
