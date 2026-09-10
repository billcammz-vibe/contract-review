/** A contiguous span of the source document (a PDF page or a DOCX paragraph). */
export interface DocSegment {
  index: number;
  /** 1-indexed page number (PDF) or null (DOCX). */
  page: number | null;
  /** 0-indexed paragraph number (DOCX) or null (PDF). */
  paragraph: number | null;
  text: string;
  /** Offset of this segment's first char within `NormalizedDoc.fullText`. */
  charStart: number;
  /** Offset one past this segment's last char. */
  charEnd: number;
}

export interface NormalizedDoc {
  /** The whole contract as one string; segments join with "\n\n". */
  fullText: string;
  segments: DocSegment[];
  meta: {
    fileName: string;
    fileType: "pdf" | "docx";
    pageCount: number | null;
    wordCount: number;
  };
}

export interface RawFile {
  name: string;
  fileType: "pdf" | "docx";
  buffer: Buffer;
}
