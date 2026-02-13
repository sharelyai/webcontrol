import { 
  ScrollBar, 
  ArrowBack, 
  useMaxHeight, 
  useVisualViewport 
} from "@sharely/ui-shared";

import { Wrapper } from "./styles";
import { GoalCard } from "../GoalCard";
import {
  useGlobalStore,
  useGoals,
  constants,
} from "@sharely/services";

export const GoalsList = () => {
  const {
    currentInformation,
    prevStepActive,
    setStepActive,
    setCurrentInformation,
  } = useGlobalStore();
  const { spaceGoals } = useGoals({
    spaceId: currentInformation?.spaceId,
  });
  const { viewportHeight: height } = useVisualViewport();
  const { viewportHeight } = useMaxHeight(height);

  const handleView = async (goalId: string) => {
    const findGoal = (spaceGoals as any[])?.find((goal) => (goal?.goalId === goalId || goal?.id === goalId));

    setCurrentInformation({
      thread: {
        ...findGoal,
        threadId: undefined,
      },
      currentGroupId: undefined,
      currentName: undefined,
      preview: false,
    });
    setStepActive(constants.GOALS_DETAIL_PAGE);
  };

  const handleBack = () => {
    setStepActive(prevStepActive[prevStepActive.length - 2] || constants.CHAT_STEP);
  };

  return (
    <Wrapper height={viewportHeight + 20}>
      <div className="sharelyai-webcontroller-body-goals">
        <div className="sharelyai-webcontroller-body-goals-header">
          <div
            className="sharelyai-webcontroller-header-back-icon"
            onClick={handleBack}
          >
            <ArrowBack />
          </div>
          <p className="sharelyai-webcontroller-body-goals-subtitle">Goals</p>
        </div>
        <div className="sharelyai-webcontroller-body-goals-body">
          <ScrollBar options={{ suppressScrollX: true }}>
            {(spaceGoals as any[])?.length > 0 &&
              (spaceGoals as any[])?.map((goal) => {
                const goalId = goal?.goalId || goal?.id;
                return (
                  <GoalCard
                    key={goalId}
                    title={goal?.title}
                    description={goal?.description}
                    status={constants.GOAL_NOT_STARTED}
                    onClick={() => {
                      handleView(goalId);
                    }}
                  />
                );
              })}
          </ScrollBar>
        </div>
      </div>
    </Wrapper>
  );
};