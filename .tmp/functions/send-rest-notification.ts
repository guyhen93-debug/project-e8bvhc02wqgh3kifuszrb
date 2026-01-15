Deno.serve(async (req) => {
  try {
    // Attempt to read body if it exists, but don't fail if it's empty
    let delaySeconds = 90;
    try {
      const body = await req.json();
      if (body && body.delaySeconds) {
        delaySeconds = body.delaySeconds;
      }
    } catch (_e) {
      // Body might be empty or not JSON, that's fine for this stub
    }

    console.log("Rest notification endpoint called, but push notifications are disabled.");

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Rest notifications via push are disabled in this app.',
        delaySeconds
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error('Unexpected error in send-rest-notification stub:', err);
    return new Response(JSON.stringify({ 
      error: err instanceof Error ? err.message : "Unknown error" 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
