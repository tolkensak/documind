// src/lib/rag/llm.ts
/**
 * LLM Client (Groq)
 *
 * What this does:
 * 1. Takes a question + relevant document chunks
 * 2. Sends them to Groq's LLM
 * 3. Returns a grounded answer with citations
 *
 * Why Groq?
 * - Blazing fast (llama-3.3 runs at 300+ tokens/sec)
 * - Free tier is generous
 * - OpenAI-compatible API
 */

import { ChatGroq } from "@langchain/groq";
import { RAG_CONFIG } from "./config";
import type { DocumentChunk } from "./vectorstore";

let llm: ChatGroq | null = null;

/**
 * Get or create the LLM client (singleton)
 */
export function getLLM(): ChatGroq {
    if (!llm) {
        if (!process.env.GROQ_API_KEY) {
            throw new Error("GROQ_API_KEY is not set");
        }
        llm = new ChatGroq({
            apiKey: process.env.GROQ_API_KEY,
            model: RAG_CONFIG.llmModel, // ✅ Now uses llama-3.1-8b-instant
            temperature: RAG_CONFIG.temperature,
            maxTokens: RAG_CONFIG.maxTokens,
        });
    }
    return llm;
}

/**
 * Build the RAG prompt
 *
 * The prompt structure is critical:
 * 1. System message: Defines the assistant's role and rules
 * 2. Context: The retrieved document chunks
 * 3. Question: The user's question
 */
function buildPrompt(question: string, chunks: DocumentChunk[]): string {
    const context = chunks
        .map(
            (chunk, i) =>
                `[Source ${i + 1}: ${chunk.documentName}, Page ${chunk.pageNumber}]\n${chunk.text}`,
        )
        .join("\n\n---\n\n");

    return `You are a helpful assistant that answers questions based ONLY on the provided context.

RULES:
1. Only use information from the context below
2. If the answer is not in the context, say "I couldn't find that information in the document"
3. Always cite your sources using [Source X] format
4. Be concise and accurate

CONTEXT:
${context}

QUESTION: ${question}

ANSWER:`;
}

/**
 * Generate an answer using RAG
 */
export async function generateAnswer(
    question: string,
    chunks: DocumentChunk[],
): Promise<string> {
    if (chunks.length === 0) {
        return "I couldn't find any relevant information in the document to answer your question.";
    }

    const client = getLLM();
    const prompt = buildPrompt(question, chunks);

    const response = await client.invoke(prompt);
    return response.content as string;
}
