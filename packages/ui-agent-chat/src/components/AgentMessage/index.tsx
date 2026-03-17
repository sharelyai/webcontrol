import ReactMarkdown from "react-markdown";
import type { AgentMessage as AgentMessageType } from "@sharelyai/services";
import { BotIcon, UserIcon } from "../icons";
import { SourcesList } from "../SourcesList";
import {
  MessageAvatar,
  MessageContent,
  MessageMeta,
  MessageText,
  MessageWrapper,
  ToolCallsContainer,
} from "../styles";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { ToolCallCard } from "../ToolCallCard";

interface AgentMessageProps {
  message: AgentMessageType;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgentMessage({ message }: AgentMessageProps) {
  const isUser = message.role === "user";

  return (
    <MessageWrapper $role={message.role}>
      <MessageAvatar $role={message.role}>
        {isUser ? <UserIcon /> : <BotIcon />}
      </MessageAvatar>

      <MessageContent $role={message.role}>
        {/* Thinking Steps (assistant only) */}
        {!isUser && message.thinkingSteps.length > 0 && (
          <ThinkingIndicator steps={message.thinkingSteps} collapsed />
        )}

        {/* Tool Calls (assistant only) */}
        {!isUser && message.toolCalls.length > 0 && (
          <ToolCallsContainer>
            {message.toolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </ToolCallsContainer>
        )}

        {/* Message Text */}
        {message.content && (
          <MessageText $role={message.role}>
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </MessageText>
        )}

        {/* Sources */}
        {!isUser && message.sources.length > 0 && (
          <SourcesList sources={message.sources} />
        )}

        {/* Metadata */}
        <MessageMeta>
          <span className="timestamp">{formatTime(message.createdAt)}</span>
          {message.tokenUsage && (
            <span className="tokens">
              {message.tokenUsage.totalTokens} tokens
            </span>
          )}
        </MessageMeta>
      </MessageContent>
    </MessageWrapper>
  );
}
