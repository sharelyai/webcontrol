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

/** Shape of a single entry in semantic_search output.sourcesMetadata */
interface SemanticSourceMetadataEntry {
  id: string;
  score?: number;
  metadata: {
    text?: string;
    type?: string;
    title?: string;
    source?: string;
    sourceUrl?: string;
    knowledgeId?: string;
    [key: string]: unknown;
  };
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
  const pageNumber = parseInt(parts[0], 10) || 0;
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
    if (rawData) {
      return {
        ...source,
        metadata: {
          ...source.metadata,
          pageNumber: rawData.pageNumber,
          filename: rawData.filename,
          knowledgeId: source.id,
        },
      };
    }
    return {
      ...source,
      metadata: {
        ...source.metadata,
        knowledgeId: source.id,
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
    .filter((entry) => entry.metadata != null)
    .map((entry) => {
    const meta = entry.metadata;
    const title = (meta.title || "").replace(/&#038;/g, "&").replace(/&amp;/g, "&");
    return {
      id: meta.knowledgeId || entry.id,
      type: "knowledge" as const,
      title,
      url: meta.sourceUrl || undefined,
      snippet: meta.text ? stripHtml(meta.text) : undefined,
      metadata: {
        knowledgeId: meta.knowledgeId || entry.id,
        knowledgeType: meta.type,
        similarity: entry.score,
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
  return results.map((result) => ({
    id: result.id,
    type: "knowledge" as const,
    title: (result.title || "").replace(/&#038;/g, "&").replace(/&amp;/g, "&"),
    url: result.sourceUrl || undefined,
    snippet: result.content ? stripHtml(result.content) : undefined,
    metadata: {
      knowledgeId: result.id,
      filename: result.filename,
    },
  }));
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
    return sources.map((source) => ({
      ...source,
      metadata: {
        ...source.metadata,
        knowledgeId: source.metadata?.knowledgeId || source.id,
      },
    }));
  }

  // Extract raw source data from toolCalls output (for enrichment)
  const rawDataMap = new Map<string, RawSourceData>();
  // Extract full source lists from tool outputs
  const semanticSources: Source[] = [];
  const searchSources: Source[] = [];

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
      const extracted = extractSourcesFromSemanticSearch(
        output.sourcesMetadata as SemanticSourceMetadataEntry[],
      );
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

  // If we found sources from tool outputs, use them (they match the AI's [N] numbering)
  // Prefer semantic_search sources since the AI typically references those
  let combinedSources: Source[];
  if (semanticSources.length > 0) {
    combinedSources = semanticSources;
  } else if (searchSources.length > 0) {
    combinedSources = searchSources;
  } else {
    combinedSources = sources;
  }

  // Enrich with raw data if available
  if (rawDataMap.size > 0) {
    return mergeSourcesWithRawData(combinedSources, rawDataMap);
  }

  return combinedSources.map((source) => ({
    ...source,
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
