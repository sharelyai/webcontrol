import React, { useEffect, useRef, useState } from "react";
import {
  SharelyProvider,
  useGlobalStore,
  useLanguage,
  useSpace,
  useGoals,
  useWorkspace,
  useSpaceMessages,
  constants,
  customEvents,
  useAuth,
  useSharelyContext,
  classNames,
  setCSSVariables,
  cookieManager,
} from "@sharelyai/services";
import type { DisplayModeConfig } from "@sharelyai/services";
import {
  ThemeProvider,
  GlobalStyle,
  Alert,
  Done,
  Logo,
  Skeleton,
  Spinner as AppLoader,
  PDFPreview,
  useResponsive,
  Tooltip,
  Close,
  Forum,
  Menu,
  AddChatBox,
  Restart,
} from "@sharelyai/ui-shared";
import { ChatPanel } from "@sharelyai/ui-chat";
import { SearchPanel } from "@sharelyai/ui-search";
import { BrowsePanel } from "@sharelyai/ui-browse";
import { Wrapper } from "./styles";
import { AuthModal } from "./components/AuthModal";
import { ViewTabs } from "./components/ViewTabs";
import { ChatHistory } from "./components/ChatHistory";
import { AgentView } from "./components/AgentView";
import { SaveConversation } from "./components/SaveConversation";
import { RbacBlocker } from "./components/RbacBlocker";

export interface WebControlProps {
  workspaceId?: string;
  baseUrl?: string;
  externalUserId?: string;
  lang?: string;
  defaultView?: string;
  theme?: any;
  onError?: (error: Error) => void;
  onReady?: () => void;
  displayMode?: DisplayModeConfig;
  mode?: string;
  justChat?: boolean;
  closedText?: string;
  avatarmodeDesktop?: string;
  avatarmodeMobile?: string;
}

// Helper to check if user has RBAC role in token
const hasRbacRole = (userData: any): boolean => {
  const metadata = userData?.user_metadata;
  return Boolean(metadata?.roleId || metadata?.customerRoleId);
};

export const WebControl = (props: WebControlProps) => {
  // Validate mode
  if (props.mode && !constants.POSITIONS.includes(props.mode)) {
    console.error(
      `[Sharely] Invalid mode "${
        props.mode
      }". Valid modes: ${constants.POSITIONS.join(", ")}`,
    );
  }

  // Build a partial config from explicitly provided props only
  const propConfig: Record<string, any> = {};
  if (props.workspaceId !== undefined)
    propConfig.workspaceId = props.workspaceId;
  if (props.baseUrl !== undefined) propConfig.baseUrl = props.baseUrl;
  if (props.externalUserId !== undefined)
    propConfig.externalUserId = props.externalUserId;
  if (props.lang !== undefined) propConfig.lang = props.lang;
  if (props.displayMode !== undefined)
    propConfig.displayMode = props.displayMode;
  if (props.mode !== undefined) propConfig.mode = props.mode;
  if (props.justChat !== undefined) propConfig.justChat = props.justChat;
  if (props.closedText !== undefined) propConfig.closedText = props.closedText;
  if (props.avatarmodeDesktop !== undefined)
    propConfig.avatarmodeDesktop = props.avatarmodeDesktop;
  if (props.avatarmodeMobile !== undefined)
    propConfig.avatarmodeMobile = props.avatarmodeMobile;
  if (props.onError !== undefined) propConfig.onError = props.onError;

  return (
    <SharelyProvider config={propConfig}>
      <ThemeProvider theme={props.theme}>
        <GlobalStyle />
        <WebControlInner {...props} />
      </ThemeProvider>
    </SharelyProvider>
  );
};

const WebControlInner = (props: WebControlProps) => {
  const { config, userData } = useGlobalStore();
  const mode = config?.mode || constants.POSITION_TOP_CENTER_FLOATING;
  const isInline = mode === constants.POSITION_PLACED_INLINE;
  const [isOpen, setIsOpen] = useState(
    isInline || config?.displayMode?.OPEN_BY_DEFAULT || false,
  );
  const [status, setStatus] = useState("idle");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isRbacBlocked, setIsRbacBlocked] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    fileName: "",
    pageNumber: 1,
  });
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [showAgentChatHistory, setShowAgentChatHistory] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const {
    currentInformation,
    stepActive,
    currentView,
    workspace,
    token,
    loginToken,
    externalToken,
    setCurrentInformation,
    setStepActive,
    setCurrentView,
    setToken,
    setLoginToken,
  } = useGlobalStore();

  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const { isLoading: isLoadingWorkspace } = useWorkspace();
  const { isAuthenticated, signOut } = useAuth();
  const { apiClient } = useSharelyContext();

  const { refetchMessages } = useSpaceMessages({
    spaceId: currentInformation?.spaceId || "",
    groupId: currentInformation?.currentGroupId,
    enabled: stepActive === constants.CHAT_STEP,
    stopInterval: true,
  });

  const { space, spaceOptions } = useSpace({
    spaceId: currentInformation?.spaceId,
  });
  const { spaceGoals } = useGoals({
    spaceId: currentInformation?.spaceId,
  });

  // Session/auth derived state
  const hasSession = Boolean(userData?.name) || Boolean(loginToken);
  const showSaveConversation =
    !hasSession && (space as any)?.status === constants.SPACE_STATUS_PUBLIC;

  // Avatar compact mode: check desktop/mobile setting
  const avatarCompact =
    !isOpen &&
    ((isMobile && config?.avatarmodeMobile === constants.AVATAR_MODE_COMPACT) ||
      (!isMobile &&
        config?.avatarmodeDesktop === constants.AVATAR_MODE_COMPACT));

  // Display mode (from store — already merged by SharelyProvider)
  const displayMode = config?.displayMode;
  const isPrivate = displayMode?.MODE === constants.DISPLAY_MODE.MODE.PRIVATE;

  // Header derived state
  const groups = (space as any)?.spaceGroupConversation;
  const currentGroup = groups?.find(
    (group: any) => group?.id === currentInformation?.currentGroupId,
  );
  const isGoal = currentGroup?.type === constants.GOAL;
  const isNotGoalsStep = stepActive !== constants.GOALS_STEP;
  const isChatView = currentView === constants.CHAT_VIEW;
  const isAgentView = currentView === constants.AGENT_VIEW;
  const hasGroups = groups && groups.length > 0;

  // PDF Preview handling
  useEffect(() => {
    const handleOpenPdf = (event: any) => {
      const { url, fileName, pageNumber } = event.detail;
      setPdfPreview({
        open: true,
        url,
        fileName: fileName || "Document",
        pageNumber: pageNumber || 1,
      });
    };
    const handleClosePdf = () =>
      setPdfPreview((prev) => ({ ...prev, open: false }));

    customEvents.subscribe(
      constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW,
      handleOpenPdf,
    );
    customEvents.subscribe(
      constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW,
      handleClosePdf,
    );

    return () => {
      customEvents.unsubscribe(
        constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW,
        handleOpenPdf,
      );
      customEvents.unsubscribe(
        constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW,
        handleClosePdf,
      );
    };
  }, []);

  // Save conversation event listener
  useEffect(() => {
    const handleToggleSaveConversation = ({ detail }: any) => {
      setIsAuthModalOpen(detail.open);
    };

    customEvents.subscribe(
      constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION,
      handleToggleSaveConversation,
    );

    return () => {
      customEvents.unsubscribe(
        constants.CUSTOM_EVENTS.TOGGLE_SAVE_CONVERSATION,
        handleToggleSaveConversation,
      );
    };
  }, []);

  // RBAC check
  useEffect(() => {
    if (workspace?.rbacStatus === "ACTIVE" && !hasRbacRole(userData)) {
      setIsRbacBlocked(true);
    } else {
      setIsRbacBlocked(false);
    }
  }, [workspace?.rbacStatus, userData]);

  // CSS variable injection from workspace styles
  useEffect(() => {
    if (workspace?.spaceStyling?.styles) {
      setCSSVariables(workspace.spaceStyling.styles);
      if (workspace.spaceStyling.styles?.global?.importFont) {
        const link = document.createElement("link");
        link.href = workspace.spaceStyling.styles.global.importFont;
        link.rel = "stylesheet";
        document.head.appendChild(link);
      }
    }
  }, [workspace]);

  // OPEN_BY_DEFAULT from config (may arrive async from workspace)
  useEffect(() => {
    if (config?.displayMode?.OPEN_BY_DEFAULT) {
      handleIsOpen(true);
    }
  }, [config?.displayMode?.OPEN_BY_DEFAULT]);

  // Scroll to top on mobile when opening
  useEffect(() => {
    if (isOpen && isMobile) {
      window?.scrollTo(0, 0);
    }
  }, [isOpen, isMobile]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (config?.displayMode?.OPEN_BY_DEFAULT) return;
      if (
        ref.current &&
        !(ref.current as HTMLDivElement).contains(event.target as Node)
      ) {
        handleIsOpen(false);
        setIsAuthModalOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [config?.displayMode?.OPEN_BY_DEFAULT]);

  // Auth modal at beginning check
  useEffect(() => {
    if (!currentInformation?.spaceId) {
      setIsAuthModalOpen(
        workspace?.verificationSpace?.authAction ===
          constants.AUTH_ACTION_AT_THE_BEGINNING && !hasSession,
      );
    }
  }, [workspace]);

  // Auto-open first group on space load
  useEffect(() => {
    if (!spaceOptions.isLoading && isOpen) {
      const groups = (space as any)?.spaceGroupConversation;
      const firstGroup = groups?.[0];

      if (firstGroup && !currentInformation?.currentGroupId) {
        const isGoal = firstGroup?.type === constants.GOAL;
        const hasInteracted =
          groups?.find((chat: any) => chat?.id === firstGroup?.id)
            ?.hasMoreThanOneMessage ?? false;
        const goalData = isGoal
          ? (spaceGoals as any)?.find(
              (goal: any) => goal?.goalId === firstGroup?.goalId,
            )
          : {};
        setCurrentInformation({
          currentGroupId: firstGroup?.id,
          currentName: firstGroup?.name,
          thread: {
            ...goalData,
            threadId: firstGroup?.threadId,
            hasInteracted: hasInteracted,
          },
          preview: true,
        });
        setStepActive(
          isGoal ? constants.GOALS_DETAIL_PAGE : constants.CHAT_STEP,
        );
        refetchMessages();
      }
    }
  }, [isOpen, spaceOptions.isLoading]);

  // Refetch messages when group changes
  useEffect(() => {
    refetchMessages();
  }, [currentInformation?.currentGroupId]);

  // Iframe postMessage listener for embedded token passing
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      const authToken = event.data?.auth;
      if (!authToken) return;

      try {
        const spaceResponse = await apiClient.fetcher<any[]>(
          `/spaces?` +
            new URLSearchParams({
              roles: JSON.stringify(["GUEST"]),
              sortBy: "desc",
              lastMessageSortBy: "true",
              workspaces: JSON.stringify([config?.workspaceId]),
            }).toString(),
        );

        setLoginToken(authToken);
        setToken(authToken);

        if (spaceResponse?.[0]?.id) {
          setCurrentInformation({
            spaceId: spaceResponse[0].id,
          });
        }
      } catch (e) {
        console.error("[Sharely] postMessage auth error:", e);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [config?.workspaceId]);

  // Hide interfering elements on mobile
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const elementsToHide = [
      "bsf-footer",
      "#INDshadowRootWrap",
      "#launcher-frame",
    ];

    const hideElements = () => {
      if (isMobile) {
        elementsToHide.forEach((selector) => {
          const element = document.querySelector(selector);
          if (element && element instanceof HTMLElement) {
            element.style.display = "none";
          }
        });
      }
    };

    const showElements = () => {
      elementsToHide.forEach((selector) => {
        const element = document.querySelector(selector);
        if (element && element instanceof HTMLElement) {
          element.style.display = "";
        }
      });
    };

    hideElements();
    intervalId = setInterval(hideElements, 500);
    timeoutId = setTimeout(() => {
      if (intervalId) clearInterval(intervalId);
    }, 5 * 60 * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
      showElements();
    };
  }, []);

  const handleInitWithToken = async (authToken?: string) => {
    const currentToken = authToken || token;
    if (!currentToken) return;

    try {
      const validateResponse = await apiClient.fetcher<any>(
        `/spaces/validate-temporal-token`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${currentToken}` },
        },
      );

      if (!validateResponse?.error) {
        if (validateResponse?.spaceId) {
          setCurrentInformation({
            spaceId: validateResponse.spaceId,
            temporalUserId: validateResponse.temporalUserId,
            startMode:
              workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
          });
          setStatus("resolved");
          return validateResponse;
        }
      }

      // Fallback: fetch spaces
      const spaceResponse = await apiClient.fetcher<any>(
        `/spaces?` +
          new URLSearchParams({
            roles: JSON.stringify(["GUEST"]),
            sortBy: "desc",
            lastMessageSortBy: "true",
            workspaces: JSON.stringify([config?.workspaceId]),
          }).toString(),
        { headers: { Authorization: `Bearer ${currentToken}` } },
      );

      if (spaceResponse?.[0]?.id) {
        setCurrentInformation({
          spaceId: spaceResponse[0].id,
          startMode:
            workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
        });
        setStatus("resolved");
      }

      return spaceResponse;
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateNewSpace = async () => {
    try {
      const res = await apiClient.fetcher<any>(
        `/workspaces/${config?.workspaceId}/spaces`,
        {
          method: "POST",
          body: JSON.stringify({
            externalUserId: config?.externalUserId,
            customSource: constants.SPACE_SOURCE_TYPE_WEB_CONTROL,
          }),
        },
      );

      if (res?.id) {
        setToken(res.token);
        setLoginToken(undefined);
        setCurrentInformation({
          spaceId: res.id,
          temporalUserId: res.temporalUserId,
          startMode:
            workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
        });
        await refetchMessages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const initializeSpace = async () => {
    if (isRbacBlocked) return;
    if (
      status === "pending" ||
      status === "rejected" ||
      status === "pending_message"
    )
      return;

    try {
      setStatus("pending");

      if (!config?.workspaceId) {
        throw new Error("You need to configure a workspace id");
      }

      // External token flow: token and spaceId already set by embed API
      if (externalToken && currentInformation?.spaceId) {
        setStatus("resolved");
        return;
      }

      // Check for existing token and space from cookie
      if (token) {
        const spaceFromAdmin = cookieManager.get(
          cookieManager.getCookieName([
            constants.COOKIES_KEYS.MY_ACCESS_SPACE,
            config.workspaceId,
          ]),
        );

        if (spaceFromAdmin) {
          setLoginToken(token);
          setCurrentInformation({
            spaceId: spaceFromAdmin,
            temporalUserId: undefined,
            startMode:
              workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
          });
          await refetchMessages();
          setStatus("resolved");
          return;
        }

        const validation = await handleInitWithToken();
        if (validation?.spaceId || validation?.[0]?.id) {
          setStatus("resolved");
          return;
        }
      }

      if (!currentInformation?.spaceId) {
        await handleCreateNewSpace();
      }
      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setStatus("rejected");
    }
  };

  useEffect(() => {
    if (isOpen || isInline || config?.justChat) {
      initializeSpace();
    }
  }, [isOpen, isInline, config?.justChat]);

  const handleIsOpen = (value: boolean) => {
    setIsOpen(value);
    if (value) {
      setStepActive(constants.CHAT_STEP);
    }
    if (currentInformation?.spaceId) {
      setIsAuthModalOpen(
        workspace?.verificationSpace?.authAction ===
          constants.AUTH_ACTION_AT_THE_BEGINNING && !hasSession,
      );
    }
  };

  const handleCreateNewChat = () => {
    setShowChatHistory(false);
    setStepActive(constants.CHAT_STEP);
    setCurrentView(constants.CHAT_VIEW);
    setTimeout(() => {
      setCurrentInformation({
        currentGroupId: undefined,
        currentName: undefined,
        thread: undefined,
        preview: true,
      });
    }, 0);
  };

  const handleCreateGoalThread = () => {
    setCurrentInformation({
      thread: {
        goalId: currentInformation?.thread?.goalId,
        threadId: undefined,
      },
      currentGroupId: undefined,
      currentName: undefined,
      preview: false,
    });
    setStepActive(constants.GOALS_DETAIL_PAGE);
  };

  const containerStyle: React.CSSProperties = {
    ...(displayMode?.Z_INDEX
      ? { zIndex: parseInt(displayMode.Z_INDEX, 10) }
      : {}),
  };

  const isWidgetOpen = isOpen || isInline || config?.justChat;

  return (
    <Wrapper
      ref={ref}
      $mode={mode}
      $avatarCompact={avatarCompact}
      $displayWidth={displayMode?.WIDTH}
      $displayHeight={displayMode?.HEIGHT}
      className={classNames(
        "sharely-web-control sharelyai-webcontroller-chat",
        {
          "is-open sharelyai-webcontroller-is-open": isWidgetOpen,
          "is-inline": isInline,
          "display-private sharelyai-webcontroller-displayMode-privated":
            isPrivate,
          "sharelyai-webcontroller-is-open-auth": isAuthModalOpen,
        },
      )}
      style={containerStyle}
    >
      {showAlert && isAuthenticated && (
        <Alert
          isOpen={showAlert}
          onClose={() => setShowAlert(false)}
          icon={<Done />}
        >
          {t("IndexAlertText")}
        </Alert>
      )}

      {!isInline && (
        <div
          className="sharely-launcher sharelyai-webcontroller-small-chat"
          onClick={() => handleIsOpen(!isOpen)}
        >
          <div className="launcher-logo sharelyai-webcontroller-logo">
            {workspace?.photo ? (
              <img src={workspace.photo} alt="AI" />
            ) : (
              <Logo />
            )}
          </div>
          {!isOpen && (
            <p className="launcher-text sharelyai-webcontroller-text">
              {config?.closedText || t("IndexSmallChatText")}
            </p>
          )}
        </div>
      )}

      {isLoadingWorkspace && isWidgetOpen && <AppLoader />}

      {!isLoadingWorkspace && isWidgetOpen && isRbacBlocked && <RbacBlocker />}

      {!isLoadingWorkspace && isWidgetOpen && !isRbacBlocked && (
        <div className="web-control-container sharelyai-webcontroller-container">
          {isAuthModalOpen && (
            <AuthModal
              onClose={() => setIsAuthModalOpen(false)}
              handleInitWithToken={handleInitWithToken}
            />
          )}

          {!isAuthModalOpen && (
            <>
              {showSaveConversation && (
                <SaveConversation handleIsModalOpen={setIsAuthModalOpen} />
              )}

              <div className="web-control-header">
                <div className="web-control-header-grid">
                  <div className="header-left">
                    {(isChatView || isAgentView) && isNotGoalsStep && (
                      <>
                        <Tooltip text="Threads" placement="bottom">
                          <button
                            className={classNames("header-threads-btn", {
                              disabled: isChatView && !hasGroups,
                            })}
                            onClick={() =>
                              isAgentView
                                ? setShowAgentChatHistory(!showAgentChatHistory)
                                : setShowChatHistory(!showChatHistory)
                            }
                            disabled={isChatView && !hasGroups}
                          >
                            <Forum />
                          </button>
                        </Tooltip>
                        <div className="header-logo-info">
                          <div className="header-logo">
                            {workspace?.photo ? (
                              <img src={workspace.photo} alt="AI" />
                            ) : workspace?.id ? (
                              <Logo />
                            ) : (
                              <Skeleton width={40} height={40} />
                            )}
                          </div>
                          <span className="header-title">
                            {workspace?.organizationName || workspace?.name || (
                              <Skeleton width={100} height={20} />
                            )}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="header-center">
                    <ViewTabs />
                  </div>
                  <div className="header-right">
                    {isNotGoalsStep && isChatView && isGoal && (
                      <Tooltip text="Restart goal" placement="bottom">
                        <button
                          className={classNames("header-action-btn", {
                            disabled: !hasGroups,
                          })}
                          onClick={handleCreateGoalThread}
                          disabled={!hasGroups}
                        >
                          <Restart />
                        </button>
                      </Tooltip>
                    )}
                    {isNotGoalsStep && (isChatView || isAgentView) && (
                      <Tooltip text="New chat" placement="bottom">
                        <button
                          className={classNames("header-action-btn", {
                            disabled: isChatView && !hasGroups,
                          })}
                          onClick={() => {
                            if (isAgentView) {
                              setShowAgentChatHistory(false);
                              setCurrentInformation({
                                agentThreadId: undefined,
                                agentThreadName: undefined,
                              });
                            } else {
                              handleCreateNewChat();
                            }
                          }}
                          disabled={isChatView && !hasGroups}
                        >
                          <AddChatBox />
                        </button>
                      </Tooltip>
                    )}
                    {!isInline && (
                      <Tooltip text="Close" placement="bottom">
                        <button
                          className="header-action-btn"
                          onClick={() => {
                            setIsAuthModalOpen(false);
                            handleIsOpen(false);
                          }}
                        >
                          <Close />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>

              <div className="web-control-content">
                {currentView === constants.CHAT_VIEW && (
                  <ChatPanel
                    spaceId={currentInformation?.spaceId || ""}
                    status={status}
                    isLoading={status === "pending"}
                    setStatus={setStatus}
                  />
                )}
                {currentView === constants.AGENT_VIEW && (
                  <AgentView
                    spaceId={currentInformation?.spaceId || ""}
                    showChatHistory={showAgentChatHistory}
                    onCloseChatHistory={() => setShowAgentChatHistory(false)}
                    onCreateNewChat={() => setShowAgentChatHistory(false)}
                  />
                )}
                {currentView === constants.SEARCH_VIEW && <SearchPanel />}
                {currentView === constants.BROWSE_VIEW && <BrowsePanel />}
              </div>
            </>
          )}

          {showChatHistory && isChatView && (
            <ChatHistory
              onClose={() => setShowChatHistory(false)}
              handleCreateNewChat={handleCreateNewChat}
            />
          )}
        </div>
      )}

      {pdfPreview.open && (
        <PDFPreview
          url={pdfPreview.url}
          open={pdfPreview.open}
          onClose={() => setPdfPreview((prev) => ({ ...prev, open: false }))}
          fileName={pdfPreview.fileName}
          initialPage={pdfPreview.pageNumber}
        />
      )}

      {/* Portal mount point for modals, chat history, etc. */}
      <div id="modal"></div>
    </Wrapper>
  );
};
