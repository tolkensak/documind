// src/components/ChatInterface.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import MessageBubble from "./MessageBubble";
import type { Message, QueryResponse } from "@/types";

interface ChatInterfaceProps {
    documentCount: number;
}

export default function ChatInterface({ documentCount }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    /**
     * Auto-scroll to the bottom when new messages arrive
     */
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    /**
     * Send a question to the RAG API
     */
    const handleSend = async () => {
        const question = input.trim();
        if (!question || isLoading) return;

        if (documentCount === 0) {
            toast.error("Please upload a document first");
            return;
        }

        // Add user message
        const userMessage: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: question,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/query", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Query failed");
            }

            const data: QueryResponse = await response.json();

            // Add AI response
            const aiMessage: Message = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: data.answer,
                sources: data.sources,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            toast.error(
                error instanceof Error ? error.message : "Query failed",
            );
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handle Enter key (Shift+Enter for new line)
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <Card className="flex flex-col h-[600px]">
            <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageSquare className="h-5 w-5" />
                    Chat with your documents
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                {/* Messages area - ✅ Added min-h-0 and h-full */}
                <div className="flex-1 min-h-0">
                    <ScrollArea className="h-full">
                        <div className="p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                    <p className="text-sm font-medium">
                                        Ask a question about your documents
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {documentCount === 0
                                            ? "Upload a PDF first to get started"
                                            : `You have ${documentCount} document${documentCount === 1 ? "" : "s"} ready`}
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => (
                                    <MessageBubble
                                        key={message.id}
                                        message={message}
                                    />
                                ))
                            )}

                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    </div>
                                    <div className="bg-muted rounded-lg px-4 py-3">
                                        <p className="text-sm text-muted-foreground">
                                            Thinking...
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>

                {/* Input area - ✅ Kept at the bottom */}
                <div className="border-t p-4 shrink-0">
                    <div className="flex gap-2">
                        <Textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask a question about your documents..."
                            className="min-h-[60px] resize-none"
                            disabled={isLoading}
                        />
                        <Button
                            onClick={handleSend}
                            disabled={isLoading || !input.trim()}
                            size="icon"
                            className="h-[60px] w-[60px] shrink-0"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Press{" "}
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                            Enter
                        </kbd>{" "}
                        to send,{" "}
                        <kbd className="px-1 py-0.5 bg-muted rounded text-xs">
                            Shift+Enter
                        </kbd>{" "}
                        for a new line
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
