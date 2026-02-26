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
 * Processes a loaded AgentMessage to merge its sources with toolCalls output data.
 * This is used when loading messages from the database (not during streaming).
 *
 * The message structure from the database:
 * - message.sources: Source[] - clean source objects with id, title, snippet
 * - message.toolCalls[].output.dataArraySortedWithSource: RawSourceItem[] - raw data with pageNumber:filename:knowledgeId
 */
export function processLoadedMessageSources(message: {
  sources?: Source[];
  toolCalls?: Array<{
    output?: unknown;
  }>;
}): Source[] {
  const sources = message.sources || [];

  if (sources.length === 0) {
    return sources;
  }

  // Extract raw source data from toolCalls output
  const rawDataMap = new Map<string, RawSourceData>();

  if (message.toolCalls) {
    for (const toolCall of message.toolCalls) {
      const output = toolCall.output as
        | { dataArraySortedWithSource?: RawSourceItem[] }
        | undefined;

      if (output?.dataArraySortedWithSource) {
        const map = transformRawSourcesToMap(output.dataArraySortedWithSource);
        map.forEach((value, key) => {
          rawDataMap.set(key, value);
        });
      }
    }
  }

  // If no raw data found, still ensure knowledgeId is set
  if (rawDataMap.size === 0) {
    return sources.map((source) => ({
      ...source,
      metadata: {
        ...source.metadata,
        knowledgeId: source.metadata?.knowledgeId || source.id,
      },
    }));
  }

  // Merge sources with raw data
  const merged = mergeSourcesWithRawData(sources, rawDataMap);
  return merged;
}

/**
 * Processes an array of loaded messages to merge all sources with toolCalls data.
 * Use this when loading a thread from the database.
 */
export function processLoadedMessages<
  T extends {
    sources?: Source[];
    toolCalls?: Array<{
      output?: unknown;
    }>;
  },
>(messages: T[]): T[] {
  return messages.map((message) => ({
    ...message,
    sources: processLoadedMessageSources(message),
  }));
}
