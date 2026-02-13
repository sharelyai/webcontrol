import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }: { theme: any }) => css`
    width: 100%;
    padding: 12px 24px;
    background: ${theme.colors.white};

    .sharelyai-webcontroller-chat-input-container {
      border-radius: 50px;
      border: 1px solid ${theme.colors.athensGray2};
      background-color: ${theme.colors.white};
      display: flex;
      align-items: flex-end;
      gap: 12px;
      padding: 8px 12px;
      width: 100%;

      &:focus-within {
        border: 1px solid var(--web-control-styles-main_color, ${theme.colors.indigo});
      }

      .sharelyai-webcontroller-chat-input-icon {
        background-color: ${theme.colors.white};
        border: 1px solid ${theme.colors.whiteLilac};
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        flex-shrink: 0;
        margin-bottom: 2px;

        & > svg {
          width: 20px;
          height: 20px;
          fill: ${theme.colors.paleSky};
        }
      }

      .sharelyai-webcontroller-chat-input-textarea {
        flex: 1;
        border: none;
        outline: none;
        background: transparent;
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.base};
        font-weight: 500;
        line-height: 24px;
        padding: 8px 0;
        resize: none;
        max-height: 150px;
        min-height: 24px;

        &::placeholder {
          color: ${theme.colors.gullGray};
        }
      }

      .sharelyai-webcontroller-chat-input-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
        margin-bottom: 2px;

        .sharelyai-webcontroller-chat-input-goals-button {
          background-color: var(--web-control-styles-main_card_background, ${theme.colors.whiteLilac2});
          border: none;
          border-radius: 50px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;

          & > svg {
            width: 20px;
            height: 20px;
            fill: var(--web-control-styles-main_color, ${theme.colors.indigo});
          }
        }

        .sharelyai-webcontroller-chat-input-send-button {
          background-color: var(--web-control-styles-main_color, ${theme.colors.indigo});
          border: none;
          width: 36px;
          height: 36px;
          cursor: pointer;
          padding: 8px;
          border-radius: 50px;
          display: flex;
          align-items: center;
          justify-content: center;

          &:disabled {
            background-color: ${theme.colors.athensGray3};
            cursor: not-allowed;
            & > svg {
              fill: ${theme.colors.gullGray};
            }
          }

          & > svg {
            width: 20px;
            height: 20px;
            fill: ${theme.colors.white};
          }

          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid ${theme.colors.white};
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
        }
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `}
`;
