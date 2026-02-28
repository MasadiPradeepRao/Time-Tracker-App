import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Get current UTC time
        const now = new Date();
        console.log(`[${now.toISOString()}] Starting reminder check...`);

        // Fetch all enabled reminders
        const { data: reminders, error: fetchError } = await supabase
            .from("reminders")
            .select("id, user_id, reminder_time, timezone, enabled")
            .eq("enabled", true);

        if (fetchError) throw fetchError;

        console.log(`[${now.toISOString()}] Found ${reminders?.length || 0} enabled reminders.`);

        const notificationsSent = [];

        for (const reminder of reminders || []) {
            if (!reminder.enabled) continue;

            const STOCKHOLM_TZ = "Europe/Stockholm";
            const stockholmTime = new Date().toLocaleString("en-US", {
                timeZone: STOCKHOLM_TZ,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            });

            const reminderTime = reminder.reminder_time.slice(0, 5);

            console.log("Fixed timezone:", STOCKHOLM_TZ);
            console.log("Stockholm current time:", stockholmTime);
            console.log("Reminder time:", reminderTime);

            if (stockholmTime !== reminderTime) continue;

            console.log(`[${now.toISOString()}] Match found! Sending notification to user ${reminder.user_id}`);

            // Fetch user player ID separately
            const { data: profile, error: profileError } = await supabase
                .from("profiles")
                .select("onesignal_player_id")
                .eq("id", reminder.user_id)
                .single();

            if (profileError || !profile?.onesignal_player_id) {
                console.log(`[${now.toISOString()}] No OneSignal player ID found for user ${reminder.user_id}`);
                continue;
            }

            const player_id = profile.onesignal_player_id;

            // Send notification via OneSignal
            const response = await fetch("https://onesignal.com/api/v1/notifications", {
                method: "POST",
                headers: {
                    "Authorization": `Basic ${ONESIGNAL_REST_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    app_id: ONESIGNAL_APP_ID,
                    include_player_ids: [player_id],
                    headings: { en: "Hourlog Reminder" },
                    contents: { en: "Time to check in for your shift." },
                }),
            });

            const result = await response.json();
            console.log(`[${now.toISOString()}] OneSignal response for user ${reminder.user_id}: ${response.status}`, result);

            notificationsSent.push({ user_id: reminder.user_id, status: response.status, result });
        }

        console.log(`[${now.toISOString()}] Finished. Sent ${notificationsSent.length} notifications.`);

        return new Response(JSON.stringify({
            success: true,
            sent: notificationsSent.length,
            details: notificationsSent
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error in send-reminders:`, error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 200, // Return 200 as requested even if no reminders found or error handled
            headers: { "Content-Type": "application/json" },
        });
    }
});
