declare module "pdf-parse/lib/pdf-parse.js" {
  interface PdfParseResult {
    numpages: number;
    numrender: number;
    info: Record<string, unknown>;
    metadata: unknown;
    version: string;
    text: string;
  }
  interface PdfParseOptions {
    /** Called once per page; return value is concatenated into `.text`. */
    pagerender?: (pageData: PdfPageProxy) => Promise<string> | string;
    max?: number;
    version?: string;
  }
  interface PdfTextItem {
    str: string;
    transform: number[];
    width: number;
    height: number;
  }
  interface PdfPageProxy {
    getTextContent(opts?: {
      normalizeWhitespace?: boolean;
      disableCombineTextItems?: boolean;
    }): Promise<{ items: PdfTextItem[] }>;
  }
  function pdf(
    dataBuffer: Buffer | Uint8Array,
    options?: PdfParseOptions,
  ): Promise<PdfParseResult>;
  export default pdf;
}

declare module "mammoth" {
  interface ExtractResult {
    value: string;
    messages: unknown[];
  }
  interface ExtractInput {
    buffer?: Buffer;
    path?: string;
    arrayBuffer?: ArrayBuffer;
  }
  export function extractRawText(input: ExtractInput): Promise<ExtractResult>;
  export function convertToHtml(input: ExtractInput): Promise<ExtractResult>;
  const _default: {
    extractRawText: typeof extractRawText;
    convertToHtml: typeof convertToHtml;
  };
  export default _default;
}
