import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { ThinkingStep } from "@sharely/services";
import {
  BrainIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpinnerIcon,
  XIcon,
} from "../icons";
import {
  ExpandIcon,
  StepContent,
  StepDuration,
  StepHeader,
  StepStatus,
  StepTitle,
  ThinkingHeader,
  ThinkingIcon,
  ThinkingStepItem,
  ThinkingStepsList,
  ThinkingTitle,
  ThinkingWrapper,
} from "../styles";

interface ThinkingIndicatorProps {
  steps: ThinkingStep[];
  collapsed?: boolean;
}

export function ThinkingIndicator({
  steps,
  collapsed = false,
}: ThinkingIndicatorProps) {
  const [isExpanded, setIsExpanded] = useState(!collapsed);

  const activeStep = steps.find((s) => s.status === "running");
  const completedCount = steps.filter((s) => s.status === "completed").length;

  if (steps.length === 0) return null;

  return (
    <ThinkingWrapper>
      <ThinkingHeader onClick={() => setIsExpanded(!isExpanded)}>
        <ThinkingIcon $spinning={!!activeStep}>
          {activeStep ? <SpinnerIcon /> : <BrainIcon />}
        </ThinkingIcon>
        <ThinkingTitle>
          {activeStep
            ? activeStep.title
            : `Completed ${completedCount} reasoning step${completedCount !== 1 ? "s" : ""}`}
        </ThinkingTitle>
        <ExpandIcon>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </ExpandIcon>
      </ThinkingHeader>

      {isExpanded && (
        <ThinkingStepsList>
          {steps.map((step) => (
            <ThinkingStepItem key={step.id} $status={step.status}>
              <StepHeader className="step-header">
                <StepStatus $status={step.status}>
                  {step.status === "running" && <SpinnerIcon />}
                  {step.status === "completed" && <CheckIcon />}
                  {step.status === "failed" && <XIcon />}
                </StepStatus>
                <StepTitle>{step.title}</StepTitle>
                {step.durationMs !== undefined && (
                  <StepDuration>{step.durationMs}ms</StepDuration>
                )}
              </StepHeader>
              {step.content && (
                <StepContent>
                  <ReactMarkdown>{step.content}</ReactMarkdown>
                </StepContent>
              )}
            </ThinkingStepItem>
          ))}
        </ThinkingStepsList>
      )}
    </ThinkingWrapper>
  );
}
