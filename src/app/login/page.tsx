"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const { login, verifyOtp } = useAuth();
    const [step, setStep] = useState<'email' | 'otp'>('email');
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await login(email);
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("OTP sent! (Check console for code: 123456)");
            setStep('otp');
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { error } = await verifyOtp(email, otp);
        setLoading(false);

        if (error) {
            toast.error(error.message);
        } else {
            toast.success("Welcome back!");
            // Redirect handled by AuthProvider
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <Card className="w-[400px] shadow-lg">
                <CardHeader>
                    <CardTitle>Time Tracker Login</CardTitle>
                    <CardDescription>Enter your email to sign in.</CardDescription>
                </CardHeader>
                <CardContent>
                    {step === 'email' ? (
                        <form onSubmit={handleSendOtp} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="employee@test.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Sending..." : "Send Magic Link"}
                            </Button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="otp">One-Time Password</Label>
                                <Input
                                    id="otp"
                                    type="text"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-muted-foreground">Hint: Use 123456</p>
                            </div>
                            <Button type="submit" className="w-full" disabled={loading}>
                                {loading ? "Verifying..." : "Verify Login"}
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
