import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 12px;
    margin-top: 8px;

    & > .button {
      background: none;
      border: 1px solid ${theme.colors.athensGray2};
      border-radius: 6px;
      padding: 4px 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      color: ${theme.colors.paleSky};
      font-size: ${theme.fonts.xs};
      transition: all 0.2s;

      &:hover {
        background: ${theme.colors.athensGray2};
        color: ${theme.colors.ebony};
      }

      &.active {
        background: ${theme.colors.whiteLilac};
        border-color: ${theme.colors.indigo};
        color: ${theme.colors.indigo};

        svg {
          fill: ${theme.colors.indigo};
        }
      }

      svg {
        width: 14px;
        height: 14px;
        fill: ${theme.colors.paleSky};
      }
    }
  `}
`;