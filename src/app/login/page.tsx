"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { login, user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Safety redirect: If already logged in, go to dashboard
    useEffect(() => {
        if (!authLoading && user) {
            if (user.role === 'admin') {
                router.replace("/admin/users");
            } else {
                router.replace("/dashboard");
            }
        }
    }, [user, authLoading, router]);

    if (authLoading) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 font-medium">Authenticating...</p>
            </div>
        );
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: authError } = await login(email, password);
        setLoading(false);

        if (authError) {
            setError(authError.message);
        } else {
            toast.success("Welcome back!");
            // router.replace("/dashboard"); // Handled by useEffect redirect
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle>Time Tracker Login</CardTitle>
                    <CardDescription>
                        Enter your email and password to sign in.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                        {error && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                                {error}
                            </div>
                        )}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Signing in..." : "Log In"}
                        </Button>
                    </form>

                    <div className="mt-4 space-y-2 text-center text-sm">
                        <Link href="/forgot-password" className="text-primary hover:underline block">
                            Forgot password?
                        </Link>
                        <div className="text-muted-foreground">
                            Don't have an account?{" "}
                            <Link href="/signup" className="text-primary hover:underline">
                                Sign up
                            </Link>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
