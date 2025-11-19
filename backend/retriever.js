// backend/retriever.js
class SimpleRetriever {
  constructor(knowledge) {
    this.documents = knowledge; // array of docs
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
    const docSet = new Set(docTokens);
    let common = 0;
    for (const t of querySet) {
      if (docSet.has(t)) common++;
    }
    return common / Math.max(querySet.size, 1);
  }

  retrieve(query, topK = 4) {
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
