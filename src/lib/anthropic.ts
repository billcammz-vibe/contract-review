import Anthropic from "@anthropic-ai/sdk";
import type { ZodTypeAny, z } from "zod";
import { AnalysisError } from "./errors";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AnalysisError(
      "config",
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.",
    );
  }
  return (client ??= new Anthropic());
}

interface StructuredCallOptions<S extends ZodTypeAny> {
  system: string;
  user: string;
  toolName: string;
  toolDescription: string;
  inputSchema: Record<string, unknown>;
  schema: S;
  maxTokens?: number;
}

/**
 * Call Claude with a single forced tool whose input must satisfy `inputSchema`,
 * then validate the returned arguments against `schema`. On a validation failure
 * the Zod issues are fed back once for the model to repair; a second failure
 * throws. This is the reliability boundary of the app — nothing downstream sees
 * unvalidated model output.
 */
export async function callStructured<S extends ZodTypeAny>(
  opts: StructuredCallOptions<S>,
): Promise<z.infer<S>> {
  const anthropic = getClient();
  const tools = [
    {
      name: opts.toolName,
      description: opts.toolDescription,
      input_schema: opts.inputSchema as Anthropic.Tool.InputSchema,
    },
  ];
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: opts.user },
  ];

  for (let attempt = 0; attempt < 2; attempt++) {
    let response: Anthropic.Message;
    try {
      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: opts.maxTokens ?? 16000,
        system: opts.system,
        tools,
        tool_choice: { type: "tool", name: opts.toolName },
        messages,
      });
    } catch (err) {
      if (err instanceof Anthropic.APIError) {
        throw new AnalysisError(
          "model",
          `Anthropic API error (${err.status ?? "?"}): ${err.message}`,
        );
      }
      throw err;
    }

    const toolUse = response.content.find(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );
    if (!toolUse) {
      throw new AnalysisError(
        "model",
        "The model did not return a structured tool call.",
      );
    }

    const parsed = opts.schema.safeParse(toolUse.input);
    if (parsed.success) return parsed.data;

    const issues = parsed.error.issues
      .slice(0, 12)
      .map((i) => `- ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");

    if (attempt === 0) {
      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [
          {
            type: "tool_result",
            tool_use_id: toolUse.id,
            is_error: true,
            content: `Your \`${opts.toolName}\` arguments failed schema validation. Fix exactly these issues and call the tool again:\n${issues}`,
          },
        ],
      });
      continue;
    }

    throw new AnalysisError(
      "validation",
      `Model output failed schema validation after one repair attempt:\n${issues}`,
    );
  }

  // Unreachable: the loop either returns or throws.
  throw new AnalysisError("model", "structured call did not resolve");
}
