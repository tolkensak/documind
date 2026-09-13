// src/lib/rag/pdf.ts
/**
 * PDF Parser
 *
 * Uses pdf-parse-new (a community fork of pdf-parse with the debug bug fixed)
 */

import pdfParse from "pdf-parse-new";

export interface ParsedPage {
    pageNumber: number;
    text: string;
}

export interface ParsedPDF {
    fileName: string;
    pageCount: number;
    pages: ParsedPage[];
    totalCharacters: number;
}

export async function parsePDF(
    buffer: Buffer,
    fileName: string,
): Promise<ParsedPDF> {
    const pages: ParsedPage[] = [];
    let currentPage = 0;

    const options = {
        pagerender: (pageData: any) => {
            currentPage++;
            const pageNum = currentPage;

            return pageData.getTextContent().then((content: any) => {
                const text = content.items
                    .map((item: any) => item.str)
                    .join(" ")
                    .replace(/\s+/g, " ")
                    .trim();

                pages.push({ pageNumber: pageNum, text });
                return text;
            });
        },
    };

    const result = await pdfParse(buffer, options);

    return {
        fileName,
        pageCount: result.numpages,
        pages: pages.sort((a, b) => a.pageNumber - b.pageNumber),
        totalCharacters: pages.reduce((sum, p) => sum + p.text.length, 0),
    };
}
