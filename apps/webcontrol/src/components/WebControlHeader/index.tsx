import {
  Logo,
  Skeleton,
  Tooltip,
  Close,
  Forum,
  AddChatBox,
  Restart,
} from "@sharelyai/ui-shared";
import { classNames } from "@sharelyai/services";
import { ViewTabs } from "../ViewTabs";

interface WebControlHeaderProps {
  workspace: any;
  isInline: boolean;
  isChatView: boolean;
  isAgentView: boolean;
  isNotGoalsStep: boolean;
  isGoal: boolean;
  hasGroups: boolean;
  /** Toggle the threads / chat-history drawer for the active view. */
  onToggleThreads: () => void;
  /** Restart the current goal thread (chat view, goal groups only). */
  onRestartGoal: () => void;
  /** Start a new chat / agent thread. */
  onNewChat: () => void;
  /** Close the widget (non-inline modes). */
  onClose: () => void;
}

/**
 * The widget header: threads toggle + workspace identity on the left, view tabs
 * in the center, and the goal-restart / new-chat / close actions on the right.
 * Extracted from WebControl — purely presentational, behavior unchanged.
 */
export const WebControlHeader = ({
  workspace,
  isInline,
  isChatView,
  isAgentView,
  isNotGoalsStep,
  isGoal,
  hasGroups,
  onToggleThreads,
  onRestartGoal,
  onNewChat,
  onClose,
}: WebControlHeaderProps) => {
  return (
    <div className="web-control-header">
      <div className="web-control-header-grid">
        <div className="header-left">
          {(isChatView || isAgentView) && isNotGoalsStep && (
            <>
              <Tooltip text="Threads" placement="bottom">
                <button
                  className={classNames("header-threads-btn", {
                    disabled: isChatView && !hasGroups,
                  })}
                  onClick={onToggleThreads}
                  disabled={isChatView && !hasGroups}
                >
                  <Forum />
                </button>
              </Tooltip>
              <div className="header-logo-info">
                <div className="header-logo">
                  {workspace?.photo ? (
                    <img src={workspace.photo} alt="AI" />
                  ) : workspace?.id ? (
                    <Logo />
                  ) : (
                    <Skeleton width={40} height={40} />
                  )}
                </div>
                <span className="header-title">
                  {workspace?.organizationName || workspace?.name || (
                    <Skeleton width={100} height={20} />
                  )}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="header-center">
          <ViewTabs />
        </div>
        <div className="header-right">
          {isNotGoalsStep && isChatView && isGoal && (
            <Tooltip text="Restart goal" placement="bottom">
              <button
                className={classNames("header-action-btn", {
                  disabled: !hasGroups,
                })}
                onClick={onRestartGoal}
                disabled={!hasGroups}
              >
                <Restart />
              </button>
            </Tooltip>
          )}
          {isNotGoalsStep && (isChatView || isAgentView) && (
            <Tooltip text="New chat" placement="bottom">
              <button
                className={classNames("header-action-btn", {
                  disabled: isChatView && !hasGroups,
                })}
                onClick={onNewChat}
                disabled={isChatView && !hasGroups}
              >
                <AddChatBox />
              </button>
            </Tooltip>
          )}
          {!isInline && (
            <Tooltip text="Close" placement="bottom">
              <button className="header-action-btn" onClick={onClose}>
                <Close />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
