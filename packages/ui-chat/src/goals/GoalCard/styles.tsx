import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    background: ${theme.colors.white};
    border: 1px solid ${theme.colors.athensGray2};
    border-radius: 12px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 12px;

    &:hover {
      border-color: ${theme.colors.indigo};
      box-shadow: ${theme.shadows.lowDepthShadow};
    }

    & > .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.base};
        font-weight: 600;
        line-height: 1.4;
      }
    }

    & > .footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 4px;

      & > .status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: ${theme.fonts.xs};
        font-weight: 500;
      }

      & > .date {
        color: ${theme.colors.gullGray};
        font-size: ${theme.fonts.xs};
      }
    }
  `}
`;