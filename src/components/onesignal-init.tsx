"use client";

import { useEffect, useCallback } from "react";
import OneSignal from "react-onesignal";
import { useAuth } from "@/components/auth-provider";
import { supabase } from "@/lib/supabase";

export default function OneSignalInit() {
    const { user } = useAuth();

    const setupOneSignal = useCallback(async () => {
        if (!user) return;

        try {
            await OneSignal.init({
                appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "",
                allowLocalhostAsSecureOrigin: true,
            });

            // Request permission and get player ID
            await OneSignal.Notifications.requestPermission();
            const playerId = OneSignal.User.PushSubscription.id;

            if (playerId) {
                // Save player ID to profiles table
                const { error } = await supabase
                    .from("profiles")
                    .update({ onesignal_player_id: playerId })
                    .eq("id", user.id);

                if (error) {
                    console.error("Error saving OneSignal player ID:", error);
                }
            }
        } catch (error) {
            console.error("OneSignal initialization failed:", error);
        }
    }, [user]);

    useEffect(() => {
        if (user && typeof window !== "undefined") {
            setupOneSignal();
        }
    }, [user, setupOneSignal]);

    return null;
}
