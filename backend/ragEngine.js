// backend/ragEngine.js
const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");
const SimpleRetriever = require("./retriever");

const knowledgePath = path.join(__dirname, "data", "knowledge.json");
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));

const retriever = new SimpleRetriever(knowledge);

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function buildPrompt(question, results) {
  const contextBlocks = results.map((item, idx) => {
    const { doc, score } = item;
    return `[#${idx + 1}] ${doc.title || "Untitled"} (score: ${score.toFixed(
      2
    )})
Category: ${doc.category || "N/A"}
Tags: ${(doc.tags || []).join(", ")}

Content:
${doc.content}
`;
  });

  const context = contextBlocks.join("\n-----------------------------\n");

  return `
You are an Islamic knowledge assistant that answers questions about Hajj and Umrah.

Rules:
- Use ONLY the information in the CONTEXT below.
- If the answer is not clearly in the context, say:
  "This specific detail is not covered in this knowledge base. Please ask a trusted scholar."
- Do NOT invent rulings or details.
- Answer clearly and simply. Use bullet points or ordered steps when explaining rituals.

CONTEXT:
${context}

QUESTION:
${question}

FINAL ANSWER (in English, clear, friendly, faithful to the context):
`;
}

async function answerWithRAG(question) {
  const results = retriever.retrieve(question, 4);
  if (!results || results.length === 0) {
    return "I couldn't find relevant information in this Hajj & Umrah knowledge base. Please consult a trusted scholar for this question.";
  }

  const prompt = buildPrompt(question, results);

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const answer = response.output[0].content[0].text;
  return answer.trim();
}

module.exports = { answerWithRAG };
