import { css, styled } from "styled-components";

export const Wrapper = styled.div`
  ${({ theme }) => css`
    height: 100%;
    width: 100%;

    .modal-container-loading {
      width: 100%;
      height: 100%;
    }

    .modal-container {
      border-radius: 20px;
      box-shadow: ${theme.shadows.medium};
      background: ${theme.colors.white};
      width: 100%;
      height: 100%;
      display: grid;
      grid-template-rows: auto 1fr;

      @media (max-width: ${theme.screens.lg}) {
        max-width: 100%;
        max-height: 100%;
        border-radius: 0px;
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px;
        max-height: 60px;

        @media (min-width: ${theme.screens.lg}) {
          padding: 20px;
          max-height: 62px;
        }

        .modal-header-title {
          display: flex;
          align-items: center;
          gap: 8px;

          & > .logo {
            width: 32px;
            height: 32px;
            border-radius: 32px;
            overflow: hidden;

            & > img {
              width: 32px;
              height: 32px;
              border-radius: 32px;
              object-fit: cover;
            }
          }

          & > .title {
            color: ${theme.colors.ebony};
            font-size: ${theme.fonts.base};
            font-style: normal;
            font-weight: 600;
            line-height: 24px;
          }
        }

        .modal-header-icon {
          width: 24px;
          height: 24px;
          padding: 0;
          border: none;
          background: none;
          cursor: pointer;

          & > svg {
            width: 24px;
            height: 24px;
            color: ${theme.colors.paleSky};
          }
        }
      }

      .modal-body {
        display: flex;
        justify-content: center;
        padding: 40px 16px 0px 16px;

        @media (min-width: ${theme.screens.lg}) {
          padding-top: 44px;
        }

        &:has(.modal-container-loading) {
          align-items: center;
          padding: 0;

          .modal-container-loading {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  `}
`;
