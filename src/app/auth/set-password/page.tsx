"use client";

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth-service";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function SetPasswordPage() {
    const router = useRouter();
    const { logout } = useAuth();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [verifying, setVerifying] = useState(true);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const handleSession = async () => {
            try {
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);
                const searchParams = new URLSearchParams(window.location.search);

                const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
                const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
                const errorDescription = searchParams.get("error_description");

                if (errorDescription) {
                    setError(errorDescription.replace(/\+/g, ' '));
                    return;
                }

                if (!accessToken || !refreshToken) {
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        setError("Invalid or expired setup link. Please request a new invite.");
                        return;
                    }
                } else {
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        if (sessionError.message?.includes("abort")) {
                            return;
                        }
                        setError("This link is invalid or has expired. Please request a new invite.");
                        return;
                    }
                }
            } catch (err) {
                console.error("Session check error:", err);
                setError("An error occurred. Please try again or contact support.");
            } finally {
                setVerifying(false);
            }
        };
        handleSession();
    }, []);

    const handleSetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);

        const { data, error: authError } = await authService.updatePassword(password);

        if (authError) {
            setError(authError.message || "Failed to set password");
            setLoading(false);
        } else if (data.user) {
            await authService.ensureProfile(data.user.id, data.user.email!, data.user.user_metadata?.name);
            toast.success("Password set successfully! Please log in.");
            await logout();
            router.push("/login");
        }
    };

    if (verifying) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 font-medium">Verifying session...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle>Finish Account Setup</CardTitle>
                    <CardDescription>
                        {error
                            ? "There was a problem with your setup link"
                            : "Set your password to complete your account registration."}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error ? (
                        <div className="space-y-4">
                            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-3">
                                {error}
                            </div>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/login")}
                            >
                                Back to Login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                            </div>

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Saving..." : "Set Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
