# Contract Review

Upload a contract (PDF or `.docx`) and get back a structured analysis:

- **Clause extraction** into a strict, typed schema — parties, dates, term, renewal, termination, liability cap, indemnification, governing law, confidentiality, payment, assignment — each item carrying the **verbatim source text** and its **page / paragraph location**.
- **Risk analysis** — clauses that are missing, one-sided, non-standard, ambiguous, or onerous, each with a **severity** (high / medium / low) and a one-line explanation.
- **Playbook comparison** — the contract scored item-by-item against a JSON playbook of preferred positions, each marked **MEETS**, **DEVIATES**, or **MISSING** with the gap explained.
- **Dashboard + export** — a risk-by-severity summary, a playbook scorecard, an itemised clause table, and one-click export to JSON or a formatted Markdown summary.

Built with Next.js (App Router) + TypeScript + Tailwind, and the Anthropic API using **tool use for structured output** validated against a Zod schema.

![Contract Review dashboard](docs/screenshot.png)

> _Screenshot placeholder — run the app locally and drop a real screenshot at `docs/screenshot.png`._

---

## Why this design

A single contract fits comfortably in Claude's context window, so the whole document text is passed directly to the model. **There is no vector database and no RAG pipeline** — this is an extraction-and-analysis task, not a retrieval task. Chunking a contract would only throw away the cross-references (definitions, "Excluded Claims", section pointers) that the analysis depends on.

### Structured output is enforced, not hoped for

Reliability is the point of the project, so model output is constrained on both ends:

1. **Zod schemas are the single source of truth** (`src/lib/schema/`). TypeScript types are inferred from them — the schema and the types can never drift.
2. A **JSON Schema is derived** from the Zod schema (`zod-to-json-schema`) and handed to Claude as an Anthropic **tool `input_schema`**. The call uses `tool_choice: { type: "tool" }`, so the model *must* respond with a tool call matching that shape.
3. The returned arguments are **parsed back through the same Zod schema** (`src/lib/anthropic.ts`). Extra cross-field rules run here too — e.g. every clause category must be present exactly once, and a clause's `value.kind` must match its `clauseType`.
4. On a validation failure the Zod issues are **fed back to the model once** for a repair attempt. A second failure raises a typed `AnalysisError` that the UI renders cleanly.

Nothing downstream — the scorecard, the dashboard, the exports — ever sees unvalidated model output.

### Provenance without trusting the model for offsets

The model is asked only for **verbatim quotes**, never for character offsets. The ingestion layer keeps a segment map (one segment per PDF page or DOCX paragraph, with character ranges) and **locates each quote itself** (`src/lib/ingest/locate.ts`), resolving it to a page or paragraph. If a quote can't be found it's flagged in the UI rather than shown with a fake location.

---

## Architecture

```
Upload (PDF | DOCX)
      │
      ▼
  src/lib/ingest/            pdf-parse  → text per page  (page numbers)
    ingest()                 mammoth    → text per paragraph
      → NormalizedDoc { fullText, segments[], meta }
      │
      ▼
  src/lib/extraction/        Anthropic call #1 — forced tool: submit_contract_analysis
    runExtraction(doc)       → { documentSummary, clauses[], risks[] }   (Zod-validated)
      │
      ▼
  src/lib/playbook/          Anthropic call #2 — forced tool: submit_playbook_comparison
    comparePlaybook(...)     → { comparisons[] }                          (Zod-validated)
      │
      ▼
  src/lib/ingest/locate      resolve every evidence quote → { page | paragraph, charStart, charEnd }
  src/lib/scorecard          derive risk counts + playbook score (deterministic, never model-generated)
      │
      ▼
  ContractAnalysis  →  POST /api/analyze response  →  Dashboard  →  JSON / Markdown export
```

The three stages are separate, well-typed modules:

| Module | Responsibility |
|---|---|
| `src/lib/ingest/` | PDF/DOCX → normalised text + segment map; quote-to-location resolver |
| `src/lib/extraction/` | Model call #1: clause schema + risk flags. Prompt + tool wiring only |
| `src/lib/playbook/` | Model call #2: compare against `default-playbook.json`. Prompt + tool wiring only |
| `src/lib/schema/` | Zod schemas → inferred TS types → derived JSON Schemas |
| `src/lib/anthropic.ts` | The `callStructured` helper: forced tool use + Zod validation + one repair retry |
| `src/lib/scorecard.ts` | Deterministic scorecard from validated results |
| `src/lib/export.ts` | `toJsonString` / `toMarkdownSummary` (pure) |
| `src/lib/analyze.ts` | Orchestrates the pipeline end to end |

The playbook lives at `src/lib/playbook/default-playbook.json` and is validated at module load. Edit it to change the standard positions — the shape is enforced by `playbookSchema`.

---

## Setup

Requires Node 18.17+.

```bash
git clone <your-fork-url> contract-review
cd contract-review
npm install

cp .env.example .env
# then edit .env and set ANTHROPIC_API_KEY

npm run samples   # optional: writes two test contracts into sample-contracts/
npm run dev       # http://localhost:3000
```

### Environment variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `ANTHROPIC_API_KEY` | yes | — | Create at <https://console.anthropic.com/settings/keys> |
| `ANTHROPIC_MODEL` | no | `claude-sonnet-5` | Any current Claude model id. Use `claude-opus-5` for maximum accuracy. |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | Next / ESLint |
| `npm run samples` | Generate `sample-contracts/*.docx` + `*.pdf` |

### Test files

Drop any `.pdf` or `.docx` into `sample-contracts/`, or just upload through the UI (nothing needs to be on disk — the API route reads the upload in memory and stores nothing). `npm run samples` generates two contrasting examples; see [`sample-contracts/README.md`](sample-contracts/README.md).

---

## Deploy to Vercel

1. Push the repo to GitHub.
2. In Vercel, **New Project → import the repo**. Framework preset: **Next.js** (auto-detected).
3. **Settings → Environment Variables**: add `ANTHROPIC_API_KEY` (and optionally `ANTHROPIC_MODEL`) for Production, Preview, and Development.
4. Deploy.

Notes:

- `/api/analyze` runs on the **Node.js runtime** with `maxDuration = 60`. On Vercel Hobby the effective request-body limit is ~4.5 MB (the app's own limit is 10 MB); large contracts may need Pro.
- The two Claude calls typically complete in 20–45s well under the 60s function limit.
- No database, no storage, no other services to provision.

---

## Extraction schema (summary)

Full definitions in `src/lib/schema/`. The top-level `ContractAnalysis` returned by the API:

```ts
interface ContractAnalysis {
  schemaVersion: "1.0";
  meta: { fileName; fileType: "pdf" | "docx"; pageCount; wordCount; model; analyzedAt; durationMs };
  documentSummary: string;
  clauses: AnalysedClause[];        // exactly one per clause category
  risks: AnalysedRisk[];            // severity + issueType + verbatim evidence
  playbook: AnalysedPlaybookItem[]; // meets | deviates | missing, per playbook item
  scorecard: {
    risk: { high; medium; low; total };
    playbook: { meets; deviates; missing; total; score /* 0-100 */ };
  };
}
```

Each `AnalysedClause` carries a discriminated-union `value` (`kind` matches `clauseType`) with typed fields per category — e.g. `liability_cap` has `capType`, `lookbackMonths`, `multiple`, `mutual`, `carveouts[]` — plus `evidence: LocatedEvidence[]`, where each entry is `{ sourceText, confidence, location: { page, paragraph, charStart, charEnd }, matched }`.
