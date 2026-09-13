// src/lib/rag/embeddings.ts
/**
 * Embeddings Client
 *
 * What this does:
 * 1. Converts text into numerical vectors (embeddings)
 * 2. Uses OpenAI's text-embedding-3-small model
 * 3. Returns a 1536-dimensional vector for each text input
 */

import { OpenAIEmbeddings } from "@langchain/openai";
import { RAG_CONFIG } from "./config";

let embeddings: OpenAIEmbeddings | null = null;

/**
 * Get or create the embeddings client (singleton pattern)
 */
export function getEmbeddings(): OpenAIEmbeddings {
    if (!embeddings) {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error(
                "OPENAI_API_KEY is not set in environment variables",
            );
        }

        // ✅ Simplified configuration - let LangChain use defaults
        embeddings = new OpenAIEmbeddings({
            modelName: "text-embedding-3-small",
            apiKey: process.env.OPENAI_API_KEY,
        });
    }
    return embeddings;
}

/**
 * Embed a single text string
 */
export async function embedText(text: string): Promise<number[]> {
    const client = getEmbeddings();
    return client.embedQuery(text);
}

/**
 * Embed multiple documents at once
 */
export async function embedDocuments(texts: string[]): Promise<number[][]> {
    const client = getEmbeddings();
    return client.embedDocuments(texts);
}
