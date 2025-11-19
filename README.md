Hajj & Umrah RAG System
A Question-Answering System for Hajj and Umrah Using Retrieval-Augmented Generation (RAG)
This system is educational/academic and should not be considered a source of religious rulings (fatwas). It serves as a technical demonstration of the RAG concept in a religious context.
1. Overview
This project provides a simple yet fully functional implementation of the
Retrieval-Augmented Generation (RAG) concept in the domain of questions related to Hajj and Umrah.
Instead of relying solely on the internal memory of a language model (LLM), the system performs:
1.	Retrieval of relevant information from a dedicated knowledge base (knowledge.json).
2.	Augmentation of the retrieved information with the user’s question in a structured prompt.
3.	Generation of the final answer using an OpenAI model (gpt-4.1-mini) based on the retrieved context
2. Project Components
The project is divided into two main parts:
1.	Backend – backend/
o	Node.js + Express
o	Provides the API
o	Implements the RAG logic (retrieval + generation)


2.	Frontend – hajj-ui/
o	React + Vite + Tailwind CSS
o	Chat UI that communicates with the backend via /api/chat



3. Project Structure
hajj-rag-system/
│
├── backend/                 # Backend (Node.js + RAG)
│   ├── server.js            # Main API entry point
│   ├── ragEngine.js         # RAG logic (retrieval + generation)
│   ├── retriever.js         # SimpleRetriever (retrieval engine)
│   ├── package.json
│   ├── package-lock.json
│   └── data/
│       └── knowledge.json   # Knowledge base for Hajj and Umrah
│
└── hajj-ui/                 # Frontend (React + Vite)
    ├── index.html
    ├── package.json
    ├── vite.config.js       # Proxy config for /api → backend
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── App.jsx
        ├── HajjUmrahChat.jsx # Chat UI component
        ├── main.jsx
        └── index.css


 4. How the System Works
 User Workflow:
1.	The user types a question in the chat interface (e.g.,
“What are the pillars of Hajj?”).
2.	The frontend sends this question to the backend via /api/chat.
3.	The backend processes it through the RAG Engine:
o	Retrieves relevant text from knowledge.json using SimpleRetriever.
o	Builds a prompt containing:
	The user's question
	The retrieved knowledge
o	Sends the prompt to the OpenAI model.
4.	The model generates a text answer.
5.	The backend returns the answer as JSON.
6.	The frontend displays the answer in a chat bubble.





5. The knowledge.json File — Where Does the Information Come From?
Path:
backend/data/knowledge.json
This file is the Knowledge Base of the system.
Each item inside it represents a “mini document” related to Hajj or Umrah topics.
Example document:
{
  "id": "hajj_001",
  "title": "Pillars of Hajj",
  "category": "Hajj Basics",
  "content": "The five pillars (Arkan) of Hajj are obligatory ...",
  "tags": ["pillars", "arkan", "obligatory", "fard"]
}
Each document includes:
•	id → Unique identifier
•	title → Topic title
•	category → Classification (Hajj Basics, Ihram, Umrah Steps, …)
•	content → Actual text used in answering
•	tags → Keywords that assist retrieval

The system does not read PDFs directly at runtime.
It relies solely on the information written inside knowledge.json.
You can fill this file manually using trustworthy books or PDFs.






 6. SimpleRetriever (retriever.js)
 Purpose
SimpleRetriever is the class responsible for the Retrieval (R) part of RAG.
It:
•	Takes the user’s query
•	Tokenizes it into words
•	Compares these words with each document in knowledge.json
•	Computes a similarity score (based on word overlap)
•	Selects the Top-K relevant documents and returns them
 Key Functions:
// backend/retriever.js
class SimpleRetriever {
  constructor(knowledge) {
    this.documents = knowledge; // Documents loaded from knowledge.json
  }

  _tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter(Boolean);
  }

  _similarity(queryTokens, docTokens) {
    const querySet = new Set(queryTokens);
    let matchCount = 0;
    for (const token of docTokens) {
      if (querySet.has(token)) matchCount++;
    }
    return matchCount; // Number of matching words
  }

  retrieve(query, topK = 3) {
    const queryTokens = this._tokenize(query);

  const scored = this.documents.map((doc) => {
      const extra = [
        doc.title || "",
        doc.category || "",
        (doc.tags || []).join(" "),
      ].join(" ");

  const docTokens = this._tokenize(doc.content + " " + extra);
      const score = this._similarity(queryTokens, docTokens);

  return { doc, score };
    });

   scored.sort((a, b) => b.score - a.score);
    const filtered = scored.filter((item) => item.score > 0);
    return filtered.slice(0, topK);
  }
}

module.exports = SimpleRetriever;





7. The RAG Engine (ragEngine.js)
This file combines:
•	Retrieval from SimpleRetriever
•	Generation using OpenAI
Steps inside:
1.	Load knowledge.json:
const knowledgePath = path.join(__dirname, "data", "knowledge.json");
const knowledge = JSON.parse(fs.readFileSync(knowledgePath, "utf8"));
const retriever = new SimpleRetriever(knowledge);
2.	Initialize OpenAI:
const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
3.	Build the prompt:
function buildPrompt(question, results) {
  // Combines the question + retrieved documents
}
4.	Main function answerWithRAG:
async function answerWithRAG(question) {
  const results = retriever.retrieve(question, 3);
  const prompt = buildPrompt(question, results);

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  const answer = response.output[0].content[0].text;
  return answer.trim();
}

module.exports = { answerWithRAG };



This is where RAG truly happens:
Retrieval → Augmented Prompt → Generation





8. Backend API — server.js
Key setup:
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { answerWithRAG } = require("./ragEngine");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
Health Check:
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Hajj RAG backend is running" });
});
Chat Endpoint:
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

  if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
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
Run the server:



npm start
9. Frontend — hajj-ui/
Technologies:
•	React
•	Vite
•	Tailwind CSS
•	lucide-react icons
Main Component: HajjUmrahChat.jsx
It:
•	Stores message state
•	Sends requests to /api/chat
•	Displays answers
•	Includes suggested questions
Example:
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ message: input }),
});
Proxy Configuration:
server: {
  proxy: {
    "/api": "http://localhost:3001",
  },
}




10. How to Run the Project
Backend:
cd backend
npm install
Create .env:
OPENAI_API_KEY=your_api_key
PORT=3001
Run:
npm start
Frontend:
cd hajj-ui
npm install
npm run dev
Open:
http://localhost:5173/
Conclusion
We successfully built an AI-powered Hajj & Umrah Assistant that meets all core requirements of the challenge. The system includes a responsive web-based chat interface, full LLM integration using OpenAI’s Responses API, and a complete Retrieval-Augmented Generation (RAG) pipeline grounded in an authentic, curated knowledge base. Through rapid prototyping and iterative “vibe coding,” we delivered a functional, intelligent, and context-aware assistant capable of providing accurate guidance for Hajj and Umrah rituals. This demonstrates the successful implementation of a modern, AI-driven solution that aligns with the challenge goals.
Future Improvements
•	Add PDF ingestion
•	Use Embeddings + Vector Databases (FAISS, Chroma)
•	Conversation memory


