import type { LocatedEvidence, ModelEvidence, SourceLocation } from "@/lib/schema";
import type { NormalizedDoc } from "./types";

const NOT_FOUND: SourceLocation = {
  page: null,
  paragraph: null,
  charStart: null,
  charEnd: null,
};

/**
 * Whitespace-collapsed copy of `raw` plus `map`, where `map[i]` is the index in
 * `raw` of the i-th character of the collapsed string. Lets us match a quote
 * tolerantly (ignoring reflowed whitespace) yet report true source offsets.
 */
function normalizeWithMap(raw: string): { text: string; map: number[] } {
  const out: string[] = [];
  const map: number[] = [];
  let prevSpace = false;

  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (/\s/.test(ch)) {
      if (prevSpace) continue;
      out.push(" ");
      map.push(i);
      prevSpace = true;
    } else {
      out.push(ch);
      map.push(i);
      prevSpace = false;
    }
  }
  return { text: out.join(""), map };
}

let cache: { doc: NormalizedDoc; norm: ReturnType<typeof normalizeWithMap> } | null =
  null;

function normFor(doc: NormalizedDoc) {
  if (cache && cache.doc === doc) return cache.norm;
  const norm = normalizeWithMap(doc.fullText);
  cache = { doc, norm };
  return norm;
}

/**
 * Find a model-supplied verbatim quote in the document and resolve its location.
 * Falls back to matching the first 48 chars if the full quote does not match
 * exactly (the model occasionally trims or joins across a line break).
 */
export function locate(
  quote: string,
  doc: NormalizedDoc,
): { location: SourceLocation; matched: boolean } {
  const { text: haystack, map } = normFor(doc);
  const needle = quote.replace(/\s+/g, " ").trim();
  if (!needle) return { location: NOT_FOUND, matched: false };

  let at = haystack.indexOf(needle);
  let matchLen = needle.length;

  if (at === -1 && needle.length > 48) {
    const head = needle.slice(0, 48);
    at = haystack.indexOf(head);
    matchLen = head.length;
  }
  if (at === -1) return { location: NOT_FOUND, matched: false };

  const rawStart = map[at];
  const endIdx = Math.min(at + matchLen, map.length - 1);
  const rawEnd = map[endIdx] + 1;

  const seg =
    doc.segments.find((s) => rawStart >= s.charStart && rawStart <= s.charEnd) ??
    null;

  return {
    location: {
      page: seg?.page ?? null,
      paragraph: seg?.paragraph ?? null,
      charStart: rawStart,
      charEnd: rawEnd,
    },
    matched: true,
  };
}

export function locateEvidence(
  ev: ModelEvidence,
  doc: NormalizedDoc,
): LocatedEvidence {
  const { location, matched } = locate(ev.sourceText, doc);
  return { ...ev, location, matched };
}
