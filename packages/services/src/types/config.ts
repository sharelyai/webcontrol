export interface DisplayModeConfig {
  OPEN_BY_DEFAULT?: boolean;
  MODE: string; // 'PUBLIC' | 'PRIVATE'
  WIDTH?: string;
  HEIGHT?: string;
  Z_INDEX?: string;
  VIEWS?: {
    CHAT: { SHOW: boolean };
    SEARCH: {
      SHOW: boolean;
      SHOW_TAGS?: boolean;
    };
    BROWSE: { SHOW: boolean };
    AGENT?: { SHOW: boolean };
  };
}

export interface SharelyConfig {
  baseUrl?: string;
  /** @deprecated Use `baseUrl` instead. Kept for backward compatibility. */
  api?: string;
  workspaceId?: string;
  externalUserId?: string;
  closedText?: string;
  saveSpaceNumMgs?: number;
  mode?: string;
  justChat?: boolean;
  lang?: string;
  langKnowledge?: string;
  avatarmodeDesktop?: string;
  avatarmodeMobile?: string;
  displayMode?: DisplayModeConfig;
  displayModeJSON?: {
    [key: string]: any;
  };
  agentMode?: boolean;
  agentApi?: string;
  env?: string | null;
  onError?: (error: Error) => void;
}
