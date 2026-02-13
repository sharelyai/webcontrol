import type { BaseClient } from './client';
import type { Goal, GoalThread, Message } from '../types';

export function createGoalsApi(client: BaseClient) {
  return {
    getSpaceGoals: (spaceId: string) => {
      return client.fetcher<Goal[]>(`/goals/spaces/${spaceId}`);
    },

    getWorkspaceGoals: (workspaceId: string) => {
      return client.fetcher<Goal[]>(`/workspaces/${workspaceId}/goals`);
    },

    getThreads: (spaceId: string, groupId: string) => {
      const query = new URLSearchParams({ groupId });
      return client.fetcher<GoalThread[]>(`/goals/spaces/${spaceId}/threads?${query.toString()}`);
    },

    getThreadMessages: (spaceId: string, threadId: string, groupId: string, signal?: AbortSignal) => {
      const query = new URLSearchParams({ groupId });
      return client.fetcher<Message[]>(`/goals/spaces/${spaceId}/threads/${threadId}?${query.toString()}`, {
        signal,
      });
    },

    startThread: (goalId: string, spaceId: string, languageId?: string, signal?: AbortSignal) => {
      const query = new URLSearchParams();
      if (languageId) query.append('languageId', languageId);

      return client.request(`/goals/${goalId}/spaces/${spaceId}/start-thread?${query.toString()}`, {
        method: 'POST',
        signal,
      });
    },

    generateOutcome: (goalId: string, spaceId: string, threadId: string, languageId?: string) => {
      const query = new URLSearchParams();
      if (languageId) query.append('languageId', languageId);

      return client.fetcher<{ url?: string }>(`/goals/${goalId}/spaces/${spaceId}/threads/${threadId}/outcome?${query.toString()}`, {
        method: 'POST',
      });
    },
  };
}