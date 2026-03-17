import { Wrapper } from "./styles";
import { useLanguage } from "@sharelyai/services";
import { constants } from "@sharelyai/services";

export interface IStatusGoalProps {
  status: string;
}

const LANG_TEXT_STATUS = {
  [constants.GOAL_NOT_STARTED]: "GoalNotStarted",
  [constants.GOAL_CANCELLED]: "GoalNotStarted",
  [constants.GOAL_ACTIVE]: "GoalActive",
  [constants.GOAL_COMPLETED]: "GoalCompleted",
};

export const StatusGoal = (props: IStatusGoalProps) => {
  const { status } = props;

  const { langText } = useLanguage();

  const statusText = langText?.[LANG_TEXT_STATUS[status]];

  return <Wrapper status={status}>{statusText}</Wrapper>;
};
