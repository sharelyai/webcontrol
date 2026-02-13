import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseGoalThreadsProps {
  enabled?: boolean;
  spaceId: string;
  groupId?: string;
}

export const useGoalThreads = (props: UseGoalThreadsProps) => {
  const { enabled = true, spaceId, groupId } = props;
  const { userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();
  const queryClient = useQueryClient();

  const isEnabled = enabled && Boolean(spaceId) && Boolean(groupId);
  const customerRoleId = userData?.metadata?.customerRoleId;
  
  const queryKey = ["threads", spaceId, groupId, customerRoleId];

  const {
    data: threads,
    refetch: mutateThreads,
    ...optionsThreads
  } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!isEnabled || !groupId) return null;
      return apiClient.goals.getThreads(spaceId, groupId);
    },
    enabled: isEnabled,
    refetchOnWindowFocus: false,
  });

  return {
    threads,
    mutateThreads,
    optionsThreads,
    queryClient,
  };
};
