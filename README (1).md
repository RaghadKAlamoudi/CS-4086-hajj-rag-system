# 🕋 Hajj & Umrah RAG Chatbot

An AI assistant that answers questions about **Hajj and Umrah** using:

- A custom **Hajj & Umrah knowledge base** (`knowledge.json`)
- A simple **RAG (Retrieval-Augmented Generation)** backend (Node.js + Express + OpenAI)
- A **React + Vite + Tailwind CSS** frontend chat interface

---

# 📦 1. Project Structure

```text
hajj-rag-system/
│
├── backend/                # RAG + LLM API server
│   ├── package.json
│   ├── server.js           # Express server + /api/chat endpoint
│   ├── ragEngine.js        # Retrieval + prompt building + OpenAI call
│   ├── retriever.js        # Simple bag-of-words retriever
│   ├── .env                # OPENAI_API_KEY, PORT, etc. (not committed)
│   └── data/
│       └── knowledge.json  # Hajj & Umrah knowledge base
│
└── hajj-ui/                # Frontend (React + Vite + Tailwind)
    ├── package.json
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── HajjUmrahChat.jsx
        └── index.css


```
---

# 🚀 Features

### ✔ Retrieval-Augmented Generation  
The system retrieves the **most relevant Islamic knowledge** (Hajj & Umrah rituals, steps, rulings) before sending the context to an LLM.

### ✔ Safe & Faithful Islamic Answers  
The prompt instructs the model to **only answer based on the provided knowledge** and avoid speculation.

### ✔ Simple Retriever  
A lightweight tokenizer + shared-word similarity algorithm.

### ✔ Modern Frontend UI  
- Beautiful Hajj-themed interface  
- Suggested starter questions  
- Smooth chat scrolling  
- Loading animation  

---

# 🔧 Backend Setup (Node.js + Express + OpenAI)

## 1. Install dependencies
```bash
cd backend
npm install
```
# 3.2 Create environment variables

Create backend/.env:
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxx
PORT=3001

# 3.3 Knowledge Base (knowledge.json)

Located inside:
backend/data/knowledge.json

Contains structured Islamic information, e.g.:

{
  "id": "hajj_001",
  "title": "Pillars of Hajj",
  "category": "Hajj Basics",
  "content": "The five pillars (Arkan) of Hajj are...",
  "tags": ["pillars", "arkan", "obligatory"]
}

# 3.4 Run backend
npm start

Your backend will start at:
http://localhost:3001

Test:
http://localhost:3001/api/health


## 🎨 4. Frontend Setup (React + Vite + Tailwind)
# 4.1 Install dependencies
cd hajj-ui
npm install

# 4.2 Configure Tailwind
tailwind.config.js:
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: { extend: {} },
  plugins: [],
};


postcss.config.js:
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};


src/index.css:
@tailwind base;
@tailwind components;
@tailwind utilities;

# 4.3 Vite Proxy (to backend)

vite.config.js:
server: {
  proxy: {
    "/api": "http://localhost:3001"
  }
}


# 4.4 Run frontend
npm run dev

Frontend runs at:
http://localhost:5173


## 🔁 5. How the RAG Pipeline Works
User asks a question

Frontend sends:
POST /api/chat

Backend:
Retrieves relevant documents
Builds a context-rich prompt
Sends prompt to OpenAI
OpenAI generates answer
Backend returns { answer }
UI displays answer

6. How the RAG Pipeline Works
User asks a question in the React UI.
Frontend sends POST /api/chat with { message }.

Backend:
Uses SimpleRetriever to find top-K documents from knowledge.json.

Builds a prompt combining:
Selected context passages
The user’s question
Safety/faithfulness instructions.
Sends prompt to the OpenAI model.
Model responds with an answer.
Backend returns { answer } to the frontend.
UI displays the answer as the assistant’s message.


## 🧪 Testing the RAG System

Try these:
"What are the pillars of Hajj?"
"Explain the steps of Umrah."
"What happens on the Day of Arafat?"
"What is Ihram?"
"What are the prohibitions during Ihram?"
"What is Tawaf al-Wida?"

## 7. Possible Extensions
Add more Hajj & Umrah entries to knowledge.json.
Support Arabic answers or bilingual mode.
Use embeddings for more advanced retrieval.
Store and show previous conversations per user.
Deploy backend (Render/Railway) and frontend (Vercel/Netlify).
