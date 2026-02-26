import { css, styled } from "styled-components";

export const Wrapper = styled.div`
  ${({ theme }) => css`
    button {
      padding: 0;
      border: none;
      background: none;
      cursor: pointer;
    }

    p {
      margin: 0;
    }

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 32px;
    width: 100%;
    height: max-content;
    max-width: 402px;

    @media (min-width: ${theme.screens.lg}) {
      max-width: 470px;
      gap: 40px;
    }

    & > .title > p {
      color: ${theme.colors.ebony};
      text-align: center;
      font-size: ${theme.fonts.xl};
      font-style: normal;
      font-weight: 600;
      line-height: 110%;
    }

    & > .body {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 32px;

      & > .form {
        display: flex;
        flex-direction: column;
        gap: 20px;

        & > input {
          width: 100%;
          display: flex;
          padding: 8px 0px 8px 16px;
          align-items: center;
          align-self: stretch;
          border-radius: 4px 4px 0px 0px;
          border-radius: 8px;
          border: 1px solid ${theme.colors.athensGray6};
          width: 100%;
          height: 56px;
          color: ${theme.colors.fiord};
          font-size: ${theme.fonts.base};
          font-style: normal;
          font-weight: 500;
          line-height: 24px;

          &:focus,
          &:focus-visible,
          &:hover,
          &:active {
            border: 1px solid ${theme.colors.indigo};
          }
        }

        & > button {
          display: flex;
          height: 48px;
          padding: 10px 16px;
          justify-content: center;
          align-items: center;
          gap: 8px;
          align-self: stretch;
          border-radius: 8px;
          font-size: ${theme.fonts.sm};
          font-style: normal;
          font-weight: 600;
          line-height: 20px;
          background: ${theme.colors.indigo};
          color: ${theme.colors.white};

          &:disabled {
            background: ${theme.colors.athensGray4};
            color: ${theme.colors.paleSky};
          }
        }

        & > .error {
          color: ${theme.colors.flamingo};
          font-size: ${theme.fonts.sm};
          font-style: normal;
          font-weight: 500;
          line-height: 20px;
        }

        & > .have-account {
          display: flex;
          justify-content: center;
          gap: 8px;

          & > span {
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.sm};
            font-style: normal;
            font-weight: 500;
            line-height: 20px;
          }

          & > button {
            color: ${theme.colors.indigo};
            font-size: ${theme.fonts.sm};
            font-style: normal;
            font-weight: 700;
            line-height: 20px;
          }
        }
      }

      & > .divider {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;

        & > .line {
          width: 100%;
          height: 1px;
          background: ${theme.colors.athensGray6};
        }

        & > span {
          color: ${theme.colors.paleSky};
          text-align: center;
          font-size: ${theme.fonts.base};
          font-style: normal;
          font-weight: 400;
          line-height: 24px;
        }
      }

      & > .others-methods {
        display: flex;
        flex-direction: column;

        & > button {
          display: flex;
          height: 48px;
          padding: 10px 16px;
          justify-content: center;
          align-items: center;
          gap: 8px;
          align-self: stretch;
          border-radius: 8px;
          border: 1px solid ${theme.colors.mischka};
          background: ${theme.colors.white};
          color: ${theme.colors.OxfordBlue};
          font-size: ${theme.fonts.sm};
          font-style: normal;
          font-weight: 600;
          line-height: 20px;

          &:hover {
            background: ${theme.colors.athensGray6};
          }
        }
      }

      & > .confirmation-button {
        color: ${theme.colors.indigo};
        font-size: ${theme.fonts.sm};
        font-style: normal;
        font-weight: 600;
        line-height: 20px;

        &:disabled {
          color: ${theme.colors.paleSky};
        }
      }
    }
  `}
`;
