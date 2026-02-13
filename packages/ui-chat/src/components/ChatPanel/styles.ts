import styled, { css } from 'styled-components';

type WrapperProps = {
  $isChatOpen?: boolean;
};

export const Wrapper: any = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<WrapperProps>`
  ${({ theme, $isChatOpen }) => css`
    display: flex;
    flex-direction: column;
    flex: 1;
    height: 100%;
    background: ${theme.colors.white};
    overflow: hidden;
    position: relative;

    @media (max-width: ${theme.screens.md}) {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;

      ${$isChatOpen &&
      css`
        transform: translateX(0);
      `}
    }

    & > .header {
      display: flex;
      align-items: center;
      padding: 16px 24px;
      border-bottom: 1px solid ${theme.colors.athensGray2};
      gap: 12px;

      & > .back {
        display: none;
        @media (max-width: ${theme.screens.md}) {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
        }
      }

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.lg};
        font-weight: 600;
      }
    }

    & > .messages {
      flex: 1;
      overflow: hidden;
    }

    & > .footer {
      padding: 16px 24px;
      border-top: 1px solid ${theme.colors.athensGray2};
    }
  `}
`;