// src/app/api/query/route.ts
/**
 * RAG Query API
 *
 * Flow:
 * 1. Receives a question from the client
 * 2. Embeds the question (OpenAI)
 * 3. Searches Pinecone for the top 5 most similar chunks
 * 4. Sends question + chunks to Groq
 * 5. Returns the answer + source citations
 *
 * This is a POST endpoint: /api/query
 */

import { NextRequest, NextResponse } from "next/server";
import { embedText } from "@/lib/rag/embeddings";
import { searchSimilarChunks } from "@/lib/rag/vectorstore";
import { generateAnswer } from "@/lib/rag/llm";
import { validateEnv, RAG_CONFIG } from "@/lib/rag/config";

export const maxDuration = 10;
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
    try {
        // ✅ Validate environment
        validateEnv();

        // ✅ Get the question
        const body = await request.json();
        const question = body.question as string;

        if (!question || question.trim().length === 0) {
            return NextResponse.json(
                { error: "Question is required" },
                { status: 400 },
            );
        }

        console.log(`❓ Question: "${question}"`);

        // ✅ Step 1: Embed the question
        const queryVector = await embedText(question);
        console.log(`✅ Embedded question (${queryVector.length} dimensions)`);

        // ✅ Step 2: Search Pinecone for relevant chunks
        const chunks = await searchSimilarChunks(queryVector, RAG_CONFIG.topK);
        console.log(`✅ Found ${chunks.length} relevant chunks`);

        if (chunks.length === 0) {
            return NextResponse.json({
                answer: "I couldn't find any relevant information in the uploaded documents.",
                sources: [],
            });
        }

        // ✅ Step 3: Generate the answer using Groq
        const answer = await generateAnswer(question, chunks);
        console.log(`✅ Generated answer (${answer.length} chars)`);

        // ✅ Step 4: Return answer + citations
        return NextResponse.json({
            answer,
            sources: chunks.map((chunk, i) => ({
                id: chunk.id,
                sourceNumber: i + 1,
                documentId: chunk.documentId,
                documentName: chunk.documentName,
                pageNumber: chunk.pageNumber,
                text: chunk.text,
            })),
        });
    } catch (error) {
        console.error("❌ Query error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Query failed",
            },
            { status: 500 },
        );
    }
}
