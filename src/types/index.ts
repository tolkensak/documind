// src/types/index.ts

/**
 * Document metadata returned after upload
 */
export interface DocumentMetadata {
    id: string;
    name: string;
    pageCount: number;
    chunkCount: number;
    totalCharacters: number;
    uploadedAt: string;
}

/**
 * A source chunk returned with an answer
 */
export interface Source {
    id: string;
    sourceNumber: number;
    documentId: string;
    documentName: string;
    pageNumber: number;
    text: string;
}

/**
 * A question + answer pair in the chat
 */
export interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    sources?: Source[];
    timestamp: Date;
}

/**
 * The upload API response
 */
export interface UploadResponse {
    success: boolean;
    document: DocumentMetadata;
}

/**
 * The query API response
 */
export interface QueryResponse {
    answer: string;
    sources: Source[];
}
