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
  return {
    id: msg.id,
    type: msg.role === "user" ? CONVERSATIONS_TYPE_USER : CONVERSATIONS_TYPE_AI,
    message: msg.content || "",
    thinkingSteps: msg.thinkingSteps,
    toolCalls: msg.toolCalls,
    sources: msg.sources,
    sourcesMetadata: msg.sources?.map((source) => ({
      source: source.url || source.title,
      metadata: {
        title: source.title,
        snippet: source.snippet,
        type: source.type,
      },
    })),
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
