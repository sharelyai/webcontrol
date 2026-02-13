import styled, { css } from 'styled-components';

export const Wrapper: any = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 20px;
    background: ${theme.colors.whiteLilac};
    border-radius: 12px;
    border: 1px solid ${theme.colors.indigo}20;

    & > .title {
      color: ${theme.colors.indigo};
      font-size: ${theme.fonts.base};
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    & > .content {
      color: ${theme.colors.ebony};
      font-size: ${theme.fonts.sm};
      line-height: 1.6;
      white-space: pre-wrap;
    }
  `}
`;