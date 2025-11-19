// backend/server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { answerWithRAG } = require("./ragEngine");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Hajj RAG backend is running" });
});

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "message is required" });
    }

    const answer = await answerWithRAG(message.trim());
    res.json({ answer });
  } catch (err) {
    console.error("Error in /api/chat:", err);
    res
      .status(500)
      .json({ error: "Failed to generate answer. Please try again later." });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
