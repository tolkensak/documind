// src/app/api/documents/[documentId]/route.ts
/**
 * Document Deletion API
 *
 * DELETE /api/documents/[documentId]
 *
 * Removes all chunks for a document from Pinecone
 */

import { NextRequest, NextResponse } from "next/server";
import { deleteDocumentChunks } from "@/lib/rag/vectorstore";
import { validateEnv } from "@/lib/rag/config";

export const maxDuration = 60;
export const runtime = "nodejs";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ documentId: string }> },
) {
    try {
        validateEnv();

        const { documentId } = await params;

        if (!documentId) {
            return NextResponse.json(
                { error: "Document ID is required" },
                { status: 400 },
            );
        }

        console.log(`🗑️ Deleting document: ${documentId}`);

        await deleteDocumentChunks(documentId);

        console.log(`✅ Document deleted`);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("❌ Delete error:", error);
        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : "Delete failed",
            },
            { status: 500 },
        );
    }
}
