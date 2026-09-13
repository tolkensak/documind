// src/lib/rag/vectorstore.ts
/**
 * Vector Store Client (Pinecone)
 *
 * What this does:
 * 1. Stores document embeddings in Pinecone
 * 2. Searches for similar embeddings when a question is asked
 * 3. Returns the most relevant chunks
 *
 * Pinecone Data Structure:
 * - Each vector has:
 *   - id: unique identifier
 *   - values: [0.1, 0.2, ...] (1536 dimensions)
 *   - metadata: { text, documentId, pageNumber, ... }
 *
 * Why Pinecone?
 * - Managed service (no infrastructure to maintain)
 * - Fast similarity search (millions of vectors in milliseconds)
 * - Free tier: 1 index, 100K vectors
 */

import { Pinecone, RecordMetadata } from "@pinecone-database/pinecone";

let pineconeClient: Pinecone | null = null;

/**
 * Get or create the Pinecone client (singleton)
 */
export function getPineconeClient(): Pinecone {
    if (!pineconeClient) {
        if (!process.env.PINECONE_API_KEY) {
            throw new Error("PINECONE_API_KEY is not set");
        }
        pineconeClient = new Pinecone({
            apiKey: process.env.PINECONE_API_KEY,
        });
    }
    return pineconeClient;
}

/**
 * Get the Pinecone index
 */
export function getPineconeIndex() {
    const client = getPineconeClient();
    const indexName = process.env.PINECONE_INDEX_NAME;
    if (!indexName) {
        throw new Error("PINECONE_INDEX_NAME is not set");
    }
    return client.index(indexName);
}

export interface DocumentChunk {
    id: string;
    text: string;
    documentId: string;
    documentName: string;
    pageNumber: number;
}

/**
 * Store document chunks in Pinecone
 *
 * @param chunks - Array of { id, text, documentId, ... }
 * @param vectors - Array of embedding vectors (same length as chunks)
 */
export async function storeChunks(
    chunks: DocumentChunk[],
    vectors: number[][],
): Promise<void> {
    const index = getPineconeIndex();

    const records = chunks.map((chunk, i) => ({
        id: chunk.id,
        values: vectors[i],
        metadata: {
            text: chunk.text,
            documentId: chunk.documentId,
            documentName: chunk.documentName,
            pageNumber: chunk.pageNumber,
        },
    }));

    // ✅ Pinecone recommends batching upserts (max 100 per request)
    // ✅ Pinecone SDK v4 requires { records: [...] } format
    const BATCH_SIZE = 100;
    for (let i = 0; i < records.length; i += BATCH_SIZE) {
        const batch = records.slice(i, i + BATCH_SIZE);
        await index.upsert({ records: batch });
    }
}

/**
 * Search for relevant chunks
 *
 * @param queryVector - The embedding vector of the question
 * @param topK - Number of results to return
 * @returns The most similar chunks
 */
export async function searchSimilarChunks(
    queryVector: number[],
    topK: number = 5,
): Promise<DocumentChunk[]> {
    const index = getPineconeIndex();

    const results = await index.query({
        vector: queryVector,
        topK,
        includeMetadata: true,
    });

    return results.matches.map((match) => ({
        id: match.id,
        text: (match.metadata?.text as string) || "",
        documentId: (match.metadata?.documentId as string) || "",
        documentName: (match.metadata?.documentName as string) || "",
        pageNumber: (match.metadata?.pageNumber as number) || 0,
    }));
}

/**
 * Delete all chunks for a document
 *
 * ✅ Fixed: Pass the filter directly (Pinecone SDK v4 format)
 */
export async function deleteDocumentChunks(documentId: string): Promise<void> {
    const index = getPineconeIndex();
    await index.deleteMany({
        filter: { documentId: { $eq: documentId } },
    });
}
