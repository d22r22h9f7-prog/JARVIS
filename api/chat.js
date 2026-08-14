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

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        error: "OPENROUTER_API_KEY is missing"
      });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",

        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://jarvis-9fjr.vercel.app",
          "X-OpenRouter-Title": "JARVIS"
        },

        body: JSON.stringify({

          model: "openrouter/free",

          messages: [

            {
              role: "system",

              content: `
You are a futuristic personal voice assistant.

Your response will be spoken aloud, so follow these rules strictly:

Speak like a calm, intelligent, refined British-style AI assistant.

Answer naturally like a human speaking.

Keep most answers short and conversational.

Never output computer code.

Never output HTML.

Never output JavaScript.

Never use markdown.

Never use code blocks.

Never use backticks.

Never use headings.

Never use bullet points unless absolutely necessary.

Never describe your programming or internal code.

Never say things like "here is the code".

Never include URLs unless the user specifically asks for one.

Do not use emojis.

Do not add the word "sir" because the JARVIS webpage automatically adds it.

If the user asks a normal question, simply answer the question in natural spoken English.

If the user asks a technical question, explain it conversationally instead of dumping code.

Sound confident, calm, helpful, concise, and natural.
`
            },

            {
              role: "user",
              content: message
            }

          ],

          temperature: 0.6,

          max_tokens: 250

        })
      }
    );


    const data = await response.json();


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


    let answer =
      data?.choices?.[0]?.message?.content;


    if (!answer) {

      return res.status(500).json({
        error: "No AI response received"
      });
    }


    /* REMOVE CODE BLOCKS */

    answer = answer.replace(
      /```[\s\S]*?```/g,
      ""
    );


    /* REMOVE BACKTICKS */

    answer = answer.replace(
      /`([^`]*)`/g,
      "$1"
    );


    /* REMOVE MARKDOWN HEADINGS */

    answer = answer.replace(
      /^#{1,6}\s*/gm,
      ""
    );


    /* REMOVE MARKDOWN BULLETS */

    answer = answer.replace(
      /^\s*[-*+]\s+/gm,
      ""
    );


    /* REMOVE MARKDOWN BOLD */

    answer = answer.replace(
      /\*\*(.*?)\*\*/g,
      "$1"
    );


    /* REMOVE EXTRA SPACES */

    answer = answer
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim();


    if (!answer) {

      answer =
        "I don't have a useful spoken response for that yet.";

    }


    return res.status(200).json({
      reply: answer
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