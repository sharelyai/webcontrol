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
  };
}

export interface SharelyConfig {
  baseUrl?: string;
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
  onError?: (error: Error) => void;
}
