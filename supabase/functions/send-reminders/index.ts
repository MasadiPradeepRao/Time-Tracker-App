import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
const ONESIGNAL_REST_API_KEY = Deno.env.get("ONESIGNAL_REST_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

serve(async (req) => {
    try {
        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        // Get current UTC time in HH:MM format
        const nowUtc = new Date();

        // Fetch all enabled reminders with user player IDs
        const { data: reminders, error: fetchError } = await supabase
            .from("reminders")
            .select(`
        reminder_time,
        timezone,
        enabled,
        user_id,
        profiles!inner(onesignal_player_id)
      `)
            .eq("enabled", true)
            .not("profiles.onesignal_player_id", "is", null);

        if (fetchError) throw fetchError;

        const notificationsSent = [];

        for (const reminder of reminders) {
            const { reminder_time, timezone, profiles } = reminder;
            const player_id = profiles.onesignal_player_id;

            // Convert current UTC time to user's timezone
            const userTime = new Intl.DateTimeFormat("en-GB", {
                timeZone: timezone,
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
            }).format(nowUtc);

            // Extract HH:MM from reminder_time (which is in HH:MM:SS format from Supabase)
            const targetTime = reminder_time.substring(0, 5);

            if (userTime === targetTime) {
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
                notificationsSent.push({ user_id: reminder.user_id, result });
            }
        }

        return new Response(JSON.stringify({ success: true, sent: notificationsSent.length, details: notificationsSent }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
