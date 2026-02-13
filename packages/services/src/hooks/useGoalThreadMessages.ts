import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseGoalThreadMessagesProps {
  enabled?: boolean;
  stopInterval?: boolean;
  spaceId: string;
  threadId: string;
  groupId: string;
}

export const useGoalThreadMessages = (props: UseGoalThreadMessagesProps) => {
  const {
    enabled = true,
    spaceId,
    threadId,
    groupId,
    stopInterval = false,
  } = props;
  const queryClient = useQueryClient();
  const { userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabled = enabled && Boolean(spaceId) && Boolean(threadId) && Boolean(groupId);
  const customerRoleId = userData?.metadata?.customerRoleId;
  
  const queryKey = [
    "threads-messages",
    spaceId,
    threadId,
    groupId,
    customerRoleId,
  ];

  const response = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      if (!isEnabled) return [];
      return apiClient.goals.getThreadMessages(spaceId, threadId, groupId, signal);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
    refetchInterval: stopInterval ? 0 : 10000,
  });

  const mutate = async (data: any, refetch = false) => {
    queryClient.setQueryData(queryKey, (oldData: any) => {
      if (typeof data === "function") {
        return data(oldData || []);
      }
      if (!oldData) return [data];
      return [...oldData, data];
    });
    if (refetch) {
      await response.refetch();
    }
  };

  return {
    threadMessages: response?.data || [],
    isLoadingThreadMessages: response.isLoading,
    refetchThreadMessages: response.refetch,
    threadMessagesMutate: mutate,
    threadMessagesOptions: response,
  };
};
