import styled, { css } from 'styled-components';

export const Wrapper = styled.div`
  ${({ theme }) => css`
    background-color: ${theme.colors.whiteLilac2};
    padding: 16px 20px;
    border-radius: 20px 20px 0px 0px;
    z-index: 10;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;

    @media (max-width: ${theme.screens.lg}) {
      grid-template-columns: 1fr 1fr;
    }

    p {
      margin: 0;
    }

    .left {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 8px;
    }

    .sharelyai-webcontroller-content-save-conversation {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      cursor: pointer;

      @media (max-width: ${theme.screens.lg}) {
        justify-content: flex-start;
      }

      .sharelyai-webcontroller-content-save-conversation-text {
        color: ${theme.colors.shark};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: normal;
        margin: 0;
        white-space: break-spaces;
        text-wrap-mode: nowrap;
      }

      .sharelyai-webcontroller-content-save-conversation-text.sharelyai-webcontroller-save {
        cursor: pointer;
        color: ${theme.colors.indigo};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        text-wrap-mode: nowrap;
      }
    }

    .right {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 20px;

      .sharelyai-webcontroller-content-save-conversation-text.sharelyai-webcontroller-save {
        cursor: pointer;
        color: ${theme.colors.indigo};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 20px;
        text-wrap-mode: nowrap;
      }
    }
  `}
`;
