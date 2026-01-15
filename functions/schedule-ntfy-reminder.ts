Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { title, message, delaySeconds } = await req.json();

    if (!title || !message || typeof delaySeconds !== "number") {
      return new Response(
        JSON.stringify({ error: "Invalid payload: title, message and delaySeconds (number) are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const coercedDelay = Math.max(0, Math.floor(delaySeconds));

    console.log(`Scheduling ntfy reminder: "${title}" in ${coercedDelay}s`);

    const response = await fetch("https://ntfy.sh/guy_oxygym_alerts_99", {
      method: "POST",
      headers: {
        "Title": title,
        "Priority": "high",
        "Delay": `${coercedDelay}s`,
        "Content-Type": "text/plain; charset=utf-8",
      },
      body: message,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ntfy error: ${response.status} ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error scheduling ntfy reminder:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message ?? "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
