import { useEffect, useRef, useState } from "react";

import { Wrapper, StreamingMessageWrapper, GreetingWrapper } from "./styles";
import { ChatHistory } from "../ChatHistory";
import {
  useGlobalStore,
  useLanguage,
  constants,
  classNames,
  useSharelyChat,
  reasoningPartsToThinkingSteps,
  toolInvocationPartsToToolCalls,
  sourcePartsToSources,
} from "@sharely/services";
import type { ToolCall } from "@sharely/services";
import {
  ScrollBar,
  Tooltip,
  Person,
  Interests,
  ArrowUpward,
  Logo,
} from "@sharely/ui-shared";
import { MessageBubble } from "@sharely/ui-chat";
import {
  ThinkingIndicator,
  ToolCallCard,
  SourcesList,
} from "@sharely/ui-agent-chat";

interface AgentViewV2Props {
  spaceId: string;
  showChatHistory?: boolean;
  onCloseChatHistory?: () => void;
  onCreateNewChat?: () => void;
}

/** A message with parts - matches UIMessage shape without importing the type */
interface MessageWithParts {
  id: string;
  role: string;
  parts: Array<{ type: string; [key: string]: any }>;
}

/** Render parts of a single AI message using existing components */
function MessageParts({
  message,
  isStreaming,
  imageAI,
  name,
  showSourcesButton,
}: {
  message: MessageWithParts;
  isStreaming: boolean;
  imageAI?: string;
  name: string;
  showSourcesButton?: boolean;
}) {
  const parts = message.parts as any[];
  const thinkingSteps = reasoningPartsToThinkingSteps(parts);
  const toolCalls = toolInvocationPartsToToolCalls(parts);
  const sources = sourcePartsToSources(parts);
  const textContent = parts
    .filter((p: any) => p.type === "text")
    .map((p: any) => p.text)
    .join("");

  const hasThinking = thinkingSteps.length > 0;
  const hasToolCalls = toolCalls.length > 0;
  const hasSources = sources.length > 0;
  const hasContent = textContent.length > 0;
  const isPending =
    isStreaming && !hasContent && !hasThinking && !hasToolCalls;

  if (message.role === "user") {
    return (
      <MessageBubble
        messageId={message.id}
        type={constants.CONVERSATIONS_TYPE_USER}
        message={textContent}
        showThumbUpIcon={false}
      />
    );
  }

  // For streaming assistant messages, use the streaming layout
  if (isStreaming) {
    return (
      <StreamingMessageWrapper>
        <div className="sharelyai-webcontroller-content-message-image-ai">
          {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
        </div>
        <div className="sharelyai-webcontroller-streaming-content">
          <p className="sharelyai-webcontroller-content-message-name">
            {name}
          </p>

          {isPending && (
            <div className="sharelyai-webcontroller-streaming-pending">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
            </div>
          )}

          {hasThinking && (
            <div className="sharelyai-webcontroller-streaming-thinking">
              <ThinkingIndicator steps={thinkingSteps} />
            </div>
          )}

          {hasToolCalls && (
            <div className="sharelyai-webcontroller-streaming-tools">
              {toolCalls.map((tc) => (
                <ToolCallCard key={tc.id} toolCall={tc} />
              ))}
            </div>
          )}

          {hasContent && (
            <div className="sharelyai-webcontroller-streaming-text">
              <span>{textContent}</span>
              <span className="sharelyai-webcontroller-streaming-cursor" />
            </div>
          )}

          {hasSources && (
            <div className="sharelyai-webcontroller-streaming-sources">
              <SourcesList sources={sources} defaultCollapsed={false} />
            </div>
          )}
        </div>
      </StreamingMessageWrapper>
    );
  }

  // For completed assistant messages, use MessageBubble with footer
  const footer =
    hasThinking || hasToolCalls || hasSources ? (
      <div className="sharelyai-webcontroller-agent-content">
        {hasThinking && (
          <ThinkingIndicator steps={thinkingSteps} collapsed={true} />
        )}
        {hasToolCalls && (
          <div className="sharelyai-webcontroller-agent-tools">
            {toolCalls.map((tc: ToolCall) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}
        {hasSources && (
          <SourcesList sources={sources} defaultCollapsed={true} />
        )}
      </div>
    ) : undefined;

  // Build sourcesMetadata for MessageBubble (matches expected shape)
  const sourcesMetadata = sources.length > 0
    ? sources.map((s) => ({
        source: s.url || s.title,
        metadata: {
          title: s.title,
          type: s.type,
          snippet: s.snippet,
        },
      }))
    : undefined;

  return (
    <MessageBubble
      messageId={message.id}
      type={constants.CONVERSATIONS_TYPE_AI}
      message={textContent}
      imageAI={imageAI ?? ""}
      name={name}
      sourcesMetadata={sourcesMetadata}
      showThumbUpIcon={false}
      showSourcesButton={showSourcesButton}
      footer={footer}
    />
  );
}

export const AgentViewV2 = ({
  spaceId,
  showChatHistory = false,
  onCloseChatHistory,
  onCreateNewChat,
}: AgentViewV2Props) => {
  const [message, setMessage] = useState("");

  const { config, workspace, currentInformation, setCurrentInformation } =
    useGlobalStore();
  const { t } = useLanguage();

  const chat = useSharelyChat({
    spaceId,
    initialThreadId: currentInformation?.agentThreadId,
  });

  // Track previous thread ID to detect changes
  const prevThreadIdRef = useRef<string | undefined>(
    currentInformation?.agentThreadId,
  );

  // Load thread when agentThreadId changes (e.g., from chat history selection)
  useEffect(() => {
    const currentThreadId = currentInformation?.agentThreadId;

    if (currentThreadId && currentThreadId !== prevThreadIdRef.current) {
      chat.loadThread(currentThreadId);
    }

    prevThreadIdRef.current = currentThreadId;
  }, [currentInformation?.agentThreadId]);

  const customConfig = workspace?.spaceStyling?.customConfig?.views?.chat;
  const hasCustomConfig = Boolean(customConfig);
  const showInputGoalsButton = hasCustomConfig
    ? customConfig?.inputChat?.showGoalsButton
    : false;
  const showPersonIcon = hasCustomConfig
    ? customConfig?.inputChat?.showPersonIcon
    : true;
  const inputPlaceholder = hasCustomConfig
    ? t(customConfig?.inputChat?.placeholderText) || t("IndexSmallChatText")
    : t("IndexSmallChatText");

  const isStreaming = chat.status === "streaming" || chat.isLoading;
  const aiName =
    workspace?.defaultSpaceName || workspace?.name || "AI Bot";

  // Compute display messages (reversed for column-reverse)
  const displayMessages = [...chat.messages].reverse();
  const hasMessages = chat.messages.length > 0 || isStreaming;
  const hasJustGreeting =
    !chat.threadId && chat.messages.length === 0 && !isStreaming;

  const handleChangeMessage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== "Enter") return;
    sendMessage();
  };

  const sendMessage = async (customMessage?: string) => {
    const messageToSend = customMessage || message;
    if (!messageToSend.trim() || isStreaming) return;

    setMessage("");
    const newThreadId = await chat.sendMessage(messageToSend);

    // Update thread ID if a new thread was created
    if (newThreadId && newThreadId !== currentInformation?.agentThreadId) {
      setCurrentInformation({
        agentThreadId: newThreadId,
      });
    }
  };

  const handleCreateNewChat = () => {
    onCloseChatHistory?.();
    setCurrentInformation({
      agentThreadId: undefined,
      agentThreadName: undefined,
    });
    chat.createNewThread();
    onCreateNewChat?.();
  };

  const renderInputSection = () => {
    return (
      <div className="sharelyai-webcontroller-container-input">
        <div className="sharelyai-webcontroller-content-input-container">
          <div
            className={classNames("sharelyai-webcontroller-content-input", {
              "sharelyai-webcontroller-disabled": isStreaming,
              "sharelyai-webcontroller-icon-disabled": !message,
            })}
          >
            {showPersonIcon ? (
              <div className="sharelyai-webcontroller-image-user">
                <Person />
              </div>
            ) : (
              <span />
            )}
            <input
              placeholder={inputPlaceholder}
              value={message}
              onChange={handleChangeMessage}
              onKeyDown={handleSendMessage}
              disabled={isStreaming}
            />
            <div
              className={classNames(
                "sharelyai-webcontroller-content-input-icon",
                { disabled: !message || isStreaming },
              )}
              onClick={() =>
                handleSendMessage({
                  key: "Enter",
                } as React.KeyboardEvent<HTMLInputElement>)
              }
            >
              <ArrowUpward />
            </div>
          </div>
          {showInputGoalsButton && (
            <Tooltip text="Accomplish a Goal" placement="top">
              <div className="sharelyai-webcontroller-content-input-icon-goals">
                <Interests />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    );
  };

  return (
    <Wrapper mode={config?.mode} hasMessages={hasMessages}>
      {showChatHistory && (
        <ChatHistory
          onClose={() => onCloseChatHistory?.()}
          handleCreateNewChat={handleCreateNewChat}
          isAgentMode={true}
          version="v2"
        />
      )}
      <ScrollBar
        className="scrollbar-container"
        scrollBottom={true}
        disableComponent={config?.mode === constants.POSITION_PLACED_INLINE}
        options={{
          suppressScrollX: true,
          suppressScrollY: config?.mode === constants.POSITION_PLACED_INLINE,
        }}
      >
        <div className="sharelyai-webcontroller-content-chat">
          {/* Error display */}
          {chat.error && (
            <div className="sharelyai-webcontroller-agent-error">
              <span>Error: {chat.error.message}</span>
              <button onClick={chat.clearError}>Dismiss</button>
            </div>
          )}

          {/* Messages list - streaming message is the last assistant message */}
          {!hasJustGreeting &&
            displayMessages.map((msg, idx) => {
              // The first message in reversed list (last chronologically)
              // is streaming if we're in streaming state and it's an assistant message
              const isLastAssistant =
                idx === 0 &&
                msg.role === "assistant" &&
                isStreaming;

              return (
                <div key={msg.id}>
                  <MessageParts
                    message={msg}
                    isStreaming={isLastAssistant}
                    imageAI={workspace?.photo}
                    name={aiName}
                    showSourcesButton={
                      customConfig?.message?.showSourcesButton
                    }
                  />
                </div>
              );
            })}

          {/* Show pending indicator when streaming but no assistant message yet */}
          {isStreaming &&
            (displayMessages.length === 0 ||
              displayMessages[0]?.role !== "assistant") && (
              <StreamingMessageWrapper>
                <div className="sharelyai-webcontroller-content-message-image-ai">
                  {workspace?.photo ? (
                    <img src={workspace.photo} alt="logo" />
                  ) : (
                    <Logo />
                  )}
                </div>
                <div className="sharelyai-webcontroller-streaming-content">
                  <p className="sharelyai-webcontroller-content-message-name">
                    {aiName}
                  </p>
                  <div className="sharelyai-webcontroller-streaming-pending">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </div>
                </div>
              </StreamingMessageWrapper>
            )}

          {/* Initial greeting state */}
          {hasJustGreeting && (
            <GreetingWrapper>
              <div className="sharelyai-webcontroller-greeting-logo">
                {workspace?.photo ? (
                  <img src={workspace.photo} alt="logo" />
                ) : (
                  <Logo />
                )}
              </div>
              <p className="sharelyai-webcontroller-greeting-text">
                How can I help you today?
              </p>
              {renderInputSection()}
            </GreetingWrapper>
          )}
        </div>
      </ScrollBar>
      {!hasJustGreeting && renderInputSection()}
    </Wrapper>
  );
};
