export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {

    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "Missing message"
      });
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing"
      });
    }

    const response =
      await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",

          headers: {
            "Authorization":
              `Bearer ${apiKey}`,

            "Content-Type":
              "application/json",

            "HTTP-Referer":
              "https://jarvis-9fjr.vercel.app",

            "X-OpenRouter-Title":
              "JARVIS"
          },

          body: JSON.stringify({

            model:
              "openrouter/free",

            messages: [

              {
                role: "system",

                content:
                  "You are a refined futuristic personal AI assistant. Speak naturally, calmly, intelligently, and concisely for voice conversation. Use a polished British-style manner. Do not claim to be the actual movie character or actor. Do not add the word sir because the webpage adds sir automatically."
              },

              {
                role: "user",
                content: message
              }

            ],

            temperature: 0.7,

            max_tokens: 300

          })
        }
      );

    const data =
      await response.json();

    if (!response.ok) {

      console.log(
        "OpenRouter error:",
        data
      );

      return res
        .status(response.status)
        .json({
          error:
            data?.error?.message ||
            "OpenRouter request failed"
        });

    }

    const answer =
      data?.choices?.[0]?.message?.content;

    if (!answer) {

      return res.status(500).json({
        error:
          "No AI response received"
      });

    }

    return res.status(200).json({
      reply: answer.trim()
    });

  }

  catch (error) {

    console.log(error);

    return res.status(500).json({
      error:
        "JARVIS AI connection failed"
    });

  }

}