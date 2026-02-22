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
import { Logo } from "@/components/logo";
import { AuthCarousel } from "@/components/auth/auth-carousel";
import { AuthBackground } from "@/components/auth/auth-background";
import { motion } from "framer-motion";

export default function SignupPage() {
    const { signup } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        const { error: authError } = await signup(email, password, name);
        setLoading(false);

        if (authError) {
            setError(authError.message);
        } else {
            setSuccess(true);
            toast.success("Verification email sent!");
        }
    };

    if (success) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-[400px] shadow-lg">
                    <CardHeader>
                        <CardTitle>Check your email</CardTitle>
                        <CardDescription>
                            We've sent a link to <strong>{email}</strong> to confirm your account.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/login">
                            <Button className="w-full">Back to Login</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full flex bg-white relative overflow-hidden">
            {/* Desktop Background Pattern */}
            <AuthBackground />

            {/* Mobile Background Carousel */}
            <div className="absolute inset-0 z-0 lg:hidden">
                <AuthCarousel isMobile />
            </div>

            <div className="relative z-10 w-full max-w-6xl mx-auto lg:grid lg:grid-cols-2 items-center min-h-screen">
                {/* Form Column */}
                <div className="flex flex-col items-center justify-center p-6 md:p-12 lg:p-24 relative">
                    <Card className="w-full max-w-[420px] shadow-2xl border-none lg:shadow-none bg-white/90 backdrop-blur-sm lg:bg-transparent">
                        <CardHeader className="flex flex-col items-center pb-8">
                            <Link href="/">
                                <Logo textSize="text-3xl" iconSize={36} className="mb-6 cursor-pointer hover:opacity-80 transition-opacity" />
                            </Link>
                            <CardTitle className="text-2xl font-bold tracking-tight">Create Account</CardTitle>
                            <CardDescription className="text-gray-500 text-center mt-2">
                                Join Hourlog today and start tracking your productivity efficiently.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleSignup} className="space-y-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="font-semibold text-gray-700">Full Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="John Doe"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-semibold text-gray-700">Email Address</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="name@company.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" title="password" className="font-semibold text-gray-700">Password</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="h-12 border-gray-200 focus:ring-blue-500 rounded-xl"
                                        required
                                        minLength={6}
                                    />
                                    <p className="text-[10px] text-gray-400">At least 6 characters</p>
                                </div>

                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                                        {error}
                                    </motion.div>
                                )}

                                <Button type="submit" className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl shadow-lg transition-all active:scale-[0.98]" disabled={loading}>
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Creating account...
                                        </div>
                                    ) : "Create Account"}
                                </Button>
                            </form>

                            <div className="mt-8 text-center text-sm">
                                <span className="text-gray-500">Already have an account? </span>
                                <Link href="/login" className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                    Log in
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Desktop Carousel Column */}
                <div className="hidden lg:flex items-center justify-center p-8">
                    <AuthCarousel className="w-full max-w-[500px] aspect-square shadow-2xl" />
                </div>
            </div>
        </div>
    );
}
