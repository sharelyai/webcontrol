import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { useAgentChat } from "@sharelyai/services";
import { AgentMessage } from "../AgentMessage";
import { StreamingContent } from "../StreamingContent";
import {
  AgentChatWrapper,
  ErrorBanner,
  InputTextarea,
  InputWrapper,
  MessagesContainer,
  MessageWrapper,
  MessageAvatar,
  MessageContent,
  SendButton,
  ToolCallsContainer,
} from "../styles";
import { ThinkingIndicator } from "../ThinkingIndicator";
import { ToolCallCard } from "../ToolCallCard";
import { BotIcon } from "../icons";
import { SourcesList } from "../SourcesList";

interface AgentChatPanelProps {
  spaceId: string;
  initialThreadId?: string;
  className?: string;
}

export function AgentChatPanel({
  spaceId,
  initialThreadId,
  className,
}: AgentChatPanelProps) {
  const {
    messages,
    isStreaming,
    streamingContent,
    thinkingSteps,
    activeToolCalls,
    activeSources,
    error,
    sendMessage,
    stopStreaming,
    clearError,
  } = useAgentChat({ spaceId, initialThreadId });

  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, thinkingSteps, activeToolCalls]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isStreaming) return;

    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  return (
    <AgentChatWrapper className={className}>
      {/* Error Banner */}
      {error && (
        <ErrorBanner>
          <span>{error}</span>
          <button onClick={clearError}>Dismiss</button>
        </ErrorBanner>
      )}

      {/* Messages */}
      <MessagesContainer>
        {messages.map((message) => (
          <AgentMessage key={message.id} message={message} />
        ))}

        {/* Streaming Message */}
        {isStreaming && (
          <MessageWrapper $role="assistant" $isStreaming>
            <MessageAvatar $role="assistant">
              <BotIcon />
            </MessageAvatar>
            <MessageContent $role="assistant">
              {thinkingSteps.length > 0 && (
                <ThinkingIndicator steps={thinkingSteps} />
              )}

              {activeToolCalls.length > 0 && (
                <ToolCallsContainer>
                  {activeToolCalls.map((tc) => (
                    <ToolCallCard key={tc.id} toolCall={tc} />
                  ))}
                </ToolCallsContainer>
              )}

              {streamingContent && (
                <StreamingContent content={streamingContent} />
              )}

              {activeSources.length > 0 && (
                <SourcesList sources={activeSources} />
              )}
            </MessageContent>
          </MessageWrapper>
        )}

        <div ref={messagesEndRef} />
      </MessagesContainer>

      {/* Input */}
      <InputWrapper onSubmit={handleSubmit}>
        <InputTextarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask a question..."
          disabled={isStreaming}
          onKeyDown={handleKeyDown}
          rows={1}
        />

        {isStreaming ? (
          <SendButton type="button" onClick={stopStreaming} $variant="danger">
            Stop
          </SendButton>
        ) : (
          <SendButton type="submit" disabled={!inputValue.trim()}>
            Send
          </SendButton>
        )}
      </InputWrapper>
    </AgentChatWrapper>
  );
}
