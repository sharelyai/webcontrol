import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { getMessageCompletion } from "../utils/getMessageCompletion";
import { regex } from "../utils/regex";

export interface PostCreateGoalThreadProps {
  goalId: string;
  spaceId: string;
}

export const useStartGoalThread = () => {
  const [response, setResponse] = useState<any>(null);
  const { config: storeConfig } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const mutation = useMutation({
    mutationFn: async (props: PostCreateGoalThreadProps) => {
      const { goalId, spaceId } = props;
      const localAbortController = new AbortController();
      const signal = localAbortController.signal;
      
      try {
        const fetchResponse = await apiClient.goals.startThread(
          goalId,
          spaceId,
          storeConfig?.langKnowledge,
          signal
        );

        let messageString = "";
        let id = "";
        let groupId = "";

        for await (let token of getMessageCompletion(fetchResponse, signal)) {
          const match = regex.MATCH_TOKEN_PARAMS_MESSAGE.exec(token);
          const hasSharelyTags = regex.SHARELYAI_TAGS.test(token);
          if (match?.[0].includes("id")) {
            try {
              const info = JSON.parse(match[0])?.[0];
              id = info.id;
              groupId = info.groupId;
            } catch (e) {
              // ignore parse error
            }
            if (!hasSharelyTags) continue;
            if (hasSharelyTags) {
              token = token.replace(match[0], "");
            }
          }
          messageString += token;
          setResponse({ id, groupId, messageString });
        }
        
        return fetchResponse;
      } catch (err: any) {
        if (err.name === "AbortError") {
          // Handle abort gracefully
        } else {
          throw err;
        }
      }
    },
    onSettled: () => {
      // Reset mutation state after completion
      setTimeout(() => mutation.reset(), 0);
    },
  });

  return {
    postCreateGoalThread: mutation.mutateAsync,
    responseStartThread: response,
    isLoadingCreateThread: mutation.status === "pending",
    mutation,
  };
};
