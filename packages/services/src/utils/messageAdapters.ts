import type { AgentMessage, ThinkingStep, ToolCall, Source } from '../types/agent';
import { CONVERSATIONS_TYPE_USER, CONVERSATIONS_TYPE_AI } from '../constants';

export interface BodyMessage {
  id: string;
  type: string;
  message: string;
  thinkingSteps?: ThinkingStep[];
  toolCalls?: ToolCall[];
  sources?: Source[];
  user?: {
    id: string;
    name?: string;
    photo?: string;
  };
  thumbSignals?: unknown[];
  sourcesMetadata?: {
    source: string;
    metadata: unknown;
  }[];
  createdAt?: string;
}

export function agentMessageToBodyMessage(msg: AgentMessage): BodyMessage {
  let content = msg.content || "";

  // Build sourcesMetadata with the fields the Anchor component expects:
  // - metadata.source: used for lookup (must match the referenceId derived from href)
  // - metadata.knowledgeId, metadata.text, metadata["loc.pageNumber"], score: used for popup
  const sourcesMetadata = msg.sources?.map((source) => {
    const sourceId = source.url || source.title;
    return {
      source: sourceId,
      metadata: {
        source: sourceId,
        title: source.title,
        snippet: source.snippet,
        type: source.type,
        text: source.snippet || source.excerpt,
        ...(source.metadata as Record<string, unknown> | undefined),
      },
      score: (source.metadata as any)?.similarity ?? (source.metadata as any)?.score ?? 0,
    };
  });

  // Convert inline [N] and [N-M] references to markdown links so the Anchor component
  // renders them as interactive pills with hover popups (matching regular chat behavior).
  if (msg.sources && msg.sources.length > 0) {
    content = content.replace(/\[(\d+)(?:-(\d+))?\]/g, (match, startStr, _endStr) => {
      const index = parseInt(startStr, 10) - 1; // [1] → sources[0], [1-6] → sources[0]
      if (index >= 0 && index < msg.sources.length) {
        const source = msg.sources[index];
        const title = source.title;
        const identifier = (source.url || source.title).split(" ").join("____");
        return `[${title}](${identifier})`;
      }
      return match;
    });
  }

  return {
    id: msg.id,
    type: msg.role === "user" ? CONVERSATIONS_TYPE_USER : CONVERSATIONS_TYPE_AI,
    message: content,
    thinkingSteps: msg.thinkingSteps,
    toolCalls: msg.toolCalls,
    sources: msg.sources,
    sourcesMetadata,
    createdAt: msg.createdAt,
  };
}

export function bodyMessageToAgentMessage(msg: BodyMessage): AgentMessage {
  return {
    id: msg.id,
    role: msg.type === CONVERSATIONS_TYPE_USER ? "user" : "assistant",
    content: msg.message,
    thinkingSteps: msg.thinkingSteps || [],
    toolCalls: msg.toolCalls || [],
    sources: msg.sources || [],
    tokenUsage: null,
    model: null,
    finishReason: null,
    createdAt: msg.createdAt || new Date().toISOString(),
  };
}

export function mergeAgentMessagesWithBodyMessages(
  agentMessages: AgentMessage[],
  bodyMessages: BodyMessage[]
): BodyMessage[] {
  const bodyMessageMap = new Map(bodyMessages.map((m) => [m.id, m]));

  const convertedAgentMessages = agentMessages.map((msg) => {
    const existingBody = bodyMessageMap.get(msg.id);
    const converted = agentMessageToBodyMessage(msg);

    if (existingBody) {
      return {
        ...existingBody,
        ...converted,
        thumbSignals: existingBody.thumbSignals,
        user: existingBody.user,
      };
    }

    return converted;
  });

  return convertedAgentMessages;
}
