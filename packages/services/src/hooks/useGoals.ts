import { useQuery } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";

interface UseGoalsProps {
  enabled?: boolean;
  spaceId: string;
  validateOnFocus?: boolean;
}

export const useGoals = (props: UseGoalsProps) => {
  const { enabled = true, spaceId, validateOnFocus = false } = props;
  const { userData } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  const isEnabled = enabled && Boolean(spaceId);
  const customerRoleId = userData?.metadata?.customerRoleId;

  const response = useQuery({
    queryKey: ["spaceGoals", spaceId, customerRoleId],
    queryFn: async () => {
      if (!isEnabled) return [];
      return apiClient.goals.getSpaceGoals(spaceId);
    },
    enabled: isEnabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: validateOnFocus,
  });

  return {
    spaceGoals: response.data || [],
    isLoadingSpaceGoals: response.isLoading,
    spaceGoalsRefetch: response.refetch,
    spaceGoalsOptions: response,
  };
};
