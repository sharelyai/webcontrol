import { useMemo, useCallback } from "react";
import { ReactMarkdown } from "@sharelyai/ui-shared";
import type { AgentMessage as AgentMessageType, AgentFeedback, Source } from "@sharelyai/services";
import { UserBubble, AiRow, Avatar, AiContent, ResponseText } from "../styles";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { ToolCallCard } from "../ToolCallCard";
import { SourcesList } from "../SourcesList";
import { ActionBar } from "../ActionBar";
import { SuggestedFollowups } from "../SuggestedFollowups";
import { ErrorMessage } from "../ErrorMessage";
import { BotIcon, UserIcon } from "../icons";
import { getCitationMarkdownComponents } from "../CitationRenderer";

interface AgentMessageProps {
  message: AgentMessageType;
  avatarSrc?: string;
  suggestedFollowups?: string[];
  onFollowupSelect?: (text: string) => void;
  onSourceClick?: (source: Source) => void;
  onShowAllSources?: (sources: Source[]) => void;
  onFeedback?: (feedback: AgentFeedback) => void;
  onRetry?: () => void;
  isLast?: boolean;
}

export function AgentMessage({
  message,
  avatarSrc,
  suggestedFollowups = [],
  onFollowupSelect,
  onSourceClick,
  onShowAllSources,
  onFeedback,
  onRetry,
  isLast = false,
}: AgentMessageProps) {
  const isUser = message.role === "user";

  const handleCitationClick = useCallback(
    (sourceId: string) => {
      const source = message.sources.find((s) => s.id === sourceId);
      if (source) onSourceClick?.(source);
    },
    [message.sources, onSourceClick],
  );

  const markdownComponents = useMemo(
    () => getCitationMarkdownComponents(message.sources, handleCitationClick),
    [message.sources, handleCitationClick],
  );

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <UserBubble>{message.content}</UserBubble>
      </div>
    );
  }

  // Check for error state
  if (!message.content && message.finishReason === "error") {
    return (
      <AiRow>
        <Avatar>
          {avatarSrc ? <img src={avatarSrc} alt="" /> : <BotIcon size={18} />}
        </Avatar>
        <AiContent>
          <ErrorMessage onRetry={isLast ? onRetry : undefined} />
        </AiContent>
      </AiRow>
    );
  }

  return (
    <AiRow>
      <Avatar>
        {avatarSrc ? <img src={avatarSrc} alt="" /> : <BotIcon size={18} />}
      </Avatar>
      <AiContent>
        {/* Thinking Steps + Tool Calls */}
        {(message.thinkingSteps.length > 0 || message.toolCalls.length > 0) && (
          <div style={{ marginBottom: message.content ? 16 : 0 }}>
            <ThinkingIndicator
              steps={message.thinkingSteps}
              toolCalls={message.toolCalls}
              collapsed
              sourceCount={message.sources.length || undefined}
            />
          </div>
        )}

        {/* Message Content */}
        {message.content && (
          <ResponseText>
            <ReactMarkdown components={markdownComponents}>
              {message.content}
            </ReactMarkdown>
          </ResponseText>
        )}

        {/* Sources */}
        {message.sources.length > 0 && (
          <SourcesList
            sources={message.sources}
            onSourceClick={onSourceClick}
            onShowAllSources={onShowAllSources}
          />
        )}

        {/* Action Bar */}
        {message.content && (
          <ActionBar
            messageId={message.id}
            content={message.content}
            onFeedback={onFeedback}
          />
        )}

        {/* Suggested Followups (only for last message) */}
        {isLast && suggestedFollowups.length > 0 && onFollowupSelect && (
          <SuggestedFollowups
            questions={suggestedFollowups}
            onSelect={onFollowupSelect}
          />
        )}
      </AiContent>
    </AiRow>
  );
}
