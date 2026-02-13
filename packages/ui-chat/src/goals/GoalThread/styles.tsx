import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    background: ${theme.colors.white};
    border: 1px solid ${theme.colors.athensGray2};
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: ${theme.colors.indigo};
      box-shadow: ${theme.shadows.lowDepthShadow};
    }

    & > .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.sm};
        font-weight: 600;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    & > .last-message {
      color: ${theme.colors.fiord};
      font-size: ${theme.fonts.xs};
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `}
`;