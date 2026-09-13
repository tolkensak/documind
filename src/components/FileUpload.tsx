// src/components/FileUpload.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { DocumentMetadata, UploadResponse } from "@/types";

interface FileUploadProps {
    onUploadComplete?: (document: DocumentMetadata) => void;
}

export default function FileUpload({ onUploadComplete }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    /**
     * Handle file selection and upload
     */
    const uploadFile = useCallback(
        async (file: File) => {
            // Validate file type
            if (file.type !== "application/pdf") {
                toast.error("Only PDF files are supported");
                return;
            }

            // Validate file size (10 MB max)
            if (file.size > 10 * 1024 * 1024) {
                toast.error("File is too large (max 10 MB)");
                return;
            }

            setIsUploading(true);

            try {
                const formData = new FormData();
                formData.append("file", file);

                const response = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || "Upload failed");
                }

                const data: UploadResponse = await response.json();

                toast.success(`Uploaded "${data.document.name}"`, {
                    description: `${data.document.pageCount} pages, ${data.document.chunkCount} chunks`,
                });

                onUploadComplete?.(data.document);
            } catch (error) {
                console.error("Upload error:", error);
                toast.error(
                    error instanceof Error ? error.message : "Upload failed",
                );
            } finally {
                setIsUploading(false);
            }
        },
        [onUploadComplete],
    );

    /**
     * Handle drag over
     */
    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    /**
     * Handle drag leave
     */
    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    /**
     * Handle drop
     */
    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);

            const files = Array.from(e.dataTransfer.files);
            if (files.length > 0) {
                uploadFile(files[0]);
            }
        },
        [uploadFile],
    );

    /**
     * Handle click to browse
     */
    const handleClick = () => {
        fileInputRef.current?.click();
    };

    /**
     * Handle file input change
     */
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            uploadFile(files[0]);
        }
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={handleClick}
                    className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            transition-colors duration-200
            ${
                isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50"
            }
            ${isUploading ? "pointer-events-none opacity-60" : ""}
          `}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="h-12 w-12 text-primary animate-spin" />
                            <p className="text-sm font-medium">
                                Uploading and processing...
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Parsing PDF, generating embeddings, storing in
                                Pinecone
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-3">
                            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                {isDragging ? (
                                    <FileText className="h-6 w-6 text-primary" />
                                ) : (
                                    <Upload className="h-6 w-6 text-primary" />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    {isDragging
                                        ? "Drop your PDF here"
                                        : "Upload a PDF"}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Drag and drop or click to browse
                                </p>
                            </div>
                            <Button size="sm" variant="outline" type="button">
                                Choose File
                            </Button>
                            <p className="text-xs text-muted-foreground">
                                PDF only · Max 10 MB
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
