
export default async (req) => {
  // Allow POST requests only
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST" }
    });
  }

  // Read secret settings from Netlify
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return new Response(
      "Telegram notification is not configured",
      { status: 500 }
    );
  }

  // Read and validate the request
  let body;

  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (body?.answer !== "yes") {
    return new Response("Invalid answer", { status: 400 });
  }

  // Send the Telegram notification
  try {
    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: "❤️ تم الضغط على زر نعم في الموقع!"
        })
      }
    );

    const result = await telegramResponse.json();

    if (!telegramResponse.ok || !result.ok) {
      console.error("Telegram API error:", result.description);

      return new Response("Telegram notification failed", {
        status: 502
      });
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Telegram request failed:", error);

    return new Response("Telegram notification failed", {
      status: 502
    });
  }
};
