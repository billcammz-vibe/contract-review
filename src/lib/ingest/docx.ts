import mammoth from "mammoth";
import { assembleDoc } from "./text";
import type { NormalizedDoc } from "./types";

/** Extract text from a .docx, one segment per non-empty paragraph. */
export async function ingestDocx(
  buffer: Buffer,
  fileName: string,
): Promise<NormalizedDoc> {
  const { value } = await mammoth.extractRawText({ buffer });

  const paragraphs = value
    .split(/\r?\n/)
    .map((p) => p.replace(/[ \t]{2,}/g, " ").trim())
    .filter((p) => p.length > 0);

  const parts = paragraphs.map((text, i) => ({
    page: null,
    paragraph: i,
    text,
  }));

  return assembleDoc(parts, { fileName, fileType: "docx", pageCount: null });
}
