import { useEffect, useMemo } from "react";
import { ToggleButton, ToggleWrapper } from "./styles";

import { useGlobalStore, useLanguage, constants } from "@sharely/services";
import rolesTabsConfig from "./roles-tabs-config.json";

export const ViewTabs = () => {
  const {
    externalToken,
    config,
    setConfig,
    currentView,
    setCurrentView,
    userData,
  } = useGlobalStore();
  const { t } = useLanguage();

  const tabVisibility = useMemo(() => {
    const customerRoleId = userData?.metadata?.customerRoleId;
    const views = config?.displayMode?.VIEWS;
    const defaultBehavior = {
      ...rolesTabsConfig.defaultBehavior,
      browse: {
        show: views?.BROWSE?.SHOW ?? rolesTabsConfig.defaultBehavior.browse.show,
      },
      search: {
        show: views?.SEARCH?.SHOW ?? rolesTabsConfig.defaultBehavior.search.show,
      },
      chat: {
        show: views?.CHAT?.SHOW ?? rolesTabsConfig.defaultBehavior.chat.show,
      },
    };

    if (!config?.workspaceId || !customerRoleId) {
      if (config) setConfig({ ...config, displayModeJSON: defaultBehavior });
      return defaultBehavior;
    }
    const workspace = rolesTabsConfig.workspaces.find(
      (w) => w.workspaceId === config.workspaceId
    );
    if (!workspace) {
      setConfig({ ...config, displayModeJSON: defaultBehavior });
      return defaultBehavior;
    }
    const role = workspace.roles.find(
      (r) => r.customerRoleId === String(customerRoleId)
    );
    if (!role) {
      setConfig({ ...config, displayModeJSON: defaultBehavior });
      return defaultBehavior;
    }
    const configBehavior = role.tabs || defaultBehavior;
    setConfig({ ...config, displayModeJSON: configBehavior });
    return configBehavior;
  }, [config?.workspaceId, userData?.metadata?.customerRoleId]);

  // Count visible tabs to determine if tab bar should be shown
  const visibleTabCount = [
    tabVisibility.browse?.show || Boolean(tabVisibility.browse?.["comingSoon"]),
    tabVisibility.search?.show,
    tabVisibility.chat?.show,
  ].filter(Boolean).length;

  useEffect(() => {
    if (externalToken) {
      if (tabVisibility.browse?.show) {
        setCurrentView(constants.BROWSE_VIEW);
      } else if (tabVisibility.search?.show) {
        setCurrentView(constants.SEARCH_VIEW);
      } else if (tabVisibility.chat?.show) {
        setCurrentView(constants.CHAT_VIEW);
      }
    } else {
      setCurrentView(constants.CHAT_VIEW);
    }
  }, [externalToken, setCurrentView, tabVisibility.browse]);

  // If only one or zero tabs are visible, don't render the tab bar
  if (visibleTabCount <= 1) {
    return null;
  }

  return (
    <ToggleWrapper>
      {(tabVisibility.browse?.show ||
        Boolean(tabVisibility.browse?.["comingSoon"])) && (
        <ToggleButton
          active={currentView === constants.BROWSE_VIEW}
          onClick={() => setCurrentView(constants.BROWSE_VIEW)}
        >
          {t('BrowseTabText')}
        </ToggleButton>
      )}
      {tabVisibility.search?.show && (
        <ToggleButton
          active={currentView === constants.SEARCH_VIEW}
          onClick={() => setCurrentView(constants.SEARCH_VIEW)}
        >
          {t('SearchTabText')}
        </ToggleButton>
      )}
      {tabVisibility.chat?.show && (
        <ToggleButton
          active={currentView === constants.CHAT_VIEW}
          onClick={() => setCurrentView(constants.CHAT_VIEW)}
        >
          {t('ChatTabText')}
        </ToggleButton>
      )}
    </ToggleWrapper>
  );
};
