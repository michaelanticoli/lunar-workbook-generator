const express = require("express");
const path = require("path");
const handler = require("./generate");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.post("/api/generate", async (req, res) => {
  try {
    await handler(req, res);
  } catch (err) {
    console.error("Image generation failed", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

app.listen(port, () => {
  console.log(`Lunar Workbook Generator running on http://localhost:${port}`);
});
