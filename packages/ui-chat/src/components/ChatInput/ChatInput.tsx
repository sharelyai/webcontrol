import React, { useRef, useEffect } from "react";
import { Send, Person, Interests, LogoChat } from "@sharely/ui-shared";
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
  } = props;

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <Wrapper>
      <div className="sharelyai-webcontroller-chat-input-container">
        {showPersonIcon && (
          <div className="sharelyai-webcontroller-chat-input-icon">
            <Person />
          </div>
        )}
        <textarea
          ref={textareaRef}
          className="sharelyai-webcontroller-chat-input-textarea"
          placeholder={placeholder}
          value={message}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <div className="sharelyai-webcontroller-chat-input-actions">
          {showGoalsButton && (
            <button
              className="sharelyai-webcontroller-chat-input-goals-button"
              onClick={onGoalsClick}
            >
              <Interests />
            </button>
          )}
          <button
            className={classNames("sharelyai-webcontroller-chat-input-send-button", {
              "is-loading": isLoading,
            })}
            onClick={onSend}
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? <div className="spinner" /> : <Send />}
          </button>
        </div>
      </div>
    </Wrapper>
  );
};