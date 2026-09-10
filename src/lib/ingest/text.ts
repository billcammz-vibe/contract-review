import type { DocSegment, NormalizedDoc } from "./types";

const SEGMENT_SEPARATOR = "\n\n";

/**
 * Assemble ordered document parts into a {@link NormalizedDoc}, computing the
 * character offsets that let evidence quotes be traced back to a page/paragraph.
 */
export function assembleDoc(
  parts: Array<{ page: number | null; paragraph: number | null; text: string }>,
  meta: Omit<NormalizedDoc["meta"], "wordCount">,
): NormalizedDoc {
  const segments: DocSegment[] = [];
  const chunks: string[] = [];
  let cursor = 0;

  parts.forEach((part, index) => {
    const text = part.text;
    const charStart = cursor;
    const charEnd = charStart + text.length;
    segments.push({
      index,
      page: part.page,
      paragraph: part.paragraph,
      text,
      charStart,
      charEnd,
    });
    chunks.push(text);
    cursor = charEnd + SEGMENT_SEPARATOR.length;
  });

  const fullText = chunks.join(SEGMENT_SEPARATOR);
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;

  return { fullText, segments, meta: { ...meta, wordCount } };
}
