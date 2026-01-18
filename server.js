const express = require("express");
const path = require("path");
const handler = require("./generate");

const app = express();
const port = process.env.PORT || 3000;
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;
const rateLimits = new Map();

app.use(express.json());

app.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

function rateLimit(req, res, next) {
  const ip = req.ip || req.connection?.remoteAddress || "unknown";
  const now = Date.now();
  const record = rateLimits.get(ip) || { count: 0, start: now };
  if (now - record.start > WINDOW_MS) {
    record.count = 0;
    record.start = now;
  }
  record.count += 1;
  rateLimits.set(ip, record);
  if (record.count > MAX_REQUESTS) {
    return res.status(429).json({ error: "Too many requests" });
  }
  next();
}

app.post("/api/generate", rateLimit, async (req, res) => {
  try {
    if (typeof handler !== "function") {
      throw new Error("generate handler must export a function");
    }
    await handler(req, res);
  } catch (err) {
    console.error("Image generation failed", err);
    res.status(500).json({ error: "Failed to generate image" });
  }
});

const server = app.listen(port, () => {
  console.log(`Lunar Workbook Generator running on http://localhost:${port}`);
});

server.on("error", (err) => {
  console.error("Server failed to start", err);
});
