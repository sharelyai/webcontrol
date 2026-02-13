import styled, { css } from "styled-components";

export const Wrapper: any = styled.div`
  ${({ theme }: { theme: any }) => css`
    .sharelyai-webcontroller-goals-first-view {
      display: flex;
      flex-direction: column;
      gap: 24px;
      width: 100%;

      @media (min-width: ${theme.screens.lg}) {
        gap: 32px;
      }

      & > .sharelyai-webcontroller-input-section {
        width: 100%;
        align-self: center;

        @media (min-width: ${theme.screens.lg}) {
          width: 60%;
        }
      }

      & > .sharelyai-webcontroller-goals-greeting {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 20px;

        & > p {
          margin: 0;
          color: ${theme.colors.ebony};
          font-size: ${theme.fonts.xl};
          text-align: center;
          font-style: normal;
          font-weight: 600 !important;
          line-height: normal;
          align-self: stretch;
        }

        & > svg,
        & > img {
          width: 44px;
          height: 44px;
          border-radius: 100%;
          border: 1px solid ${theme.colors.whiteLilac};
        }
      }

      & > .sharelyai-webcontroller-subheader {
        width: 100%;
        color: var(
          --web-control-styles-main_color,
          ${theme.colors.ebony}
        );
        font-size: ${theme.fonts.lg};
        text-align: center;
        font-weight: 500;
        text-decoration: underline !important;
      }

      & > .sharelyai-webcontroller-body {
        width: 100%;
        overflow: hidden;

        @media (min-width: ${theme.screens.lg}) {
          height: 100%;
          max-height: 429px;
        }

        .sharelyai-webcontroller-goals-container {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          grid-auto-rows: minmax(auto, 200px);
          grid-gap: 12px;
          width: 100%;

          & > div {
            width: 218px;

            &:first-child {
              justify-self: end;
            }
            &:last-child {
              justify-self: start;
            }

            .sharelyai-webcontroller-goal-card-body {
              line-height: 20px;
            }
          }

          @media (min-width: ${theme.screens.md}) {
            grid-template-rows: auto;
            justify-content: center;

            & > div {
              width: 100%;

              .sharelyai-webcontroller-goal-card-body {
                line-height: 24px;
              }
            }
          }
        }

        .sharelyai-webcontroller-note {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;

          & > span {
            font-size: ${theme.fonts.sm};
            text-align: center;
            width: 700px;
            text-align: left;
            font-style: italic;
            color: ${theme.colors.paleSky};
            font-weight: 500;
          }
        }
      }
    }
  `}
`;
