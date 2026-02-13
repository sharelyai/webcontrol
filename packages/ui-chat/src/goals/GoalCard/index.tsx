import { useEffect, useRef } from "react";

import { Wrapper } from "./styles";
import { Flag } from "@sharely/ui-shared";
import { useLanguage, constants, getLastTimeAgo } from "@sharely/services";

interface IGoalCardProps {
  title: string;
  description: string;
  status: string;
  lastTime?: string;
  onClick?: () => void;
}

const LANG_TEXT_STATUS: Record<string, string> = {
  [constants.GOAL_NOT_STARTED]: "GoalStarted",
  [constants.GOAL_ACTIVE]: "GoalContinue",
  [constants.GOAL_COMPLETED]: "GoalStarted",
  [constants.GOAL_CANCELLED]: "GoalStarted",
  "null": "GoalStarted",
};

export const GoalCard = (props: IGoalCardProps) => {
  const { title, description, status, lastTime = "", onClick } = props;
  const titleRef = useRef<HTMLParagraphElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const { t } = useLanguage();

  const statusText = t(LANG_TEXT_STATUS[status] || LANG_TEXT_STATUS["null"]);

  useEffect(() => {
    if (!titleRef.current || !descriptionRef.current) return;

    ["overflow-one", "overflow-two"].forEach((className) => {
      titleRef.current?.classList.remove(className);
      descriptionRef.current?.classList.remove(className);
    });

    if (titleRef.current.offsetHeight > 40) {
      titleRef.current.classList.add("overflow-two");
      descriptionRef.current.classList.add("overflow-one");
    } else {
      titleRef.current.classList.add("overflow-one");
      descriptionRef.current.classList.add("overflow-two");
    }
  }, [t]);

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-goal-card-header">
        <div className="sharelyai-webcontroller-goal-card-sub-header">
          <div className="sharelyai-webcontroller-goal-card-icon">
            <Flag />
          </div>
          <p ref={titleRef} className="sharelyai-webcontroller-goal-card-title">
            {title}
          </p>
        </div>
      </div>
      <div
        ref={descriptionRef}
        className="sharelyai-webcontroller-goal-card-body"
      >
        {description}
      </div>
      <div className="sharelyai-webcontroller-goal-card-footer">
        <p className="sharelyai-webcontroller-goal-card-last-started">
          {lastTime && `Started ${getLastTimeAgo(lastTime)}`}
        </p>
        <button
          className="sharelyai-webcontroller-goal-card-button"
          onClick={onClick}
        >
          {statusText}
        </button>
      </div>
    </Wrapper>
  );
};
