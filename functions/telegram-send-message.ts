Deno.serve(async (req) => {
  const token = Deno.env.get("TELEGRAM_BOT_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "Missing TELEGRAM_BOT_TOKEN on server" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const { chatId, text } = await req.json();

    if (!chatId || typeof chatId !== "string" || chatId.trim() === "") {
      return new Response(JSON.stringify({ error: "chatId is required and must be a non-empty string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!text || typeof text !== "string" || text.trim() === "") {
      return new Response(JSON.stringify({ error: "text is required and must be a non-empty string" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: "HTML",
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error("Telegram API error:", data);
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Telegram API error", 
        details: data 
      }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "sent", 
      telegram: data 
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Unexpected error in telegram-send-message:", err);
    return new Response(JSON.stringify({ 
      error: "Internal Server Error", 
      message: err instanceof Error ? err.message : String(err) 
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
