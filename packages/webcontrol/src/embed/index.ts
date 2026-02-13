import React from 'react';
import ReactDOM from 'react-dom/client';
import { useGlobalStore } from '@sharely/services';
import { constants } from '@sharely/services';
import type { SharelyConfig } from '@sharely/services';
import { WebControl } from '../WebControl';
import { GlobalStyle, ThemeProvider } from '@sharely/ui-shared';

declare global {
  interface Window {
    sharelyai: typeof sharelyai;
    __sharelyaiRoot?: ReturnType<typeof ReactDOM.createRoot>;
  }
}

export const sharelyai = {
  initialize(
    config: SharelyConfig & { externalToken?: string; spaceId?: string }
  ) {
    // Destroy any previous instance before initializing
    sharelyai.destroy();

    const { externalToken, spaceId, ...userConfig } = config;

    if (userConfig?.mode) {
      if (!constants.POSITIONS.includes(userConfig.mode)) {
        throw new Error(
          `The mode ${userConfig.mode} is not valid. The valid modes are: ${constants.POSITIONS.join(', ')}`
        );
      }
    }

    useGlobalStore.setState((state) => ({
      ...state,
      config: {
        lang: constants.LANGUAGE_EN,
        langKnowledge: constants.LANGUAGE_EN,
        ...state.config,
        ...userConfig,
      } as SharelyConfig,
      ...(Boolean(externalToken) &&
        Boolean(spaceId) && {
          currentInformation: {
            ...state.currentInformation,
            spaceId,
          },
        }),
      ...(Boolean(externalToken) && {
        externalToken: externalToken || state.externalToken,
        token: externalToken || state.token,
        loginToken: externalToken || state.loginToken,
      }),
    }));
  },

  render() {
    const rootElement = document.getElementById('sharelyai-webcontroller-id');
    if (rootElement) {
      rootElement.style.height = 'auto';

      if (!window.__sharelyaiRoot) {
        window.__sharelyaiRoot = ReactDOM.createRoot(rootElement);
      }

      const state = useGlobalStore.getState();
      const config = state.config;

      window.__sharelyaiRoot.render(
        React.createElement(
          React.StrictMode,
          null,
          React.createElement(WebControl, {
            workspaceId: config?.workspaceId || '',
            baseUrl: config?.baseUrl,
            externalUserId: config?.externalUserId,
            lang: config?.lang,
            theme: undefined,
          }),
        )
      );
    }
  },

  destroy() {
    if (window.__sharelyaiRoot) {
      window.__sharelyaiRoot.unmount();
      window.__sharelyaiRoot = undefined;
    } else {
      const rootElement = document.getElementById('sharelyai-webcontroller-id');
      if (rootElement) {
        rootElement.innerHTML = '';
      }
    }
  },

  config() {
    const state = useGlobalStore.getState();
    return {
      lang: state.config?.lang,
      langKnowledge: state.config?.langKnowledge,
    };
  },
};

// Expose on window
if (typeof window !== 'undefined') {
  window.sharelyai = sharelyai;
}
