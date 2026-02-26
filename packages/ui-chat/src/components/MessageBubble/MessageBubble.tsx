import { ReactNode, useState } from "react";

import { Wrapper } from "./styles";
import {
  AutoAwesome,
  Logo,
  Person,
  ReactMarkdown,
  useResponsive,
} from "@sharely/ui-shared";
import {
  constants,
  customEvents,
  regex,
  replaceMessageValue,
} from "@sharely/services";
import { MessageFeedback } from "../MessageFeedback";
import { SourcesWithModal } from "./components/SourcesWithModal";
import { WorkflowProgress } from "../WorkflowProgress";

export interface IMessageProps {
  feedback?: string;
  messageId: string;
  type: string;
  message: string;
  name?: string;
  imageAI?: string;
  goalSuggestions?: {
    id: string;
    description: string;
    source: string;
    sourceTitle: string;
    score: number;
    createdAt: string;
    image?: string;
  }[];
  footer?: ReactNode;
  hasCurrentGoalSuggestionsMessage?: boolean;
  threadUsers?: {
    id: string;
    user: {
      id: string;
      photo: string;
    };
  }[];
  user?: {
    id: string;
    name: string;
    photo: string;
  };
  userName?: string;
  showThumbUpIcon?: boolean;
  thumbType?: string;
  sourcesMetadata?: {
    source: string;
    metadata: unknown;
  }[];
  workflowProgressProps?: {
    workspaceId: string;
    goalId?: string;
    messageFrom: string;
    groupId: string;
    data?: {
      id: string;
      logs?: unknown;
      status?: string;
      statusMessage?: string;
    }[];
  };
  showSourcesButton?: boolean;
  onClick?: () => void;
  handleThumbUp?: () => void;
  handleThumbDown?: () => void;
  handleSendFeedback?: (props: any) => void;
}

export const MessageBubble = (props: IMessageProps) => {
  const {
    messageId,
    message,
    type,
    name,
    imageAI,
    goalSuggestions,
    hasCurrentGoalSuggestionsMessage,
    footer,
    threadUsers,
    user,
    userName,
    showThumbUpIcon,
    thumbType,
    feedback,
    sourcesMetadata,
    workflowProgressProps,
    showSourcesButton = true,
    onClick,
    handleThumbUp,
    handleThumbDown,
    handleSendFeedback,
  } = props;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [showCollapse, setShowCollapse] = useState<boolean>(false);

  const { isDesktop } = useResponsive();

  const isAiMessage = type === constants.CONVERSATIONS_TYPE_AI;

  const handleMouseHover = (hovered: boolean) => {
    if (isDesktop) {
      setIsHovered(hovered);
    }
  };

  const filterUniqueUsers = (threads: any[]) => {
    if (!threads) return [];

    const uniqueUsers: Record<string, boolean> = {};
    const uniqueThreads: any[] = [];

    threads.forEach((thread) => {
      const userId = thread?.user?.id;
      if (userId && !uniqueUsers[userId]) {
        uniqueUsers[userId] = true;
        uniqueThreads.push(thread);
      }
    });

    return uniqueThreads;
  };

  return (
    <Wrapper
      type={type}
      hasCurrentGoalSuggestionsMessage={hasCurrentGoalSuggestionsMessage}
      hasGoalSuggestions={goalSuggestions && goalSuggestions.length > 0}
      onClick={onClick}
      onMouseEnter={() => handleMouseHover(true)}
      onMouseLeave={() => handleMouseHover(false)}
    >
      {type === constants.CONVERSATIONS_TYPE_AI && (
        <div className="sharelyai-webcontroller-content-message-image-ai">
          {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
        </div>
      )}
      {type !== constants.CONVERSATIONS_TYPE_AI && user?.photo && (
        <div className="sharelyai-webcontroller-content-message-image-ai">
          <img src={user?.photo} alt={user?.name || "Anonymous"} />
        </div>
      )}
      {type !== constants.CONVERSATIONS_TYPE_AI && !user?.photo && (
        <div className="sharelyai-webcontroller-content-message-image-user">
          <Person />
        </div>
      )}
      <div className="sharelyai-webcontroller-content-message">
        <div className="sharelyai-webcontroller-content-message-header">
          <p className="sharelyai-webcontroller-content-message-name">
            {type === constants.CONVERSATIONS_TYPE_AI
              ? name
              : user?.name || userName || "You"}
          </p>
          {goalSuggestions && goalSuggestions.length > 0 && (
            <>
              <div className="sharelyai-webcontroller-content-message-icon">
                <AutoAwesome />
              </div>
              <p className="sharelyai-webcontroller-content-message-tooltip">
                View AI suggestions
              </p>
            </>
          )}
          {isAiMessage && (
            <WorkflowProgress
              {...workflowProgressProps}
              messageId={messageId}
              type="USER"
              showCollapse={showCollapse}
              setShowCollapse={setShowCollapse}
            />
          )}
        </div>
        <div className="sharelyai-webcontroller-content-message-text">
          {isAiMessage && (
            <WorkflowProgress
              {...workflowProgressProps}
              messageId={messageId}
              type="MESSAGE"
              showCollapse={showCollapse}
              setShowCollapse={setShowCollapse}
            />
          )}
          <ReactMarkdown
            customProps={{
              sourcesMetadata: sourcesMetadata,
              message: message,
              messageId: messageId,
            }}
          >
            {replaceMessageValue({ message })}
          </ReactMarkdown>
        </div>
        {showSourcesButton && sourcesMetadata && sourcesMetadata.length > 0 && (
          <SourcesWithModal sources={sourcesMetadata} message={message} />
        )}
        <div className="sharelyai-webcontroller-content-message-footer">
          {footer}
          {showThumbUpIcon && (
            <MessageFeedback
              feedback={feedback}
              messageId={messageId}
              isAiMessage={isAiMessage}
              isHovered={isHovered}
              thumbType={thumbType}
              handleThumbUp={handleThumbUp!}
              handleThumbDown={handleThumbDown!}
              handleSendFeedback={handleSendFeedback}
            />
          )}
        </div>
        {regex.GET_SAVE_TAGS.test(message) && (
          <div className="chat-content-conversation-text-save-message">
            <div className="left">
              <p className="title">Save conversation to continue</p>
              <p className="description">
                {regex.GET_SAVE_CONTENT.exec(message)?.[0] ||
                  "Create an account to keep talking with AI and reach your goals"}
              </p>
            </div>
            <div className="right">
              <button
                onClick={() => {
                  customEvents.publish(
                    constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION,
                    { open: true },
                  );
                }}
              >
                Save conversation
              </button>
            </div>
          </div>
        )}
        <button
          className="sharelyai-webcontroller-message-thread-button-action"
          onClick={() => {}}
        >
          {threadUsers &&
            threadUsers.length > 0 &&
            filterUniqueUsers(threadUsers)
              .slice(0, 2)
              .map((thread) => (
                <div
                  key={thread.id}
                  className="sharelyai-webcontroller-chat-content-conversation-picture-container"
                >
                  {thread?.user?.photo ? (
                    <img
                      src={thread?.user?.photo}
                      alt={thread.user.id}
                      className="sharelyai-webcontroller-chat-content-conversation-picture"
                    />
                  ) : (
                    <div className="sharelyai-webcontroller-chat-content-conversation-picture">
                      <Person />
                    </div>
                  )}
                </div>
              ))}
          {threadUsers && filterUniqueUsers(threadUsers).length > 2 && (
            <div className="sharelyai-webcontroller-chat-content-conversation-picture-rest-users">
              +{filterUniqueUsers(threadUsers).length - 2}
            </div>
          )}
          {threadUsers && threadUsers.length > 0
            ? `${threadUsers.length} ${
                threadUsers.length > 1 ? "Messages" : "Message"
              }`
            : ""}
        </button>
      </div>
    </Wrapper>
  );
};
