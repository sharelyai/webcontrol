import { createSpacesApi } from './spaces';
import { createGoalsApi } from './goals';
import { createKnowledgeApi } from './knowledge';
import { createWorkspacesApi } from './workspaces';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  getToken: () => string | null | undefined;
  onError?: (error: ApiError) => void;
}

export type Fetcher = <T>(endpoint: string, options?: RequestInit & { parseJson?: boolean }) => Promise<T>;

export interface BaseClient {
  fetcher: Fetcher;
  request: (endpoint: string, options?: RequestInit) => Promise<Response>;
}

export interface ApiClient extends BaseClient {
  spaces: ReturnType<typeof createSpacesApi>;
  goals: ReturnType<typeof createGoalsApi>;
  knowledge: ReturnType<typeof createKnowledgeApi>;
  workspaces: ReturnType<typeof createWorkspacesApi>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const request = async (endpoint: string, options?: RequestInit): Promise<Response> => {
    const token = config.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    };

    const response = await fetch(`${config.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = response.statusText;
      let data;
      try {
        data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch (e) {
        // ignore json parse error
      }
      
      const error = new ApiError(response.status, errorMessage, data);
      config.onError?.(error);
      throw error;
    }

    return response;
  };

  const fetcher: Fetcher = async <T>(endpoint: string, options?: RequestInit & { parseJson?: boolean }): Promise<T> => {
    const response = await request(endpoint, options);

    if (options?.parseJson === false) {
      return response as unknown as T;
    }

    // Handle 204 No Content or empty responses
    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (e) {
      return {} as T;
    }
  };

  const baseClient: BaseClient = { fetcher, request };

  return {
    ...baseClient,
    spaces: createSpacesApi(baseClient),
    goals: createGoalsApi(baseClient),
    knowledge: createKnowledgeApi(baseClient),
    workspaces: createWorkspacesApi(baseClient),
  };
}