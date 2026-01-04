Deno.serve(async (req) => {
  const apiKey = Deno.env.get("ONESIGNAL_REST_API_KEY");
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing ONESIGNAL_REST_API_KEY' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { playerId, delaySeconds = 90 } = await req.json();

    if (!playerId) {
      return new Response(JSON.stringify({ error: "playerId is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Schedule notification for X seconds from now
    const sendAfterDate = new Date(Date.now() + delaySeconds * 1000);
    const sendAfter = sendAfterDate.toISOString();

    const body = {
      app_id: '765b6111-8550-4b51-8db8-c64cd97396f0',
      include_player_ids: [playerId],
      headings: {
        en: 'Rest finished',
        he: 'המנוחה הסתיימה',
      },
      contents: {
        en: 'Rest is over! Start your next set.',
        he: 'מנוחה הסתיימה! התחל סט הבא',
      },
      send_after: sendAfter,
    };

    console.log(`Scheduling notification for ${playerId} at ${sendAfter}`);

    const onesignalResp = await fetch("https://onesignal.com/api/v1/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Basic ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const data = await onesignalResp.json();

    if (!onesignalResp.ok) {
      console.error('OneSignal API error:', data);
      return new Response(JSON.stringify({ error: 'OneSignal error', details: data }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ id: data.id, scheduled_at: sendAfter }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error('Unexpected error in send-rest-notification:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
