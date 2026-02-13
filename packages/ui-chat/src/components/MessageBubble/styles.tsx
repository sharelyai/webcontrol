import styled, { css } from 'styled-components';

type WrapperProps = {
  $isUser?: boolean;
};

export const Wrapper: any = styled.div.withConfig({
  shouldForwardProp: (prop) => !prop.startsWith('$'),
})<WrapperProps>`
  ${({ theme, $isUser }) => css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px 24px;
    align-self: ${$isUser ? 'flex-end' : 'flex-start'};
    max-width: 85%;

    @media (max-width: ${theme.screens.md}) {
      max-width: 95%;
      padding: 12px 16px;
    }

    & > .bubble {
      padding: 12px 16px;
      border-radius: 12px;
      background: ${$isUser ? theme.colors.indigo : theme.colors.whiteLilac};
      color: ${$isUser ? theme.colors.white : theme.colors.ebony};
      font-size: ${theme.fonts.base};
      line-height: 1.5;
      position: relative;

      ${$isUser &&
      css`
        border-bottom-right-radius: 2px;
      `}

      ${!$isUser &&
      css`
        border-bottom-left-radius: 2px;
      `}

      & > .text {
        word-break: break-word;
      }
    }

    & > .info {
      display: flex;
      align-items: center;
      gap: 8px;
      color: ${theme.colors.gullGray};
      font-size: ${theme.fonts.xs};
      justify-content: ${$isUser ? 'flex-end' : 'flex-start'};
    }
  `}
`;