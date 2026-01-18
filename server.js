const express = require("express");
const path = require("path");
const handler = require("./generate");

const app = express();
const port = process.env.PORT || 3000;
app.set("trust proxy", true);
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 10;
const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || DEFAULT_WINDOW_MS;
const MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX) || DEFAULT_MAX_REQUESTS;
const rateLimits = new Map();

app.use(express.json());

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket?.remoteAddress;
  if (!ip) {
    return res.status(400).json({ error: "Could not determine client address" });
  }
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

setInterval(() => {
  if (!rateLimits.size) return;
  const now = Date.now();
  for (const [ip, record] of rateLimits.entries()) {
    if (now - record.start > WINDOW_MS) {
      rateLimits.delete(ip);
    }
  }
}, WINDOW_MS).unref();

app.get("/", rateLimit, (_req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/generate", rateLimit, async (req, res) => {
  try {
    if (typeof handler !== "function") {
      throw new Error("generate module must export a function (CommonJS)");
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
