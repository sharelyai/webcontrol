import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.colors.white};

    & > .header {
      padding: 24px;
      border-bottom: 1px solid ${theme.colors.athensGray2};
      display: flex;
      flex-direction: column;
      gap: 12px;

      & > .top {
        display: flex;
        justify-content: space-between;
        align-items: center;

        & > .back {
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          color: ${theme.colors.indigo};
          font-size: ${theme.fonts.sm};
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
        }
      }

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.xl};
        font-weight: 600;
      }
    }

    & > .content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `}
`;