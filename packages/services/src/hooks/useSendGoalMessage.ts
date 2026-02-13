import { useState } from "react";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { useGoalThreadMessages } from "./useGoalThreadMessages";
import { getMessageCompletion } from "../utils/getMessageCompletion";
import { regex } from "../utils/regex";
import { constants } from "../constants";

export interface SendGoalMessageActionProps {
  goalId: string;
  spaceId: string;
  threadId: string;
  message: string;
  groupId?: string;
  setMessage: (message: string) => void;
  setStatusMessage?: (status: string) => void;
}

export const useSendGoalMessage = () => {
  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  
  const { config: storeConfig, token } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const sendGoalMessageAction = async (props: SendGoalMessageActionProps) => {
    const { message, goalId, spaceId, threadId, groupId, setMessage, setStatusMessage } = props;
    
    try {
      if (!message) return;

      if (!storeConfig?.workspaceId) {
        throw new Error("You need to configure a workspace id");
      }

      if (!token) {
        throw new Error("No token found");
      }

      setIsLoading(true);
      setStatusMessage?.("message_pending");
      setMessage("");

      // Note: Manual mutation of messages is skipped here as we don't have easy access to the specific thread's query cache key without the hook.
      // In a real scenario, we might want to pass the mutate function or use a more global way to update the cache.

      if (abortController) {
        abortController.abort();
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setAbortController(controller);

      const queryParams = new URLSearchParams();
      if (storeConfig?.lang) queryParams.append("lang", storeConfig?.lang);

      const res = await apiClient.request(
        `/goals/${goalId}/spaces/${spaceId}/threads/${threadId}?${queryParams.toString()}`,
        {
          method: "POST",
          body: JSON.stringify({
            newMessage: message,
            groupId: groupId,
          }),
          signal,
        }
      );

      // Add new messages being streamed from the ai
      let messageString = "";
      let id = "";
      let actions: any[] = [];
      let goalActionInfo: any = {};
      
      for await (let token of getMessageCompletion(res, signal)) {
        const match = regex.MATCH_TOKEN_PARAMS_MESSAGE.exec(token);
        const hasSharelyTags = regex.SHARELYAI_TAGS.test(token);
        if (match?.[0].includes("id")) {
          try {
            const info = JSON.parse(match[0])?.[0];
            id = info.id;
            actions = info.actions;

            if (info?.actions?.[0] && Object.keys(goalActionInfo).length === 0) {
              const repsonseGoalActionId = await apiClient.fetcher(
                `/workspaces/${storeConfig?.workspaceId}/goals/${goalId}/goal-actions/${info.actions?.[0]}`
              );
              
              const baseGoalActionInfo: Record<string, any> = {};
              if (typeof repsonseGoalActionId === 'object' && repsonseGoalActionId !== null) {
                Object.assign(baseGoalActionInfo, repsonseGoalActionId);
              }

              goalActionInfo = {
                ...baseGoalActionInfo,
                isLoading: false,
                method: "SHOW",
              };
            }
          } catch (e) {
            // ignore
          }
          if (!hasSharelyTags) continue;
          if (hasSharelyTags) {
            token = token.replace(match[0], "");
          }
        }

        messageString += token;
        setResponse({ id, messageString, actions });
      }

      setIsLoading(false);
      setAbortController(null);
      setStatusMessage?.("resolved");

    } catch (error) {
      console.error(error);
      setStatusMessage?.("rejected");
      setIsLoading(false);
    }
  };

  return {
    sendGoalMessageAction,
    isLoadingMessage: isLoading,
    responseMessage: response,
  };
};