/**
 * Vercel AI SDK v6 based chat hook for Sharely agent.
 * Wraps useChat with Sharely-specific concerns:
 * - Thread lifecycle (create on first message, load from history)
 * - Auth via custom fetch
 * - Message format adaptation via custom transport
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useGlobalStore } from "../stores/globalStore";
import { agentFetcher } from "../api/agentApi";
import { createSharelyFetch } from "../ai/sharelyFetch";
import { agentMessagesToUIMessages } from "../ai/convertMessages";
import type { AgentMessage } from "../types/agent";

interface UseSharelyChatOptions {
  spaceId: string;
  initialThreadId?: string;
}

interface ThreadResponse {
  id: string;
  title?: string;
  status?: string;
  messages?: AgentMessage[];
}

type ThreadState = "IDLE" | "CREATING_THREAD" | "READY";

export function useSharelyChat(options: UseSharelyChatOptions) {
  const { spaceId, initialThreadId } = options;
  const { config, workspace } = useGlobalStore();

  const workspaceId = config?.workspaceId || workspace?.id;

  const [threadId, setThreadId] = useState<string | null>(
    initialThreadId || null,
  );
  const [threadState, setThreadState] = useState<ThreadState>(
    initialThreadId ? "READY" : "IDLE",
  );
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([]);
  const [hookError, setHookError] = useState<string | null>(null);

  const threadIdRef = useRef<string | null>(initialThreadId || null);
  const pendingMessageRef = useRef<string | null>(null);

  const getBasePath = useCallback(() => {
    if (!workspaceId) return null;
    return `/workspaces/${workspaceId}/agent`;
  }, [workspaceId]);

  // Stable fetch wrapper
  const sharelyFetch = useMemo(() => createSharelyFetch(), []);

  // Compute API endpoint
  const api = threadIdRef.current
    ? `${getBasePath()}/threads/${threadIdRef.current}/chat`
    : "/noop";

  // Create transport with custom request preparation
  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api,
        fetch: sharelyFetch,
        prepareSendMessagesRequest({ messages }) {
          // Backend expects { message: string }, not the full messages array
          const lastMessage = messages[messages.length - 1];
          const textPart = lastMessage?.parts?.find(
            (p) => p.type === "text",
          );
          const messageText = (textPart as any)?.text || "";

          return {
            body: { message: messageText },
          };
        },
      }),
    [api, sharelyFetch],
  );

  const chat = useChat({
    transport,
    messages: initialMessages,
  });

  // Create a new thread
  const createThread = useCallback(
    async (title?: string): Promise<string> => {
      const basePath = getBasePath();
      if (!basePath) {
        throw new Error("Workspace ID not available");
      }
      setThreadState("CREATING_THREAD");
      const data = await agentFetcher<ThreadResponse>(`${basePath}/threads`, {
        method: "POST",
        body: JSON.stringify({ spaceId, title }),
      });
      threadIdRef.current = data.id;
      setThreadId(data.id);
      setThreadState("READY");
      return data.id;
    },
    [spaceId, getBasePath],
  );

  // Load an existing thread
  const loadThread = useCallback(
    async (tid: string) => {
      const basePath = getBasePath();
      if (!basePath) return;

      try {
        const data = await agentFetcher<ThreadResponse>(
          `${basePath}/threads/${tid}`,
        );
        threadIdRef.current = tid;
        setThreadId(tid);
        setThreadState("READY");

        const uiMessages = agentMessagesToUIMessages(data.messages || []);
        setInitialMessages(uiMessages);
        chat.setMessages(uiMessages);
        setHookError(null);
      } catch (e) {
        setHookError((e as Error).message);
      }
    },
    [getBasePath, chat],
  );

  // Send message, creating thread if needed
  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!content.trim()) return null;

      let tid = threadIdRef.current;

      // Create thread if needed
      if (!tid) {
        try {
          pendingMessageRef.current = content;
          tid = await createThread();
          pendingMessageRef.current = null;
        } catch (e) {
          pendingMessageRef.current = null;
          setHookError((e as Error).message);
          return null;
        }
      }

      // Send via useChat's sendMessage
      chat.sendMessage({ text: content });

      return tid;
    },
    [createThread, chat],
  );

  // Send pending message after thread creation
  useEffect(() => {
    if (
      threadState === "READY" &&
      pendingMessageRef.current &&
      threadIdRef.current
    ) {
      const msg = pendingMessageRef.current;
      pendingMessageRef.current = null;
      chat.sendMessage({ text: msg });
    }
  }, [threadState, chat]);

  // Create new chat (reset state)
  const createNewThread = useCallback(async () => {
    threadIdRef.current = null;
    setThreadId(null);
    setThreadState("IDLE");
    setInitialMessages([]);
    chat.setMessages([]);
    setHookError(null);
  }, [chat]);

  // Load initial thread on mount
  useEffect(() => {
    if (initialThreadId) {
      loadThread(initialThreadId);
    }
  }, [initialThreadId]);

  return {
    // Thread state
    threadId,
    isCreatingThread: threadState === "CREATING_THREAD",
    threadState,

    // Chat state from useChat
    messages: chat.messages,
    status: chat.status,
    isLoading: chat.status === "submitted" || chat.status === "streaming",
    error: chat.error || (hookError ? new Error(hookError) : undefined),

    // Actions
    sendMessage,
    stop: chat.stop,
    setMessages: chat.setMessages,

    // Thread management
    createThread,
    createNewThread,
    loadThread,

    // Error
    clearError: () => {
      chat.clearError();
      setHookError(null);
    },
  };
}
