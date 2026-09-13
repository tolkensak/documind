// src/app/api/upload/route.ts
/**
 * PDF Upload API
 *
 * Flow:
 * 1. Receives a PDF file from the client
 * 2. Parses the PDF into text (per page)
 * 3. Chunks each page
 * 4. Generates embeddings for all chunks
 * 5. Stores chunks + embeddings in Pinecone
 * 6. Returns document metadata
 *
 * This is a POST endpoint: /api/upload
 */

import { NextRequest, NextResponse } from "next/server";
import { parsePDF } from "@/lib/rag/pdf";
import { chunkText } from "@/lib/rag/chunking";
import { embedDocuments } from "@/lib/rag/embeddings";
import { storeChunks, type DocumentChunk } from "@/lib/rag/vectorstore";
import { validateEnv } from "@/lib/rag/config";
import { randomUUID } from "crypto";

// ✅ Next.js App Router: increase body size limit for PDFs
export const maxDuration = 10; // seconds (Vercel limit)
export const runtime = "nodejs"; // pdf-parse needs Node.js
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
    try {
        // ✅ Validate environment
        validateEnv();

        // ✅ Get the file from the form data
        const formData = await request.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json(
                { error: "No file uploaded" },
                { status: 400 },
            );
        }

        // ✅ Validate file type
        if (file.type !== "application/pdf") {
            return NextResponse.json(
                { error: "Only PDF files are supported" },
                { status: 400 },
            );
        }

        // ✅ Validate file size (10 MB max)
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: "File is too large (max 10 MB)" },
                { status: 400 },
            );
        }

        console.log(
            `📄 Uploading: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
        );

        // ✅ Convert file to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ Parse PDF
        const parsed = await parsePDF(buffer, file.name);
        console.log(
            `✅ Parsed ${parsed.pageCount} pages (${parsed.totalCharacters} chars)`,
        );

        // ✅ Generate a unique document ID
        const documentId = randomUUID();

        // ✅ Chunk each page
        const allChunks: DocumentChunk[] = [];

        for (const page of parsed.pages) {
            const pageChunks = await chunkText(page.text, page.pageNumber);

            for (const chunk of pageChunks) {
                allChunks.push({
                    id: `${documentId}-${chunk.chunkIndex}`,
                    text: chunk.text,
                    documentId,
                    documentName: parsed.fileName,
                    pageNumber: chunk.pageNumber,
                });
            }
        }

        console.log(`✅ Created ${allChunks.length} chunks`);

        // ✅ Generate embeddings (batch)
        const texts = allChunks.map((c) => c.text);
        const vectors = await embedDocuments(texts);
        console.log(`✅ Generated ${vectors.length} embeddings`);

        // ✅ Store in Pinecone
        await storeChunks(allChunks, vectors);
        console.log(`✅ Stored in Pinecone`);

        // ✅ Return metadata
        return NextResponse.json({
            success: true,
            document: {
                id: documentId,
                name: parsed.fileName,
                pageCount: parsed.pageCount,
                chunkCount: allChunks.length,
                totalCharacters: parsed.totalCharacters,
                uploadedAt: new Date().toISOString(),
            },
        });
    } catch (error) {
        console.error("❌ Upload error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Upload failed",
            },
            { status: 500 },
        );
    }
}
