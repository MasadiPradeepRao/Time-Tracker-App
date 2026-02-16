"use client";

import { useState, useEffect, useRef } from "react";
import { authService } from "@/services/auth-service";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
    const router = useRouter();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState("");
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const handleSession = async () => {
            try {
                // 1. Try to get tokens from the URL hash (standard Supabase redirect format)
                const hash = window.location.hash.substring(1);
                const hashParams = new URLSearchParams(hash);

                // 2. Fallback to search params if not in hash
                const searchParams = new URLSearchParams(window.location.search);

                const accessToken = hashParams.get("access_token") || searchParams.get("access_token");
                const refreshToken = hashParams.get("refresh_token") || searchParams.get("refresh_token");
                const errorDescription = searchParams.get("error_description");

                if (errorDescription) {
                    setError(errorDescription.replace(/\+/g, ' '));
                    return;
                }

                if (!accessToken || !refreshToken) {
                    // Check if we already have a session (e.g. refresh)
                    const { data: { session } } = await supabase.auth.getSession();
                    if (!session) {
                        setError("Invalid or expired reset link. Please request a new one.");
                        return;
                    }
                } else {
                    // 3. Set the session manually
                    const { error: sessionError } = await supabase.auth.setSession({
                        access_token: accessToken,
                        refresh_token: refreshToken,
                    });

                    if (sessionError) {
                        // Catch and log potential AbortErrors or hydration errors
                        if (sessionError.message?.includes("abort")) {
                            return;
                        }
                        setError("This link is invalid or has expired. Please request a new password reset.");
                        return;
                    }
                }
            } catch (err) {
                console.error("Session initialization error:", err);
                setError("An error occurred. Please try again or request a new reset link.");
            } finally {
                setVerifying(false);
            }
        };

        handleSession();
    }, []);

    const handleResetPassword = async (e: React.FormEvent) => {
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

        const { error: authError } = await authService.updatePassword(password);
        setLoading(false);

        if (authError) {
            setError(authError.message || "Failed to reset password");
        } else {
            toast.success("Password updated successfully!");
            // Logout to clear the reset session
            await supabase.auth.signOut();
            router.push("/login");
        }
    };

    if (verifying) {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
                <p className="text-gray-600 font-medium">Verifying reset link...</p>
            </div>
        );
    }

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle>Set New Password</CardTitle>
                    <CardDescription>
                        {error
                            ? "There was a problem with your reset link"
                            : "Enter your new password below"}
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
                                onClick={() => router.push("/forgot-password")}
                            >
                                Request New Reset Link
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleResetPassword} className="space-y-4">
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
                                {loading ? "Updating..." : "Set New Password"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
