import { Wrapper } from "./styles";
import { Ellipse, Flag, LogoChat, Person } from "@sharely/ui-shared";
import { ReactMarkdown } from "@sharely/ui-shared";
import { useLanguage } from "@sharely/services";
import { constants, formatDate, replaceMessageValue } from "@sharely/services";
import { StatusGoal } from "../GoalStatus";

interface IThreadCardProps {
  title: string;
  description: string;
  status: string;
  lastTime?: string;
  messages?: number;
  showStatus?: boolean;
  onClick?: () => void;
  type?: string;
  isHumanThread?: boolean;
  user?: {
    id: string;
    name: string;
    photo: string;
  };
  imageAi?: string;
  threadUsers?: {
    id: string;
    user: {
      id: string;
      photo: string;
    };
  }[];
}

const LANG_TEXT_STATUS = {
  [constants.GOAL_NOT_STARTED]: "GoalStarted",
  [constants.GOAL_ACTIVE]: "GoalContinue",
  [constants.GOAL_COMPLETED]: "ViewThread",
  [constants.GOAL_CANCELLED]: "ViewThread",
  null: "GoalStarted",
};

export const ThreadCard = (props: IThreadCardProps) => {
  const {
    title,
    description,
    status,
    lastTime = "",
    showStatus = true,
    messages,
    onClick,
    type,
    isHumanThread = false,
    user,
    imageAi,
    threadUsers,
  } = props;

  const { langText } = useLanguage();

  const statusText = langText?.[(LANG_TEXT_STATUS as any)[status]];

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-thread-card-header">
        <div className="sharelyai-webcontroller-thread-card-sub-header">
          {!isHumanThread && (
            <div className="sharelyai-webcontroller-thread-card-icon">
              <Flag />
            </div>
          )}
          <p className="sharelyai-webcontroller-thread-card-title">{title}</p>
        </div>
        {showStatus && (
          <StatusGoal status={status || constants.GOAL_NOT_STARTED} />
        )}
      </div>
      <div className="sharelyai-webcontroller-thread-card-body">
        {type === constants.CONVERSATIONS_TYPE_USER ? (
          <>
            {user?.photo ? (
              <img
                src={user?.photo}
                alt={user?.name || "Anonymous"}
                sizes="32px 32px"
                className="sharelyai-webcontroller-chat-content-conversation-picture"
              />
            ) : (
              <div className="sharelyai-webcontroller-chat-content-conversation-picture-name">
                {user?.name?.substring(0, 1)?.toUpperCase() || <Person />}
              </div>
            )}
          </>
        ) : type === constants.CONVERSATIONS_TYPE_AI && isHumanThread ? (
          <>
            {imageAi ? (
              <img
                src={imageAi}
                alt={constants.CONVERSATIONS_TYPE_AI}
                sizes="32px 32px"
                className="sharelyai-webcontroller-chat-content-conversation-picture"
              />
            ) : (
              <div className="sharelyai-webcontroller-chat-content-conversation-picture">
                <LogoChat />
              </div>
            )}
          </>
        ) : null}
        <div className="sharelyai-webcontroller-chat-content-conversation-text">
          <ReactMarkdown>
            {replaceMessageValue({ message: description })}
          </ReactMarkdown>
        </div>
      </div>
      <div className="sharelyai-webcontroller-thread-card-footer">
        <div className="sharelyai-webcontroller-thread-card-footer-left">
          <p className="sharelyai-webcontroller-thread-card-last-started">
            {lastTime && formatDate(lastTime, "SHORT")}
          </p>
          <Ellipse />
          <p className="sharelyai-webcontroller-thread-card-last-started">
            {`${messages} ${langText?.Answer}`}
          </p>
        </div>
        <div className="sharelyai-webcontroller-thread-card-footer-right">
          {threadUsers && threadUsers.length > 0 && isHumanThread ? (
            <div className="sharelyai-webcontroller-thread-card-footer-container-images">
              {threadUsers.slice(0, 2).map((thread) =>
                thread?.user?.photo ? (
                  <img
                    key={thread.id}
                    src={thread?.user?.photo}
                    alt={thread.user.id}
                    className="sharelyai-webcontroller-chat-content-conversation-picture"
                  />
                ) : (
                  <div
                    key={thread.id}
                    className="sharelyai-webcontroller-chat-content-conversation-picture"
                  >
                    <LogoChat />
                  </div>
                )
              )}
            </div>
          ) : (
            <button
              className="sharelyai-webcontroller-thread-card-button"
              onClick={onClick}
            >
              {statusText}
            </button>
          )}
        </div>
      </div>
    </Wrapper>
  );
};