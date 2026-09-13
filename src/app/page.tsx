// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { FileText, Sparkles, BookOpen, Shield } from "lucide-react";
import Link from "next/link";
import FileUpload from "@/components/FileUpload";
import ChatInterface from "@/components/ChatInterface";
import type { DocumentMetadata } from "@/types";

const STORAGE_KEY = "documind-documents";

export default function HomePage() {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // ✅ Load documents from localStorage on mount
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setDocuments(JSON.parse(stored));
            }
        } catch (error) {
            console.error("Failed to load documents:", error);
        }
        setIsLoaded(true);
    }, []);

    // ✅ Save documents to localStorage when they change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(documents));
        }
    }, [documents, isLoaded]);

    /**
     * Called when a document is uploaded successfully
     */
    const handleUploadComplete = (doc: DocumentMetadata) => {
        setDocuments((prev) => [...prev, doc]);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                            <Sparkles className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <h1 className="text-xl font-bold">DocuMind</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        {documents.map((doc) => (
                            <Link
                                key={doc.id}
                                href="/documents"
                                className="p-3 border rounded-lg flex items-center justify-between hover:bg-muted/50 transition-colors"
                            >
                                Documents
                            </Link>
                        ))}
                        <p className="text-sm text-muted-foreground">
                            AI-powered document Q&A
                        </p>
                    </div>
                </div>
            </header>
            {/* Hero section */}
            <section className="border-b bg-muted/30">
                <div className="container mx-auto px-4 py-12 text-center">
                    <h2 className="text-4xl font-bold tracking-tight mb-4">
                        Ask questions. Get answers.
                        <br />
                        <span className="text-primary">
                            From your own documents.
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Upload a PDF and get instant answers with page-level
                        citations. Powered by RAG (Retrieval-Augmented
                        Generation).
                    </p>
                </div>
            </section>

            {/* Features */}
            <section className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Upload PDFs</h3>
                            <p className="text-sm text-muted-foreground">
                                Drag and drop any PDF up to 10 MB
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">
                                AI-Powered Answers
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Get responses grounded in your actual documents
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <Shield className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Source Citations</h3>
                            <p className="text-sm text-muted-foreground">
                                Every answer cites the exact page
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main content */}
            <section className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: Upload + Documents */}
                    <div className="space-y-6">
                        <FileUpload onUploadComplete={handleUploadComplete} />

                        {/* Documents list */}
                        {documents.length > 0 && (
                            <div className="space-y-2">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Your Documents ({documents.length})
                                </h3>
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-3 border rounded-lg flex items-center justify-between"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">
                                                {doc.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {doc.pageCount} pages ·{" "}
                                                {doc.chunkCount} chunks
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {new Date(
                                                doc.uploadedAt,
                                            ).toLocaleTimeString()}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Right: Chat */}
                    <ChatInterface documentCount={documents.length} />
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t mt-12">
                <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
                    Built with Next.js, LangChain, Groq, OpenAI, and Pinecone
                </div>
            </footer>
        </div>
    );
}
