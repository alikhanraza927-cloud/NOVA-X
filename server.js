const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());

// Serve the NOVA X website
app.use(express.static(path.join(__dirname)));

// OpenRouter API key
const API_KEY = process.env.OPENROUTER_API_KEY;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!API_KEY) {
      return res.status(500).json({ error: "OPENROUTER_API_KEY is missing" });
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${API_KEY}`,
          "HTTP-Referer": "https://nova-x.onrender.com",
          "X-Title": "NOVA X"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-20b:free",
          messages: [
            {
              role: "system",
              content:
                "You are NOVA X, a smart, helpful and friendly AI assistant. Give clear, accurate and useful answers. Keep responses natural and easy to understand."
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data.error?.message || "OpenRouter request failed"
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: "No AI response received" });
    }

    res.json({ reply });

  } catch (error) {
    console.error("NOVA X ERROR:", error);
    res.status(500).json({ error: "Something went wrong" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NOVA X running on port ${PORT}`);
});
