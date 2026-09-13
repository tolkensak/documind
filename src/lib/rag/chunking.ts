// src/lib/rag/chunking.ts
/**
 * Chunking Utility
 *
 * What this does:
 * 1. Splits long text into smaller chunks
 * 2. Preserves context with overlap
 *
 * Why chunk?
 * - LLMs have limited context windows
 * - Smaller chunks = more precise retrieval
 * - Overlap prevents losing context at boundaries
 *
 * Example:
 * Original: [========================================] (10,000 chars)
 * Chunks:   [=========] (1000 chars)
 *             [=========] (1000 chars, 200 overlap)
 *               [=========] (1000 chars, 200 overlap)
 */

import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { RAG_CONFIG } from "./config";

export interface TextChunk {
    text: string;
    pageNumber: number;
    chunkIndex: number;
}

/**
 * Split text into chunks using RecursiveCharacterTextSplitter
 *
 * This splitter tries to keep paragraphs and sentences together:
 * 1. First tries to split on \n\n (paragraphs)
 * 2. Then \n (lines)
 * 3. Then ". " (sentences)
 * 4. Finally " " (words)
 */
export async function chunkText(
    text: string,
    pageNumber: number,
    startIndex: number = 0,
): Promise<TextChunk[]> {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: RAG_CONFIG.chunkSize,
        chunkOverlap: RAG_CONFIG.chunkOverlap,
        separators: ["\n\n", "\n", ". ", " ", ""],
    });

    const chunks = await splitter.splitText(text);

    return chunks.map((chunkText, i) => ({
        text: chunkText,
        pageNumber,
        chunkIndex: startIndex + i,
    }));
}
