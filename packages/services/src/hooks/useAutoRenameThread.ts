import { useEffect, useRef } from "react";
import type { AgentMessage } from "../types/agent";

const AUTO_RENAME_THRESHOLD = 3;

interface UseAutoRenameThreadOptions {
  threadId: string | null;
  messages: AgentMessage[];
  updateThread: (threadId: string, data: { title?: string }) => Promise<void>;
  currentTitle?: string | null;
  threshold?: number;
}

export function useAutoRenameThread({
  threadId,
  messages,
  updateThread,
  currentTitle,
  threshold = AUTO_RENAME_THRESHOLD,
}: UseAutoRenameThreadOptions): void {
  const renamedThreadsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!threadId) return;
    if (renamedThreadsRef.current.has(threadId)) return;
    if (currentTitle) return;

    if (messages.length < threshold) return;

    renamedThreadsRef.current.add(threadId);

    updateThread(threadId, {}).catch(() => {
      renamedThreadsRef.current.delete(threadId);
    });
  }, [threadId, messages, updateThread, currentTitle, threshold]);
}
