import pdf from "pdf-parse/lib/pdf-parse.js";
import { assembleDoc } from "./text";
import type { NormalizedDoc } from "./types";

/**
 * Extract text from a PDF one page at a time so every span keeps a page number.
 * `pdf-parse` invokes `pagerender` sequentially for pages 1..N, so push order
 * equals page order.
 */
export async function ingestPdf(
  buffer: Buffer,
  fileName: string,
): Promise<NormalizedDoc> {
  const pages: string[] = [];

  const data = await pdf(buffer, {
    pagerender: async (pageData) => {
      const content = await pageData.getTextContent();
      const lines: string[] = [];
      let lastY: number | undefined;
      let line = "";

      for (const item of content.items) {
        const y = item.transform?.[5];
        if (lastY !== undefined && y !== undefined && Math.abs(y - lastY) > 1) {
          lines.push(line.trim());
          line = "";
        }
        line += item.str;
        if (!item.str.endsWith(" ")) line += " ";
        lastY = y;
      }
      if (line.trim()) lines.push(line.trim());

      const text = lines
        .join("\n")
        .replace(/[ \t]{2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .trim();
      pages.push(text);
      return text;
    },
  });

  const parts = pages.map((text, i) => ({ page: i + 1, paragraph: null, text }));
  return assembleDoc(parts, {
    fileName,
    fileType: "pdf",
    pageCount: data.numpages || pages.length,
  });
}
