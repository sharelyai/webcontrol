import { useCallback, useEffect, useRef, useState } from "react";
import type {
  AgentMessage,
  ContentDeltaEvent,
  ErrorEvent,
  MessageStartEvent,
  Source,
  SourceEvent,
  SourcesEvent,
  SSEEventType,
  ThinkingEvent,
  ThinkingDeltaEvent,
  ThinkingEndEvent,
  ThinkingStartEvent,
  ThinkingStep,
  ToolCall,
  ToolCallEndEvent,
  ToolCallStartEvent,
  ToolUseEvent,
  ToolResultEvent,
  UseAgentChatReturn,
} from "../types/agent";
import { agentFetcher } from "../api/agentApi";
import {
  transformRawSourcesToMap,
  mergeSourcesWithRawData,
  processLoadedMessages,
} from "../utils/sourceParser";
import { useAgentSSE } from "./useAgentSSE";
import { useGlobalStore } from "../stores/globalStore";

interface UseAgentChatOptions {
  spaceId: string;
  initialThreadId?: string;
}

interface ThreadResponse {
  id: string;
  title?: string;
  status?: string;
  messages?: AgentMessage[];
}

export function useAgentChat(options: UseAgentChatOptions): UseAgentChatReturn {
  const { spaceId, initialThreadId } = options;
  const { config, workspace } = useGlobalStore();

  // Get workspaceId from config or workspace
  const workspaceId = config?.workspaceId || workspace?.id;

  // Use refs to track current state for callbacks (avoid stale closures)
  const threadIdRef = useRef<string | null>(initialThreadId || null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const streamingContentRef = useRef<string>("");
  const thinkingStepsRef = useRef<ThinkingStep[]>([]);
  const activeToolCallsRef = useRef<ToolCall[]>([]);
  const activeSourcesRef = useRef<Source[]>([]);

  // Ref for raw source data from tool_call_end/tool_result events
  const rawSourceDataRef = useRef<
    Map<string, { pageNumber: number; filename: string; text: string }>
  >(new Map());

  // Thread state
  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null,
  );
  const [messages, setMessages] = useState<AgentMessage[]>([]);

  // Streaming state
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(
    null,
  );
  const [streamingContent, setStreamingContent] = useState("");
  const [thinkingSteps, setThinkingSteps] = useState<ThinkingStep[]>([]);
  const [activeToolCalls, setActiveToolCalls] = useState<ToolCall[]>([]);
  const [activeSources, setActiveSources] = useState<Source[]>([]);

  // Error state
  const [error, setError] = useState<string | null>(null);

  const { startStream, stopStream } = useAgentSSE();

  // Keep refs in sync with state
  useEffect(() => {
    threadIdRef.current = threadId;
  }, [threadId]);

  useEffect(() => {
    streamingMessageIdRef.current = streamingMessageId;
  }, [streamingMessageId]);

  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  useEffect(() => {
    thinkingStepsRef.current = thinkingSteps;
  }, [thinkingSteps]);

  useEffect(() => {
    activeToolCallsRef.current = activeToolCalls;
  }, [activeToolCalls]);

  useEffect(() => {
    activeSourcesRef.current = activeSources;
  }, [activeSources]);

  // Build base path for agent API
  const getBasePath = useCallback(() => {
    if (!workspaceId) return null;
    return `/workspaces/${workspaceId}/agent`;
  }, [workspaceId]);

  // Load thread messages
  const loadThread = useCallback(async (tid: string) => {
    const basePath = getBasePath();
    if (!basePath) {
      return;
    }
    try {
      const data = await agentFetcher<ThreadResponse>(
        `${basePath}/threads/${tid}`,
      );
      threadIdRef.current = tid;
      setThreadId(tid);
      // Process loaded messages to merge sources with toolCalls data
      const processedMessages = processLoadedMessages(data.messages || []);
      setMessages(processedMessages);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [getBasePath]);

  // Create new thread
  const createThread = useCallback(
    async (title?: string): Promise<string> => {
      const basePath = getBasePath();
      if (!basePath) {
        throw new Error("Workspace ID not available");
      }
      const data = await agentFetcher<ThreadResponse>(`${basePath}/threads`, {
        method: "POST",
        body: JSON.stringify({
          spaceId,
          title,
        }),
      });
      threadIdRef.current = data.id;
      setThreadId(data.id);
      setMessages([]);
      return data.id;
    },
    [spaceId, getBasePath],
  );

  // Handle SSE events (supports both new backend format and legacy format)
  const handleEvent = useCallback(
    (eventType: SSEEventType, data: unknown) => {
      switch (eventType) {
        case "message_start": {
          const event = data as MessageStartEvent;
          setStreamingMessageId(event.messageId);
          setStreamingContent("");
          setThinkingSteps([]);
          setActiveToolCalls([]);
          setActiveSources([]);
          // Clear raw source data for new message
          rawSourceDataRef.current.clear();
          break;
        }

        // New backend format: single "thinking" event with content
        case "thinking": {
          const event = data as ThinkingEvent;
          setThinkingSteps((prev) => {
            if (prev.length === 0) {
              return [{
                id: `thinking-${Date.now()}`,
                title: "Thinking...",
                content: event.thinking,
                status: "running",
              }];
            }
            return prev.map((step, idx) =>
              idx === prev.length - 1
                ? { ...step, content: step.content + event.thinking }
                : step,
            );
          });
          break;
        }

        // New backend format: "tool_use" event when tool is called
        case "tool_use": {
          const event = data as ToolUseEvent;
          setActiveToolCalls((prev) => [
            ...prev,
            {
              id: `tool-${event.tool}-${Date.now()}`,
              name: event.tool,
              input: event.input,
              status: "running",
            },
          ]);
          break;
        }

        // New backend format: "tool_result" event with tool output
        case "tool_result": {
          const event = data as ToolResultEvent;

          // Capture raw source data if present (for RAG results)
          const output = event.output as Record<string, unknown> | undefined;
          if (output?.dataArraySortedWithSource) {
            const rawSources = output.dataArraySortedWithSource as Array<{
              text: string;
              source: string;
            }>;
            const rawMap = transformRawSourcesToMap(rawSources);
            rawMap.forEach((value, key) => {
              rawSourceDataRef.current.set(key, value);
            });
          }

          setActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.name === event.tool && tc.status === "running"
                ? {
                    ...tc,
                    output: event.output,
                    status: "completed",
                  }
                : tc,
            ),
          );
          setThinkingSteps((prev) =>
            prev.map((step) =>
              step.status === "running"
                ? { ...step, status: "completed" }
                : step,
            ),
          );
          break;
        }

        // New backend format: single "source" event per source
        case "source": {
          const event = data as SourceEvent;
          setActiveSources((prev) => [...prev, event.source]);
          break;
        }

        // Legacy format: thinking_start
        case "thinking_start": {
          const event = data as ThinkingStartEvent;
          setThinkingSteps((prev) => [
            ...prev,
            {
              id: event.thinkingId,
              title: event.title,
              content: "",
              status: "running",
            },
          ]);
          break;
        }

        // Legacy format: thinking_delta
        case "thinking_delta": {
          const event = data as ThinkingDeltaEvent;
          setThinkingSteps((prev) =>
            prev.map((step) =>
              step.id === event.thinkingId
                ? { ...step, content: step.content + event.delta }
                : step,
            ),
          );
          break;
        }

        // Legacy format: thinking_end
        case "thinking_end": {
          const event = data as ThinkingEndEvent;
          setThinkingSteps((prev) =>
            prev.map((step) =>
              step.id === event.thinkingId
                ? {
                    ...step,
                    status: event.status,
                    durationMs: event.durationMs,
                  }
                : step,
            ),
          );
          break;
        }

        // Legacy format: tool_call_start
        case "tool_call_start": {
          const event = data as ToolCallStartEvent;
          setActiveToolCalls((prev) => [
            ...prev,
            {
              id: event.toolCallId,
              name: event.name,
              input: event.input,
              status: "running",
            },
          ]);
          break;
        }

        // Legacy format: tool_call_end
        case "tool_call_end": {
          const event = data as ToolCallEndEvent;

          // Capture raw source data if present (for RAG results)
          const toolOutput = event.output as Record<string, unknown> | undefined;
          if (toolOutput?.dataArraySortedWithSource) {
            const rawSources = toolOutput.dataArraySortedWithSource as Array<{
              text: string;
              source: string;
            }>;
            const rawMap = transformRawSourcesToMap(rawSources);
            rawMap.forEach((value, key) => {
              rawSourceDataRef.current.set(key, value);
            });
          }

          setActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.id === event.toolCallId
                ? {
                    ...tc,
                    output: event.output,
                    error: event.error,
                    status: event.error ? "error" : "completed",
                    durationMs: event.durationMs,
                  }
                : tc,
            ),
          );
          break;
        }

        case "content_delta": {
          const event = data as ContentDeltaEvent;
          setStreamingContent((prev) => prev + event.delta);
          break;
        }

        // Legacy format: sources (plural)
        case "sources": {
          const event = data as SourcesEvent;
          // Merge with raw data from tool_call_end/tool_result events
          const mergedSources = mergeSourcesWithRawData(
            event.sources,
            rawSourceDataRef.current
          );
          setActiveSources(mergedSources);
          break;
        }

        case "message_end": {
          setThinkingSteps((prev) =>
            prev.map((step) =>
              step.status === "running"
                ? { ...step, status: "completed" }
                : step,
            ),
          );
          setActiveToolCalls((prev) =>
            prev.map((tc) =>
              tc.status === "running"
                ? { ...tc, status: "completed" }
                : tc,
            ),
          );
          break;
        }

        case "error": {
          const event = data as ErrorEvent;
          setError(event.error);
          setIsStreaming(false);
          break;
        }

        case "done": {
          setMessages((prev) => {
            const assistantMessage: AgentMessage = {
              id: streamingMessageIdRef.current || `msg-${Date.now()}`,
              role: "assistant",
              content: streamingContentRef.current,
              thinkingSteps: thinkingStepsRef.current,
              toolCalls: activeToolCallsRef.current,
              sources: activeSourcesRef.current,
              tokenUsage: null,
              model: null,
              finishReason: "end_turn",
              createdAt: new Date().toISOString(),
            };
            return [...prev, assistantMessage];
          });

          setStreamingContent("");
          setThinkingSteps([]);
          setActiveToolCalls([]);
          setActiveSources([]);
          setStreamingMessageId(null);
          setIsStreaming(false);
          break;
        }
      }
    },
    [],
  );

  // Send message - returns the threadId used
  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      const basePath = getBasePath();
      if (!basePath) {
        setError("Workspace ID not available");
        return null;
      }

      let tid = threadIdRef.current;

      // Create thread if needed
      if (!tid) {
        try {
          tid = await createThread();
        } catch (e) {
          setError((e as Error).message);
          return null;
        }
      }

      // Optimistically add user message
      const userMessage: AgentMessage = {
        id: `temp-${Date.now()}`,
        role: "user",
        content,
        thinkingSteps: [],
        toolCalls: [],
        sources: [],
        tokenUsage: null,
        model: null,
        finishReason: null,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, userMessage]);

      setIsStreaming(true);
      setError(null);

      try {
        await startStream(
          `${basePath}/threads/${tid}/chat`,
          { message: content },
          {
            onEvent: handleEvent,
            onError: (e) => {
              setError(e.message);
              setIsStreaming(false);
            },
            onComplete: () => {
              // Handled by 'done' event
            },
          },
        );
      } catch (e) {
        setError((e as Error).message);
        setIsStreaming(false);
      }

      return tid;
    },
    [createThread, startStream, handleEvent, getBasePath],
  );

  // Stop streaming
  const handleStopStreaming = useCallback(() => {
    stopStream();
    setIsStreaming(false);
  }, [stopStream]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Load initial thread
  useEffect(() => {
    if (initialThreadId) {
      loadThread(initialThreadId);
    }
  }, [initialThreadId, loadThread]);

  return {
    threadId,
    messages,
    isStreaming,
    streamingMessageId,
    streamingContent,
    thinkingSteps,
    activeToolCalls,
    activeSources,
    error,
    sendMessage,
    stopStreaming: handleStopStreaming,
    createThread,
    loadThread,
    clearError,
  };
}
