import styled, { css, keyframes } from "styled-components";

// Animations
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const blink = keyframes`
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Main Container
export const AgentChatWrapper = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.colors.white};
  `}
`;

// Error Banner
export const ErrorBanner = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: ${theme.colors.provincialPink};
    border-bottom: 1px solid ${theme.colors.cinderella};
    color: ${theme.colors.thunderbird};
    font-size: ${theme.fonts.sm};

    button {
      background: none;
      border: none;
      color: ${theme.colors.thunderbird};
      cursor: pointer;
      font-weight: 500;
      padding: 4px 8px;
      border-radius: 4px;

      &:hover {
        background: ${theme.colors.cinderella};
      }
    }
  `}
`;

// Messages Container
export const MessagesContainer = styled.div`
  ${({ theme }) => css`
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: ${theme.colors.athensGray};
    }

    &::-webkit-scrollbar-thumb {
      background: ${theme.colors.mischka};
      border-radius: 3px;
    }
  `}
`;

// Message Styles
interface MessageWrapperProps {
  $role: "user" | "assistant" | "system";
  $isStreaming?: boolean;
}

export const MessageWrapper = styled.div<MessageWrapperProps>`
  ${({ $role, $isStreaming }) => css`
    display: flex;
    gap: 12px;
    animation: ${fadeIn} 0.2s ease-out;

    ${$role === "user" &&
    css`
      flex-direction: row-reverse;
    `}

    ${$isStreaming &&
    css`
      opacity: 0.95;
    `}
  `}
`;

export const MessageAvatar = styled.div<{ $role: "user" | "assistant" | "system" }>`
  ${({ theme, $role }) => css`
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    font-size: 14px;

    ${$role === "user"
      ? css`
          background: ${theme.colors.cornflowerBlue};
          color: ${theme.colors.white};
        `
      : css`
          background: ${theme.colors.mediumPurple};
          color: ${theme.colors.white};
        `}
  `}
`;

export const MessageContent = styled.div<{ $role: "user" | "assistant" | "system" }>`
  ${({ $role }) => css`
    flex: 1;
    max-width: 80%;
    display: flex;
    flex-direction: column;
    gap: 8px;

    ${$role === "user" &&
    css`
      align-items: flex-end;
    `}
  `}
`;

export const MessageText = styled.div<{ $role: "user" | "assistant" | "system" }>`
  ${({ theme, $role }) => css`
    padding: 12px 16px;
    border-radius: 12px;
    font-size: ${theme.fonts.sm};
    line-height: 1.5;

    ${$role === "user"
      ? css`
          background: ${theme.colors.cornflowerBlue};
          color: ${theme.colors.white};
          border-bottom-right-radius: 4px;
        `
      : css`
          background: ${theme.colors.athensGray};
          color: ${theme.colors.ebony};
          border-bottom-left-radius: 4px;
        `}

    p {
      margin: 0 0 8px 0;

      &:last-child {
        margin-bottom: 0;
      }
    }

    code {
      background: ${$role === "user"
        ? "rgba(255, 255, 255, 0.2)"
        : theme.colors.athensGray2};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
    }

    pre {
      background: ${theme.colors.mirage};
      color: ${theme.colors.athensGray};
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 8px 0;

      code {
        background: none;
        padding: 0;
      }
    }
  `}
`;

export const MessageMeta = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: 12px;
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.paleSky};
    padding: 0 4px;
  `}
`;

// Thinking Indicator Styles
export const ThinkingWrapper = styled.div`
  ${({ theme }) => css`
    border-radius: 8px;
    border: 1px solid ${theme.colors.athensGray2};
    overflow: hidden;
    background: ${theme.colors.white};
  `}
`;

export const ThinkingHeader = styled.button`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: ${theme.colors.athensGray};
    border: none;
    cursor: pointer;
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.fiord};
    text-align: left;

    &:hover {
      background: ${theme.colors.athensGray2};
    }
  `}
`;

export const ThinkingIcon = styled.span<{ $spinning?: boolean }>`
  ${({ theme, $spinning }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    color: ${theme.colors.mediumPurple};

    ${$spinning &&
    css`
      animation: ${spin} 1s linear infinite;
    `}

    svg {
      width: 16px;
      height: 16px;
    }
  `}
`;

export const ThinkingTitle = styled.span`
  flex: 1;
  font-weight: 500;
`;

export const ExpandIcon = styled.span`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    color: ${theme.colors.gullGray};

    svg {
      width: 16px;
      height: 16px;
    }
  `}
`;

export const ThinkingStepsList = styled.div`
  ${({ theme }) => css`
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    border-top: 1px solid ${theme.colors.athensGray2};
  `}
`;

export const ThinkingStepItem = styled.div<{ $status: "running" | "completed" | "failed" }>`
  ${({ theme, $status }) => css`
    display: flex;
    flex-direction: column;
    gap: 6px;

    ${$status === "running" &&
    css`
      opacity: 0.9;
    `}

    ${$status === "failed" &&
    css`
      .step-header {
        color: ${theme.colors.flamingo};
      }
    `}
  `}
`;

export const StepHeader = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.fiord};
  `}
`;

export const StepStatus = styled.span<{ $status: "running" | "completed" | "failed" }>`
  ${({ theme, $status }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;

    ${$status === "running" &&
    css`
      color: ${theme.colors.mediumPurple};
      animation: ${spin} 1s linear infinite;
    `}

    ${$status === "completed" &&
    css`
      color: ${theme.colors.mountainMeadow};
    `}

    ${$status === "failed" &&
    css`
      color: ${theme.colors.flamingo};
    `}

    svg {
      width: 14px;
      height: 14px;
    }
  `}
`;

export const StepTitle = styled.span`
  flex: 1;
  font-weight: 500;
`;

export const StepDuration = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.paleSky};
  `}
`;

export const StepContent = styled.div`
  ${({ theme }) => css`
    margin-left: 24px;
    padding: 8px 12px;
    background: ${theme.colors.athensGray};
    border-radius: 6px;
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.shuttleGray};
    line-height: 1.5;
    max-height: 200px;
    overflow-y: auto;
  `}
`;

// Tool Call Card Styles
export const ToolCallWrapper = styled.div<{ $status: "running" | "completed" | "error" }>`
  ${({ theme, $status }) => css`
    border-radius: 8px;
    border: 1px solid
      ${$status === "error"
        ? theme.colors.cinderella
        : theme.colors.athensGray2};
    overflow: hidden;
    background: ${theme.colors.white};
  `}
`;

export const ToolCallHeader = styled.button`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: ${theme.colors.athensGray};
    border: none;
    cursor: pointer;
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.fiord};
    text-align: left;

    &:hover {
      background: ${theme.colors.athensGray2};
    }
  `}
`;

export const ToolIconStyled = styled.span<{ $status: "running" | "completed" | "error" }>`
  ${({ theme, $status }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;

    ${$status === "running" &&
    css`
      color: ${theme.colors.cornflowerBlue};
      animation: ${spin} 1s linear infinite;
    `}

    ${$status === "completed" &&
    css`
      color: ${theme.colors.mountainMeadow};
    `}

    ${$status === "error" &&
    css`
      color: ${theme.colors.flamingo};
    `}

    svg {
      width: 16px;
      height: 16px;
    }
  `}
`;

export const ToolName = styled.span`
  flex: 1;
  font-weight: 500;
`;

export const ToolDuration = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.paleSky};
  `}
`;

export const ToolCallDetails = styled.div`
  ${({ theme }) => css`
    padding: 12px;
    border-top: 1px solid ${theme.colors.athensGray2};
    display: flex;
    flex-direction: column;
    gap: 12px;
  `}
`;

export const ToolSection = styled.div`
  ${({ theme }) => css`
    h4 {
      margin: 0 0 6px 0;
      font-size: ${theme.fonts.xs};
      font-weight: 600;
      color: ${theme.colors.paleSky};
      text-transform: uppercase;
    }

    pre {
      margin: 0;
      padding: 10px;
      background: ${theme.colors.mirage};
      color: ${theme.colors.athensGray};
      border-radius: 6px;
      font-size: ${theme.fonts.xs};
      overflow-x: auto;
      max-height: 200px;
      overflow-y: auto;
    }
  `}
`;

// Sources List Styles
export const SourcesWrapper = styled.div`
  ${({ theme }) => css`
    padding: 12px;
    background: ${theme.colors.athensGray};
    border-radius: 8px;

    h4 {
      margin: 0 0 8px 0;
      font-size: ${theme.fonts.xs};
      font-weight: 600;
      color: ${theme.colors.paleSky};
      text-transform: uppercase;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    li {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
  `}
`;

export const SourceIndex = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.gullGray};
    font-weight: 500;
    margin-right: 6px;
  `}
`;

export const SourceLink = styled.a`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.royalBlue};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  `}
`;

export const SourceTitle = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.fiord};
  `}
`;

export const SourceSnippet = styled.p`
  ${({ theme }) => css`
    margin: 0;
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.paleSky};
    line-height: 1.4;
    padding-left: 24px;
  `}
`;

// Streaming Content Styles
export const StreamingWrapper = styled.div`
  ${({ theme }) => css`
    padding: 12px 16px;
    background: ${theme.colors.athensGray};
    border-radius: 12px;
    border-bottom-left-radius: 4px;
    font-size: ${theme.fonts.sm};
    line-height: 1.5;
    color: ${theme.colors.ebony};
  `}
`;

export const Cursor = styled.span`
  ${({ theme }) => css`
    display: inline-block;
    width: 2px;
    height: 1em;
    background: ${theme.colors.mediumPurple};
    margin-left: 2px;
    vertical-align: text-bottom;
    animation: ${blink} 1s step-end infinite;
  `}
`;

// Input Area Styles
export const InputWrapper = styled.form`
  ${({ theme }) => css`
    display: flex;
    gap: 12px;
    padding: 16px;
    border-top: 1px solid ${theme.colors.athensGray2};
    background: ${theme.colors.white};
  `}
`;

export const InputTextarea = styled.textarea`
  ${({ theme }) => css`
    flex: 1;
    min-height: 44px;
    max-height: 120px;
    padding: 10px 14px;
    border: 1px solid ${theme.colors.mischka};
    border-radius: 8px;
    font-size: ${theme.fonts.sm};
    font-family: inherit;
    resize: none;
    outline: none;
    transition: border-color 0.15s;

    &:focus {
      border-color: ${theme.colors.mediumPurple};
    }

    &:disabled {
      background: ${theme.colors.athensGray};
      cursor: not-allowed;
    }

    &::placeholder {
      color: ${theme.colors.gullGray};
    }
  `}
`;

export const SendButton = styled.button<{ $variant?: "primary" | "danger" }>`
  ${({ theme, $variant = "primary" }) => css`
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: ${theme.fonts.sm};
    font-weight: 500;
    cursor: pointer;
    transition: background 0.15s;

    ${$variant === "primary" &&
    css`
      background: ${theme.colors.mediumPurple};
      color: ${theme.colors.white};

      &:hover:not(:disabled) {
        background: ${theme.colors.mysticLavender};
      }
    `}

    ${$variant === "danger" &&
    css`
      background: ${theme.colors.flamingo};
      color: ${theme.colors.white};

      &:hover:not(:disabled) {
        background: ${theme.colors.thunderbird};
      }
    `}

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `}
`;

// Tool Calls Container
export const ToolCallsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// SourceChips Styles

export const SourceChipsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    background: ${theme.colors.athensGray};
    border-radius: 8px;
    border: 1px solid ${theme.colors.athensGray2};
    overflow: hidden;
  `}
`;

export const SourceChipsHeader = styled.button<{ $collapsed?: boolean }>`
  ${({ theme, $collapsed }) => css`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s;

    &:hover {
      background: ${theme.colors.athensGray2};
    }

    > svg {
      width: 16px;
      height: 16px;
      color: ${theme.colors.fiord};
      flex-shrink: 0;
    }

    h4 {
      margin: 0;
      font-size: ${theme.fonts.sm};
      font-weight: 500;
      color: ${theme.colors.fiord};
      flex: 1;
    }

    > span {
      font-size: ${theme.fonts.xs};
      color: ${theme.colors.gullGray};
    }

    ${$collapsed &&
    css`
      border-radius: 8px;
    `}
  `}
`;

export const SourceChipsContent = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 0 12px 12px 12px;
    border-top: 1px solid ${theme.colors.athensGray2};
    padding-top: 12px;
  `}
`;

export const SourceChip = styled.div<{ $expanded?: boolean }>`
  ${({ theme, $expanded }) => css`
    background: ${theme.colors.white};
    border: 1px solid ${theme.colors.athensGray2};
    border-radius: 8px;
    overflow: hidden;
    transition: box-shadow 0.15s;

    ${$expanded &&
    css`
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    `}
  `}
`;

export const SourceChipHeader = styled.button`
  ${({ theme }) => css`
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    background: transparent;
    border: none;
    cursor: pointer;
    text-align: left;

    &:hover {
      background: ${theme.colors.athensGray};
    }
  `}
`;

export const SourceTypeIcon = styled.span<{ $type: string }>`
  ${({ theme, $type }) => css`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    flex-shrink: 0;

    svg {
      width: 14px;
      height: 14px;
    }

    ${$type === "knowledge" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "document" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "atom" &&
    css`
      background: ${theme.colors.selago};
      color: ${theme.colors.mediumPurple};
    `}

    ${$type === "taxonomy" &&
    css`
      background: ${theme.colors.foam};
      color: ${theme.colors.mountainMeadow};
    `}

    ${$type === "role" &&
    css`
      background: ${theme.colors.provincialPink};
      color: ${theme.colors.flamingo};
    `}

    ${$type === "url" &&
    css`
      background: ${theme.colors.lightSkyBlue};
      color: ${theme.colors.royalBlue};
    `}
  `}
`;

export const SourceChipTitle = styled.span`
  ${({ theme }) => css`
    flex: 1;
    font-size: ${theme.fonts.sm};
    font-weight: 500;
    color: ${theme.colors.fiord};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
`;

export const SourceChipScore = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    font-weight: 600;
    color: ${theme.colors.mountainMeadow};
    background: ${theme.colors.foam};
    padding: 2px 6px;
    border-radius: 4px;
  `}
`;

export const SourceChipExpandIcon = styled.span<{ $expanded?: boolean }>`
  ${({ theme, $expanded }) => css`
    display: flex;
    align-items: center;
    color: ${theme.colors.gullGray};
    transition: transform 0.2s;

    svg {
      width: 16px;
      height: 16px;
    }

    ${$expanded &&
    css`
      transform: rotate(180deg);
    `}
  `}
`;

export const SourceChipContent = styled.div`
  ${({ theme }) => css`
    padding: 12px;
    border-top: 1px solid ${theme.colors.athensGray2};
    display: flex;
    flex-direction: column;
    gap: 10px;
  `}
`;

export const SourceChipRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

export const SourceChipLabel = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.xs};
    font-weight: 600;
    color: ${theme.colors.paleSky};
    text-transform: uppercase;
  `}
`;

export const SourceChipValue = styled.span`
  ${({ theme }) => css`
    font-size: ${theme.fonts.sm};
    color: ${theme.colors.ebony};
    word-break: break-word;
  `}
`;

export const SourceChipExcerpt = styled.p`
  ${({ theme }) => css`
    margin: 0;
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.shuttleGray};
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  `}
`;

export const SourceChipLink = styled.a`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: ${theme.fonts.xs};
    color: ${theme.colors.royalBlue};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }

    svg {
      width: 12px;
      height: 12px;
    }
  `}
`;

export const SourceChipTypeBadge = styled.span<{ $type: string }>`
  ${({ theme, $type }) => css`
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 500;
    text-transform: capitalize;

    svg {
      width: 12px;
      height: 12px;
    }

    ${$type === "knowledge" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "document" &&
    css`
      background: ${theme.colors.athensGray2};
      color: ${theme.colors.fiord};
    `}

    ${$type === "atom" &&
    css`
      background: ${theme.colors.selago};
      color: ${theme.colors.mediumPurple};
    `}

    ${$type === "taxonomy" &&
    css`
      background: ${theme.colors.foam};
      color: ${theme.colors.mountainMeadow};
    `}

    ${$type === "role" &&
    css`
      background: ${theme.colors.provincialPink};
      color: ${theme.colors.flamingo};
    `}

    ${$type === "url" &&
    css`
      background: ${theme.colors.lightSkyBlue};
      color: ${theme.colors.royalBlue};
    `}
  `}
`;

export const SourceChipOpenButton = styled.button`
  ${({ theme }) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    width: 100%;
    padding: 8px 12px;
    background-color: var(--web-control-styles-main_color);
    color: ${theme.colors.white};
    border: none;
    border-radius: 6px;
    font-size: ${theme.fonts.xs};
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.15s;
    margin-top: 4px;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    svg {
      width: 14px;
      height: 14px;
    }
  `}
`;
