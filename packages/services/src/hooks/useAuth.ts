import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useGlobalStore } from "../stores/globalStore";
import { useSharelyContext } from "../provider";
import { tokenManager } from "../auth/tokenManager";
import { supabaseClient } from "../auth/supabaseClient";
import { SPACE_SOURCE_TYPE_WEB_CONTROL } from "../constants";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const {
    config,
    token,
    setToken,
    setLoginToken,
    setTemporalToken,
    setUserData,
    workspace,
    setWorkspace,
    setCurrentInformation,
  } = useGlobalStore();
  const { apiClient } = useSharelyContext();

  // Token sync logic
  useEffect(() => {
    const initTokens = async () => {
      if (!config?.workspaceId) return;

      // External token was set via embed API — don't overwrite from cookies
      const { externalToken } = useGlobalStore.getState();
      if (externalToken) {
        const decoded = tokenManager.decodeToken(externalToken);
        if (decoded) setUserData(decoded as any);
        return;
      }

      const temporal = tokenManager.getTemporalToken(config.workspaceId);
      const login = tokenManager.getLoginToken(config.workspaceId);

      if (temporal) setTemporalToken(temporal);
      if (login) setLoginToken(login);

      const activeToken = login || temporal;
      if (activeToken) {
        setToken(activeToken);
        const decoded = tokenManager.decodeToken(activeToken);
        if (decoded) setUserData(decoded as any);

        if (login) {
          // Fetch full user data if logged in
          handleGetUserData(login);
        }
      }
    };

    initTokens();
  }, [config?.workspaceId]);

  const handleGetUserData = async (token: string) => {
    const decoded = tokenManager.decodeToken(token);
    const sub = (decoded as any)?.sub;
    if (!sub) return;

    try {
      const userResponse = await apiClient.fetcher(`/user/?id=${sub}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(userResponse as any);
      return userResponse;
    } catch (e) {
      console.error("Failed to fetch user data", e);
    }
  };

  const signOut = async () => {
    await supabaseClient.auth.signOut();
    queryClient.clear();
    setUserData(undefined);
    setLoginToken(undefined);
    tokenManager.removeTokens(config?.workspaceId);

    // Create a new space after sign out if workspaceId exists
    if (config?.workspaceId) {
      try {
        const createNewSpaceResponse = await apiClient.fetcher<any>(
          `/workspaces/${config.workspaceId}/spaces`,
          {
            method: "POST",
            body: JSON.stringify({
              externalUserId: config?.externalUserId,
              customSource: SPACE_SOURCE_TYPE_WEB_CONTROL,
            }),
          },
        );

        if (createNewSpaceResponse?.token) {
          tokenManager.setTemporalToken(
            createNewSpaceResponse.token,
            config.workspaceId,
          );
          setTemporalToken(createNewSpaceResponse.token);
          setToken(createNewSpaceResponse.token);

          setCurrentInformation({
            spaceId: createNewSpaceResponse?.id,
            temporalUserId: createNewSpaceResponse?.temporalUserId,
            startMode: workspace?.webControlStartMode || "QUESTIONS",
          });
        }
      } catch (e) {
        console.error("Failed to create new space after sign out", e);
      }
    }
  };

  return {
    token,
    isAuthenticated: !!token,
    signOut,
    handleGetUserData,
  };
};
