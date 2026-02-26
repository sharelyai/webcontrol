import React from "react";
import { ArrowUpward, Person, Interests, Tooltip } from "@sharely/ui-shared";
import { classNames } from "@sharely/services";
import { Wrapper } from "./styles";

export interface ChatInputProps {
  message: string;
  onChange: (message: string) => void;
  onSend: () => void;
  isLoading: boolean;
  placeholder?: string;
  showPersonIcon?: boolean;
  showGoalsButton?: boolean;
  onGoalsClick?: () => void;
  disabled?: boolean;
}

export const ChatInput = (props: ChatInputProps) => {
  const {
    message,
    onChange,
    onSend,
    isLoading,
    placeholder,
    showPersonIcon = true,
    showGoalsButton = true,
    onGoalsClick,
    disabled = false,
  } = props;

  const isDisabled = isLoading || !message.trim();

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-content-input-container">
        <div
          className={classNames("sharelyai-webcontroller-content-input", {
            "sharelyai-webcontroller-disabled": disabled,
            "sharelyai-webcontroller-icon-disabled": isDisabled,
          })}
        >
          {showPersonIcon ? (
            <div className="sharelyai-webcontroller-image-user">
              <Person />
            </div>
          ) : (
            <span />
          )}
          <input
            type="text"
            placeholder={placeholder}
            value={message}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <div
            className={classNames("sharelyai-webcontroller-content-input-icon", {
              disabled: isDisabled,
            })}
            onClick={() => {
              if (!isDisabled) onSend();
            }}
          >
            <ArrowUpward />
          </div>
        </div>
        {showGoalsButton && (
          <Tooltip text="Accomplish a Goal" placement="top">
            <div
              className="sharelyai-webcontroller-content-input-icon-goals"
              onClick={onGoalsClick}
            >
              <Interests />
            </div>
          </Tooltip>
        )}
      </div>
    </Wrapper>
  );
};
