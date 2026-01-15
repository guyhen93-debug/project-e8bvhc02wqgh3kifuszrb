Deno.serve(async (req) => {
    if (req.method !== "POST") {
        return new Response(JSON.stringify({ error: "Method not allowed" }), {
            status: 405,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        // We don't really need any data from the request body as per the plan,
        // but we'll safely consume it if it exists.
        await req.json().catch(() => null);

        console.log("Scheduling ntfy notification for rest end...");

        const response = await fetch('https://ntfy.sh/guy_oxygym_alerts_99', {
            method: 'POST',
            headers: {
                'Title': 'OXYGYM - טיימר',
                'Priority': 'high',
                'Delay': '90s',
                'Content-Type': 'text/plain; charset=utf-8',
            },
            body: 'המנוחה הסתיימה! 💪 הגיע הזמן לסט הבא',
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`ntfy returned error: ${response.status} ${errorText}`);
        }

        console.log("ntfy notification scheduled successfully");

        return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Error scheduling ntfy notification:", error);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
});
