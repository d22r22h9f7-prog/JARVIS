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

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENAI_API_KEY is missing"
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },

        body: JSON.stringify({
          model: "gpt-5",

          store: false,

          instructions:
            "You are a polished futuristic personal AI assistant inspired by a refined British cinematic AI. Keep answers concise and natural for spoken conversation. Be calm, intelligent, slightly formal, and helpful. Do not claim to actually be the movie character or actor. Do not add the word sir because the webpage adds it automatically.",

          input: message
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(data);

      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed"
      });
    }

    let answer = "";

    if (Array.isArray(data.output)) {
      for (const item of data.output) {
        if (
          item.type === "message" &&
          Array.isArray(item.content)
        ) {
          for (const part of item.content) {
            if (
              part.type === "output_text" &&
              part.text
            ) {
              answer += part.text;
            }
          }
        }
      }
    }

    if (!answer) {
      answer =
        "I was unable to generate a response.";
    }

    return res.status(200).json({
      reply: answer.trim()
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "JARVIS AI connection failed"
    });
  }
}