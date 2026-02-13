import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 24px;
    height: 100%;

    & > .header {
      display: flex;
      justify-content: space-between;
      align-items: center;

      & > .title {
        color: ${theme.colors.ebony};
        font-size: ${theme.fonts.lg};
        font-weight: 600;
      }
    }

    & > .list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      overflow-y: auto;
    }
  `}
`;