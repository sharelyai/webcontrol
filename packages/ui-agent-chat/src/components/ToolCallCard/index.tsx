import { useState } from "react";
import type { ToolCall } from "@sharely/services";
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SpinnerIcon,
  XIcon,
} from "../icons";
import {
  ExpandIcon,
  ToolCallDetails,
  ToolCallHeader,
  ToolCallWrapper,
  ToolDuration,
  ToolIconStyled,
  ToolName,
  ToolSection,
} from "../styles";

interface ToolCallCardProps {
  toolCall: ToolCall;
}

function formatToolName(name: string): string {
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function ToolCallCard({ toolCall }: ToolCallCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusIcon = {
    running: <SpinnerIcon />,
    completed: <CheckIcon />,
    error: <XIcon />,
  }[toolCall.status];

  return (
    <ToolCallWrapper $status={toolCall.status}>
      <ToolCallHeader onClick={() => setIsExpanded(!isExpanded)}>
        <ToolIconStyled $status={toolCall.status}>{statusIcon}</ToolIconStyled>
        <ToolName>{formatToolName(toolCall.name)}</ToolName>
        {toolCall.durationMs !== undefined && (
          <ToolDuration>{toolCall.durationMs}ms</ToolDuration>
        )}
        <ExpandIcon>
          {isExpanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
        </ExpandIcon>
      </ToolCallHeader>

      {isExpanded && (
        <ToolCallDetails>
          <ToolSection>
            <h4>Input</h4>
            <pre>{JSON.stringify(toolCall.input, null, 2)}</pre>
          </ToolSection>

          {toolCall.status !== "running" && (
            <ToolSection>
              <h4>{toolCall.error ? "Error" : "Output"}</h4>
              <pre>
                {toolCall.error || JSON.stringify(toolCall.output, null, 2)}
              </pre>
            </ToolSection>
          )}
        </ToolCallDetails>
      )}
    </ToolCallWrapper>
  );
}
