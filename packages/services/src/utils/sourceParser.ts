import type { Source } from "../types/agent";

interface RawSourceItem {
  text: string;
  source: string; // "pageNumber:filename:knowledgeId"
}

interface ParsedSourceData {
  pageNumber: number;
  filename: string;
  knowledgeId: string;
}

interface RawSourceData {
  pageNumber: number;
  filename: string;
  text: string;
}

/** Shape of a single entry in semantic_search output.sourcesMetadata.
 *  Backend sends flat objects (text, title, knowledgeId at top level),
 *  but some paths may nest them under a `metadata` key. Handle both. */
interface SemanticSourceMetadataEntry {
  id: string;
  score?: number;
  text?: string;
  type?: string;
  title?: string;
  source?: string;
  sourceUrl?: string;
  knowledgeId?: string;
  metadata?: {
    text?: string;
    type?: string;
    title?: string;
    source?: string;
    sourceUrl?: string;
    knowledgeId?: string;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

/** Shape of a single entry in search_knowledge output.results */
interface SearchKnowledgeResult {
  id: string;
  type?: string;
  title?: string;
  content?: string;
  filename?: string;
  sourceUrl?: string | null;
}

/**
 * Parses the source string from tool_call_end event
 * Format: "pageNumber:filename:knowledgeId"
 * Example: "0:PPER_AdNotes_26_062025v1.html:bb34ee55-94ad-488f-9178-0c3292963c72"
 */
export function parseSourceString(sourceStr: string): ParsedSourceData {
  const parts = sourceStr.split(":");
  // Handle format: "pageNumber:filename:knowledgeId"
  // The knowledgeId is always the last part (UUID format)
  // The pageNumber is always the first part
  // The filename is everything in between (may contain colons)
  const pageNumber = parseInt(parts[0], 10) || 1;
  const knowledgeId = parts[parts.length - 1];
  const filename = parts.slice(1, -1).join(":");
  return { pageNumber, filename, knowledgeId };
}

/**
 * Transforms raw sources from tool_call_end into a Map keyed by knowledgeId
 */
export function transformRawSourcesToMap(
  rawSources: RawSourceItem[],
): Map<string, RawSourceData> {
  const map = new Map<string, RawSourceData>();
  rawSources.forEach((raw) => {
    const { pageNumber, filename, knowledgeId } = parseSourceString(raw.source);
    map.set(knowledgeId, { pageNumber, filename, text: raw.text });
  });
  return map;
}

/**
 * Merges clean sources from "sources" event with raw data from "tool_call_end" event
 * This combines the metadata from both events to get complete source info
 */
export function mergeSourcesWithRawData(
  sources: Source[],
  rawDataMap: Map<string, RawSourceData>,
): Source[] {
  return sources.map((source) => {
    const rawData = rawDataMap.get(source.id);
    const cleanSnippet = source.snippet ? stripHtml(source.snippet) : source.snippet;
    const cleanExcerpt = (source as any).excerpt ? stripHtml((source as any).excerpt) : (source as any).excerpt;
    if (rawData) {
      return {
        ...source,
        snippet: cleanSnippet,
        excerpt: cleanExcerpt,
        metadata: {
          ...source.metadata,
          pageNumber: rawData.pageNumber,
          filename: rawData.filename || source.metadata?.filename,
          knowledgeId: source.id,
        },
      };
    }
    return {
      ...source,
      snippet: cleanSnippet,
      excerpt: cleanExcerpt,
      metadata: {
        ...source.metadata,
        knowledgeId: source.id,
      },
    };
  });
}

/**
 * Returns true when the value is a non-empty string starting with http(s)://.
 * Used to decide whether a free-form field (snippet, source, sourceUrl) actually
 * contains a URL we can navigate to.
 */
export function isLikelyUrl(value: unknown): value is string {
  return typeof value === "string" && /^https?:\/\//i.test(value.trim());
}

/**
 * Resolves the best external URL for a Source using a strict priority chain.
 * Snippet is the LAST resort and only used when it's a real URL — plain prose
 * snippets are ignored.
 */
export function resolveSourceUrl(source: Source | undefined | null): string | undefined {
  if (!source) return undefined;
  const meta = (source.metadata || {}) as Record<string, unknown>;
  if (isLikelyUrl(source.url)) return source.url;
  if (isLikelyUrl(meta.sourceUrl)) return meta.sourceUrl as string;
  if (isLikelyUrl(meta.source)) return meta.source as string;
  if (isLikelyUrl(source.snippet)) return source.snippet;
  return undefined;
}

/**
 * Strips HTML tags from a string
 */
export function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/<[^>]*$/, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
    .slice(0, 200);
}

/**
 * Extracts Source objects from semantic_search tool output's sourcesMetadata.
 * These are ordered to match the [N] references the AI generates.
 */
export function extractSourcesFromSemanticSearch(
  sourcesMetadata: SemanticSourceMetadataEntry[],
): Source[] {
  return sourcesMetadata
    .map((entry) => {
    // Handle both nested metadata and flat format from the backend
    const meta = entry.metadata || entry;
    const score = entry.score ?? (meta as any).score;
    const title = ((meta.title || "") as string).replace(/&#038;/g, "&").replace(/&amp;/g, "&");
    // The backend's `source` field is overloaded: it can be either a URL
    // (for URL-based knowledge) or a chunked-file token like
    // "pageNumber:filename:knowledgeId" (for uploaded files). Treat it as
    // the source URL only when it actually looks like an http(s) URL.
    const rawSource = typeof meta.source === "string" ? meta.source : undefined;
    const sourceFieldUrl =
      rawSource && /^https?:\/\//i.test(rawSource) ? rawSource : undefined;
    const url = meta.sourceUrl || sourceFieldUrl || undefined;
    return {
      id: meta.knowledgeId || entry.knowledgeId || entry.id,
      type: "knowledge" as const,
      title,
      url,
      snippet: meta.text ? stripHtml(meta.text as string) : undefined,
      metadata: {
        knowledgeId: meta.knowledgeId || entry.knowledgeId || entry.id,
        knowledgeType: meta.type,
        sourceType: meta.type,
        sourceUrl: url,
        similarity: score,
      },
    };
  });
}

/**
 * Extracts Source objects from search_knowledge tool output's results.
 */
export function extractSourcesFromSearchKnowledge(
  results: SearchKnowledgeResult[],
): Source[] {
  return results.map((result) => {
    const url = result.sourceUrl || undefined;
    return {
      id: result.id,
      type: "knowledge" as const,
      title: (result.title || "").replace(/&#038;/g, "&").replace(/&amp;/g, "&"),
      url,
      snippet: result.content ? stripHtml(result.content) : undefined,
      metadata: {
        knowledgeId: result.id,
        filename: result.filename || undefined,
        sourceType: result.type || undefined,
        sourceUrl: url,
      },
    };
  });
}

/**
 * Processes a loaded AgentMessage's sources for display.
 *
 * The backend now commits a single, positionally-indexed `sources[]` per
 * message — every `[N]` marker in `content` maps to `sources[N-1]`. So this
 * function is just a per-source cleanup: strip HTML from snippet, resolve the
 * best URL via the priority chain, and normalize `metadata.knowledgeId`.
 *
 * `toolCalls` is accepted for backwards compatibility with older callers but
 * is unused — sources are no longer reconstructed from tool output.
 */
export function processLoadedMessageSources(message: {
  sources?: Source[];
  toolCalls?: Array<{
    name?: string;
    output?: unknown;
  }>;
}): Source[] {
  const sources = message.sources || [];
  return sources.map((source) => ({
    ...source,
    snippet: source.snippet ? stripHtml(source.snippet) : source.snippet,
    url: resolveSourceUrl(source) ?? source.url,
    metadata: {
      ...source.metadata,
      knowledgeId: source.metadata?.knowledgeId || source.id,
    },
  }));
}

/**
 * Processes an array of loaded messages to merge all sources with toolCalls data.
 * Use this when loading a thread from the database.
 */
export function processLoadedMessages<
  T extends {
    sources?: Source[];
    toolCalls?: Array<{
      name?: string;
      output?: unknown;
    }>;
  },
>(messages: T[]): T[] {
  return messages.map((message) => ({
    ...message,
    sources: processLoadedMessageSources(message),
  }));
}
