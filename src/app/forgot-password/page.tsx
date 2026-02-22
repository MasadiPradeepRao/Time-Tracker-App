"use client";

import { useState } from "react";
import { authService } from "@/services/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleResetRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const { error } = await authService.resetPasswordForEmail(email);
        setLoading(false);

        if (error) {
            toast.error("Failed to send reset email");
        } else {
            setSent(true);
            toast.success("Reset link sent!");
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader className="flex flex-col items-center">
                    <Logo textSize="text-3xl" iconSize={36} className="mb-2" />
                    <CardTitle>Forgot Password</CardTitle>
                    <CardDescription>
                        {sent
                            ? "Check your email"
                            : "Enter your email to receive a reset link"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {sent ? (
                        <div className="space-y-4 text-center">
                            <p className="text-sm text-muted-foreground">
                                We've sent a password reset link to <strong>{email}</strong>.
                                <br />Please check your inbox.
                            </p>
                            <Link href="/login">
                                <Button variant="outline" className="w-full">
                                    Back to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleResetRequest} className="space-y-4">
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

                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send Reset Link"}
                            </Button>

                            <div className="text-center text-sm text-muted-foreground">
                                <Link href="/login" className="text-primary hover:underline">
                                    Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
