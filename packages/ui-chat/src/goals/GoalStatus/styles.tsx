import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    border-radius: 100px;
    font-size: ${theme.fonts.xs};
    font-weight: 600;
    width: fit-content;

    &.completed {
      background: ${theme.colors.athensGray4};
      color: ${theme.colors.ebony};
    }

    &.in_progress {
      background: ${theme.colors.indigo}15;
      color: ${theme.colors.indigo};
    }

    &.pending {
      background: ${theme.colors.selectiveYellow}15;
      color: ${theme.colors.selectiveYellow};
    }

    & > .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
    }
  `}
`;