import { useEffect, useRef, useState } from "react";

import { Wrapper, StreamingMessageWrapper, GreetingWrapper } from "./styles";
import { ChatHistory } from "../ChatHistory";
import {
  useAgentChat,
  useGlobalStore,
  useLanguage,
  constants,
  classNames,
  agentMessageToBodyMessage,
} from "@sharely/services";
import type { ThinkingStep, ToolCall, Source } from "@sharely/services";
import {
  ScrollBar,
  Tooltip,
  Person,
  Interests,
  ArrowUpward,
  Logo,
} from "@sharely/ui-shared";
import { MessageBubble } from "@sharely/ui-chat";
import { ThinkingIndicator, ToolCallCard, SourcesList } from "@sharely/ui-agent-chat";

interface AgentViewProps {
  spaceId: string;
}

// Inline streaming message component
function StreamingMessage({
  content,
  thinkingSteps,
  activeToolCalls,
  activeSources = [],
  imageAI,
  name,
}: {
  content: string;
  thinkingSteps: ThinkingStep[];
  activeToolCalls: ToolCall[];
  activeSources?: Source[];
  imageAI?: string;
  name?: string;
}) {
  const hasContent = content.length > 0;
  const hasThinking = thinkingSteps.length > 0;
  const hasToolCalls = activeToolCalls.length > 0;
  const hasSources = activeSources.length > 0;
  const isPending = !hasContent && !hasThinking && !hasToolCalls;

  return (
    <StreamingMessageWrapper>
      <div className="sharelyai-webcontroller-content-message-image-ai">
        {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
      </div>
      <div className="sharelyai-webcontroller-streaming-content">
        <p className="sharelyai-webcontroller-content-message-name">
          {name || "AI Bot"}
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
            {activeToolCalls.map((tc) => (
              <ToolCallCard key={tc.id} toolCall={tc} />
            ))}
          </div>
        )}

        {hasContent && (
          <div className="sharelyai-webcontroller-streaming-text">
            <span>{content}</span>
            <span className="sharelyai-webcontroller-streaming-cursor" />
          </div>
        )}

        {hasSources && (
          <div className="sharelyai-webcontroller-streaming-sources">
            <SourcesList sources={activeSources} defaultCollapsed={false} />
          </div>
        )}
      </div>
    </StreamingMessageWrapper>
  );
}

export const AgentView = ({ spaceId }: AgentViewProps) => {
  const [message, setMessage] = useState("");
  const [showChatHistory, setShowChatHistory] = useState(false);

  const { config, workspace, currentInformation, setCurrentInformation } =
    useGlobalStore();
  const { t } = useLanguage();

  const agentChat = useAgentChat({
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
      agentChat.loadThread(currentThreadId);
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
    ? t(customConfig?.inputChat?.placeholderText) ||
      t('IndexSmallChatText')
    : t('IndexSmallChatText');

  // Convert agent messages for display
  const convertedMessages = agentChat.messages.map(agentMessageToBodyMessage);
  // Reverse for column-reverse display
  const messages = [...convertedMessages].reverse();
  const hasMessages = messages.length > 0 || agentChat.isStreaming;
  const hasJustGreeting =
    !agentChat.threadId && messages.length === 0 && !agentChat.isStreaming;

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
    if (!messageToSend.trim() || agentChat.isStreaming) return;

    setMessage("");
    const newThreadId = await agentChat.sendMessage(messageToSend);

    // Update thread ID if a new thread was created
    if (newThreadId && newThreadId !== currentInformation?.agentThreadId) {
      setCurrentInformation({
        agentThreadId: newThreadId,
      });
    }
  };

  const handleCreateNewChat = () => {
    setShowChatHistory(false);
    setCurrentInformation({
      agentThreadId: undefined,
      agentThreadName: undefined,
    });
    // Reset the agent chat state
    agentChat.createThread();
  };

  const renderInputSection = () => {
    return (
      <div className="sharelyai-webcontroller-container-input">
        <div className="sharelyai-webcontroller-content-input-container">
          <div
            className={classNames("sharelyai-webcontroller-content-input", {
              "sharelyai-webcontroller-disabled": agentChat.isStreaming,
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
              disabled={agentChat.isStreaming}
            />
            <div
              className={classNames(
                "sharelyai-webcontroller-content-input-icon",
                { disabled: !message || agentChat.isStreaming },
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
          onClose={() => setShowChatHistory(false)}
          handleCreateNewChat={handleCreateNewChat}
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
          {agentChat.error && (
            <div className="sharelyai-webcontroller-agent-error">
              <span>Error: {agentChat.error}</span>
              <button onClick={agentChat.clearError}>Dismiss</button>
            </div>
          )}

          {/* Streaming message */}
          {agentChat.isStreaming && (
            <StreamingMessage
              content={agentChat.streamingContent}
              thinkingSteps={agentChat.thinkingSteps}
              activeToolCalls={agentChat.activeToolCalls}
              activeSources={agentChat.activeSources}
              imageAI={workspace?.photo}
              name={workspace?.defaultSpaceName || workspace?.name || "AI Bot"}
            />
          )}

          {/* Messages list */}
          {!hasJustGreeting &&
            messages.map((msg: any) => (
              <MessageBubble
                key={msg.id}
                messageId={msg.id}
                type={msg.type}
                message={msg.message}
                imageAI={workspace?.photo ?? ""}
                name={
                  workspace?.defaultSpaceName || workspace?.name || "AI Bot"
                }
                sourcesMetadata={msg.sourcesMetadata}
                showThumbUpIcon={false}
                showSourcesButton={customConfig?.message?.showSourcesButton}
              />
            ))}

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
