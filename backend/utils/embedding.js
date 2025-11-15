const axios = require('axios');

class EmbeddingService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta/models';
    this.embeddingModel = 'text-embedding-004';
  }

  /**
   * Generate embeddings for text
   */
  async generateEmbedding(text) {
    try {
      const response = await axios.post(
        `${this.baseURL}/${this.embeddingModel}:embedContent`,
        {
          content: {
            parts: [{ text }]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey
          },
          timeout: 15000
        }
      );

      return response.data.embedding.values;
    } catch (error) {
      console.error('Embedding Generation Error:', error.message);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vecA, vecB) {
    if (vecA.length !== vecB.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Find similar documents based on query
   */
  async findSimilar(queryText, documents, topK = 5) {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(queryText);

      // Calculate similarities
      const results = documents.map(doc => ({
        document: doc,
        similarity: this.cosineSimilarity(queryEmbedding, doc.embedding)
      }));

      // Sort by similarity and return top K
      return results
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK)
        .map(r => ({
          ...r.document,
          similarity: r.similarity
        }));
    } catch (error) {
      console.error('Find Similar Error:', error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for multiple texts in batch
   */
  async generateBatchEmbeddings(texts) {
    try {
      const embeddings = await Promise.all(
        texts.map(text => this.generateEmbedding(text))
      );
      return embeddings;
    } catch (error) {
      console.error('Batch Embedding Error:', error.message);
      throw error;
    }
  }
}

module.exports = new EmbeddingService();
