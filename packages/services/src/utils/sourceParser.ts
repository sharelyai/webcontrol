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

function pickFirst<T>(...candidates: T[]): T | undefined {
  for (const c of candidates) {
    if (c !== undefined && c !== null && c !== "") return c;
  }
  return undefined;
}

/**
 * Merges a list of Source objects with the sourcesMetadata array emitted by the
 * semantic_search tool. Matching is by knowledgeId (falling back to source.id).
 *
 * Existing non-empty fields on the source win; missing fields are filled in
 * from the matched metadata entry. URL resolution uses the same priority chain
 * as resolveSourceUrl so a metadata entry can supply a URL the source lacked.
 */
export function mergeSourcesByKnowledgeId(
  sources: Source[],
  sourcesMetadata: SemanticSourceMetadataEntry[] | undefined | null,
): Source[] {
  if (!sources || sources.length === 0) return sources ?? [];
  if (!sourcesMetadata || sourcesMetadata.length === 0) {
    return sources.map((s) => ({
      ...s,
      url: resolveSourceUrl(s) ?? s.url,
      metadata: { ...s.metadata, knowledgeId: s.metadata?.knowledgeId || s.id },
    }));
  }

  const byKnowledgeId = new Map<string, SemanticSourceMetadataEntry>();
  for (const entry of sourcesMetadata) {
    const meta = entry.metadata || entry;
    const kid =
      (entry.knowledgeId as string | undefined) ||
      (meta.knowledgeId as string | undefined) ||
      entry.id;
    if (kid && !byKnowledgeId.has(kid)) byKnowledgeId.set(kid, entry);
  }

  return sources.map((source) => {
    const sourceKid = source.metadata?.knowledgeId || source.id;
    const match = sourceKid ? byKnowledgeId.get(sourceKid) : undefined;
    if (!match) {
      return {
        ...source,
        url: resolveSourceUrl(source) ?? source.url,
        metadata: { ...source.metadata, knowledgeId: sourceKid },
      };
    }

    const meta = match.metadata || match;
    const metaSource: Source = {
      id: source.id,
      type: source.type,
      title: (meta.title as string | undefined) || source.title,
      url: undefined,
      snippet: meta.text as string | undefined,
      metadata: {
        sourceUrl: meta.sourceUrl as string | undefined,
        source: meta.source as string | undefined,
      } as Source["metadata"],
    };
    const urlFromMeta = resolveSourceUrl(metaSource);

    const mergedTitle = pickFirst(source.title, meta.title as string | undefined) ?? source.title;
    const mergedSnippet = pickFirst(source.snippet, meta.text as string | undefined);
    const mergedExcerpt = pickFirst(source.excerpt, (meta as any).excerpt as string | undefined);
    const mergedUrl = pickFirst(resolveSourceUrl(source), urlFromMeta);
    const mergedSourceType = pickFirst(
      source.metadata?.sourceType,
      meta.type as string | undefined,
    );
    const mergedFilename = pickFirst(
      source.metadata?.filename,
      (meta as any).filename as string | undefined,
    );
    const mergedPageNumber = pickFirst(
      source.metadata?.pageNumber,
      (meta as any).pageNumber as number | undefined,
    );
    const mergedSimilarity = pickFirst(
      source.metadata?.similarity,
      match.score,
      (meta as any).score as number | undefined,
    );

    return {
      ...source,
      title: mergedTitle,
      url: mergedUrl,
      snippet: mergedSnippet,
      excerpt: mergedExcerpt ?? source.excerpt,
      metadata: {
        ...source.metadata,
        knowledgeId: sourceKid,
        sourceUrl: mergedUrl ?? source.metadata?.sourceUrl,
        sourceType: mergedSourceType,
        filename: mergedFilename,
        pageNumber: mergedPageNumber,
        similarity: mergedSimilarity,
      },
    };
  });
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
 * Processes a loaded AgentMessage to merge its sources with toolCalls output data.
 * This is used when loading messages from the database (not during streaming).
 *
 * The message structure from the database:
 * - message.sources: Source[] - clean source objects with id, title, snippet
 * - message.toolCalls[].output.sourcesMetadata: SemanticSourceMetadataEntry[] - from semantic_search
 * - message.toolCalls[].output.results: SearchKnowledgeResult[] - from search_knowledge
 * - message.toolCalls[].output.dataArraySortedWithSource: RawSourceItem[] - raw data with pageNumber:filename:knowledgeId
 */
export function processLoadedMessageSources(message: {
  sources?: Source[];
  toolCalls?: Array<{
    name?: string;
    output?: unknown;
  }>;
}): Source[] {
  const sources = message.sources || [];

  if (!message.toolCalls || message.toolCalls.length === 0) {
    return sources.map((source) => {
      const cleaned: Source = {
        ...source,
        snippet: source.snippet ? stripHtml(source.snippet) : source.snippet,
        metadata: {
          ...source.metadata,
          knowledgeId: source.metadata?.knowledgeId || source.id,
        },
      };
      cleaned.url = resolveSourceUrl(cleaned) ?? cleaned.url;
      return cleaned;
    });
  }

  // Extract raw source data from toolCalls output (for enrichment)
  const rawDataMap = new Map<string, RawSourceData>();
  // Extract full source lists from tool outputs
  const semanticSources: Source[] = [];
  const searchSources: Source[] = [];
  // Collect every sourcesMetadata entry across tool calls so we can merge by
  // knowledgeId regardless of which tool emitted it.
  const allSemanticMetadata: SemanticSourceMetadataEntry[] = [];

  for (const toolCall of message.toolCalls) {
    const output = toolCall.output as Record<string, unknown> | undefined;
    if (!output) continue;

    // Collect raw data for enrichment
    if (output.dataArraySortedWithSource) {
      const map = transformRawSourcesToMap(
        output.dataArraySortedWithSource as RawSourceItem[],
      );
      map.forEach((value, key) => {
        rawDataMap.set(key, value);
      });
    }

    // Extract sources from semantic_search output
    if (output.sourcesMetadata && Array.isArray(output.sourcesMetadata)) {
      const metadataEntries = output.sourcesMetadata as SemanticSourceMetadataEntry[];
      allSemanticMetadata.push(...metadataEntries);
      const extracted = extractSourcesFromSemanticSearch(metadataEntries);
      semanticSources.push(...extracted);
    }

    // Extract sources from search_knowledge output
    if (output.results && Array.isArray(output.results)) {
      const extracted = extractSourcesFromSearchKnowledge(
        output.results as SearchKnowledgeResult[],
      );
      searchSources.push(...extracted);
    }
  }

  // Prefer message.sources because that's the canonical list the backend
  // committed against the message (the [N] markers in content map to it) and
  // it carries url/title/snippet/sourceUrl. Tool-output sources are used only
  // as a fallback and for *enriching* message.sources via mergeSourcesByKnowledgeId.
  let combinedSources: Source[];
  if (sources.length > 0) {
    combinedSources = sources;
  } else if (semanticSources.length > 0) {
    combinedSources = semanticSources;
  } else {
    combinedSources = searchSources;
  }

  // Merge by knowledgeId so sources gain url/title/snippet/etc from the
  // sourcesMetadata entries that share the same knowledgeId.
  if (allSemanticMetadata.length > 0) {
    combinedSources = mergeSourcesByKnowledgeId(combinedSources, allSemanticMetadata);
  }

  // Enrich with raw data if available
  if (rawDataMap.size > 0) {
    return mergeSourcesWithRawData(combinedSources, rawDataMap);
  }

  return combinedSources.map((source) => ({
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
