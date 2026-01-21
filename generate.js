async function handler(req, res) {
  const prompt = req.body && req.body.prompt;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(503).json({ error: "OPENAI_API_KEY is not configured" });
  }

  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-image-1",
      prompt: prompt,
      size: "1024x1024"
    })
  });

  if (!r.ok) {
    const error = await r.text();
    console.error("OpenAI request failed", error);
    return res.status(500).json({ error: "Failed to generate image" });
  }

  const result = await r.json();
  const first = result?.data?.[0] || null;
  if (!first || !first.url) {
    console.error("OpenAI response missing image URL", result);
    return res.status(500).json({ error: "Failed to generate image" });
  }
  res.status(200).json({ url: first.url });
}

module.exports = handler;
