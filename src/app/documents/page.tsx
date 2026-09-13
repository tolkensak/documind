// src/app/documents/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText,
    Trash2,
    ArrowLeft,
    BookOpen,
    Hash,
    Calendar,
    Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import type { DocumentMetadata } from "@/types";

const STORAGE_KEY = "documind-documents";

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<DocumentMetadata[]>([]);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    // ✅ Load documents from localStorage
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

    // ✅ Handle delete
    const handleDelete = async (documentId: string) => {
        setDeletingId(documentId);

        try {
            const response = await fetch(`/api/documents/${documentId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Delete failed");
            }

            // Remove from state and localStorage
            const updated = documents.filter((doc) => doc.id !== documentId);
            setDocuments(updated);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

            toast.success("Document deleted");
        } catch (error) {
            console.error("Delete error:", error);
            toast.error(
                error instanceof Error ? error.message : "Delete failed",
            );
        } finally {
            setDeletingId(null);
        }
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b">
                <div className="container mx-auto px-4 py-4">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Chat
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <FileText className="h-6 w-6" />
                        Your Documents
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        {documents.length} document
                        {documents.length === 1 ? "" : "s"} in your library
                    </p>
                </div>
            </header>

            {/* Documents list */}
            <section className="container mx-auto px-4 py-8">
                {documents.length === 0 ? (
                    <Card>
                        <CardContent className="py-16 text-center">
                            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h2 className="text-lg font-semibold mb-2">
                                No documents yet
                            </h2>
                            <p className="text-sm text-muted-foreground mb-6">
                                Upload your first PDF to start asking questions
                            </p>
                            <Button asChild>
                                <Link href="/">Upload a PDF</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {documents.map((doc) => (
                            <Card
                                key={doc.id}
                                className="hover:shadow-md transition-shadow"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex gap-4 min-w-0 flex-1">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-semibold truncate">
                                                    {doc.name}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <BookOpen className="h-3 w-3" />
                                                        {doc.pageCount} pages
                                                    </Badge>
                                                    <Badge
                                                        variant="secondary"
                                                        className="gap-1"
                                                    >
                                                        <Hash className="h-3 w-3" />
                                                        {doc.chunkCount} chunks
                                                    </Badge>
                                                    <Badge
                                                        variant="outline"
                                                        className="gap-1"
                                                    >
                                                        <Calendar className="h-3 w-3" />
                                                        {new Date(
                                                            doc.uploadedAt,
                                                        ).toLocaleDateString()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                                                    disabled={
                                                        deletingId === doc.id
                                                    }
                                                >
                                                    {deletingId === doc.id ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>
                                                        Delete document?
                                                    </AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will permanently
                                                        delete "{doc.name}" and
                                                        all its chunks from
                                                        Pinecone. This action
                                                        cannot be undone.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>
                                                        Cancel
                                                    </AlertDialogCancel>
                                                    <AlertDialogAction
                                                        onClick={() =>
                                                            handleDelete(doc.id)
                                                        }
                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                    >
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
