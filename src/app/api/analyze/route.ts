import { NextResponse } from "next/server";
import { analyzeContract } from "@/lib/analyze";
import { AnalysisError } from "@/lib/errors";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

function errorResponse(code: string, message: string, status: number) {
  return NextResponse.json({ error: { code, message } }, { status });
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("input", "Expected a multipart form upload.", 400);
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return errorResponse("input", "No file field in the request.", 400);
  }

  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  const isPdf = ext === "pdf" || file.type === "application/pdf";
  const isDocx =
    ext === "docx" ||
    file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  if (!isPdf && !isDocx) {
    return errorResponse("input", "Upload a PDF or .docx file.", 415);
  }
  if (file.size === 0) {
    return errorResponse("input", "The uploaded file is empty.", 400);
  }
  if (file.size > MAX_BYTES) {
    return errorResponse(
      "input",
      "File exceeds the 10 MB limit. On Vercel Hobby the effective limit is ~4.5 MB.",
      413,
    );
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const analysis = await analyzeContract({
      name: file.name,
      fileType: isPdf ? "pdf" : "docx",
      buffer,
    });
    return NextResponse.json(analysis);
  } catch (err) {
    if (err instanceof AnalysisError) {
      return errorResponse(err.code, err.message, err.httpStatus);
    }
    console.error("[analyze] unexpected error", err);
    return errorResponse(
      "internal",
      "Unexpected error while analysing the contract.",
      500,
    );
  }
}
