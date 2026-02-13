import React from "react";
import { Wrapper } from "./styles";
import { 
  LogoChat as Logo, 
  ScrollBar,
  useResponsive 
} from "@sharely/ui-shared";
import { 
  useGlobalStore, 
  useLanguage,
  constants 
} from "@sharely/services";
import { GoalCard } from "../../goals/GoalCard";
import { Title } from "./components/title";

export interface IGoalProps {
  id: string;
  title: string;
  completionGreeting: string;
  description: string;
  status: string;
}

export interface SuggestedQuestionsProps {
  imageAI: string;
  greeting: string;
  goals: IGoalProps[];
  handleView: (view: string, thread: object) => void;
  renderInputSection?: () => React.ReactNode;
}

export const SuggestedQuestions = (props: SuggestedQuestionsProps) => {
  const { greeting, goals, imageAI, handleView, renderInputSection } = props;
  const { isDesktop } = useResponsive();
  const { workspace } = useGlobalStore();
  const { langText } = useLanguage();

  const customConfig = workspace?.spaceStyling?.customConfig?.container;
  const hasCustomConfig = Boolean(customConfig);
  const hasCustomTitle = Boolean(
    workspace?.spaceStyling?.customConfig?.views?.chat?.title
  );

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-goals-first-view">
        {hasCustomTitle && <Title />}
        {!hasCustomTitle && (
          <div className="sharelyai-webcontroller-goals-greeting">
            {imageAI ? <img src={imageAI} alt="logo" /> : <Logo />}
            <p>{greeting}</p>
          </div>
        )}
        {renderInputSection && (
          <div className="sharelyai-webcontroller-input-section">
            {renderInputSection()}
          </div>
        )}
        <div className="sharelyai-webcontroller-body">
          {hasCustomConfig && goals?.length === 0 && (
            <div className="sharelyai-webcontroller-note">
              <span>{langText.NoteChatPoweredByAIBSFText}</span>
            </div>
          )}
          {goals?.length > 0 && (
            <ScrollBar options={{ suppressScrollX: isDesktop }}>
              <div className="sharelyai-webcontroller-goals-container">
                {goals?.slice(0, 2)?.map((goal) => (
                  <GoalCard
                    key={goal?.id}
                    status={goal?.status || constants.GOAL_NOT_STARTED}
                    description={goal?.description}
                    title={goal?.title}
                    onClick={() => {
                      handleView(constants.GOALS_DETAIL_PAGE, {
                        goalId: goal?.id,
                      });
                    }}
                  />
                ))}
              </div>
            </ScrollBar>
          )}
        </div>
      </div>
    </Wrapper>
  );
};
