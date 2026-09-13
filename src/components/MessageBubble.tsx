// src/components/MessageBubble.tsx
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bot, User } from "lucide-react";
import SourceCard from "./SourceCard";
import type { Message } from "@/types";

interface MessageBubbleProps {
    message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === "user";

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
            <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback
                    className={
                        isUser
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                    }
                >
                    {isUser ? (
                        <User className="h-4 w-4" />
                    ) : (
                        <Bot className="h-4 w-4" />
                    )}
                </AvatarFallback>
            </Avatar>

            <div className={`flex-1 max-w-3xl ${isUser ? "items-end" : ""}`}>
                <div
                    className={`
            rounded-lg px-4 py-3
            ${
                isUser
                    ? "bg-primary text-primary-foreground ml-auto w-fit max-w-full"
                    : "bg-muted"
            }
          `}
                >
                    <p className="text-sm whitespace-pre-wrap">
                        {message.content}
                    </p>
                </div>

                {/* Show sources if available */}
                {!isUser && message.sources && message.sources.length > 0 && (
                    <div className="mt-3 space-y-2">
                        <p className="text-xs text-muted-foreground font-medium">
                            📚 Sources ({message.sources.length})
                        </p>
                        {message.sources.map((source) => (
                            <SourceCard key={source.id} source={source} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
