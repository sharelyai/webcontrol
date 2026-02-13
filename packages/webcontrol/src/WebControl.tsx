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
  classNames
} from "@sharely/services";
import type { DisplayModeConfig } from "@sharely/services";
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
} from "@sharely/ui-shared";
import { ChatPanel } from "@sharely/ui-chat";
import { SearchPanel } from "@sharely/ui-search";
import { BrowsePanel } from "@sharely/ui-browse";
import { AgentChatPanel } from "@sharely/ui-agent-chat";

import { Wrapper } from "./styles";
import { AuthModal } from "./components/AuthModal";
import { ViewTabs } from "./components/ViewTabs";
import { ChatHistory } from "./components/ChatHistory";

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

export const WebControl = (props: WebControlProps) => {
  // Validate mode
  if (props.mode && !constants.POSITIONS.includes(props.mode)) {
    console.error(
      `[Sharely] Invalid mode "${props.mode}". Valid modes: ${constants.POSITIONS.join(', ')}`
    );
  }

  // Build a partial config from explicitly provided props only
  const propConfig: Record<string, any> = {};
  if (props.workspaceId !== undefined) propConfig.workspaceId = props.workspaceId;
  if (props.baseUrl !== undefined) propConfig.baseUrl = props.baseUrl;
  if (props.externalUserId !== undefined) propConfig.externalUserId = props.externalUserId;
  if (props.lang !== undefined) propConfig.lang = props.lang;
  if (props.displayMode !== undefined) propConfig.displayMode = props.displayMode;
  if (props.mode !== undefined) propConfig.mode = props.mode;
  if (props.justChat !== undefined) propConfig.justChat = props.justChat;
  if (props.closedText !== undefined) propConfig.closedText = props.closedText;
  if (props.avatarmodeDesktop !== undefined) propConfig.avatarmodeDesktop = props.avatarmodeDesktop;
  if (props.avatarmodeMobile !== undefined) propConfig.avatarmodeMobile = props.avatarmodeMobile;
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
  const { config } = useGlobalStore();
  const mode = config?.mode || constants.POSITION_TOP_CENTER_FLOATING;
  const isInline = mode === constants.POSITION_PLACED_INLINE;
  const [isOpen, setIsOpen] = useState(isInline || config?.displayMode?.OPEN_BY_DEFAULT || false);
  const [status, setStatus] = useState("idle");
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    open: false,
    url: "",
    fileName: "",
    pageNumber: 1,
  });
  const [showChatHistory, setShowChatHistory] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const {
    currentInformation,
    stepActive,
    currentView,
    workspace,
    setCurrentInformation,
    setStepActive,
    setCurrentView,
    setToken
  } = useGlobalStore();

  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const { isLoading: isLoadingWorkspace } = useWorkspace();
  const { isAuthenticated, signOut } = useAuth();
  const { apiClient } = useSharelyContext();

  const { refetchMessages } = useSpaceMessages({
    spaceId: currentInformation?.spaceId || '',
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

  // Avatar compact mode: check desktop/mobile setting
  const avatarCompact = !isOpen && (
    (isMobile && config?.avatarmodeMobile === constants.AVATAR_MODE_COMPACT) ||
    (!isMobile && config?.avatarmodeDesktop === constants.AVATAR_MODE_COMPACT)
  );

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
    const handleClosePdf = () => setPdfPreview((prev) => ({ ...prev, open: false }));

    customEvents.subscribe(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, handleOpenPdf);
    customEvents.subscribe(constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW, handleClosePdf);

    return () => {
      customEvents.unsubscribe(constants.CUSTOM_EVENTS.OPEN_PDF_PREVIEW, handleOpenPdf);
      customEvents.unsubscribe(constants.CUSTOM_EVENTS.CLOSE_PDF_PREVIEW, handleClosePdf);
    };
  }, []);

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

  const handleCreateNewSpace = async () => {
    try {
      const res = await apiClient.fetcher<any>(`/workspaces/${config?.workspaceId}/spaces`, {
        method: "POST",
        body: JSON.stringify({
          externalUserId: config?.externalUserId,
          customSource: constants.SPACE_SOURCE_TYPE_WEB_CONTROL,
        }),
      });

      if (res?.id) {
        setToken(res.token);
        setCurrentInformation({
          spaceId: res.id,
          temporalUserId: res.temporalUserId,
          startMode: workspace?.webControlStartMode ?? constants.START_MODE_QUESTIONS,
        });
        await refetchMessages();
      }
    } catch (e) { console.error(e); }
  };

  const initializeSpace = async () => {
    if (status === "pending") return;
    setStatus("pending");

    if (!currentInformation?.spaceId) {
      await handleCreateNewSpace();
    }
    setStatus("resolved");
  };

  useEffect(() => {
    if (isOpen || isInline || config?.justChat) {
      initializeSpace();
    }
  }, [isOpen, isInline, config?.justChat]);

  const handleIsOpen = (value: boolean) => {
    setIsOpen(value);
    if (value) setStepActive(constants.CHAT_STEP);
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
    ...(displayMode?.Z_INDEX ? { zIndex: parseInt(displayMode.Z_INDEX, 10) } : {}),
  };

  const isWidgetOpen = isOpen || isInline || config?.justChat;

  return (
    <Wrapper
      ref={ref}
      $mode={mode}
      $avatarCompact={avatarCompact}
      $displayWidth={displayMode?.WIDTH}
      $displayHeight={displayMode?.HEIGHT}
      className={classNames("sharely-web-control", {
        "is-open": isWidgetOpen,
        "is-inline": isInline,
        "display-private": isPrivate,
      })}
      style={containerStyle}
    >
      {showAlert && isAuthenticated && (
        <Alert isOpen={showAlert} onClose={() => setShowAlert(false)} icon={<Done />}>
          {t('IndexAlertText')}
        </Alert>
      )}

      {!isInline && (
        <div className="sharely-launcher" onClick={() => handleIsOpen(!isOpen)}>
          <div className="launcher-logo">
            {workspace?.photo ? <img src={workspace.photo} alt="AI" /> : <Logo />}
          </div>
          {!isOpen && (
            <p className="launcher-text">
              {config?.closedText || t('IndexSmallChatText')}
            </p>
          )}
        </div>
      )}

      {isWidgetOpen && (
        <div className="web-control-container">
          <div className="web-control-header">
            <div className="web-control-header-grid">
              <div className="header-left">
                {isChatView && isNotGoalsStep && (
                  <>
                    <Tooltip text="Threads" placement="bottom">
                      <button
                        className={classNames("header-threads-btn", { disabled: !hasGroups })}
                        onClick={() => setShowChatHistory(!showChatHistory)}
                        disabled={!hasGroups}
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
                      className={classNames("header-action-btn", { disabled: !hasGroups })}
                      onClick={handleCreateGoalThread}
                      disabled={!hasGroups}
                    >
                      <Restart />
                    </button>
                  </Tooltip>
                )}
                {isNotGoalsStep && isChatView && (
                  <Tooltip text="New chat" placement="bottom">
                    <button
                      className={classNames("header-action-btn", { disabled: !hasGroups })}
                      onClick={handleCreateNewChat}
                      disabled={!hasGroups}
                    >
                      <AddChatBox />
                    </button>
                  </Tooltip>
                )}
                {!isInline && (
                  <Tooltip text="Close" placement="bottom">
                    <button className="header-action-btn" onClick={() => handleIsOpen(false)}>
                      <Close />
                    </button>
                  </Tooltip>
                )}
              </div>
            </div>
          </div>

          <div className="web-control-content">
            {isLoadingWorkspace ? <AppLoader /> : (
              <>
                {currentView === constants.CHAT_VIEW && (
                  config?.agentMode
                    ? <AgentChatPanel spaceId={currentInformation?.spaceId || ''} />
                    : <ChatPanel
                        spaceId={currentInformation?.spaceId || ''}
                        status={status}
                        isLoading={status === 'pending'}
                        setStatus={setStatus}
                      />
                )}
                {currentView === constants.SEARCH_VIEW && <SearchPanel />}
                {currentView === constants.BROWSE_VIEW && <BrowsePanel />}
              </>
            )}
          </div>

          {showChatHistory && (
            <ChatHistory
              onClose={() => setShowChatHistory(false)}
              handleCreateNewChat={handleCreateNewChat}
            />
          )}
        </div>
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => setIsAuthModalOpen(false)}
          handleInitWithToken={(token) => setToken(token)}
        />
      )}

      {pdfPreview.open && (
        <PDFPreview
          url={pdfPreview.url}
          open={pdfPreview.open}
          onClose={() => setPdfPreview(prev => ({ ...prev, open: false }))}
          fileName={pdfPreview.fileName}
          initialPage={pdfPreview.pageNumber}
        />
      )}

      {/* Portal mount point for modals, chat history, etc. */}
      <div id="modal"></div>
    </Wrapper>
  );
};
