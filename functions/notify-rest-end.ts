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

        console.log("Scheduling ntfy notification for rest end with query params...");

        const url = new URL("https://ntfy.sh/guy_oxygym_alerts_99");
        url.searchParams.set("title", "OXYGYM - טיימר");
        url.searchParams.set("delay", "90s");
        url.searchParams.set("priority", "high");
        url.searchParams.set("tags", "stopwatch");

        const response = await fetch(url.toString(), {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
            },
            body: 'המנוחה הסתיימה! 💪 הגיע הזמן לסט הבא',
        });

        if (!response.ok && response.type !== 'opaque') {
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
