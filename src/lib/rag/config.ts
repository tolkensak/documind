// src/lib/rag/config.ts
export const RAG_CONFIG = {
    // Chunking
    chunkSize: 1000,
    chunkOverlap: 200,

    // Embeddings
    embeddingModel: "text-embedding-3-small",
    embeddingDimensions: 1536,

    // Retrieval
    topK: 5,

    // LLM - ✅ Use OpenAI's GPT-OSS-120B (available on Groq)
    llmModel: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    maxTokens: 1024,
    temperature: 0.1,
};

export function validateEnv() {
    const required = [
        "GROQ_API_KEY",
        "OPENAI_API_KEY",
        "PINECONE_API_KEY",
        "PINECONE_INDEX_NAME",
    ];

    const missing = required.filter((key) => !process.env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missing.join(", ")}`,
        );
    }
}
