import {
  ScrollBar,
  AutoAwesome,
  Close,
  Description,
  Language,
  Summarize,
  Loader,
  Skeleton,
} from "@sharelyai/ui-shared";
import { constants, classNames } from "@sharelyai/services";

// types
import { IGoalSuggestionsMessage } from "./index";

export interface IAiCardProps {
  currentGoalSuggestionsMessage?: IGoalSuggestionsMessage;
  handleCurrentGoalSuggestionsMessage: (value: any) => void;
}

export const AiCard = (props: IAiCardProps) => {
  const { currentGoalSuggestionsMessage, handleCurrentGoalSuggestionsMessage } =
    props;
  const currentGoalActions = currentGoalSuggestionsMessage?.goalActions || [];

  if (currentGoalActions?.length > 0) {
    const typeMethod = currentGoalActions?.[0]?.goalActionsAvailable?.type;
    const currentTitle =
      currentGoalActions?.[0]?.title ||
      constants.GOAL_ACTIONS_TYPE_TITLE_ACTIONS[typeMethod];
    const getMethod = currentGoalActions?.[0]?.method;
    const isShowMethod = getMethod === constants.GOAL_ACTIONS_METHOD_SHOW;
    const isIframeView =
      isShowMethod &&
      constants.GOAL_ACTIONS_TYPE_WEB_IFRAME.includes(typeMethod);
    const isSeoView =
      isShowMethod && typeMethod === constants.GOAL_ACTIONS_TYPE_WEB_LINK;

    return (
      <div
        className={classNames(
          "sharelyai-webcontroller-content-chat-goal-suggestions",
          {
            iframe: isIframeView,
          }
        )}
      >
        <div className="sharelyai-webcontroller-content-chat-goal-suggestions-header">
          <div className="sharelyai-webcontroller-content-chat-goal-suggestions-title">
            <div className="sharelyai-webcontroller-content-chat-goal-suggestions-title-icon">
              {constants.GOAL_ACTIONS_TYPE_MEETING_ACTIONS.includes(
                typeMethod
              ) && (
                <img
                  src={currentGoalActions?.[0]?.goalActionsAvailable?.icon}
                  alt="icon"
                />
              )}
              {constants.GOAL_ACTIONS_TYPE_WEB_ACTIONS.includes(typeMethod) && (
                <AutoAwesome />
              )}
            </div>
            <p className="sharelyai-webcontroller-content-chat-goal-suggestions-title-text">
              {currentTitle ? currentTitle : <Skeleton width={100} />}
            </p>
          </div>
          <div
            className="sharelyai-webcontroller-content-chat-goal-suggestions-close"
            onClick={() => handleCurrentGoalSuggestionsMessage(null)}
          >
            <Close />
          </div>
        </div>
        {isIframeView && (
          <iframe
            title="AI Card Iframe"
            src={currentGoalActions?.[0]?.action}
            style={{ border: "none" }}
            width="100%"
            height="90%"
          />
        )}
        {isSeoView && currentGoalActions?.[0]?.isLoading && (
          <Loader text="Loading..." type="card-loading" />
        )}
        {isSeoView && !currentGoalActions?.[0]?.isLoading && (
          <ScrollBar>
            <div
              className="sharelyai-webcontroller-content-chat-goal-action-seo"
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                window.open(currentGoalActions?.[0]?.action, "_blank");
              }}
            >
              <div className="sharelyai-webcontroller-content-chat-goal-action-seo-header">
                <div className="sharelyai-webcontroller-content-chat-goal-action-seo-title-icon">
                  <img
                    src={
                      currentGoalActions?.[0]?.metadata?.favicon ??
                      currentGoalActions?.[0]?.goalActionsAvailable?.icon
                    }
                    alt="icon"
                  />
                  <div className="sharelyai-webcontroller-content-chat-goal-action-seo-title">
                    {currentGoalActions?.[0]?.action}
                  </div>
                </div>
                <a href={currentGoalActions[0]?.action}>
                  {currentGoalActions?.[0]?.metadata?.title}
                </a>
                <div className="sharelyai-webcontroller-content-chat-goal-action-seo-description">
                  {currentGoalActions?.[0]?.metadata?.description}
                </div>
              </div>
              <div className="sharelyai-webcontroller-content-chat-goal-action-seo-body">
                <div className="sharelyai-webcontroller-content-chat-goal-action-seo-image">
                  <img
                    src={currentGoalActions?.[0]?.metadata?.image}
                    alt="content_image"
                  />
                </div>
              </div>
            </div>
          </ScrollBar>
        )}
      </div>
    );
  }

  return (
    <div className="sharelyai-webcontroller-content-chat-goal-suggestions">
      <div className="sharelyai-webcontroller-content-chat-goal-suggestions-header">
        <div className="sharelyai-webcontroller-content-chat-goal-suggestions-title">
          <div className="sharelyai-webcontroller-content-chat-goal-suggestions-title-icon">
            <AutoAwesome />
          </div>
          <p className="sharelyai-webcontroller-content-chat-goal-suggestions-title-text">
            AI suggestions
          </p>
        </div>
        <div
          className="sharelyai-webcontroller-content-chat-goal-suggestions-close"
          onClick={() => handleCurrentGoalSuggestionsMessage(undefined)}
        >
          <Close />
        </div>
      </div>
      <ScrollBar>
        <div className="sharelyai-webcontroller-content-chat-goal-suggestions-list">
          {currentGoalSuggestionsMessage?.goalSuggestions?.length > 0 &&
            currentGoalSuggestionsMessage?.goalSuggestions?.map(
              (goalSuggestion, index: number) => (
                <div
                  className={`sharelyai-webcontroller-content-chat-goal-suggestions-list-item ${
                    goalSuggestion?.source?.includes("http")
                      ? "sharelyai-webcontroller-content-chat-goal-suggestions-list-item-url"
                      : ""
                  }`}
                  onClick={
                    goalSuggestion?.source?.includes("http")
                      ? () => {
                          window.open(goalSuggestion?.source, "_blank");
                        }
                      : undefined
                  }
                  key={index}
                >
                  <div className="sharelyai-webcontroller-content-chat-goal-suggestions-list-item-icon">
                    {goalSuggestion?.source?.includes("http") ? (
                      <Language />
                    ) : constants.TYPE_OF_DOCUMENTS.includes(
                        goalSuggestion?.source
                      ) ? (
                      <Description />
                    ) : (
                      <Summarize />
                    )}
                  </div>
                  <div className="sharelyai-webcontroller-content-chat-goal-suggestions-list-item-content">
                    <p className="sharelyai-webcontroller-content-chat-goal-suggestions-list-item-content-title">
                      {goalSuggestion?.source?.includes("pdf") ||
                      goalSuggestion?.source?.includes("csv") ||
                      goalSuggestion?.source?.includes("blob")
                        ? goalSuggestion?.sourceTitle || goalSuggestion?.source
                        : goalSuggestion?.source}
                    </p>
                    <p className="sharelyai-webcontroller-content-chat-goal-suggestions-list-item-content-description">
                      {goalSuggestion?.description}
                    </p>
                  </div>
                </div>
              )
            )}
        </div>
      </ScrollBar>
    </div>
  );
};
