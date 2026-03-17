import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { Wrapper } from "./styles";
import { 
  LogoChat, 
  ArrowBack, 
  Close, 
  AddChatBox,
  ScrollBar,
  Loader,
  InputSkeleton,
  useResponsive,
  useMaxHeight,
  useVisualViewport
} from "@sharelyai/ui-shared";
import { 
  constants, 
  classNames,
  useGlobalStore, 
  useLanguage, 
  useGoalThreads, 
  useGoalThreadMessages, 
  useStartGoalThread, 
  useSendGoalMessage,
  useSharelyContext
} from "@sharelyai/services";

import { MessageBubble } from "../../components/MessageBubble";
import { ChatInput } from "../../components/ChatInput";
import { ThreadCard } from "../GoalThread";

export const GoalDetail = () => {
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");

  const {
    currentInformation,
    prevStepActive,
    setStepActive,
    setCurrentInformation,
    config,
    userData,
    workspace,
  } = useGlobalStore();

  const { t, langText } = useLanguage();
  const { isMobile } = useResponsive();
  const { viewportHeight: height } = useVisualViewport();
  const { viewportHeight } = useMaxHeight(height);
  const { apiClient } = useSharelyContext();
  const queryClient = useQueryClient();

  const goal = currentInformation?.thread;
  const goalId = goal?.goalId || goal?.id;
  const threadId = currentInformation?.thread?.threadId;

  const { threads, optionsThreads } = useGoalThreads({
    spaceId: currentInformation?.spaceId,
    groupId: goalId,
  });

  const { threadMessages, isLoadingThreadMessages } =
    useGoalThreadMessages({
      spaceId: currentInformation?.spaceId,
      groupId: goalId,
      threadId: threadId || '',
    });

  const { postCreateGoalThread } = useStartGoalThread();
  const { sendGoalMessageAction } = useSendGoalMessage();

  const messages = threadMessages || [];

  const handleBack = () => {
    setStepActive(
      prevStepActive[prevStepActive.length - 2] || constants.CHAT_STEP
    );
  };

  const handleStartThread = async () => {
    setStatus("message_pending");
    const result: any = await postCreateGoalThread({
      spaceId: currentInformation?.spaceId,
      goalId,
    });

    if (result?.threadId) {
      setCurrentInformation({
        thread: {
          ...goal,
          threadId: result.threadId,
        },
      });
    }
    setStatus("idle");
  };

  const handleSendMessage = async (customMessage?: string) => {
    if (!threadId) {
      handleStartThread();
      return;
    }

    await sendGoalMessageAction({
      message: customMessage || message,
      spaceId: currentInformation?.spaceId,
      goalId,
      threadId,
      setMessage,
      setStatusMessage: setStatus,
    });
  };

  const handleViewThread = (thread: any) => {
    setCurrentInformation({
      thread: {
        ...goal,
        threadId: thread.id,
      },
    });
  };

  const renderInputSection = () => {
    if (isLoadingThreadMessages) {
      return <InputSkeleton height={60} />;
    }
    return (
      <ChatInput
        message={message}
        onChange={setMessage}
        onSend={handleSendMessage}
        isLoading={status === "message_pending"}
        placeholder={t('IndexSmallChatText')}
        showPersonIcon={true}
        showGoalsButton={false}
      />
    );
  };

  return (
    <Wrapper height={viewportHeight + 20}>
      <div className="sharelyai-webcontroller-body-goal-detail">
        <div className="sharelyai-webcontroller-body-goal-detail-header">
          <div
            className="sharelyai-webcontroller-header-back-icon"
            onClick={handleBack}
          >
            <ArrowBack />
          </div>
          <div className="sharelyai-webcontroller-body-goal-detail-header-content">
            <p className="sharelyai-webcontroller-body-goal-detail-title">
              {goal?.title}
            </p>
            {threadId && (
              <button
                className="sharelyai-webcontroller-body-goal-detail-new-thread"
                onClick={() => {
                  setCurrentInformation({
                    thread: {
                      ...goal,
                      threadId: undefined,
                    },
                  });
                }}
              >
                <AddChatBox />
                {t('NewThread')}
              </button>
            )}
          </div>
        </div>

        <div className="sharelyai-webcontroller-body-goal-detail-body">
          <ScrollBar options={{ suppressScrollX: true }}>
            {!threadId && (
              <div className="sharelyai-webcontroller-body-goal-detail-info">
                <div className="sharelyai-webcontroller-body-goal-detail-description">
                  {goal?.description}
                </div>
                {threads && (threads as any[]).length > 0 && (
                  <div className="sharelyai-webcontroller-body-goal-detail-threads">
                    <p className="sharelyai-webcontroller-body-goal-detail-threads-title">
                      {t('RecentThreads')}
                    </p>
                    <div className="sharelyai-webcontroller-body-goal-detail-threads-list">
                      {(threads as any[]).map((thread: any) => (
                        <ThreadCard
                          key={thread.id}
                          title={thread.title || t('UntitledThread')}
                          description={thread.lastMessage || ""}
                          status={thread.status}
                          lastTime={thread.updatedAt}
                          messages={thread.messageCount}
                          onClick={() => handleViewThread(thread)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {threadId && (
              <div className="sharelyai-webcontroller-body-goal-detail-messages">
                {messages.map((msg: any, index: number) => {
                  const isUser = msg.role === "user";
                  return (
                    <MessageBubble
                      key={msg.id || index}
                      messageId={msg.id}
                      type={isUser ? constants.CONVERSATIONS_TYPE_USER : constants.CONVERSATIONS_TYPE_AI}
                      message={msg.content || msg.message}
                      imageAI={workspace?.photo ?? ""}
                      name={workspace?.name || "AI Bot"}
                      user={{
                        id: userData?.id || '',
                        name: userData?.name || '',
                        photo: userData?.photo || '',
                      }}
                    />
                  );
                })}
                {status === "message_pending" && (
                  <Loader text={t('LoaderText')} imageAi={workspace?.photo ?? ""} />
                )}
                
                {messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.goalSuggestions && (
                   <div className="sharelyai-webcontroller-content-message-questions">
                   {messages[messages.length - 1]?.goalSuggestions?.map(
                     (question: string, idx: number) => (
                       <button
                         key={idx}
                         className="sharelyai-webcontroller-content-message-question"
                         onClick={() => {
                           handleSendMessage(question);
                         }}
                       >
                         {question}
                       </button>
                     )
                   )}
                 </div>
                )}
              </div>
            )}
          </ScrollBar>
        </div>
        {threadId && (
          <div className="sharelyai-webcontroller-body-goal-detail-footer">
            {renderInputSection()}
          </div>
        )}
        {!threadId && (
          <div className="sharelyai-webcontroller-body-goal-detail-footer-start">
            <button
              className="sharelyai-webcontroller-body-goal-detail-start-button"
              onClick={handleStartThread}
              disabled={status === "message_pending"}
            >
              {t('StartGoal')}
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
};