export default async function handler(req, res) {
  const { prompt } = req.body;

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

  const result = await r.json();
  res.status(200).json({ url: result.data[0].url });
}
