import { Wrapper } from "./styles";
import { Download, PictureAsPdf } from "@sharely/ui-shared";

interface IProps {
  title: string;
  description: string;
  onClick: () => void;
  isLoading?: boolean;
}

export const GoalOutcome = (props: IProps) => {
  const { title, description, isLoading, onClick } = props;

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-goal-outcome-icon">
        <PictureAsPdf />
      </div>
      <div className="sharelyai-webcontroller-goal-outcome-content">
        <p className="sharelyai-webcontroller-goal-outcome-title">{title}</p>
        <p className="sharelyai-webcontroller-goal-outcome-description">
          {description}
        </p>
      </div>
      <button
        className="sharelyai-webcontroller-goal-outcome-button"
        onClick={onClick}
        disabled={isLoading}
      >
        <Download />
        {isLoading ? "Generating" : "Download"}
      </button>
    </Wrapper>
  );
};
