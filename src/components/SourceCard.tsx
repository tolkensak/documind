// src/components/SourceCard.tsx
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import type { Source } from "@/types";

interface SourceCardProps {
    source: Source;
}

export default function SourceCard({ source }: SourceCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <Card className="overflow-hidden">
            <CardContent className="p-3">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                        <Badge variant="secondary" className="shrink-0">
                            Source {source.sourceNumber}
                        </Badge>
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground truncate">
                            {source.documentName}
                        </span>
                        <Badge variant="outline" className="shrink-0 text-xs">
                            Page {source.pageNumber}
                        </Badge>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="shrink-0"
                    >
                        {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                        ) : (
                            <ChevronDown className="h-4 w-4" />
                        )}
                    </Button>
                </div>

                {isExpanded && (
                    <div className="mt-3 p-3 bg-muted rounded-md text-sm text-muted-foreground">
                        "{source.text}"
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
