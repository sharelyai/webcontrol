import { useState } from "react";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

export interface UseGoalOutcomeProps {
  goalId: string;
  spaceId: string;
  threadId: string;
  threadMessagesMutate: (data?: any, options?: any) => Promise<any>;
}

export const useGoalOutcome = (props: UseGoalOutcomeProps) => {
  const { goalId, spaceId, threadId, threadMessagesMutate } = props;

  const [response, setResponse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<string>("initial");

  const { config: storeConfig, token } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const generateOutcome = async () => {
    try {
      if (status === "pending") return;

      if (!storeConfig?.workspaceId) {
        throw new Error("You need to configure a workspace id");
      }

      if (!token) {
        throw new Error("No token found");
      }

      setIsLoading(true);
      setStatus("pending");

      const res = await apiClient.goals.generateOutcome(
        goalId,
        spaceId,
        threadId,
        storeConfig?.langKnowledge
      );

      if (res?.url) {
        const windowOpen = window.open(res.url, "_blank");

        if (!windowOpen) {
          const parsedUrl = new URL(res.url);
          const downloadValue = parsedUrl.searchParams.get("download");

          const anchor = document.body.appendChild(document.createElement("a"));
          anchor.href = res.url;
          anchor.download = downloadValue || "download.pdf";
          anchor.click();
          anchor.remove();
        }
        await threadMessagesMutate();
      }

      setResponse(res);
      setIsLoading(false);
      setStatus("resolved");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setStatus("rejected");
    }
  };

  return {
    generateOutcome,
    isLoadingGoalOutcome: isLoading,
    responseGoalOutcome: response,
  };
};
